// Data Processing & Transformation Nodes
import { NodePaletteItem } from '../types'

export const dataNodes: NodePaletteItem[] = [
  {
    id: 'json-transform',
    name: 'JSON Transform',
    category: 'data',
    description: 'Transform JSON data using JSONPath, JMESPath, or custom logic',
    icon: '🔄',
    color: '#10b981',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Input Data', description: 'Data to transform', required: true },
      { key: 'mapping', type: 'object', displayName: 'Mapping', description: 'Transformation mapping', required: false }
    ],
    outputs: [
      { key: 'result', type: 'any', displayName: 'Result', description: 'Transformed data', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Transformation errors', required: false }
    ],
    properties: [
      { key: 'engine', name: 'Transform Engine', type: 'select', description: 'Transformation engine to use', default: 'jsonpath',
        options: [
          { label: 'JSONPath', value: 'jsonpath' },
          { label: 'JMESPath', value: 'jmespath' },
          { label: 'JavaScript', value: 'javascript' },
          { label: 'Template', value: 'template' }
        ]
      },
      { key: 'expression', name: 'Expression', type: 'code', description: 'Transformation expression', required: true },
      { key: 'strictMode', name: 'Strict Mode', type: 'boolean', description: 'Strict transformation mode', default: false },
      { key: 'nullHandling', name: 'Null Handling', type: 'select', description: 'How to handle null values', default: 'keep',
        options: [
          { label: 'Keep Nulls', value: 'keep' },
          { label: 'Remove Nulls', value: 'remove' },
          { label: 'Convert to Empty', value: 'empty' }
        ]
      }
    ],
    examples: [
      'Extract specific fields from API response',
      'Reshape data for different API format',
      'Calculate derived values from input data'
    ],
    tags: ['json', 'transform', 'jsonpath', 'jmespath', 'mapping']
  },

  {
    id: 'data-filter',
    name: 'Data Filter',
    category: 'data',
    description: 'Filter arrays and objects based on conditions',
    icon: 'Search',
    color: '#3b82f6',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Input Data', description: 'Data to filter', required: true },
      { key: 'conditions', type: 'array', displayName: 'Conditions', description: 'Filter conditions', required: true }
    ],
    outputs: [
      { key: 'filtered', type: 'any', displayName: 'Filtered Data', description: 'Data matching conditions', required: true },
      { key: 'excluded', type: 'any', displayName: 'Excluded Data', description: 'Data not matching conditions', required: false },
      { key: 'count', type: 'number', displayName: 'Count', description: 'Number of matching items', required: true }
    ],
    properties: [
      { key: 'operator', name: 'Operator', type: 'select', description: 'Logical operator for multiple conditions', default: 'AND',
        options: [
          { label: 'AND', value: 'AND' },
          { label: 'OR', value: 'OR' },
          { label: 'NOT', value: 'NOT' }
        ]
      },
      { key: 'preserveStructure', name: 'Preserve Structure', type: 'boolean', description: 'Keep original data structure', default: true },
      { key: 'caseSensitive', name: 'Case Sensitive', type: 'boolean', description: 'Case sensitive string matching', default: false }
    ],
    examples: [
      'Filter API results by status code',
      'Find records matching criteria',
      'Remove incomplete data entries'
    ],
    tags: ['filter', 'condition', 'array', 'search']
  },

  {
    id: 'data-validator',
    name: 'Data Validator',
    category: 'testing',
    description: 'Validate data against schemas (JSON Schema, Joi, custom)',
    icon: 'CheckCircle',
    color: '#059669',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Data', description: 'Data to validate', required: true },
      { key: 'schema', type: 'object', displayName: 'Schema', description: 'Validation schema', required: true }
    ],
    outputs: [
      { key: 'valid', type: 'boolean', displayName: 'Is Valid', description: 'Whether data is valid', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Validation errors', required: false },
      { key: 'warnings', type: 'array', displayName: 'Warnings', description: 'Validation warnings', required: false },
      { key: 'cleaned', type: 'any', displayName: 'Cleaned Data', description: 'Data after cleaning', required: false }
    ],
    properties: [
      { key: 'validator', name: 'Validator', type: 'select', description: 'Validation engine', default: 'jsonschema',
        options: [
          { label: 'JSON Schema', value: 'jsonschema' },
          { label: 'Joi', value: 'joi' },
          { label: 'Yup', value: 'yup' },
          { label: 'Custom', value: 'custom' },
          { label: 'OpenAPI', value: 'openapi' }
        ]
      },
      { key: 'strictMode', name: 'Strict Mode', type: 'boolean', description: 'Strict validation mode', default: true },
      { key: 'coerceTypes', name: 'Coerce Types', type: 'boolean', description: 'Automatically convert types', default: false },
      { key: 'removeAdditional', name: 'Remove Additional', type: 'boolean', description: 'Remove additional properties', default: false }
    ],
    examples: [
      'Validate API response structure',
      'Check input data before processing',
      'Ensure data quality standards'
    ],
    tags: ['validation', 'schema', 'jsonschema', 'joi', 'quality']
  },

  {
    id: 'csv-parser',
    name: 'CSV Parser',
    category: 'data',
    description: 'Parse CSV data into JSON objects',
    icon: 'BarChart3',
    color: '#f59e0b',
    inputs: [
      { key: 'csv', type: 'string', displayName: 'CSV Data', description: 'Raw CSV data', required: true },
      { key: 'headers', type: 'array', displayName: 'Headers', description: 'Custom column headers', required: false }
    ],
    outputs: [
      { key: 'data', type: 'array', displayName: 'Parsed Data', description: 'Array of objects', required: true },
      { key: 'headers', type: 'array', displayName: 'Headers', description: 'Detected headers', required: true },
      { key: 'rowCount', type: 'number', displayName: 'Row Count', description: 'Number of rows', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Parsing errors', required: false }
    ],
    properties: [
      { key: 'delimiter', name: 'Delimiter', type: 'string', description: 'CSV delimiter', default: ',' },
      { key: 'quote', name: 'Quote Character', type: 'string', description: 'Quote character', default: '"' },
      { key: 'escape', name: 'Escape Character', type: 'string', description: 'Escape character', default: '"' },
      { key: 'hasHeaders', name: 'Has Headers', type: 'boolean', description: 'First row contains headers', default: true },
      { key: 'skipEmptyLines', name: 'Skip Empty Lines', type: 'boolean', description: 'Skip empty lines', default: true },
      { key: 'trimValues', name: 'Trim Values', type: 'boolean', description: 'Trim whitespace from values', default: true },
      { key: 'encoding', name: 'Encoding', type: 'select', description: 'Text encoding', default: 'utf8',
        options: [
          { label: 'UTF-8', value: 'utf8' },
          { label: 'UTF-16', value: 'utf16' },
          { label: 'ASCII', value: 'ascii' },
          { label: 'Latin1', value: 'latin1' }
        ]
      }
    ],
    examples: [
      'Parse CSV export from database',
      'Process spreadsheet data',
      'Import user data from CSV file'
    ],
    tags: ['csv', 'parser', 'spreadsheet', 'import']
  },

  {
    id: 'xml-parser',
    name: 'XML Parser',
    category: 'data',
    description: 'Parse XML data into JSON objects',
    icon: 'FileText',
    color: '#8b5cf6',
    inputs: [
      { key: 'xml', type: 'string', displayName: 'XML Data', description: 'Raw XML data', required: true },
      { key: 'xpath', type: 'string', displayName: 'XPath', description: 'XPath expression to extract specific data', required: false }
    ],
    outputs: [
      { key: 'data', type: 'object', displayName: 'Parsed Data', description: 'Parsed XML as JSON', required: true },
      { key: 'namespaces', type: 'object', displayName: 'Namespaces', description: 'XML namespaces', required: false },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Parsing errors', required: false }
    ],
    properties: [
      { key: 'preserveAttributes', name: 'Preserve Attributes', type: 'boolean', description: 'Keep XML attributes', default: true },
      { key: 'textKey', name: 'Text Key', type: 'string', description: 'Key name for text content', default: '_text' },
      { key: 'attributeKey', name: 'Attribute Key', type: 'string', description: 'Key prefix for attributes', default: '_attr' },
      { key: 'explicitArray', name: 'Explicit Array', type: 'boolean', description: 'Always create arrays for repeated elements', default: false },
      { key: 'ignoreNamespace', name: 'Ignore Namespace', type: 'boolean', description: 'Ignore XML namespaces', default: false },
      { key: 'trim', name: 'Trim Text', type: 'boolean', description: 'Trim whitespace from text content', default: true }
    ],
    examples: [
      'Parse SOAP response XML',
      'Process RSS/Atom feeds',
      'Extract data from XML APIs'
    ],
    tags: ['xml', 'parser', 'xpath', 'soap']
  },

  {
    id: 'data-aggregator',
    name: 'Data Aggregator',
    category: 'data',
    description: 'Aggregate data with grouping, counting, summing, averaging',
    icon: 'TrendingUp',
    color: '#ec4899',
    inputs: [
      { key: 'data', type: 'array', displayName: 'Input Data', description: 'Array of objects to aggregate', required: true },
      { key: 'groupBy', type: 'array', displayName: 'Group By', description: 'Fields to group by', required: false },
      { key: 'operations', type: 'array', displayName: 'Operations', description: 'Aggregation operations', required: true }
    ],
    outputs: [
      { key: 'result', type: 'array', displayName: 'Aggregated Data', description: 'Aggregated results', required: true },
      { key: 'summary', type: 'object', displayName: 'Summary', description: 'Aggregation summary', required: true },
      { key: 'groupCount', type: 'number', displayName: 'Group Count', description: 'Number of groups', required: true }
    ],
    properties: [
      { key: 'operations', name: 'Operations', type: 'multiSelect', description: 'Aggregation operations to perform',
        options: [
          { label: 'Count', value: 'count' },
          { label: 'Sum', value: 'sum' },
          { label: 'Average', value: 'avg' },
          { label: 'Min', value: 'min' },
          { label: 'Max', value: 'max' },
          { label: 'Median', value: 'median' },
          { label: 'Mode', value: 'mode' },
          { label: 'Standard Deviation', value: 'stddev' }
        ]
      },
      { key: 'includeEmpty', name: 'Include Empty Groups', type: 'boolean', description: 'Include groups with no data', default: false },
      { key: 'sortBy', name: 'Sort By', type: 'select', description: 'Sort aggregated results', default: 'none',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Count (ASC)', value: 'count_asc' },
          { label: 'Count (DESC)', value: 'count_desc' },
          { label: 'Group Key', value: 'key' }
        ]
      }
    ],
    examples: [
      'Calculate API response time statistics',
      'Group error logs by status code',
      'Analyze user behavior patterns'
    ],
    tags: ['aggregate', 'group', 'statistics', 'analytics']
  },

  {
    id: 'data-merger',
    name: 'Data Merger',
    category: 'data',
    description: 'Merge multiple datasets based on keys or conditions',
    icon: '🔗',
    color: '#0ea5e9',
    inputs: [
      { key: 'primary', type: 'array', displayName: 'Primary Data', description: 'Primary dataset', required: true },
      { key: 'secondary', type: 'array', displayName: 'Secondary Data', description: 'Secondary dataset', required: true, multiple: true },
      { key: 'joinKeys', type: 'object', displayName: 'Join Keys', description: 'Keys to join on', required: true }
    ],
    outputs: [
      { key: 'merged', type: 'array', displayName: 'Merged Data', description: 'Merged dataset', required: true },
      { key: 'unmatched', type: 'array', displayName: 'Unmatched', description: 'Unmatched records', required: false },
      { key: 'duplicates', type: 'array', displayName: 'Duplicates', description: 'Duplicate records', required: false }
    ],
    properties: [
      { key: 'joinType', name: 'Join Type', type: 'select', description: 'Type of join operation', default: 'inner',
        options: [
          { label: 'Inner Join', value: 'inner' },
          { label: 'Left Join', value: 'left' },
          { label: 'Right Join', value: 'right' },
          { label: 'Full Outer Join', value: 'full' },
          { label: 'Union', value: 'union' },
          { label: 'Intersection', value: 'intersection' }
        ]
      },
      { key: 'conflictResolution', name: 'Conflict Resolution', type: 'select', description: 'How to resolve field conflicts', default: 'primary',
        options: [
          { label: 'Keep Primary', value: 'primary' },
          { label: 'Keep Secondary', value: 'secondary' },
          { label: 'Combine Arrays', value: 'array' },
          { label: 'Create Nested Object', value: 'nested' }
        ]
      },
      { key: 'caseSensitive', name: 'Case Sensitive Keys', type: 'boolean', description: 'Case sensitive key matching', default: true },
      { key: 'allowPartialMatch', name: 'Allow Partial Match', type: 'boolean', description: 'Allow partial key matches', default: false }
    ],
    examples: [
      'Merge user data with profile information',
      'Combine API responses from multiple sources',
      'Join test results with configuration data'
    ],
    tags: ['merge', 'join', 'combine', 'union']
  }
]
