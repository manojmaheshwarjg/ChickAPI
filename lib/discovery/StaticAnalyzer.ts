import * as cheerio from 'cheerio'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { APIEndpoint, APIPattern, HTTPMethod, StaticAnalyzer as IStaticAnalyzer } from './types'

export class StaticAnalyzer implements IStaticAnalyzer {
  private apiPatterns = {
    fetch: /fetch\s*\(\s*['"](.*?)['"]/g,
    axios: /axios\.(get|post|put|delete|patch)\s*\(\s*['"](.*?)['"]/g,
    xmlhttp: /\.open\s*\(\s*['"](GET|POST|PUT|DELETE|PATCH)['"]\s*,\s*['"](.*?)['"]/gi,
    jquery: /\$\.(ajax|get|post|put|delete)\s*\(\s*\{[^}]*url\s*:\s*['"](.*?)['"]/g,
    apiUrl: /(https?:\/\/[^\s'"]+api[^\s'"]*)/gi,
    graphql: /graphql|query\s*{|mutation\s*{|subscription\s*{/gi,
    websocket: /wss?:\/\/[^\s'"]+/gi,
    restPattern: /\/(api|v\d+)\//i
  }

  async parseHTML(content: string, baseUrl: string): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = []
    const $ = cheerio.load(content)
    
    // Extract from forms
    $('form').each((_, form) => {
      const action = $(form).attr('action')
      const method = ($(form).attr('method') || 'GET').toUpperCase() as HTTPMethod
      
      if (action && this.isApiUrl(action)) {
        const url = this.resolveUrl(action, baseUrl)
        endpoints.push(this.createEndpoint(url, method, 'static', baseUrl))
      }
    })

    // Extract from links with API patterns
    $('a[href*="api"], a[href*="/v1/"], a[href*="/v2/"]').each((_, link) => {
      const href = $(link).attr('href')
      if (href && this.isApiUrl(href)) {
        const url = this.resolveUrl(href, baseUrl)
        endpoints.push(this.createEndpoint(url, 'GET', 'static', baseUrl))
      }
    })

    // Extract from data attributes
    $('[data-api-url], [data-endpoint], [data-url]').each((_, elem) => {
      const apiUrl = $(elem).attr('data-api-url') || 
                     $(elem).attr('data-endpoint') || 
                     $(elem).attr('data-url')
      if (apiUrl && this.isApiUrl(apiUrl)) {
        const url = this.resolveUrl(apiUrl, baseUrl)
        const method = ($(elem).attr('data-method') || 'GET').toUpperCase() as HTTPMethod
        endpoints.push(this.createEndpoint(url, method, 'static', baseUrl))
      }
    })

    // Extract from inline scripts
    $('script:not([src])').each((_, script) => {
      const scriptContent = $(script).html() || ''
      const inlineEndpoints = await this.extractFromJavaScript(scriptContent, baseUrl)
      endpoints.push(...inlineEndpoints)
    })

    return this.deduplicateEndpoints(endpoints)
  }

  async analyzeJavaScript(scripts: string[], baseUrl: string): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = []

    for (const script of scripts) {
      const scriptEndpoints = await this.extractFromJavaScript(script, baseUrl)
      endpoints.push(...scriptEndpoints)
    }

    return this.deduplicateEndpoints(endpoints)
  }

  private async extractFromJavaScript(script: string, baseUrl: string): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = []

    // Try regex patterns first
    endpoints.push(...this.extractWithRegex(script, baseUrl))

    // Try AST parsing for more complex cases
    try {
      const ast = parse(script, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true
      })

      traverse(ast, {
        StringLiteral: (path) => {
          const value = path.node.value
          if (this.isApiUrl(value)) {
            const url = this.resolveUrl(value, baseUrl)
            endpoints.push(this.createEndpoint(url, 'GET', 'static', baseUrl))
          }
        },
        CallExpression: (path) => {
          const node = path.node
          
          // Check for fetch calls
          if (path.isCallExpression() && 
              node.callee.type === 'Identifier' && 
              node.callee.name === 'fetch') {
            const firstArg = node.arguments[0]
            if (firstArg && firstArg.type === 'StringLiteral') {
              const url = this.resolveUrl(firstArg.value, baseUrl)
              const method = this.extractMethodFromFetchOptions(node.arguments[1])
              endpoints.push(this.createEndpoint(url, method, 'static', baseUrl))
            }
          }

          // Check for axios calls
          if (path.isCallExpression() && 
              node.callee.type === 'MemberExpression') {
            const object = node.callee.object
            const property = node.callee.property
            
            if (object.type === 'Identifier' && object.name === 'axios' &&
                property.type === 'Identifier') {
              const method = property.name.toUpperCase() as HTTPMethod
              const firstArg = node.arguments[0]
              
              if (firstArg && firstArg.type === 'StringLiteral') {
                const url = this.resolveUrl(firstArg.value, baseUrl)
                endpoints.push(this.createEndpoint(url, method, 'static', baseUrl))
              }
            }
          }
        }
      })
    } catch (error) {
      // Silently fail AST parsing and rely on regex
      console.debug('AST parsing failed, using regex fallback', error)
    }

    return endpoints
  }

  private extractWithRegex(content: string, baseUrl: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = []

    // Extract fetch calls
    let match
    const fetchRegex = new RegExp(this.apiPatterns.fetch)
    while ((match = fetchRegex.exec(content)) !== null) {
      const url = this.resolveUrl(match[1], baseUrl)
      if (this.isApiUrl(url)) {
        endpoints.push(this.createEndpoint(url, 'GET', 'static', baseUrl))
      }
    }

    // Extract axios calls
    const axiosRegex = new RegExp(this.apiPatterns.axios)
    while ((match = axiosRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase() as HTTPMethod
      const url = this.resolveUrl(match[2], baseUrl)
      if (this.isApiUrl(url)) {
        endpoints.push(this.createEndpoint(url, method, 'static', baseUrl))
      }
    }

    // Extract XMLHttpRequest calls
    const xmlhttpRegex = new RegExp(this.apiPatterns.xmlhttp)
    while ((match = xmlhttpRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase() as HTTPMethod
      const url = this.resolveUrl(match[2], baseUrl)
      if (this.isApiUrl(url)) {
        endpoints.push(this.createEndpoint(url, method, 'static', baseUrl))
      }
    }

    // Extract general API URLs
    const apiUrlRegex = new RegExp(this.apiPatterns.apiUrl)
    while ((match = apiUrlRegex.exec(content)) !== null) {
      const url = match[1]
      if (this.isApiUrl(url)) {
        endpoints.push(this.createEndpoint(url, 'GET', 'static', baseUrl))
      }
    }

    return endpoints
  }

  async extractFromCSS(stylesheets: string[], baseUrl: string): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = []

    for (const css of stylesheets) {
      // Look for URLs in CSS that might be API endpoints
      const urlRegex = /url\(['"]?(https?:\/\/[^'")]+api[^'")]*)/gi
      let match
      
      while ((match = urlRegex.exec(css)) !== null) {
        const url = match[1]
        if (this.isApiUrl(url)) {
          endpoints.push(this.createEndpoint(url, 'GET', 'static', baseUrl))
        }
      }
    }

    return this.deduplicateEndpoints(endpoints)
  }

  detectPatterns(content: string): APIPattern[] {
    const patterns: APIPattern[] = []

    // Detect REST API
    if (this.apiPatterns.restPattern.test(content)) {
      patterns.push({
        type: 'REST',
        confidence: 85,
        evidence: ['REST URL patterns detected', 'HTTP methods used'],
        conventions: {
          versioning: content.includes('/v1/') || content.includes('/v2/') ? 'url' : 'none',
          filtering: content.includes('?filter=') || content.includes('&filter='),
          sorting: content.includes('?sort=') || content.includes('&sort=')
        }
      })
    }

    // Detect GraphQL
    if (this.apiPatterns.graphql.test(content)) {
      patterns.push({
        type: 'GraphQL',
        confidence: 90,
        evidence: ['GraphQL query/mutation syntax detected'],
        baseUrl: this.extractGraphQLEndpoint(content)
      })
    }

    // Detect WebSocket
    if (this.apiPatterns.websocket.test(content)) {
      patterns.push({
        type: 'WebSocket',
        confidence: 95,
        evidence: ['WebSocket URL scheme detected']
      })
    }

    return patterns
  }

  private isApiUrl(url: string): boolean {
    if (!url) return false
    
    // Check if it's a data URL or blob
    if (url.startsWith('data:') || url.startsWith('blob:')) return false
    
    // Check if it's a static asset
    const staticExtensions = ['.jpg', '.png', '.gif', '.css', '.js', '.svg', '.ico', '.woff', '.ttf']
    if (staticExtensions.some(ext => url.toLowerCase().endsWith(ext))) return false
    
    // Check for API patterns
    const apiIndicators = ['/api/', '/v1/', '/v2/', '/graphql', '/rest/', '.json', '/oauth/', '/auth/']
    return apiIndicators.some(indicator => url.includes(indicator))
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (!url) return ''
    
    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Protocol-relative URL
    if (url.startsWith('//')) {
      const protocol = new URL(baseUrl).protocol
      return protocol + url
    }
    
    // Absolute path
    if (url.startsWith('/')) {
      const base = new URL(baseUrl)
      return `${base.protocol}//${base.host}${url}`
    }
    
    // Relative path
    try {
      return new URL(url, baseUrl).href
    } catch {
      return url
    }
  }

  private createEndpoint(
    url: string, 
    method: HTTPMethod, 
    discoveryMethod: 'static' | 'dynamic' | 'interactive',
    foundAt: string
  ): APIEndpoint {
    const urlObj = new URL(url)
    const pathParams = this.extractPathParameters(urlObj.pathname)
    const queryParams = this.extractQueryParameters(urlObj.search)

    return {
      id: `${method}_${url}`.replace(/[^a-zA-Z0-9]/g, '_'),
      url: url,
      method: method,
      headers: {},
      parameters: [...pathParams, ...queryParams],
      discoveryMethod: discoveryMethod,
      confidence: 70, // Static analysis has moderate confidence
      metadata: {
        foundAt: foundAt,
        timestamp: new Date()
      }
    }
  }

  private extractPathParameters(path: string): any[] {
    const params: any[] = []
    const paramRegex = /{([^}]+)}|:([a-zA-Z]+)/g
    let match
    
    while ((match = paramRegex.exec(path)) !== null) {
      const paramName = match[1] || match[2]
      params.push({
        name: paramName,
        in: 'path',
        type: 'string',
        required: true
      })
    }
    
    return params
  }

  private extractQueryParameters(search: string): any[] {
    if (!search) return []
    
    const params: any[] = []
    const searchParams = new URLSearchParams(search)
    
    searchParams.forEach((value, key) => {
      params.push({
        name: key,
        in: 'query',
        type: 'string',
        required: false,
        example: value
      })
    })
    
    return params
  }

  private extractMethodFromFetchOptions(options: any): HTTPMethod {
    if (!options) return 'GET'
    
    try {
      if (options.type === 'ObjectExpression') {
        const methodProp = options.properties.find(
          (p: any) => p.key?.name === 'method'
        )
        if (methodProp?.value?.value) {
          return methodProp.value.value.toUpperCase() as HTTPMethod
        }
      }
    } catch {
      // Default to GET if we can't parse
    }
    
    return 'GET'
  }

  private extractGraphQLEndpoint(content: string): string | undefined {
    const graphqlRegex = /graphql|\/graphql/i
    const match = content.match(graphqlRegex)
    return match ? match[0] : undefined
  }

  private deduplicateEndpoints(endpoints: APIEndpoint[]): APIEndpoint[] {
    const seen = new Set<string>()
    return endpoints.filter(endpoint => {
      const key = `${endpoint.method}_${endpoint.url}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
