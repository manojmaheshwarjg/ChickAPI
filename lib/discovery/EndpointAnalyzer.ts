import { APIEndpoint, EndpointParameter } from './types'

export class EndpointAnalyzer {
  async analyze(endpoint: APIEndpoint): Promise<APIEndpoint> {
    const enhanced = { ...endpoint }
    
    // Enhance parameter information
    if (enhanced.parameters) {
      enhanced.parameters = this.analyzeParameters(enhanced.parameters)
    }
    
    // Analyze and enhance path patterns
    enhanced.url = this.enhancePathPattern(enhanced.url)
    
    // Infer missing information
    if (!enhanced.tags || enhanced.tags.length === 0) {
      enhanced.tags = this.inferTags(enhanced.url)
    }
    
    // Analyze authentication requirements
    if (!enhanced.authentication) {
      enhanced.authentication = this.inferAuthentication(enhanced)
    }
    
    // Analyze response patterns
    if (enhanced.responses) {
      enhanced.responses = this.analyzeResponses(enhanced.responses)
    }
    
    // Generate summary if missing
    if (!enhanced.summary) {
      enhanced.summary = this.generateSummary(enhanced)
    }
    
    // Analyze rate limiting
    if (!enhanced.rateLimit && enhanced.responses) {
      enhanced.rateLimit = this.analyzeRateLimit(enhanced.responses)
    }
    
    // Analyze potential security issues
    enhanced.securityIssues = this.analyzeSecurityIssues(enhanced)
    
    // Calculate endpoint complexity score
    enhanced.complexity = this.calculateComplexity(enhanced)
    
    return enhanced
  }

  private analyzeParameters(parameters: EndpointParameter[]): EndpointParameter[] {
    return parameters.map(param => {
      const enhanced = { ...param }
      
      // Infer type from name if not specified
      if (!enhanced.type || enhanced.type === 'string') {
        enhanced.type = this.inferParameterType(param.name, param.example)
      }
      
      // Infer required status from name patterns
      if (enhanced.required === undefined) {
        enhanced.required = this.inferRequired(param.name)
      }
      
      // Add validation rules based on type
      if (!enhanced.validation) {
        enhanced.validation = this.inferValidation(enhanced.type, param.name)
      }
      
      // Generate description if missing
      if (!enhanced.description) {
        enhanced.description = this.generateParameterDescription(param.name, param.type)
      }
      
      return enhanced
    })
  }

  private enhancePathPattern(url: string): string {
    // Enhance path patterns with more specific placeholders
    let enhanced = url
    
    // User ID patterns
    enhanced = enhanced.replace(/\/users?\/(\{[^}]+\}|:\w+)/gi, '/users/{userId}')
    
    // Resource ID patterns
    enhanced = enhanced.replace(/\/(\w+)\/(\{id\})/gi, '/$1/{$1Id}')
    
    // Version patterns
    enhanced = enhanced.replace(/\/v(\d+)\//gi, '/v$1/')
    
    // Query string placeholders
    if (enhanced.includes('?')) {
      const [path, query] = enhanced.split('?')
      enhanced = path // Remove query string from path pattern
    }
    
    return enhanced
  }

  private inferTags(url: string): string[] {
    const tags: string[] = []
    const segments = url.split('/').filter(s => s && !s.startsWith('{') && !s.startsWith(':'))
    
    // Extract meaningful segments
    for (const segment of segments) {
      if (segment.match(/^v\d+$/)) continue // Skip version numbers
      
      const normalized = segment.toLowerCase()
      
      // Map common patterns to tags
      if (normalized.includes('auth') || normalized.includes('login') || normalized.includes('oauth')) {
        tags.push('authentication')
      } else if (normalized.includes('user') || normalized.includes('profile') || normalized.includes('account')) {
        tags.push('users')
      } else if (normalized.includes('admin')) {
        tags.push('admin')
      } else if (normalized.includes('payment') || normalized.includes('billing')) {
        tags.push('payments')
      } else if (normalized.includes('webhook')) {
        tags.push('webhooks')
      } else if (normalized.includes('file') || normalized.includes('upload') || normalized.includes('download')) {
        tags.push('files')
      } else if (normalized.includes('search') || normalized.includes('query')) {
        tags.push('search')
      } else if (normalized.includes('metric') || normalized.includes('analytic') || normalized.includes('stat')) {
        tags.push('analytics')
      } else if (!['api', 'rest', 'graphql', 'v1', 'v2'].includes(normalized)) {
        // Add the segment itself as a tag if it's meaningful
        tags.push(normalized)
      }
    }
    
    // Ensure we have at least one tag
    if (tags.length === 0 && segments.length > 0) {
      tags.push(segments[0])
    }
    
    return [...new Set(tags)] // Remove duplicates
  }

