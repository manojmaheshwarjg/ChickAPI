import { 
  DiscoveryOrchestrator as IDiscoveryOrchestrator,
  DiscoveryConfig,
  DiscoveryResult,
  APIEndpoint,
  NetworkRequest,
  CrawlConfig,
  HTTPMethod,
  EndpointParameter
} from './types'
import { DynamicCrawler } from './DynamicCrawler'
import { SpecificationParser } from './SpecificationParser'
import { EndpointAnalyzer } from './EndpointAnalyzer'

export class DiscoveryOrchestrator implements IDiscoveryOrchestrator {
  private config: DiscoveryConfig | null = null
  private crawlers: Map<string, DynamicCrawler> = new Map()
  private specParser: SpecificationParser
  private analyzer: EndpointAnalyzer
  private discoveredEndpoints: Map<string, APIEndpoint> = new Map()
  private isRunning = false

  constructor() {
    this.specParser = new SpecificationParser()
    this.analyzer = new EndpointAnalyzer()
  }

  async startDiscovery(config: DiscoveryConfig): Promise<void> {
    if (this.isRunning) {
      throw new Error('Discovery is already running')
    }

    this.config = config
    this.isRunning = true
    this.discoveredEndpoints.clear()

    try {
      // Discover from specifications if provided
      if (config.sources.specifications?.length) {
        await this.discoverFromSpecifications(config.sources.specifications)
      }

      // Discover from dynamic crawling if configured
      if (config.sources.dynamicCrawl?.enabled) {
        await this.discoverFromCrawling(config.sources.dynamicCrawl)
      }

      // Discover from traffic logs if provided
      if (config.sources.trafficLogs?.length) {
        await this.discoverFromTrafficLogs(config.sources.trafficLogs)
      }

      // Analyze and enhance discovered endpoints
      await this.analyzeEndpoints()

    } catch (error) {
      console.error('Discovery failed:', error)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  async stopDiscovery(): Promise<void> {
    this.isRunning = false
    
    // Shutdown all crawlers
    for (const crawler of this.crawlers.values()) {
      await crawler.shutdown()
    }
    this.crawlers.clear()
  }

  getDiscoveryResults(): DiscoveryResult {
    const endpoints = Array.from(this.discoveredEndpoints.values())
    
    // Group endpoints by base URL/domain
    const groupedEndpoints = this.groupEndpointsByDomain(endpoints)
    
    // Calculate statistics
    const stats = {
      totalEndpoints: endpoints.length,
      byMethod: this.countByMethod(endpoints),
      byDomain: this.countByDomain(endpoints),
      withAuth: endpoints.filter(e => e.authentication).length,
      documented: endpoints.filter(e => e.documentation).length
    }

    return {
      endpoints,
      groupedEndpoints,
      statistics: stats,
      discoveryTimestamp: new Date(),
      config: this.config!
    }
  }

  private async discoverFromSpecifications(specs: Array<{ url?: string; file?: string; type: string }>) {
    for (const spec of specs) {
      try {
        let content: string = ''
        
        if (spec.url) {
          // Fetch specification from URL
          const response = await fetch(spec.url)
          content = await response.text()
        } else if (spec.file) {
          // Read from file system (would need fs module in Node environment)
          // For now, we'll skip file reading in browser context
          console.warn('File reading not implemented in browser context')
          continue
        }

        const endpoints = await this.specParser.parse(content, spec.type)
        
        // Add discovered endpoints
        for (const endpoint of endpoints) {
          const key = `${endpoint.method}:${endpoint.url}`
          this.discoveredEndpoints.set(key, endpoint)
        }
      } catch (error) {
        console.error(`Failed to parse specification:`, error)
      }
    }
  }

  private async discoverFromCrawling(crawlConfig: CrawlConfig) {
    const crawler = new DynamicCrawler()
    const crawlerId = `crawler_${Date.now()}`
    this.crawlers.set(crawlerId, crawler)

    try {
      await crawler.initialize(crawlConfig)
      
      // Crawl the main page and linked pages
      const requests = await crawler.crawlPage(crawlConfig.url)
      
      // If interaction simulation is enabled
      if (crawlConfig.simulateInteractions) {
        const interactionRequests = await crawler.simulateInteractions(crawlConfig.url)
        requests.push(...interactionRequests)
      }

      // Convert network requests to API endpoints
      await this.processNetworkRequests(requests)

    } finally {
      await crawler.shutdown()
      this.crawlers.delete(crawlerId)
    }
  }

  private async discoverFromTrafficLogs(logs: NetworkRequest[]) {
    await this.processNetworkRequests(logs)
  }

  private async processNetworkRequests(requests: NetworkRequest[]) {
    for (const request of requests) {
      // Skip non-API requests
      if (!this.isApiRequest(request.url)) continue

      const endpoint = this.networkRequestToEndpoint(request)
      const key = `${endpoint.method}:${endpoint.url}`
      
      // Merge with existing endpoint if found
      if (this.discoveredEndpoints.has(key)) {
        const existing = this.discoveredEndpoints.get(key)!
        this.mergeEndpoints(existing, endpoint)
      } else {
        this.discoveredEndpoints.set(key, endpoint)
      }
    }
  }

  private async analyzeEndpoints() {
    for (const endpoint of this.discoveredEndpoints.values()) {
      // Analyze and enhance endpoint information
      const enhanced = await this.analyzer.analyze(endpoint)
      const key = `${enhanced.method}:${enhanced.url}`
      this.discoveredEndpoints.set(key, enhanced)
    }
  }

  private networkRequestToEndpoint(request: NetworkRequest): APIEndpoint {
    const url = new URL(request.url)
    const pathPattern = this.extractPathPattern(url.pathname)
    
    // Extract query parameters
    const queryParams: EndpointParameter[] = []
    url.searchParams.forEach((value, key) => {
      queryParams.push({
        name: key,
        type: this.inferParameterType(value),
        in: 'query',
        required: false,
        example: value
      })
    })

    // Extract headers
    const headerParams: EndpointParameter[] = []
    const authHeaders = ['authorization', 'x-api-key', 'api-key']
    let authentication: any = undefined

    for (const [key, value] of Object.entries(request.headers || {})) {
      if (authHeaders.includes(key.toLowerCase())) {
        authentication = {
          type: key.toLowerCase().includes('key') ? 'apikey' : 'bearer',
          required: true
        }
      } else if (!this.isStandardHeader(key)) {
        headerParams.push({
          name: key,
          type: 'string',
          in: 'header',
          required: false,
          example: value
        })
      }
    }

    // Extract body schema if present
    let requestBodySchema: any = undefined
    if (request.requestBody) {
      try {
        const body = JSON.parse(request.requestBody)
        requestBodySchema = this.inferSchema(body)
      } catch {
        // Not JSON, treat as string
        requestBodySchema = { type: 'string' }
      }
    }

    // Extract response schema if present
    let responseSchema: any = undefined
    if (request.response?.body) {
      responseSchema = this.inferSchema(request.response.body)
    }

    return {
      id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: pathPattern,
      method: request.method || 'GET',
      parameters: [...queryParams, ...headerParams],
      requestBody: requestBodySchema ? {
        contentType: request.headers?.['content-type'] || 'application/json',
        schema: requestBodySchema,
        examples: request.requestBody ? [request.requestBody] : undefined
      } : undefined,
      responses: request.response ? [{
        statusCode: request.response.status,
        contentType: request.response.headers?.['content-type'] || 'application/json',
        schema: responseSchema,
        examples: request.response.body ? [request.response.body] : undefined
      }] : [],
      authentication,
      rateLimit: this.inferRateLimit(request.response?.headers),
      tags: this.inferTags(url.pathname),
      discoveredAt: request.timestamp || new Date(),
      source: 'dynamic'
    }
  }

  private extractPathPattern(path: string): string {
    // Replace numeric IDs with placeholders
    return path.replace(/\/\d+/g, '/{id}')
               .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/{uuid}')
               .replace(/\/[a-f0-9]{24}/gi, '/{objectId}')
  }

  private inferParameterType(value: string): string {
    if (!isNaN(Number(value))) return 'number'
    if (value === 'true' || value === 'false') return 'boolean'
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) return 'uuid'
    return 'string'
  }

  private inferSchema(data: any): any {
    if (data === null) return { type: 'null' }
    if (Array.isArray(data)) {
      return {
        type: 'array',
        items: data.length > 0 ? this.inferSchema(data[0]) : { type: 'any' }
      }
    }
    if (typeof data === 'object') {
      const properties: any = {}
      const required: string[] = []
      
      for (const [key, value] of Object.entries(data)) {
        properties[key] = this.inferSchema(value)
        if (value !== null && value !== undefined) {
          required.push(key)
        }
      }
      
      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      }
    }
    
    return { type: typeof data }
  }

