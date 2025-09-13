// Node Palette Registry - The Complete ChickAPI Toolkit
import { NodePaletteItem, NodeCategory } from './types'
import { httpNodes } from './categories/http-nodes'
import { dataNodes } from './categories/data-nodes'
import { aiNodes } from './categories/ai-nodes'
import { controlNodes } from './categories/control-nodes'

// Additional essential node categories (condensed definitions)
import type { NodePaletteItem as NPI } from './types'

// Authentication & Security Nodes
const authNodes: NPI[] = [
  {
    id: 'oauth2-auth', name: 'OAuth2 Authentication', category: 'auth',
    description: 'Handle OAuth2 authentication flow', icon: '🔐', color: '#dc2626',
    inputs: [
      { key: 'clientId', type: 'string', displayName: 'Client ID', description: 'OAuth2 client ID', required: true },
      { key: 'clientSecret', type: 'string', displayName: 'Client Secret', description: 'OAuth2 client secret', required: true },
      { key: 'scope', type: 'string', displayName: 'Scope', description: 'OAuth2 scope', required: false }
    ],
    outputs: [
      { key: 'accessToken', type: 'string', displayName: 'Access Token', description: 'OAuth2 access token', required: true },
      { key: 'refreshToken', type: 'string', displayName: 'Refresh Token', description: 'OAuth2 refresh token', required: false },
      { key: 'expiresIn', type: 'number', displayName: 'Expires In', description: 'Token expiry time', required: true }
    ],
    properties: [
      { key: 'authUrl', name: 'Auth URL', type: 'url', description: 'Authorization endpoint', required: true },
      { key: 'tokenUrl', name: 'Token URL', type: 'url', description: 'Token endpoint', required: true },
      { key: 'redirectUri', name: 'Redirect URI', type: 'url', description: 'OAuth2 redirect URI', required: true },
      { key: 'grantType', name: 'Grant Type', type: 'select', description: 'OAuth2 grant type', default: 'authorization_code',
        options: [
          { label: 'Authorization Code', value: 'authorization_code' },
          { label: 'Client Credentials', value: 'client_credentials' },
          { label: 'Password', value: 'password' },
          { label: 'Refresh Token', value: 'refresh_token' }
        ]
      }
    ],
    examples: ['GitHub API authentication', 'Google API access', 'Microsoft Graph API'], tags: ['oauth2', 'auth', 'token']
  },
  
  {
    id: 'jwt-decode', name: 'JWT Decoder', category: 'security',
    description: 'Decode and validate JWT tokens', icon: '🔓', color: '#7c3aed',
    inputs: [
      { key: 'token', type: 'string', displayName: 'JWT Token', description: 'JWT token to decode', required: true },
      { key: 'secret', type: 'string', displayName: 'Secret', description: 'Secret for verification', required: false }
    ],
    outputs: [
      { key: 'header', type: 'object', displayName: 'Header', description: 'JWT header', required: true },
      { key: 'payload', type: 'object', displayName: 'Payload', description: 'JWT payload', required: true },
      { key: 'valid', type: 'boolean', displayName: 'Valid', description: 'Token validity', required: true },
      { key: 'expired', type: 'boolean', displayName: 'Expired', description: 'Token expired', required: true }
    ],
    properties: [
      { key: 'verify', name: 'Verify Signature', type: 'boolean', description: 'Verify token signature', default: true },
      { key: 'checkExpiry', name: 'Check Expiry', type: 'boolean', description: 'Check token expiry', default: true }
    ],
    examples: ['Validate API tokens', 'Extract user info from JWT'], tags: ['jwt', 'token', 'decode']
  }
]

