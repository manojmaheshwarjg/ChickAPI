import { 
  APIEndpoint, 
  EndpointParameter,
  HTTPMethod 
} from './types'

export class SpecificationParser {
  async parse(content: string, type: string): Promise<APIEndpoint[]> {
    switch (type.toLowerCase()) {
      case 'openapi':
      case 'openapi3':
      case 'swagger':
        return this.parseOpenAPI(content)
      case 'postman':
        return this.parsePostmanCollection(content)
      case 'har':
        return this.parseHAR(content)
      default:
        throw new Error(`Unsupported specification type: ${type}`)
    }
  }

  private parseOpenAPI(content: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = []
    
    try {
      const spec = JSON.parse(content)
      const basePath = spec.basePath || ''
      const servers = spec.servers || []
      const baseUrl = servers.length > 0 ? servers[0].url : ''
      
      // Parse paths
      for (const [path, pathItem] of Object.entries(spec.paths || {})) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
            const endpoint = this.parseOpenAPIOperation(
              baseUrl + basePath + path,
              method.toUpperCase() as HTTPMethod,
              operation,
              spec
            )
            endpoints.push(endpoint)
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse OpenAPI specification:', error)
    }
    
    return endpoints
  }

  private parseOpenAPIOperation(
    url: string,
    method: HTTPMethod,
    operation: any,
    spec: any
  ): APIEndpoint {
    const parameters: EndpointParameter[] = []
    
    // Parse parameters
    if (operation.parameters) {
      for (const param of operation.parameters) {
        const resolvedParam = this.resolveReference(param, spec)
        parameters.push({
          name: resolvedParam.name,
          type: this.getOpenAPIType(resolvedParam.schema || resolvedParam),
          in: resolvedParam.in,
          required: resolvedParam.required || false,
          description: resolvedParam.description,
          example: resolvedParam.example || resolvedParam.schema?.example,
          schema: resolvedParam.schema
        })
      }
    }
    
    // Parse request body
    let requestBody: any = undefined
    if (operation.requestBody) {
      const resolvedBody = this.resolveReference(operation.requestBody, spec)
      const content = resolvedBody.content
      if (content) {
        const contentType = Object.keys(content)[0]
        const mediaType = content[contentType]
        requestBody = {
          contentType,
          schema: this.resolveReference(mediaType.schema, spec),
          examples: mediaType.examples ? Object.values(mediaType.examples) : undefined,
          required: resolvedBody.required
        }
      }
    }
    
    // Parse responses
    const responses: any[] = []
    if (operation.responses) {
      for (const [statusCode, response] of Object.entries(operation.responses)) {
        const resolvedResponse = this.resolveReference(response, spec)
        const content = resolvedResponse.content
        
        if (content) {
          const contentType = Object.keys(content)[0]
          const mediaType = content[contentType]
          responses.push({
            statusCode: parseInt(statusCode),
            contentType,
            schema: this.resolveReference(mediaType.schema, spec),
            examples: mediaType.examples ? Object.values(mediaType.examples) : undefined,
            description: resolvedResponse.description
          })
        } else {
          responses.push({
            statusCode: parseInt(statusCode),
            description: resolvedResponse.description
          })
        }
      }
    }
    
    // Parse security requirements
    let authentication: any = undefined
    if (operation.security || spec.security) {
      const security = operation.security || spec.security
      if (security.length > 0) {
        const securityScheme = Object.keys(security[0])[0]
        const scheme = spec.components?.securitySchemes?.[securityScheme] || 
                      spec.securityDefinitions?.[securityScheme]
        
        if (scheme) {
          authentication = {
            type: this.mapSecurityType(scheme.type, scheme.scheme),
            required: true,
            description: scheme.description
          }
        }
      }
    }
    
    return {
      id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      parameters,
      requestBody,
      responses,
      authentication,
      tags: operation.tags || [],
      summary: operation.summary,
      description: operation.description,
      documentation: operation.externalDocs?.url,
      deprecated: operation.deprecated,
      discoveredAt: new Date(),
      source: 'specification'
    }
  }