  private inferAuthentication(endpoint: APIEndpoint): any {
    // Check if parameters contain auth-related headers
    const authParams = endpoint.parameters?.filter(p => 
      p.in === 'header' && 
      ['authorization', 'x-api-key', 'api-key', 'x-auth-token'].includes(p.name.toLowerCase())
    )
    
    if (authParams && authParams.length > 0) {
      const authParam = authParams[0]
      return {
        type: authParam.name.toLowerCase().includes('key') ? 'apikey' : 'bearer',
        required: authParam.required || false,
        parameterName: authParam.name
      }
    }
    
    // Check URL patterns for public endpoints
    const publicPatterns = ['/public/', '/open/', '/health', '/status', '/ping']
    const isPublic = publicPatterns.some(pattern => endpoint.url.includes(pattern))
    
    if (isPublic) {
      return { type: 'none', required: false }
    }
    
    // Default to assuming authentication might be required
    return undefined
  }

  private analyzeResponses(responses: any[]): any[] {
    return responses.map(response => {
      const enhanced = { ...response }
      
      // Add standard status code descriptions
      if (!enhanced.description) {
        enhanced.description = this.getStatusCodeDescription(response.statusCode)
      }
      
      // Analyze error responses
      if (response.statusCode >= 400) {
        enhanced.isError = true
        enhanced.errorType = this.classifyErrorType(response.statusCode)
      }
      
      // Analyze response time patterns
      if (response.duration) {
        enhanced.performanceClass = this.classifyPerformance(response.duration)
      }
      
      return enhanced
    })
  }

  private generateSummary(endpoint: APIEndpoint): string {
    const method = endpoint.method
    const resourceMatch = endpoint.url.match(/\/([^/]+)(?:\/|$)/)
    const resource = resourceMatch ? resourceMatch[1] : 'resource'
    
    const hasId = endpoint.url.includes('{') && endpoint.url.includes('Id}')
    const isCollection = !hasId && ['GET'].includes(method)
    
    switch (method) {
      case 'GET':
        return isCollection ? `List ${resource}` : `Get ${resource} by ID`
      case 'POST':
        return `Create new ${resource}`
      case 'PUT':
        return `Update ${resource}`
      case 'PATCH':
        return `Partially update ${resource}`
      case 'DELETE':
        return `Delete ${resource}`
      case 'HEAD':
        return `Check ${resource} existence`
      case 'OPTIONS':
        return `Get ${resource} options`
      default:
        return `${method} ${resource}`
    }
  }

  private analyzeRateLimit(responses: any[]): any {
    for (const response of responses) {
      if (response.headers) {
        const rateLimitHeaders = [
          'x-ratelimit-limit',
          'x-rate-limit-limit',
          'ratelimit-limit'
        ]
        
        for (const header of rateLimitHeaders) {
          if (response.headers[header]) {
            return {
              limit: parseInt(response.headers[header]),
              window: response.headers['x-ratelimit-reset'] ? 'dynamic' : '1h',
              strategy: 'header-based'
            }
          }
        }
      }
      
      // Check for 429 responses
      if (response.statusCode === 429) {
        return {
          limit: 'unknown',
          window: 'unknown',
          strategy: 'returns-429'
        }
      }
    }
    
    return undefined
  }

  private analyzeSecurityIssues(endpoint: APIEndpoint): string[] {
    const issues: string[] = []
    
    // Check for missing authentication on sensitive endpoints
    if (!endpoint.authentication || endpoint.authentication.type === 'none') {
      const sensitivePatterns = ['/admin', '/user', '/account', '/payment', '/config']
      if (sensitivePatterns.some(pattern => endpoint.url.includes(pattern))) {
        issues.push('Potentially sensitive endpoint without authentication')
      }
    }
    
    // Check for potential PII in URLs
    const piiPatterns = ['/email/', '/ssn/', '/phone/', '/address/']
    if (piiPatterns.some(pattern => endpoint.url.includes(pattern))) {
      issues.push('Potential PII in URL path')
    }
    
    // Check for unsafe HTTP methods without authentication
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(endpoint.method)) {
      if (!endpoint.authentication || !endpoint.authentication.required) {
        issues.push('Mutating operation without required authentication')
      }
    }
    
    // Check for potential SQL injection points
    const sqlKeywords = ['query', 'sql', 'database', 'table']
    if (endpoint.parameters) {
      for (const param of endpoint.parameters) {
        if (sqlKeywords.some(keyword => param.name.toLowerCase().includes(keyword))) {
          issues.push('Parameter name suggests potential SQL injection risk')
        }
      }
    }
    
    // Check for missing rate limiting on resource-intensive endpoints
    if (!endpoint.rateLimit) {
      const intensivePatterns = ['/search', '/export', '/report', '/analytics', '/bulk']
      if (intensivePatterns.some(pattern => endpoint.url.includes(pattern))) {
        issues.push('Resource-intensive endpoint without rate limiting')
      }
    }
    