// Database Nodes
const databaseNodes: NPI[] = [
  {
    id: 'sql-query', name: 'SQL Query', category: 'database',
    description: 'Execute SQL queries against databases', icon: '🗃️', color: '#0ea5e9',
    inputs: [
      { key: 'query', type: 'string', displayName: 'SQL Query', description: 'SQL query to execute', required: true },
      { key: 'params', type: 'object', displayName: 'Parameters', description: 'Query parameters', required: false }
    ],
    outputs: [
      { key: 'rows', type: 'array', displayName: 'Rows', description: 'Query result rows', required: true },
      { key: 'metadata', type: 'object', displayName: 'Metadata', description: 'Query metadata', required: true },
      { key: 'rowCount', type: 'number', displayName: 'Row Count', description: 'Number of affected rows', required: true }
    ],
    properties: [
      { key: 'connectionString', name: 'Connection String', type: 'password', description: 'Database connection string', required: true },
      { key: 'database', name: 'Database Type', type: 'select', description: 'Database type', default: 'postgresql',
        options: [
          { label: 'PostgreSQL', value: 'postgresql' },
          { label: 'MySQL', value: 'mysql' },
          { label: 'SQLite', value: 'sqlite' },
          { label: 'SQL Server', value: 'sqlserver' },
          { label: 'Oracle', value: 'oracle' }
        ]
      },
      { key: 'timeout', name: 'Query Timeout', type: 'number', description: 'Query timeout in seconds', default: 30 }
    ],
    examples: ['Execute database queries', 'Fetch test data'], tags: ['sql', 'database', 'query']
  }
]

// Mock & Testing Nodes
const mockNodes: NPI[] = [
  {
    id: 'mock-server', name: 'Mock Server', category: 'mock',
    description: 'Create mock HTTP server responses', icon: 'Theater', color: '#f97316',
    inputs: [
      { key: 'request', type: 'object', displayName: 'Request', description: 'Incoming request', required: true }
    ],
    outputs: [
      { key: 'response', type: 'object', displayName: 'Response', description: 'Mock response', required: true }
    ],
    properties: [
      { key: 'statusCode', name: 'Status Code', type: 'number', description: 'HTTP status code', default: 200 },
      { key: 'headers', name: 'Headers', type: 'headers', description: 'Response headers', required: false },
      { key: 'body', name: 'Body', type: 'json', description: 'Response body', required: false },
      { key: 'delay', name: 'Response Delay (ms)', type: 'number', description: 'Simulate network delay', default: 0 }
    ],
    examples: ['Mock third-party APIs', 'Test error scenarios'], tags: ['mock', 'testing', 'server']
  },
  
  {
    id: 'data-generator', name: 'Data Generator', category: 'mock',
    description: 'Generate realistic fake data for testing', icon: 'Dices', color: '#14b8a6',
    inputs: [
      { key: 'schema', type: 'object', displayName: 'Schema', description: 'Data generation schema', required: true },
      { key: 'count', type: 'number', displayName: 'Count', description: 'Number of records to generate', required: false }
    ],
    outputs: [
      { key: 'data', type: 'array', displayName: 'Generated Data', description: 'Generated fake data', required: true }
    ],
    properties: [
      { key: 'count', name: 'Record Count', type: 'number', description: 'Number of records', default: 10 },
      { key: 'locale', name: 'Locale', type: 'select', description: 'Data locale', default: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' }
        ]
      }
    ],
    examples: ['Generate test users', 'Create sample API data'], tags: ['generator', 'fake', 'testing']
  }
]