  private parsePostmanCollection(content: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = []
    
    try {
      const collection = JSON.parse(content)
      
      // Parse items recursively
      const parseItems = (items: any[], parentAuth?: any) => {
        for (const item of items) {
          if (item.item) {
            // It's a folder, recurse
            parseItems(item.item, item.auth || parentAuth)
          } else if (item.request) {
            // It's a request
            const endpoint = this.parsePostmanRequest(item, parentAuth)
            if (endpoint) {
              endpoints.push(endpoint)
            }
          }
        }
      }
      
      parseItems(collection.item || [], collection.auth)
    } catch (error) {
      console.error('Failed to parse Postman collection:', error)
    }
    
    return endpoints
  }

  private parsePostmanRequest(item: any, parentAuth?: any): APIEndpoint | null {
    const request = item.request
    if (!request) return null
    
    // Parse URL
    let url = ''
    let queryParams: EndpointParameter[] = []
    
    if (typeof request.url === 'string') {
      url = request.url
    } else if (request.url) {
      const urlObj = request.url
      url = urlObj.raw || `${urlObj.protocol}://${urlObj.host?.join('.')}/${urlObj.path?.join('/')}`
      
      // Parse query parameters
      if (urlObj.query) {
        queryParams = urlObj.query.map((q: any) => ({
          name: q.key,
          type: 'string',
          in: 'query',
          required: false,
          description: q.description,
          example: q.value,
          disabled: q.disabled
        }))
      }
    }
    
    // Parse headers
    const headerParams: EndpointParameter[] = []
    if (request.header) {
      for (const header of request.header) {
        if (!header.disabled) {
          headerParams.push({
            name: header.key,
            type: 'string',
            in: 'header',
            required: false,
            description: header.description,
            example: header.value
          })
        }
      }
    }
    
    // Parse body
    let requestBody: any = undefined
    if (request.body) {
      const body = request.body
      let schema: any = undefined
      let examples: any[] = []
      
      if (body.mode === 'raw') {
        try {
          const parsed = JSON.parse(body.raw)
          schema = this.inferSchema(parsed)
          examples = [parsed]
        } catch {
          schema = { type: 'string' }
          examples = [body.raw]
        }
      } else if (body.mode === 'formdata' || body.mode === 'urlencoded') {
        const properties: any = {}
        const data = body[body.mode] || []
        
        for (const field of data) {
          properties[field.key] = {
            type: field.type || 'string',
            description: field.description
          }
        }
        
        schema = {
          type: 'object',
          properties
        }
      }
      
      requestBody = {
        contentType: this.getPostmanContentType(request),
        schema,
        examples
      }
    }
    
    // Parse authentication
    const auth = request.auth || parentAuth
    let authentication: any = undefined
    
    if (auth) {
      authentication = {
        type: this.mapPostmanAuthType(auth.type),
        required: true
      }
    }
    
    return {
      id: `postman_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method: (request.method || 'GET').toUpperCase() as HTTPMethod,
      parameters: [...queryParams, ...headerParams],
      requestBody,
      authentication,
      summary: item.name,
      description: request.description,
      discoveredAt: new Date(),
      source: 'specification'
    }
  }

  private parseHAR(content: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = []
    
    try {
      const har = JSON.parse(content)
      const entries = har.log?.entries || []
      
      for (const entry of entries) {
        const request = entry.request
        const response = entry.response
        
        if (!request) continue
        
        const url = new URL(request.url)
        const pathPattern = this.extractPathPattern(url.pathname)
        
        // Parse query parameters
        const queryParams: EndpointParameter[] = request.queryString?.map((q: any) => ({
          name: q.name,
          type: 'string',
          in: 'query',
          required: false,
          example: q.value
        })) || []
        
        // Parse headers
        const headerParams: EndpointParameter[] = []
        let authentication: any = undefined
        
        for (const header of request.headers || []) {
          if (header.name.toLowerCase() === 'authorization') {
            authentication = {
              type: header.value.startsWith('Bearer ') ? 'bearer' : 'basic',
              required: true
            }
          } else if (!this.isStandardHeader(header.name)) {
            headerParams.push({
              name: header.name,
              type: 'string',
              in: 'header',
              required: false,
              example: header.value
            })
          }
        }
        
        // Parse request body
        let requestBody: any = undefined
        if (request.postData) {
          try {
            const parsed = JSON.parse(request.postData.text)
            requestBody = {
              contentType: request.postData.mimeType,
              schema: this.inferSchema(parsed),
              examples: [parsed]
            }
          } catch {
            requestBody = {
              contentType: request.postData.mimeType,
              schema: { type: 'string' },
              examples: [request.postData.text]
            }
          }
        }
        
        // Parse response
        const responses: any[] = []
        if (response) {
          let responseSchema: any = undefined
          let examples: any[] = []
          
          if (response.content?.text) {
            try {
              const parsed = JSON.parse(response.content.text)
              responseSchema = this.inferSchema(parsed)
              examples = [parsed]
            } catch {
              responseSchema = { type: 'string' }
              examples = [response.content.text]
            }
          }
          
          responses.push({
            statusCode: response.status,
            contentType: response.content?.mimeType,
            schema: responseSchema,
            examples
          })
        }
        
        endpoints.push({
          id: `har_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: pathPattern,
          method: request.method as HTTPMethod,
          parameters: [...queryParams, ...headerParams],
          requestBody,
          responses,
          authentication,
          discoveredAt: new Date(entry.startedDateTime),
          source: 'specification'
        })
      }
    } catch (error) {
      console.error('Failed to parse HAR file:', error)
    }
    
    return endpoints
  }

  private resolveReference(obj: any, spec: any): any {
    if (!obj || !obj.$ref) return obj
    
    const ref = obj.$ref
    const parts = ref.split('/')
    let resolved = spec
    
    for (let i = 1; i < parts.length; i++) {
      resolved = resolved[parts[i]]
      if (!resolved) return obj
    }
    
    return resolved
  }

  private getOpenAPIType(schema: any): string {
    if (!schema) return 'any'
    if (schema.type) return schema.type
    if (schema.oneOf || schema.anyOf || schema.allOf) return 'object'
    return 'any'
  }

  private mapSecurityType(type: string, scheme?: string): string {
    switch (type) {
      case 'http':
        return scheme === 'bearer' ? 'bearer' : 'basic'
      case 'apiKey':
        return 'apikey'
      case 'oauth2':
        return 'oauth2'
      default:
        return type
    }
  }

  private mapPostmanAuthType(type: string): string {
    switch (type) {
      case 'bearer':
        return 'bearer'
      case 'basic':
        return 'basic'
      case 'apikey':
        return 'apikey'
      case 'oauth2':
        return 'oauth2'
      default:
        return type
    }
  }

  private getPostmanContentType(request: any): string {
    const body = request.body
    if (!body) return 'application/json'
    
    if (body.mode === 'raw') {
      const options = body.options?.raw
      if (options?.language === 'json') return 'application/json'
      if (options?.language === 'xml') return 'application/xml'
      if (options?.language === 'text') return 'text/plain'
    } else if (body.mode === 'formdata') {
      return 'multipart/form-data'
    } else if (body.mode === 'urlencoded') {
      return 'application/x-www-form-urlencoded'
    }
    
    return 'application/json'
  }

  private extractPathPattern(path: string): string {
    return path.replace(/\/\d+/g, '/{id}')
               .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/{uuid}')
               .replace(/\/[a-f0-9]{24}/gi, '/{objectId}')
  }

  private isStandardHeader(header: string): boolean {
    const standardHeaders = [
      'accept', 'accept-encoding', 'accept-language', 'cache-control',
      'connection', 'content-length', 'content-type', 'cookie',
      'host', 'origin', 'referer', 'user-agent'
    ]
    return standardHeaders.includes(header.toLowerCase())
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
}