  private inferRateLimit(headers?: Record<string, string>): any {
    if (!headers) return undefined
    
    const rateLimitHeaders = {
      limit: headers['x-ratelimit-limit'] || headers['x-rate-limit-limit'],
      remaining: headers['x-ratelimit-remaining'] || headers['x-rate-limit-remaining'],
      reset: headers['x-ratelimit-reset'] || headers['x-rate-limit-reset']
    }
    
    if (rateLimitHeaders.limit) {
      return {
        limit: parseInt(rateLimitHeaders.limit),
        window: rateLimitHeaders.reset ? 'dynamic' : '1h',
        remaining: rateLimitHeaders.remaining ? parseInt(rateLimitHeaders.remaining) : undefined
      }
    }
    
    return undefined
  }

  private inferTags(path: string): string[] {
    const tags: string[] = []
    const segments = path.split('/').filter(s => s && !s.startsWith('{'))
    
    if (segments.length > 0) {
      // Use first meaningful segment as primary tag
      tags.push(segments[0])
      
      // Add specific tags based on patterns
      if (path.includes('auth') || path.includes('login') || path.includes('oauth')) {
        tags.push('authentication')
      }
      if (path.includes('user') || path.includes('profile')) {
        tags.push('users')
      }
      if (path.includes('admin')) {
        tags.push('admin')
      }
      if (path.includes('webhook')) {
        tags.push('webhooks')
      }
    }
    
    return tags
  }