// Notification Nodes
const notificationNodes: NPI[] = [
  {
    id: 'email-send', name: 'Send Email', category: 'notification',
    description: 'Send email notifications', icon: '📧', color: '#dc2626',
    inputs: [
      { key: 'to', type: 'string', displayName: 'To', description: 'Recipient email addresses', required: true },
      { key: 'subject', type: 'string', displayName: 'Subject', description: 'Email subject', required: true },
      { key: 'body', type: 'string', displayName: 'Body', description: 'Email body', required: true }
    ],
    outputs: [
      { key: 'messageId', type: 'string', displayName: 'Message ID', description: 'Email message ID', required: true },
      { key: 'status', type: 'string', displayName: 'Status', description: 'Send status', required: true }
    ],
    properties: [
      { key: 'provider', name: 'Provider', type: 'select', description: 'Email provider', default: 'smtp',
        options: [
          { label: 'SMTP', value: 'smtp' },
          { label: 'SendGrid', value: 'sendgrid' },
          { label: 'Mailgun', value: 'mailgun' },
          { label: 'AWS SES', value: 'ses' }
        ]
      },
      { key: 'from', name: 'From Address', type: 'email', description: 'Sender email address', required: true },
      { key: 'isHtml', name: 'HTML Content', type: 'boolean', description: 'Email contains HTML', default: false }
    ],
    examples: ['Test completion notifications', 'Error alerts'], tags: ['email', 'notification', 'alert']
  }
]

// Utility Nodes
const utilityNodes: NPI[] = [
  {
    id: 'variable-set', name: 'Set Variable', category: 'utility',
    description: 'Set workflow variables', icon: 'Edit', color: '#64748b',
    inputs: [
      { key: 'value', type: 'any', displayName: 'Value', description: 'Value to store', required: true }
    ],
    outputs: [
      { key: 'value', type: 'any', displayName: 'Value', description: 'Stored value', required: true }
    ],
    properties: [
      { key: 'variableName', name: 'Variable Name', type: 'string', description: 'Variable name', required: true },
      { key: 'scope', name: 'Scope', type: 'select', description: 'Variable scope', default: 'workflow',
        options: [
          { label: 'Workflow', value: 'workflow' },
          { label: 'Global', value: 'global' },
          { label: 'Environment', value: 'environment' }
        ]
      }
    ],
    examples: ['Store API responses', 'Set configuration values'], tags: ['variable', 'storage', 'state']
  },
  
  {
    id: 'logger', name: 'Logger', category: 'monitoring',
    description: 'Log messages and data for debugging', icon: 'Clipboard', color: '#374151',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Data', description: 'Data to log', required: true },
      { key: 'message', type: 'string', displayName: 'Message', description: 'Log message', required: false }
    ],
    outputs: [
      { key: 'data', type: 'any', displayName: 'Data', description: 'Pass-through data', required: true },
      { key: 'logId', type: 'string', displayName: 'Log ID', description: 'Log entry ID', required: true }
    ],
    properties: [
      { key: 'level', name: 'Log Level', type: 'select', description: 'Log level', default: 'info',
        options: [
          { label: 'Debug', value: 'debug' },
          { label: 'Info', value: 'info' },
          { label: 'Warning', value: 'warn' },
          { label: 'Error', value: 'error' }
        ]
      }
    ],
    examples: ['Debug workflow execution', 'Track API responses'], tags: ['log', 'debug', 'monitoring']
  }
]

// Complete node registry
export const nodeRegistry: Record<string, NodePaletteItem> = {}

// Category groups for organized display
export const categoryGroups = {
  core: {
    name: 'Core',
    icon: 'Wrench',
    categories: ['http', 'data', 'control'] as NodeCategory[]
  },
  ai: {
    name: 'AI & ML',
    icon: 'Bot',
    categories: ['ai'] as NodeCategory[]
  },
  integration: {
    name: 'Integration',
    icon: 'Link',
    categories: ['auth', 'database', 'protocol', 'storage'] as NodeCategory[]
  },
  testing: {
    name: 'Testing',
    icon: 'TestTube',
    categories: ['testing', 'mock', 'monitoring'] as NodeCategory[]
  },
  utilities: {
    name: 'Utilities',
    icon: 'Settings',
    categories: ['utility', 'time', 'notification', 'transform'] as NodeCategory[]
  },
  advanced: {
    name: 'Advanced',
    icon: 'Rocket',
    categories: ['security', 'realtime', 'browser', 'mobile'] as NodeCategory[]
  }
}

