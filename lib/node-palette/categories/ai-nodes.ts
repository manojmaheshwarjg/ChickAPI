// AI & Machine Learning Nodes
import { NodePaletteItem } from '../types'

export const aiNodes: NodePaletteItem[] = [
  {
    id: 'openai-chat',
    name: 'OpenAI Chat',
    category: 'ai',
    description: 'Generate text using OpenAI GPT models',
    icon: '🤖',
    color: '#10a37f',
    inputs: [
      { key: 'messages', type: 'array', displayName: 'Messages', description: 'Chat conversation history', required: true },
      { key: 'context', type: 'string', displayName: 'Context', description: 'Additional context for the AI', required: false },
      { key: 'variables', type: 'object', displayName: 'Variables', description: 'Template variables', required: false }
    ],
    outputs: [
      { key: 'response', type: 'string', displayName: 'Response', description: 'AI generated text', required: true },
      { key: 'usage', type: 'object', displayName: 'Usage', description: 'Token usage statistics', required: true },
      { key: 'finishReason', type: 'string', displayName: 'Finish Reason', description: 'Why the response ended', required: true },
      { key: 'metadata', type: 'object', displayName: 'Metadata', description: 'Response metadata', required: false }
    ],
    properties: [
      { key: 'apiKey', name: 'API Key', type: 'password', description: 'OpenAI API key', required: true },
      { key: 'model', name: 'Model', type: 'select', description: 'GPT model to use', default: 'gpt-4',
        options: [
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
        ]
      },
      { key: 'temperature', name: 'Temperature', type: 'slider', description: 'Randomness in responses (0-2)', default: 0.7, 
        validation: { min: 0, max: 2 } },
      { key: 'maxTokens', name: 'Max Tokens', type: 'number', description: 'Maximum response length', default: 1000 },
      { key: 'topP', name: 'Top P', type: 'slider', description: 'Nucleus sampling parameter', default: 1,
        validation: { min: 0, max: 1 } },
      { key: 'frequencyPenalty', name: 'Frequency Penalty', type: 'slider', description: 'Penalize repeated tokens', default: 0,
        validation: { min: -2, max: 2 } },
      { key: 'presencePenalty', name: 'Presence Penalty', type: 'slider', description: 'Penalize new topics', default: 0,
        validation: { min: -2, max: 2 } },
      { key: 'systemPrompt', name: 'System Prompt', type: 'textarea', description: 'System instructions for the AI', required: false },
      { key: 'jsonMode', name: 'JSON Mode', type: 'boolean', description: 'Force JSON response format', default: false }
    ],
    examples: [
      'Generate API documentation from code',
      'Create test data based on schema',
      'Explain API error messages to users',
      'Generate SQL queries from natural language'
    ],
    tags: ['openai', 'gpt', 'llm', 'text-generation', 'ai']
  },

  {
    id: 'text-embedding',
    name: 'Text Embedding',
    category: 'ai',
    description: 'Generate vector embeddings for text using various models',
    icon: '🔢',
    color: '#7c3aed',
    inputs: [
      { key: 'text', type: 'string', displayName: 'Text', description: 'Text to embed', required: true, multiple: true },
      { key: 'metadata', type: 'object', displayName: 'Metadata', description: 'Additional metadata for each text', required: false }
    ],
    outputs: [
      { key: 'embeddings', type: 'array', displayName: 'Embeddings', description: 'Vector embeddings', required: true },
      { key: 'dimensions', type: 'number', displayName: 'Dimensions', description: 'Embedding dimensions', required: true },
      { key: 'usage', type: 'object', displayName: 'Usage', description: 'Token usage', required: false }
    ],
    properties: [
      { key: 'provider', name: 'Provider', type: 'select', description: 'Embedding provider', default: 'openai',
        options: [
          { label: 'OpenAI', value: 'openai' },
          { label: 'Cohere', value: 'cohere' },
          { label: 'HuggingFace', value: 'huggingface' },
          { label: 'Azure OpenAI', value: 'azure' },
          { label: 'Local Model', value: 'local' }
        ]
      },
      { key: 'model', name: 'Model', type: 'select', description: 'Embedding model', default: 'text-embedding-ada-002',
        options: [
          { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' },
          { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
          { label: 'text-embedding-3-large', value: 'text-embedding-3-large' }
        ]
      },
      { key: 'apiKey', name: 'API Key', type: 'password', description: 'Provider API key', required: true },
      { key: 'batchSize', name: 'Batch Size', type: 'number', description: 'Number of texts to process at once', default: 100 },
      { key: 'normalize', name: 'Normalize Vectors', type: 'boolean', description: 'Normalize embedding vectors', default: true }
    ],
    examples: [
      'Create embeddings for semantic search',
      'Build vector database from API docs',
      'Find similar API responses',
      'Cluster API endpoints by functionality'
    ],
    tags: ['embedding', 'vector', 'similarity', 'semantic']
  },

  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    category: 'ai',
    description: 'Analyze sentiment in text (positive, negative, neutral)',
    icon: '😊',
    color: '#f59e0b',
    inputs: [
      { key: 'text', type: 'string', displayName: 'Text', description: 'Text to analyze', required: true, multiple: true },
      { key: 'language', type: 'string', displayName: 'Language', description: 'Text language code', required: false }
    ],
    outputs: [
      { key: 'sentiment', type: 'string', displayName: 'Sentiment', description: 'Overall sentiment', required: true },
      { key: 'score', type: 'number', displayName: 'Score', description: 'Confidence score', required: true },
      { key: 'emotions', type: 'object', displayName: 'Emotions', description: 'Detailed emotion breakdown', required: false },
      { key: 'keywords', type: 'array', displayName: 'Keywords', description: 'Key sentiment-bearing words', required: false }
    ],
    properties: [
      { key: 'provider', name: 'Provider', type: 'select', description: 'Analysis provider', default: 'aws',
        options: [
          { label: 'AWS Comprehend', value: 'aws' },
          { label: 'Google Cloud NL', value: 'google' },
          { label: 'Azure Text Analytics', value: 'azure' },
          { label: 'IBM Watson', value: 'ibm' },
          { label: 'TextBlob', value: 'textblob' }
        ]
      },
      { key: 'includeEmotions', name: 'Include Emotions', type: 'boolean', description: 'Analyze specific emotions', default: false },
      { key: 'threshold', name: 'Confidence Threshold', type: 'slider', description: 'Minimum confidence score', default: 0.5,
        validation: { min: 0, max: 1 } }
    ],
    examples: [
      'Analyze user feedback sentiment',
      'Monitor API error message tone',
      'Classify support ticket urgency',
      'Track customer satisfaction trends'
    ],
    tags: ['sentiment', 'emotion', 'nlp', 'analysis']
  },

  {
    id: 'text-classification',
    name: 'Text Classification',
    category: 'ai',
    description: 'Classify text into predefined categories',
    icon: '🏷️',
    color: '#06b6d4',
    inputs: [
      { key: 'text', type: 'string', displayName: 'Text', description: 'Text to classify', required: true, multiple: true },
      { key: 'categories', type: 'array', displayName: 'Categories', description: 'Possible categories', required: false }
    ],
    outputs: [
      { key: 'category', type: 'string', displayName: 'Category', description: 'Predicted category', required: true },
      { key: 'confidence', type: 'number', displayName: 'Confidence', description: 'Classification confidence', required: true },
      { key: 'allScores', type: 'object', displayName: 'All Scores', description: 'Scores for all categories', required: false }
    ],
    properties: [
      { key: 'model', name: 'Model', type: 'select', description: 'Classification model', default: 'custom',
        options: [
          { label: 'Custom Categories', value: 'custom' },
          { label: 'Intent Classification', value: 'intent' },
          { label: 'Topic Classification', value: 'topic' },
          { label: 'Language Detection', value: 'language' },
          { label: 'Spam Detection', value: 'spam' }
        ]
      },
      { key: 'categories', name: 'Categories', type: 'keyValue', description: 'Category labels and descriptions', required: true },
      { key: 'threshold', name: 'Confidence Threshold', type: 'slider', description: 'Minimum confidence for classification', default: 0.7,
        validation: { min: 0, max: 1 } }
    ],
    examples: [
      'Classify API error types',
      'Route support tickets by category',
      'Detect spam in user input',
      'Categorize API endpoints by function'
    ],
    tags: ['classification', 'category', 'intent', 'nlp']
  },

  {
    id: 'image-analysis',
    name: 'Image Analysis',
    category: 'ai',
    description: 'Analyze images for objects, text, faces, and content',
    icon: '👁️',
    color: '#8b5cf6',
    inputs: [
      { key: 'image', type: 'file', displayName: 'Image', description: 'Image file or URL', required: true, multiple: true },
      { key: 'features', type: 'array', displayName: 'Features', description: 'Analysis features to enable', required: false }
    ],
    outputs: [
      { key: 'labels', type: 'array', displayName: 'Labels', description: 'Detected objects/labels', required: true },
      { key: 'text', type: 'string', displayName: 'Extracted Text', description: 'OCR text from image', required: false },
      { key: 'faces', type: 'array', displayName: 'Faces', description: 'Detected faces', required: false },
      { key: 'metadata', type: 'object', displayName: 'Metadata', description: 'Image metadata', required: true }
    ],
    properties: [
      { key: 'provider', name: 'Provider', type: 'select', description: 'Vision API provider', default: 'aws',
        options: [
          { label: 'AWS Rekognition', value: 'aws' },
          { label: 'Google Vision', value: 'google' },
          { label: 'Azure Computer Vision', value: 'azure' },
          { label: 'OpenAI Vision', value: 'openai' }
        ]
      },
      { key: 'features', name: 'Analysis Features', type: 'multiSelect', description: 'Features to analyze',
        options: [
          { label: 'Object Detection', value: 'objects' },
          { label: 'Text Recognition (OCR)', value: 'text' },
          { label: 'Face Detection', value: 'faces' },
          { label: 'Celebrity Recognition', value: 'celebrities' },
          { label: 'Unsafe Content', value: 'moderation' },
          { label: 'Image Properties', value: 'properties' }
        ]
      },
      { key: 'maxLabels', name: 'Max Labels', type: 'number', description: 'Maximum number of labels to return', default: 10 },
      { key: 'confidenceThreshold', name: 'Confidence Threshold', type: 'slider', description: 'Minimum confidence for results', default: 0.7,
        validation: { min: 0, max: 1 } }
    ],
    examples: [
      'Analyze uploaded screenshots for UI elements',
      'Extract text from API documentation images',
      'Detect charts and graphs in reports',
      'Verify image content before processing'
    ],
    tags: ['vision', 'image', 'ocr', 'detection', 'ai']
  },

  {
    id: 'code-generator',
    name: 'Code Generator',
    category: 'ai',
    description: 'Generate code snippets, tests, and documentation using AI',
    icon: '💻',
    color: '#374151',
    inputs: [
      { key: 'prompt', type: 'string', displayName: 'Prompt', description: 'Code generation prompt', required: true },
      { key: 'context', type: 'string', displayName: 'Context', description: 'Additional context/examples', required: false },
      { key: 'schema', type: 'object', displayName: 'Schema', description: 'API schema or data structure', required: false }
    ],
    outputs: [
      { key: 'code', type: 'string', displayName: 'Generated Code', description: 'Generated code', required: true },
      { key: 'language', type: 'string', displayName: 'Language', description: 'Detected programming language', required: true },
      { key: 'explanation', type: 'string', displayName: 'Explanation', description: 'Code explanation', required: false },
      { key: 'tests', type: 'string', displayName: 'Tests', description: 'Generated test cases', required: false }
    ],
    properties: [
      { key: 'language', name: 'Target Language', type: 'select', description: 'Programming language', default: 'javascript',
        options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'Python', value: 'python' },
          { label: 'Java', value: 'java' },
          { label: 'C#', value: 'csharp' },
          { label: 'Go', value: 'go' },
          { label: 'Rust', value: 'rust' },
          { label: 'PHP', value: 'php' },
          { label: 'Ruby', value: 'ruby' },
          { label: 'SQL', value: 'sql' }
        ]
      },
      { key: 'codeType', name: 'Code Type', type: 'select', description: 'Type of code to generate', default: 'function',
        options: [
          { label: 'Function', value: 'function' },
          { label: 'Class', value: 'class' },
          { label: 'API Client', value: 'client' },
          { label: 'Test Cases', value: 'tests' },
          { label: 'Documentation', value: 'docs' },
          { label: 'Schema Validation', value: 'validation' },
          { label: 'Mock Data', value: 'mock' }
        ]
      },
      { key: 'includeComments', name: 'Include Comments', type: 'boolean', description: 'Add explanatory comments', default: true },
      { key: 'includeTests', name: 'Generate Tests', type: 'boolean', description: 'Generate test cases', default: false },
      { key: 'includeTypes', name: 'Include Types', type: 'boolean', description: 'Include type definitions', default: true },
      { key: 'style', name: 'Code Style', type: 'select', description: 'Code formatting style', default: 'standard',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Google', value: 'google' },
          { label: 'Airbnb', value: 'airbnb' },
          { label: 'Prettier', value: 'prettier' }
        ]
      }
    ],
    examples: [
      'Generate API client from OpenAPI spec',
      'Create test cases for API endpoints',
      'Generate data validation schemas',
      'Create mock server implementations'
    ],
    tags: ['codegen', 'ai', 'programming', 'automation']
  }
]