  private isStandardHeader(header: string): boolean {
    const standardHeaders = [
      'accept', 'accept-encoding', 'accept-language', 'cache-control',
      'connection', 'content-length', 'content-type', 'cookie',
      'host', 'origin', 'referer', 'user-agent', 'pragma',
      'sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site'
    ]
    return standardHeaders.includes(header.toLowerCase())
  }

  private isApiRequest(url: string): boolean {
    const apiIndicators = ['/api/', '/v1/', '/v2/', '/graphql', '/rest/', '.json']
    return apiIndicators.some(indicator => url.includes(indicator))
  }

  private mergeEndpoints(existing: APIEndpoint, newEndpoint: APIEndpoint) {
    // Merge parameters
    const paramMap = new Map(existing.parameters?.map(p => [`${p.in}:${p.name}`, p]))
    newEndpoint.parameters?.forEach(p => {
      const key = `${p.in}:${p.name}`
      if (!paramMap.has(key)) {
        paramMap.set(key, p)
      } else {
        // Merge examples
        const existingParam = paramMap.get(key)!
        if (p.example && existingParam.example !== p.example) {
          if (!existingParam.examples) {
            existingParam.examples = [existingParam.example]
          }
          existingParam.examples.push(p.example)
        }
      }
    })
    existing.parameters = Array.from(paramMap.values())

    // Merge response examples
    if (newEndpoint.responses) {
      if (!existing.responses) {
        existing.responses = []
      }
      
      for (const newResponse of newEndpoint.responses) {
        const existingResponse = existing.responses.find(r => r.statusCode === newResponse.statusCode)
        if (existingResponse) {
          // Merge examples
          if (newResponse.examples) {
            if (!existingResponse.examples) {
              existingResponse.examples = []
            }
            existingResponse.examples.push(...newResponse.examples)
          }
        } else {
          existing.responses.push(newResponse)
        }
      }
    }

    // Update discovery timestamp
    existing.lastUpdated = new Date()
  }

  private groupEndpointsByDomain(endpoints: APIEndpoint[]): Map<string, APIEndpoint[]> {
    const grouped = new Map<string, APIEndpoint[]>()
    
    for (const endpoint of endpoints) {
      try {
        const url = new URL(endpoint.url.startsWith('http') ? endpoint.url : `http://example.com${endpoint.url}`)
        const domain = url.hostname === 'example.com' ? 'relative' : url.hostname
        
        if (!grouped.has(domain)) {
          grouped.set(domain, [])
        }
        grouped.get(domain)!.push(endpoint)
      } catch {
        // Invalid URL, group under 'unknown'
        if (!grouped.has('unknown')) {
          grouped.set('unknown', [])
        }
        grouped.get('unknown')!.push(endpoint)
      }
    }
    
    return grouped
  }

  private countByMethod(endpoints: APIEndpoint[]): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const endpoint of endpoints) {
      counts[endpoint.method] = (counts[endpoint.method] || 0) + 1
    }
    return counts
  }

  private countByDomain(endpoints: APIEndpoint[]): Record<string, number> {
    const grouped = this.groupEndpointsByDomain(endpoints)
    const counts: Record<string, number> = {}
    for (const [domain, domainEndpoints] of grouped) {
      counts[domain] = domainEndpoints.length
    }
    return counts
  }
}