// All available node categories with metadata
export const categoryMetadata: Record<NodeCategory, {
  name: string
  description: string
  icon: string
  color: string
}> = {
  http: { name: 'HTTP & API', description: 'HTTP requests and API operations', icon: 'Globe', color: '#3b82f6' },
  data: { name: 'Data Processing', description: 'Transform and process data', icon: 'RefreshCw', color: '#10b981' },
  control: { name: 'Control Flow', description: 'Workflow logic and control', icon: 'GitBranch', color: '#f59e0b' },
  auth: { name: 'Authentication', description: 'Authentication and authorization', icon: 'Lock', color: '#dc2626' },
  database: { name: 'Database', description: 'Database operations', icon: 'Database', color: '#0ea5e9' },
  storage: { name: 'File & Storage', description: 'File and cloud storage', icon: 'HardDrive', color: '#8b5cf6' },
  notification: { name: 'Notifications', description: 'Alerts and messaging', icon: 'Megaphone', color: '#ec4899' },
  testing: { name: 'Testing', description: 'Validation and testing', icon: 'CheckCircle', color: '#059669' },
  time: { name: 'Time & Schedule', description: 'Timing and scheduling', icon: 'Clock', color: '#84cc16' },
  integration: { name: 'Integrations', description: 'Third-party integrations', icon: 'Plug', color: '#06b6d4' },
  utility: { name: 'Utilities', description: 'Helper functions', icon: 'Tool', color: '#64748b' },
  ai: { name: 'AI & ML', description: 'Artificial intelligence', icon: 'Bot', color: '#7c3aed' },
  security: { name: 'Security', description: 'Security and encryption', icon: 'Shield', color: '#dc2626' },
  monitoring: { name: 'Monitoring', description: 'Logging and monitoring', icon: 'BarChart3', color: '#374151' },
  realtime: { name: 'Real-time', description: 'WebSocket and streaming', icon: 'Zap', color: '#10b981' },
  mock: { name: 'Mock & Testing', description: 'Mock data and servers', icon: 'Theater', color: '#f97316' },
  transform: { name: 'Transform', description: 'Advanced transformations', icon: 'Wrench', color: '#6366f1' },
  protocol: { name: 'Protocols', description: 'Various protocols (SOAP, GraphQL)', icon: 'Radio', color: '#e535ab' },
  browser: { name: 'Browser', description: 'Browser automation', icon: 'Monitor', color: '#f59e0b' },
  mobile: { name: 'Mobile', description: 'Mobile testing', icon: 'Smartphone', color: '#ec4899' }
}

// Register all nodes
const allNodes: NodePaletteItem[] = [
  ...httpNodes,
  ...dataNodes,
  ...aiNodes,
  ...controlNodes,
  ...authNodes,
  ...databaseNodes,
  ...mockNodes,
  ...notificationNodes,
  ...utilityNodes
]

allNodes.forEach(node => {
  nodeRegistry[node.id] = node
})

// Helper functions
export function getNodeById(id: string): NodePaletteItem | undefined {
  return nodeRegistry[id]
}

export function getNodesByCategory(category: NodeCategory): NodePaletteItem[] {
  return allNodes.filter(node => node.category === category)
}

export function searchNodes(query: string): NodePaletteItem[] {
  const lowerQuery = query.toLowerCase()
  return allNodes.filter(node => 
    node.name.toLowerCase().includes(lowerQuery) ||
    node.description.toLowerCase().includes(lowerQuery) ||
    node.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

export function getNodesByTag(tag: string): NodePaletteItem[] {
  return allNodes.filter(node => node.tags.includes(tag))
}

export function getAllCategories(): NodeCategory[] {
  return Object.keys(categoryMetadata) as NodeCategory[]
}

export function getNodesCount(): number {
  return allNodes.length
}

export function getCategoryCount(): number {
  return getAllCategories().length
}

// Export everything
export { allNodes as nodes }
export * from './types'
