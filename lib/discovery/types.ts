import { BaseNode, NodeConnection } from '@/lib/types'

// HTTP Method types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// Discovery configuration
export interface CrawlConfig {
  url: string
  maxDepth: number
  timeout: number
  rateLimit: number // requests per second
  followRedirects: boolean
  includeStaticAssets: boolean
  authentication?: AuthConfig
  filters?: {
    includePaths?: string[]
    excludePaths?: string[]
    includeHosts?: string[]
    excludeHosts?: string[]
  }
}

// Authentication configuration
export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth1' | 'oauth2' | 'apikey' | 'session'
  credentials?: {
    username?: string
    password?: string
    token?: string
    apiKey?: string
    apiKeyHeader?: string
    oauth?: {
      consumerKey?: string
      consumerSecret?: string
      accessToken?: string
      tokenSecret?: string
    }
  }
}

// Discovered API endpoint
export interface APIEndpoint {
  id: string
  url: string
  method: HTTPMethod
  headers: Record<string, string>
  parameters: ParameterDefinition[]
  requestBody?: RequestBodyDefinition
  responseSchema?: ResponseDefinition
  authentication?: AuthRequirement
  discoveryMethod: 'static' | 'dynamic' | 'interactive'
  confidence: number // 0-100 confidence score
  metadata: {
    foundAt: string // URL where this was discovered
    timestamp: Date
    responseTime?: number
    statusCode?: number
  }
}

// Parameter definition
export interface ParameterDefinition {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  default?: any
  example?: any
  description?: string
}

// Request body definition
export interface RequestBodyDefinition {
  contentType: string
  schema?: any // JSON Schema
  example?: any
  required: boolean
}

// Response definition
export interface ResponseDefinition {
  statusCode: number
  contentType: string
  schema?: any // JSON Schema
  example?: any
  headers?: Record<string, string>
}

// Authentication requirement
export interface AuthRequirement {
  type: string
  scheme?: string
  bearerFormat?: string
  flows?: any
  openIdConnectUrl?: string
}

// Network request captured during crawling
export interface NetworkRequest {
  id: string
  url: string
  method: HTTPMethod
  headers: Record<string, string>
  requestBody?: any
  response?: {
    status: number
    headers: Record<string, string>
    body: any
  }
  timestamp: Date
  duration: number
  initiator?: string
}

// API call dependency
export interface APIDependency {
  source: string // Source endpoint ID
  target: string // Target endpoint ID
  type: 'sequential' | 'parallel' | 'conditional'
  dataFlow?: {
    sourceField: string
    targetField: string
  }[]
}

// Discovery session
export interface DiscoverySession {
  id: string
  url: string
  startTime: Date
  endTime?: Date
  configuration: CrawlConfig
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: {
    pagesVisited: number
    totalPages: number
    endpointsDiscovered: number
    errors: number
  }
  results?: DiscoveryResults
  metrics?: CrawlMetrics
  error?: string
}

// Discovery results
export interface DiscoveryResults {
  endpoints: APIEndpoint[]
  dependencies: APIDependency[]
  patterns: APIPattern[]
  authentication: AuthenticationInfo[]
  summary: {
    totalEndpoints: number
    byMethod: Record<HTTPMethod, number>
    byHost: Record<string, number>
    byPath: Record<string, number>
    avgResponseTime: number
  }
}

// API pattern detection
export interface APIPattern {
  type: 'REST' | 'GraphQL' | 'WebSocket' | 'SOAP' | 'RPC' | 'Unknown'
  confidence: number
  evidence: string[]
  baseUrl?: string
  conventions?: {
    versioning?: 'url' | 'header' | 'none'
    naming?: 'camelCase' | 'snake_case' | 'kebab-case'
    pagination?: 'offset' | 'cursor' | 'page'
    filtering?: boolean
    sorting?: boolean
  }
}

// Authentication information
export interface AuthenticationInfo {
  type: string
  endpoints: string[] // Endpoint IDs that require this auth
  discoveredAt: string[]
  headers?: string[]
  parameters?: string[]
}

// Crawl metrics
export interface CrawlMetrics {
  duration: number // in milliseconds
  pagesVisited: number
  endpointsDiscovered: number
  bytesDownloaded: number
  requestsBlocked: number
  errors: ErrorMetric[]
  performance: {
    avgPageLoadTime: number
    avgApiResponseTime: number
    peakMemoryUsage: number
    cpuUsage: number
  }
}

// Error metric
export interface ErrorMetric {
  type: 'network' | 'timeout' | 'authentication' | 'parsing' | 'validation'
  message: string
  url?: string
  timestamp: Date
  retryCount: number
}

// Workflow generation result
export interface WorkflowGenerationResult {
  nodes: BaseNode[]
  connections: NodeConnection[]
  metadata: {
    source: string
    generatedAt: Date
    discoverySessionId: string
    confidence: number
  }
  warnings: string[]
  suggestions: string[]
}

// Export format options
export type ExportFormat = 'chickapi' | 'openapi' | 'postman' | 'insomnia' | 'swagger' | 'har' | 'json' | 'csv'

// Static analyzer interface
export interface StaticAnalyzer {
  parseHTML(content: string, baseUrl: string): Promise<APIEndpoint[]>
  analyzeJavaScript(scripts: string[], baseUrl: string): Promise<APIEndpoint[]>
  extractFromCSS(stylesheets: string[], baseUrl: string): Promise<APIEndpoint[]>
  detectPatterns(content: string): APIPattern[]
}

// Dynamic crawler interface
export interface DynamicCrawler {
  initialize(config: CrawlConfig): Promise<void>
  crawlPage(url: string): Promise<NetworkRequest[]>
  simulateInteractions(url: string): Promise<NetworkRequest[]>
  captureAPITraffic(): NetworkRequest[]
  shutdown(): Promise<void>
}

// Flow generator interface
export interface FlowGenerator {
  analyzeSequence(requests: NetworkRequest[]): APIDependency[]
  generateNodes(endpoints: APIEndpoint[]): BaseNode[]
  createConnections(dependencies: APIDependency[]): NodeConnection[]
  optimizeWorkflow(nodes: BaseNode[], connections: NodeConnection[]): {
    nodes: BaseNode[]
    connections: NodeConnection[]
  }
  validateWorkflow(nodes: BaseNode[], connections: NodeConnection[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
}
