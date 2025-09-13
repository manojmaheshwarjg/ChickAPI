import puppeteer, { Browser, Page, HTTPRequest, HTTPResponse } from 'puppeteer'
import { 
  DynamicCrawler as IDynamicCrawler, 
  CrawlConfig, 
  NetworkRequest, 
  HTTPMethod,
  AuthConfig 
} from './types'

export class DynamicCrawler implements IDynamicCrawler {
  private browser: Browser | null = null
  private page: Page | null = null
  private config: CrawlConfig | null = null
  private capturedRequests: NetworkRequest[] = []
  private visitedUrls: Set<string> = new Set()
  private requestCounter = 0
  private lastRequestTime = 0
  private rateLimitDelay = 0

  async initialize(config: CrawlConfig): Promise<void> {
    this.config = config
    this.rateLimitDelay = config.rateLimit > 0 ? 1000 / config.rateLimit : 0

    // Launch browser with optimized settings
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    this.page = await this.browser.newPage()

    // Set viewport and user agent
    await this.page.setViewport({ width: 1920, height: 1080 })
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ChickAPI/1.0'
    )

    // Handle authentication if provided
    if (config.authentication) {
      await this.setupAuthentication(config.authentication)
    }

    // Setup request interception
    await this.setupRequestInterception()

    // Setup response handling
    await this.setupResponseHandling()
  }

  private async setupAuthentication(auth: AuthConfig): Promise<void> {
    if (!this.page) return

    switch (auth.type) {
      case 'basic':
        if (auth.credentials?.username && auth.credentials?.password) {
          await this.page.authenticate({
            username: auth.credentials.username,
            password: auth.credentials.password
          })
        }
        break

      case 'bearer':
      case 'apikey':
        // Set custom headers for bearer token or API key
        await this.page.setExtraHTTPHeaders(this.getAuthHeaders(auth))
        break

      case 'session':
        // Handle session-based auth through cookies if provided
        if (auth.credentials?.token) {
          await this.page.setCookie({
            name: 'sessionToken',
            value: auth.credentials.token,
            domain: new URL(this.config!.url).hostname
          })
        }
        break
    }
  }

  private getAuthHeaders(auth: AuthConfig): Record<string, string> {
    const headers: Record<string, string> = {}

    if (auth.type === 'bearer' && auth.credentials?.token) {
      headers['Authorization'] = `Bearer ${auth.credentials.token}`
    } else if (auth.type === 'apikey' && auth.credentials?.apiKey) {
      const headerName = auth.credentials.apiKeyHeader || 'X-API-Key'
      headers[headerName] = auth.credentials.apiKey
    }

    return headers
  }

  private async setupRequestInterception(): Promise<void> {
    if (!this.page) return

    await this.page.setRequestInterception(true)

    this.page.on('request', async (request: HTTPRequest) => {
      const url = request.url()
      
      // Apply filters
      if (!this.shouldCrawlUrl(url)) {
        request.abort()
        return
      }

      // Apply rate limiting
      await this.applyRateLimit()

      // Continue with the request
      request.continue()
    })
  }

  private async setupResponseHandling(): Promise<void> {
    if (!this.page) return

    this.page.on('response', async (response: HTTPResponse) => {
      const request = response.request()
      const url = request.url()
      
      // Only capture API requests
      if (this.isApiRequest(url)) {
        const networkRequest = await this.createNetworkRequest(request, response)
        this.capturedRequests.push(networkRequest)
      }
    })

    // Also capture failed requests
    this.page.on('requestfailed', (request: HTTPRequest) => {
      const url = request.url()
      if (this.isApiRequest(url)) {
        const networkRequest: NetworkRequest = {
          id: `req_${++this.requestCounter}`,
          url: url,
          method: request.method() as HTTPMethod,
          headers: request.headers(),
          requestBody: request.postData(),
          timestamp: new Date(),
          duration: 0,
          initiator: request.frame()?.url()
        }
        this.capturedRequests.push(networkRequest)
      }
    })
  }

  async crawlPage(url: string): Promise<NetworkRequest[]> {
    if (!this.page || !this.config) {
      throw new Error('Crawler not initialized')
    }

    // Check if already visited
    if (this.visitedUrls.has(url)) {
      return []
    }
    this.visitedUrls.add(url)

    const pageRequests: NetworkRequest[] = []

    try {
      // Navigate to the page
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      })

      // Wait for any lazy-loaded content
      await this.page.waitForTimeout(2000)

      // Scroll to trigger lazy loading
      await this.autoScroll()

      // Capture all requests made during page load
      pageRequests.push(...this.capturedRequests)
      this.capturedRequests = []

      // Extract links for further crawling (if within depth limit)
      if (this.visitedUrls.size < this.config.maxDepth) {
        const links = await this.extractLinks()
        for (const link of links) {
          if (this.shouldCrawlUrl(link) && !this.visitedUrls.has(link)) {
            const subPageRequests = await this.crawlPage(link)
            pageRequests.push(...subPageRequests)
          }
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error)
    }

    return pageRequests
  }

  async simulateInteractions(url: string): Promise<NetworkRequest[]> {
    if (!this.page) {
      throw new Error('Crawler not initialized')
    }

    const interactionRequests: NetworkRequest[] = []

    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.config!.timeout 
      })

      // Click on buttons
      const buttons = await this.page.$$('button, input[type="submit"], a.btn')
      for (const button of buttons.slice(0, 5)) { // Limit to 5 buttons
        try {
          this.capturedRequests = []
          await button.click({ delay: 100 })
          await this.page.waitForTimeout(1000)
          interactionRequests.push(...this.capturedRequests)
        } catch {
          // Button might not be clickable or cause navigation
        }
      }

      // Fill and submit forms
      const forms = await this.page.$$('form')
      for (const form of forms.slice(0, 3)) { // Limit to 3 forms
        try {
          await this.fillForm(form)
          this.capturedRequests = []
          await form.evaluate((f: any) => f.submit())
          await this.page.waitForTimeout(2000)
          interactionRequests.push(...this.capturedRequests)
        } catch {
          // Form submission might fail or cause navigation
        }
      }

      // Trigger hover events
      const hoverElements = await this.page.$$('[data-hover], [onmouseover]')
      for (const element of hoverElements.slice(0, 5)) {
        try {
          this.capturedRequests = []
          await element.hover()
          await this.page.waitForTimeout(500)
          interactionRequests.push(...this.capturedRequests)
        } catch {
          // Hover might not trigger anything
        }
      }

      // Trigger change events on selects
      const selects = await this.page.$$('select')
      for (const select of selects.slice(0, 3)) {
        try {
          const options = await select.$$('option')
          if (options.length > 1) {
            this.capturedRequests = []
            await select.select(await options[1].evaluate(o => o.getAttribute('value') || ''))
            await this.page.waitForTimeout(1000)
            interactionRequests.push(...this.capturedRequests)
          }
        } catch {
          // Select change might not trigger anything
        }
      }
    } catch (error) {
      console.error(`Error simulating interactions on ${url}:`, error)
    }

    return interactionRequests
  }

  captureAPITraffic(): NetworkRequest[] {
    return [...this.capturedRequests]
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }

  private async createNetworkRequest(
    request: HTTPRequest,
    response: HTTPResponse
  ): Promise<NetworkRequest> {
    let responseBody: any = null
    
    try {
      const contentType = response.headers()['content-type'] || ''
      if (contentType.includes('application/json')) {
        responseBody = await response.json()
      } else if (contentType.includes('text/')) {
        responseBody = await response.text()
      }
    } catch {
      // Failed to get response body
    }

    return {
      id: `req_${++this.requestCounter}`,
      url: request.url(),
      method: request.method() as HTTPMethod,
      headers: request.headers(),
      requestBody: request.postData(),
      response: {
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      },
      timestamp: new Date(),
      duration: response.timing()?.receiveHeadersEnd || 0,
      initiator: request.frame()?.url()
    }
  }

  private async autoScroll(): Promise<void> {
    if (!this.page) return

    await this.page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 100
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 100)

        // Maximum scroll time: 10 seconds
        setTimeout(() => {
          clearInterval(timer)
          resolve()
        }, 10000)
      })
    })
  }

  private async extractLinks(): Promise<string[]> {
    if (!this.page) return []

    return await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'))
      return links
        .map(link => link.getAttribute('href'))
        .filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:'))
        .map(href => {
          try {
            return new URL(href!, window.location.href).href
          } catch {
            return null
          }
        })
        .filter(Boolean) as string[]
    })
  }

  private async fillForm(form: any): Promise<void> {
    const inputs = await form.$$('input[type="text"], input[type="email"], input[type="password"], textarea')
    
    for (const input of inputs) {
      const type = await input.evaluate((el: any) => el.type)
      const name = await input.evaluate((el: any) => el.name || el.id)
      
      let value = 'test'
      if (type === 'email') value = 'test@example.com'
      else if (type === 'password') value = 'password123'
      else if (name?.includes('phone')) value = '1234567890'
      else if (name?.includes('url')) value = 'https://example.com'
      
      await input.type(value, { delay: 50 })
    }
  }

  private shouldCrawlUrl(url: string): boolean {
    if (!this.config) return false

    try {
      const urlObj = new URL(url)
      
      // Check if it's a data URL or blob
      if (url.startsWith('data:') || url.startsWith('blob:')) return false
      
      // Check static assets
      if (!this.config.includeStaticAssets) {
        const staticExtensions = ['.jpg', '.png', '.gif', '.css', '.js', '.svg', '.ico', '.woff', '.ttf', '.pdf']
        if (staticExtensions.some(ext => url.toLowerCase().endsWith(ext))) return false
      }
      
      // Apply path filters
      if (this.config.filters?.includePaths) {
        const included = this.config.filters.includePaths.some(path => url.includes(path))
        if (!included) return false
      }
      
      if (this.config.filters?.excludePaths) {
        const excluded = this.config.filters.excludePaths.some(path => url.includes(path))
        if (excluded) return false
      }
      
      // Apply host filters
      if (this.config.filters?.includeHosts) {
        const included = this.config.filters.includeHosts.some(host => urlObj.hostname.includes(host))
        if (!included) return false
      }
      
      if (this.config.filters?.excludeHosts) {
        const excluded = this.config.filters.excludeHosts.some(host => urlObj.hostname.includes(host))
        if (excluded) return false
      }
      
      return true
    } catch {
      return false
    }
  }

  private isApiRequest(url: string): boolean {
    // Check for API patterns
    const apiIndicators = ['/api/', '/v1/', '/v2/', '/graphql', '/rest/', '.json', '/oauth/', '/auth/']
    
    // Check for data endpoints
    if (url.includes('?') && (url.includes('action=') || url.includes('method='))) return true
    
    // Check for AJAX/XHR patterns
    if (url.includes('ajax') || url.includes('xhr')) return true
    
    return apiIndicators.some(indicator => url.includes(indicator))
  }

  private async applyRateLimit(): Promise<void> {
    if (this.rateLimitDelay > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      
      if (timeSinceLastRequest < this.rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
      }
      
      this.lastRequestTime = Date.now()
    }
  }
}
