// Enhanced Project Model for ChickAPI - Visual API Development Platform
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  lastActive: Date
}

export interface Environment {
  id: string
  name: string
  description?: string
  type: 'development' | 'staging' | 'production' | 'testing' | 'custom'
  baseUrl: string
  variables: Record<string, string>
  secrets: Record<string, string>
  headers: Record<string, string>
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface APIEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'
  path: string
  description?: string
  tags: string[]
  parameters: Parameter[]
  requestBody?: RequestBody
  responses: Response[]
  authentication?: Authentication
  rateLimit?: RateLimit
  deprecation?: {
    isDeprecated: boolean
    version?: string
    alternative?: string
    sunsetDate?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface Parameter {
  name: string
  type: 'query' | 'header' | 'path' | 'cookie'
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description?: string
  example?: any
  schema?: JsonSchema
  validation?: {
    pattern?: string
    minimum?: number
    maximum?: number
    minLength?: number
    maxLength?: number
    enum?: any[]
  }
}

export interface RequestBody {
  contentType: string
  schema: JsonSchema
  examples: Record<string, any>
  required: boolean
}

export interface Response {
  statusCode: number
  description: string
  headers?: Record<string, string>
  schema?: JsonSchema
  examples: Record<string, any>
}

export interface Authentication {
  type: 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth2' | 'custom'
  configuration: Record<string, any>
  required: boolean
}

export interface RateLimit {
  requests: number
  period: number
  burst?: number
}

export interface JsonSchema {
  type: string
  properties?: Record<string, JsonSchema>
  required?: string[]
  additionalProperties?: boolean
  items?: JsonSchema
  [key: string]: any
}

export interface APICollection {
  id: string
  name: string
  description?: string
  version: string
  endpoints: APIEndpoint[]
  baseUrl?: string
  authentication?: Authentication
  tags: string[]
  documentation?: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowNode {
  id: string
  type: 'api-call' | 'condition' | 'loop' | 'transform' | 'delay' | 'webhook' | 'custom'
  position: { x: number; y: number }
  data: {
    label: string
    endpoint?: string
    method?: string
    configuration: Record<string, any>
    inputs: Record<string, any>
    outputs: Record<string, any>
  }
  style?: Record<string, any>
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  conditions?: Record<string, any>
  style?: Record<string, any>
}

export interface APIWorkflow {
  id: string
  name: string
  description?: string
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  triggers: Trigger[]
  variables: Record<string, any>
  isActive: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastExecuted?: Date
  executionCount: number
  successRate: number
  avgExecutionTime: number
}

export interface Trigger {
  id: string
  type: 'manual' | 'webhook' | 'schedule' | 'event'
  configuration: Record<string, any>
  isActive: boolean
}

export interface ProjectPermission {
  userId: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
    share: boolean
    admin: boolean
  }
  grantedAt: Date
  grantedBy: string
}

export interface ProjectIntegration {
  id: string
  type: 'github' | 'gitlab' | 'jira' | 'slack' | 'discord' | 'webhook' | 'ci-cd' | 'monitoring'
  name: string
  configuration: Record<string, any>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMetrics {
  totalExecutions: number
  successRate: number
  avgResponseTime: number
  errorRate: number
  uptime: number
  lastExecution?: Date
  topErrors: Array<{
    error: string
    count: number
    lastOccurred: Date
  }>
  performanceTrends: Array<{
    date: Date
    executions: number
    successRate: number
    avgResponseTime: number
  }>
  usage: {
    daily: number
    weekly: number
    monthly: number
  }
}

export interface ProjectSettings {
  visibility: 'private' | 'team' | 'public'
  defaultEnvironment: string
  notifications: {
    onFailure: boolean
    onSuccess: boolean
    onDeployment: boolean
    channels: string[]
  }
  security: {
    requireApproval: boolean
    allowExternalAccess: boolean
    ipWhitelist: string[]
    sslRequired: boolean
  }
  backup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retention: number
  }
  advanced: {
    enableLogging: boolean
    logLevel: 'info' | 'debug' | 'error'
    enableMetrics: boolean
    enableTracing: boolean
  }
}

export interface ProjectVersion {
  id: string
  version: string
  name?: string
  description?: string
  changelog: string
  isStable: boolean
  isCurrent: boolean
  createdAt: Date
  createdBy: string
  data: {
    collections: APICollection[]
    workflows: APIWorkflow[]
    environments: Environment[]
  }
}

// Main Project Interface
export interface Project {
  // Basic Information
  id: string
  name: string
  description: string
  icon: string
  color: string
  tags: string[]
  status: 'active' | 'idle' | 'archived' | 'development' | 'production'
  visibility: 'private' | 'team' | 'public'
  
  // Core Content
  collections: APICollection[]
  workflows: APIWorkflow[]
  environments: Environment[]
  
  // Team & Permissions
  owner: string
  team: User[]
  permissions: ProjectPermission[]
  
  // Versioning
  version: string
  versions: ProjectVersion[]
  
  // Integrations & Settings
  integrations: ProjectIntegration[]
  settings: ProjectSettings
  
  // Metrics & Analytics
  metrics: ProjectMetrics
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy?: string
  lastAccessed?: Date
  
  // Advanced Features
  templates?: {
    isTemplate: boolean
    templateId?: string
    category?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime?: number
  }
  
  documentation?: {
    readme: string
    apiDocs: string
    changelog: string
    contributing?: string
  }
  
  // AI/ML Features
  insights?: {
    suggestions: Array<{
      type: 'optimization' | 'security' | 'performance' | 'best-practice'
      title: string
      description: string
      impact: 'low' | 'medium' | 'high'
      effort: 'low' | 'medium' | 'high'
      autoFixable: boolean
    }>
    health_score: number
    complexity_score: number
    maintainability_score: number
  }
}

// Project Activity & Audit
export interface ProjectActivity {
  id: string
  projectId: string
  userId: string
  action: string
  type: 'create' | 'update' | 'delete' | 'execute' | 'share' | 'deploy'
  resource: string
  resourceId: string
  details: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// Project Analytics
export interface ProjectAnalytics {
  projectId: string
  period: {
    start: Date
    end: Date
  }
  overview: {
    totalRequests: number
    uniqueEndpoints: number
    activeUsers: number
    errorRate: number
    avgResponseTime: number
  }
  endpoints: Array<{
    endpoint: string
    requests: number
    errors: number
    avgResponseTime: number
    successRate: number
  }>
  users: Array<{
    userId: string
    requests: number
    lastActive: Date
  }>
  trends: {
    daily: Array<{
      date: Date
      requests: number
      errors: number
      users: number
    }>
    hourly: Array<{
      hour: number
      requests: number
      avgResponseTime: number
    }>
  }
  geography: Array<{
    country: string
    requests: number
    percentage: number
  }>
  devices: Array<{
    type: string
    requests: number
    percentage: number
  }>
}

// Template System
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'rest-api' | 'graphql' | 'microservices' | 'webhooks' | 'automation' | 'testing' | 'monitoring'
  subcategory?: string
  tags: string[]
  icon: string
  color: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // in minutes
  features: string[]
  technologies: string[]
  useCases: string[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  stats: {
    downloads: number
    rating: number
    reviews: number
    forks: number
  }
  version: string
  lastUpdated: Date
  isOfficial: boolean
  isFeatured: boolean
  isVerified: boolean
  template: {
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'owner'>
    instructions: string
    setup: Array<{
      step: number
      title: string
      description: string
      type: 'info' | 'action' | 'warning'
      optional?: boolean
    }>
  }
  preview: {
    images: string[]
    video?: string
    demo?: string
  }
  license: string
  sourceUrl?: string
  documentation?: string
}

// Export utility types
export type ProjectStatus = Project['status']
export type ProjectVisibility = Project['visibility']
export type UserRole = User['role']
export type EnvironmentType = Environment['type']
export type HTTPMethod = APIEndpoint['method']
export type WorkflowNodeType = WorkflowNode['type']
export type TriggerType = Trigger['type']
export type IntegrationType = ProjectIntegration['type']