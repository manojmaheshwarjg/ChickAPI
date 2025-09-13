// HTTP & API Request Nodes
import { NodePaletteItem } from '../types'

export const httpNodes: NodePaletteItem[] = [
  {
    id: 'http-request',
    name: 'HTTP Request',
    category: 'http',
    description: 'Send HTTP requests with full customization',
    icon: 'Globe',
    color: '#3b82f6',
    inputs: [
      { key: 'url', type: 'string', displayName: 'URL', description: 'Request URL', required: true },
      { key: 'headers', type: 'object', displayName: 'Headers', description: 'HTTP headers', required: false },
      { key: 'body', type: 'any', displayName: 'Body', description: 'Request body', required: false },
      { key: 'params', type: 'object', displayName: 'Query Params', description: 'URL parameters', required: false },
      { key: 'auth', type: 'object', displayName: 'Auth', description: 'Authentication', required: false }
    ],
    outputs: [
      { key: 'response', type: 'object', displayName: 'Response', description: 'Full HTTP response', required: true },
      { key: 'data', type: 'any', displayName: 'Data', description: 'Response body', required: true },
      { key: 'status', type: 'number', displayName: 'Status', description: 'HTTP status code', required: true },
      { key: 'headers', type: 'object', displayName: 'Headers', description: 'Response headers', required: true },
      { key: 'error', type: 'object', displayName: 'Error', description: 'Error details if failed', required: false }
    ],
    properties: [
      { key: 'method', name: 'Method', type: 'select', description: 'HTTP method', required: true, default: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'HEAD', value: 'HEAD' },
          { label: 'OPTIONS', value: 'OPTIONS' }
        ]
      },
      { key: 'timeout', name: 'Timeout', type: 'number', description: 'Request timeout in ms', default: 30000 },
      { key: 'retries', name: 'Retries', type: 'number', description: 'Number of retries', default: 0 },
      { key: 'followRedirects', name: 'Follow Redirects', type: 'boolean', description: 'Follow HTTP redirects', default: true },
      { key: 'validateSSL', name: 'Validate SSL', type: 'boolean', description: 'Validate SSL certificates', default: true },
      { key: 'encoding', name: 'Encoding', type: 'select', description: 'Response encoding', default: 'utf8',
        options: [
          { label: 'UTF-8', value: 'utf8' },
          { label: 'Base64', value: 'base64' },
          { label: 'Binary', value: 'binary' },
          { label: 'Hex', value: 'hex' }
        ]
      },
      { key: 'proxy', name: 'Proxy URL', type: 'string', description: 'Proxy server URL', required: false },
      { key: 'userAgent', name: 'User Agent', type: 'string', description: 'Custom User-Agent header', required: false }
    ],
    examples: [
      'Basic GET request to REST API',
      'POST JSON data to webhook',
      'File upload with multipart form data',
      'API request with custom headers'
    ],
    tags: ['http', 'api', 'request', 'rest', 'web']
  },

  {
    id: 'graphql-query',
    name: 'GraphQL Query',
    category: 'protocol',
    description: 'Execute GraphQL queries and mutations',
    icon: '⚡',
    color: '#e535ab',
    inputs: [
      { key: 'endpoint', type: 'string', displayName: 'Endpoint', description: 'GraphQL endpoint URL', required: true },
      { key: 'query', type: 'string', displayName: 'Query', description: 'GraphQL query/mutation', required: true },
      { key: 'variables', type: 'object', displayName: 'Variables', description: 'Query variables', required: false },
      { key: 'headers', type: 'object', displayName: 'Headers', description: 'HTTP headers', required: false }
    ],
    outputs: [
      { key: 'data', type: 'any', displayName: 'Data', description: 'Query result data', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'GraphQL errors', required: false },
      { key: 'extensions', type: 'object', displayName: 'Extensions', description: 'Response extensions', required: false }
    ],
    properties: [
      { key: 'operationType', name: 'Operation Type', type: 'select', description: 'GraphQL operation type', default: 'query',
        options: [
          { label: 'Query', value: 'query' },
          { label: 'Mutation', value: 'mutation' },
          { label: 'Subscription', value: 'subscription' }
        ]
      },
      { key: 'introspection', name: 'Enable Introspection', type: 'boolean', description: 'Allow introspection queries', default: false },
      { key: 'persistedQueries', name: 'Persisted Queries', type: 'boolean', description: 'Use persisted queries', default: false }
    ],
    examples: [
      'Fetch user profile with GraphQL',
      'Create new record with mutation',
      'Subscribe to real-time updates'
    ],
    tags: ['graphql', 'query', 'mutation', 'api']
  },

  {
    id: 'soap-request',
    name: 'SOAP Request',
    category: 'protocol',
    description: 'Send SOAP web service requests',
    icon: '🧼',
    color: '#059669',
    inputs: [
      { key: 'wsdl', type: 'string', displayName: 'WSDL URL', description: 'WSDL service URL', required: true },
      { key: 'operation', type: 'string', displayName: 'Operation', description: 'SOAP operation name', required: true },
      { key: 'parameters', type: 'object', displayName: 'Parameters', description: 'Operation parameters', required: false },
      { key: 'headers', type: 'object', displayName: 'SOAP Headers', description: 'SOAP headers', required: false }
    ],
    outputs: [
      { key: 'result', type: 'object', displayName: 'Result', description: 'SOAP response', required: true },
      { key: 'fault', type: 'object', displayName: 'Fault', description: 'SOAP fault details', required: false }
    ],
    properties: [
      { key: 'version', name: 'SOAP Version', type: 'select', description: 'SOAP protocol version', default: '1.2',
        options: [
          { label: 'SOAP 1.1', value: '1.1' },
          { label: 'SOAP 1.2', value: '1.2' }
        ]
      },
      { key: 'namespace', name: 'Namespace', type: 'string', description: 'Target namespace', required: false }
    ],
    examples: [
      'Call legacy SOAP web service',
      'Enterprise system integration',
      'Financial services API calls'
    ],
    tags: ['soap', 'xml', 'webservice', 'enterprise']
  },

  {
    id: 'webhook-listener',
    name: 'Webhook Listener',
    category: 'http',
    description: 'Listen for incoming webhook requests',
    icon: '📡',
    color: '#8b5cf6',
    inputs: [],
    outputs: [
      { key: 'method', type: 'string', displayName: 'Method', description: 'HTTP method', required: true },
      { key: 'headers', type: 'object', displayName: 'Headers', description: 'Request headers', required: true },
      { key: 'body', type: 'any', displayName: 'Body', description: 'Request body', required: true },
      { key: 'query', type: 'object', displayName: 'Query', description: 'Query parameters', required: true },
      { key: 'timestamp', type: 'string', displayName: 'Timestamp', description: 'Request timestamp', required: true }
    ],
    properties: [
      { key: 'path', name: 'Path', type: 'string', description: 'Webhook endpoint path', required: true, default: '/webhook' },
      { key: 'methods', name: 'Allowed Methods', type: 'multiSelect', description: 'Allowed HTTP methods', 
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' }
        ]
      },
      { key: 'secret', name: 'Secret', type: 'password', description: 'Webhook secret for validation', required: false },
      { key: 'signature', name: 'Signature Header', type: 'string', description: 'Signature header name', default: 'x-signature' }
    ],
    examples: [
      'GitHub webhook for CI/CD',
      'Stripe payment notifications',
      'Slack event subscriptions'
    ],
    tags: ['webhook', 'listener', 'event', 'callback']
  },

  {
    id: 'file-upload',
    name: 'File Upload',
    category: 'http',
    description: 'Upload files via HTTP multipart',
    icon: '📤',
    color: '#f59e0b',
    inputs: [
      { key: 'url', type: 'string', displayName: 'Upload URL', description: 'File upload endpoint', required: true },
      { key: 'file', type: 'file', displayName: 'File', description: 'File to upload', required: true },
      { key: 'fields', type: 'object', displayName: 'Form Fields', description: 'Additional form fields', required: false },
      { key: 'headers', type: 'object', displayName: 'Headers', description: 'HTTP headers', required: false }
    ],
    outputs: [
      { key: 'response', type: 'object', displayName: 'Response', description: 'Upload response', required: true },
      { key: 'uploadId', type: 'string', displayName: 'Upload ID', description: 'File upload identifier', required: false },
      { key: 'url', type: 'string', displayName: 'File URL', description: 'Uploaded file URL', required: false }
    ],
    properties: [
      { key: 'fieldName', name: 'Field Name', type: 'string', description: 'Form field name for file', default: 'file' },
      { key: 'maxSize', name: 'Max Size (MB)', type: 'number', description: 'Maximum file size', default: 10 },
      { key: 'allowedTypes', name: 'Allowed Types', type: 'multiSelect', description: 'Allowed MIME types',
        options: [
          { label: 'Images', value: 'image/*' },
          { label: 'Documents', value: 'application/pdf' },
          { label: 'JSON', value: 'application/json' },
          { label: 'Text', value: 'text/*' },
          { label: 'Any', value: '*/*' }
        ]
      },
      { key: 'chunked', name: 'Chunked Upload', type: 'boolean', description: 'Use chunked upload for large files', default: false },
      { key: 'chunkSize', name: 'Chunk Size (KB)', type: 'number', description: 'Upload chunk size', default: 1024 }
    ],
    examples: [
      'Upload image to cloud storage',
      'Submit document for processing',
      'Bulk file import to API'
    ],
    tags: ['upload', 'file', 'multipart', 'storage']
  },

  {
    id: 'http-batch',
    name: 'HTTP Batch',
    category: 'http',
    description: 'Execute multiple HTTP requests in parallel or sequence',
    icon: '📦',
    color: '#6366f1',
    inputs: [
      { key: 'requests', type: 'array', displayName: 'Requests', description: 'Array of HTTP request configs', required: true, multiple: true }
    ],
    outputs: [
      { key: 'responses', type: 'array', displayName: 'Responses', description: 'Array of responses', required: true },
      { key: 'success', type: 'array', displayName: 'Success', description: 'Successful responses', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Failed responses', required: true },
      { key: 'summary', type: 'object', displayName: 'Summary', description: 'Batch execution summary', required: true }
    ],
    properties: [
      { key: 'mode', name: 'Execution Mode', type: 'select', description: 'How to execute requests', default: 'parallel',
        options: [
          { label: 'Parallel', value: 'parallel' },
          { label: 'Sequential', value: 'sequential' },
          { label: 'Rate Limited', value: 'throttled' }
        ]
      },
      { key: 'concurrency', name: 'Max Concurrency', type: 'number', description: 'Max parallel requests', default: 5 },
      { key: 'delayBetween', name: 'Delay Between (ms)', type: 'number', description: 'Delay between sequential requests', default: 0 },
      { key: 'failFast', name: 'Fail Fast', type: 'boolean', description: 'Stop on first error', default: false },
      { key: 'continueOnError', name: 'Continue on Error', type: 'boolean', description: 'Continue if some requests fail', default: true }
    ],
    examples: [
      'Bulk API data synchronization',
      'Load testing multiple endpoints',
      'Parallel health checks'
    ],
    tags: ['batch', 'bulk', 'parallel', 'concurrent']
  }
]