    return issues
  }

  private calculateComplexity(endpoint: APIEndpoint): number {
    let complexity = 1 // Base complexity
    
    // Add complexity for parameters
    if (endpoint.parameters) {
      complexity += endpoint.parameters.length * 0.5
      complexity += endpoint.parameters.filter(p => p.required).length * 0.5
    }
    
    // Add complexity for request body
    if (endpoint.requestBody) {
      complexity += 2
      if (endpoint.requestBody.schema?.type === 'object') {
        const properties = endpoint.requestBody.schema.properties
        if (properties) {
          complexity += Object.keys(properties).length * 0.3
        }
      }
    }
    
    // Add complexity for multiple response types
    if (endpoint.responses) {
      complexity += endpoint.responses.length * 0.5
    }
    
    // Add complexity for authentication
    if (endpoint.authentication && endpoint.authentication.type !== 'none') {
      complexity += 1
    }
    
    // Add complexity for nested path structure
    const pathDepth = endpoint.url.split('/').filter(s => s).length
    complexity += pathDepth * 0.2
    
    return Math.round(complexity * 10) / 10
  }

  private inferParameterType(name: string, example?: any): string {
    const lowerName = name.toLowerCase()
    
    // Check example value first
    if (example !== undefined && example !== null) {
      if (!isNaN(Number(example))) return 'number'
      if (example === 'true' || example === 'false') return 'boolean'
      if (/^\d{4}-\d{2}-\d{2}/.test(example)) return 'date'
    }
    
    // Infer from name patterns
    if (lowerName.includes('id') || lowerName.includes('key')) return 'string'
    if (lowerName.includes('count') || lowerName.includes('number') || lowerName.includes('amount')) return 'number'
    if (lowerName.includes('flag') || lowerName.includes('enabled') || lowerName.includes('active')) return 'boolean'
    if (lowerName.includes('date') || lowerName.includes('time') || lowerName.includes('created') || lowerName.includes('updated')) return 'date'
    if (lowerName.includes('email')) return 'email'
    if (lowerName.includes('url') || lowerName.includes('link')) return 'url'
    if (lowerName.includes('phone') || lowerName.includes('mobile')) return 'phone'
    
    return 'string'
  }

  private inferRequired(name: string): boolean {
    const lowerName = name.toLowerCase()
    const requiredPatterns = ['id', 'key', 'token', 'auth']
    return requiredPatterns.some(pattern => lowerName.includes(pattern))
  }

  private inferValidation(type: string, name: string): any {
    const validation: any = {}
    const lowerName = name.toLowerCase()
    
    switch (type) {
      case 'string':
        if (lowerName.includes('email')) {
          validation.format = 'email'
        } else if (lowerName.includes('url')) {
          validation.format = 'uri'
        } else if (lowerName.includes('uuid')) {
          validation.format = 'uuid'
        } else if (lowerName.includes('phone')) {
          validation.pattern = '^\\+?[1-9]\\d{1,14}$'
        }
        break
      
      case 'number':
        if (lowerName.includes('age')) {
          validation.minimum = 0
          validation.maximum = 150
        } else if (lowerName.includes('percentage') || lowerName.includes('percent')) {
          validation.minimum = 0
          validation.maximum = 100
        } else if (lowerName.includes('port')) {
          validation.minimum = 1
          validation.maximum = 65535
        }
        break
      
      case 'date':
        validation.format = 'date-time'
        break
    }
    
    return Object.keys(validation).length > 0 ? validation : undefined
  }

  private generateParameterDescription(name: string, type: string): string {
    const lowerName = name.toLowerCase()
    
    if (lowerName.includes('id')) return `Unique identifier for the ${name.replace(/[Ii]d$/, '')}`
    if (lowerName.includes('name')) return `Name of the ${name.replace(/[Nn]ame$/, '')}`
    if (lowerName.includes('email')) return 'Email address'
    if (lowerName.includes('phone')) return 'Phone number'
    if (lowerName.includes('date')) return `Date in ISO 8601 format`
    if (lowerName.includes('limit')) return 'Maximum number of items to return'
    if (lowerName.includes('offset')) return 'Number of items to skip'
    if (lowerName.includes('page')) return 'Page number for pagination'
    if (lowerName.includes('sort')) return 'Field to sort results by'
    if (lowerName.includes('filter')) return 'Filter criteria'
    
    return `${type} parameter: ${name}`
  }

  private getStatusCodeDescription(statusCode: number): string {
    const descriptions: Record<number, string> = {
      200: 'OK - Request succeeded',
      201: 'Created - Resource created successfully',
      202: 'Accepted - Request accepted for processing',
      204: 'No Content - Request succeeded with no response body',
      301: 'Moved Permanently',
      302: 'Found - Temporary redirect',
      304: 'Not Modified',
      400: 'Bad Request - Invalid request parameters',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Access denied',
      404: 'Not Found - Resource not found',
      405: 'Method Not Allowed',
      409: 'Conflict - Resource conflict',
      422: 'Unprocessable Entity - Validation error',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    }
    
    return descriptions[statusCode] || `HTTP ${statusCode}`
  }

  private classifyErrorType(statusCode: number): string {
    if (statusCode >= 400 && statusCode < 500) return 'client-error'
    if (statusCode >= 500) return 'server-error'
    return 'unknown'
  }

  private classifyPerformance(duration: number): string {
    if (duration < 100) return 'fast'
    if (duration < 500) return 'normal'
    if (duration < 2000) return 'slow'
    return 'very-slow'
  }
}
