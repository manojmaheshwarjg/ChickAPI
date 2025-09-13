// Control Flow & Logic Nodes
import { NodePaletteItem } from '../types'

export const controlNodes: NodePaletteItem[] = [
  {
    id: 'conditional',
    name: 'Conditional',
    category: 'control',
    description: 'Route data based on conditions (if/else logic)',
    icon: '🔀',
    color: '#f59e0b',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Input Data', description: 'Data to evaluate', required: true },
      { key: 'condition', type: 'string', displayName: 'Condition', description: 'JavaScript condition expression', required: true }
    ],
    outputs: [
      { key: 'true', type: 'any', displayName: 'True Output', description: 'Data when condition is true', required: true },
      { key: 'false', type: 'any', displayName: 'False Output', description: 'Data when condition is false', required: true },
      { key: 'result', type: 'boolean', displayName: 'Condition Result', description: 'Boolean result of condition', required: true }
    ],
    properties: [
      { key: 'condition', name: 'Condition', type: 'code', description: 'JavaScript expression to evaluate', required: true },
      { key: 'mode', name: 'Evaluation Mode', type: 'select', description: 'How to evaluate the condition', default: 'javascript',
        options: [
          { label: 'JavaScript Expression', value: 'javascript' },
          { label: 'JSONPath', value: 'jsonpath' },
          { label: 'Simple Comparison', value: 'simple' },
          { label: 'Regex Match', value: 'regex' }
        ]
      },
      { key: 'strictMode', name: 'Strict Mode', type: 'boolean', description: 'Use strict equality comparisons', default: true },
      { key: 'caseSensitive', name: 'Case Sensitive', type: 'boolean', description: 'Case sensitive string comparisons', default: true }
    ],
    examples: [
      'Route based on HTTP status code',
      'Filter data based on field values',
      'Handle success vs error responses',
      'Branch workflow based on user input'
    ],
    tags: ['condition', 'branch', 'if', 'logic', 'control']
  },

  {
    id: 'loop',
    name: 'Loop',
    category: 'control',
    description: 'Iterate over arrays or objects',
    icon: '🔄',
    color: '#8b5cf6',
    inputs: [
      { key: 'items', type: 'array', displayName: 'Items', description: 'Array to iterate over', required: true },
      { key: 'workflow', type: 'object', displayName: 'Loop Workflow', description: 'Workflow to execute for each item', required: true }
    ],
    outputs: [
      { key: 'results', type: 'array', displayName: 'Results', description: 'Array of results from each iteration', required: true },
      { key: 'summary', type: 'object', displayName: 'Summary', description: 'Loop execution summary', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Errors from failed iterations', required: false }
    ],
    properties: [
      { key: 'mode', name: 'Execution Mode', type: 'select', description: 'How to execute iterations', default: 'sequential',
        options: [
          { label: 'Sequential', value: 'sequential' },
          { label: 'Parallel', value: 'parallel' },
          { label: 'Batched', value: 'batched' }
        ]
      },
      { key: 'batchSize', name: 'Batch Size', type: 'number', description: 'Items per batch (batched mode)', default: 10 },
      { key: 'maxConcurrency', name: 'Max Concurrency', type: 'number', description: 'Max parallel executions', default: 5 },
      { key: 'continueOnError', name: 'Continue on Error', type: 'boolean', description: 'Continue if iteration fails', default: true },
      { key: 'timeout', name: 'Timeout (ms)', type: 'number', description: 'Timeout per iteration', default: 30000 },
      { key: 'delayBetween', name: 'Delay Between (ms)', type: 'number', description: 'Delay between iterations', default: 0 },
      { key: 'maxIterations', name: 'Max Iterations', type: 'number', description: 'Maximum number of iterations', required: false }
    ],
    examples: [
      'Process multiple API endpoints',
      'Validate array of records',
      'Batch process user data',
      'Execute same test on multiple environments'
    ],
    tags: ['loop', 'iterate', 'foreach', 'batch', 'parallel']
  },

  {
    id: 'switch',
    name: 'Switch',
    category: 'control',
    description: 'Route data to different paths based on multiple conditions',
    icon: '🎚️',
    color: '#06b6d4',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Input Data', description: 'Data to evaluate', required: true },
      { key: 'selector', type: 'string', displayName: 'Selector', description: 'Field or expression to switch on', required: true }
    ],
    outputs: [
      { key: 'case1', type: 'any', displayName: 'Case 1', description: 'Output for case 1', required: false },
      { key: 'case2', type: 'any', displayName: 'Case 2', description: 'Output for case 2', required: false },
      { key: 'case3', type: 'any', displayName: 'Case 3', description: 'Output for case 3', required: false },
      { key: 'default', type: 'any', displayName: 'Default', description: 'Default output', required: true },
      { key: 'matched', type: 'string', displayName: 'Matched Case', description: 'Which case was matched', required: true }
    ],
    properties: [
      { key: 'cases', name: 'Cases', type: 'keyValue', description: 'Case values and their outputs', required: true },
      { key: 'mode', name: 'Matching Mode', type: 'select', description: 'How to match cases', default: 'exact',
        options: [
          { label: 'Exact Match', value: 'exact' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts With', value: 'startswith' },
          { label: 'Ends With', value: 'endswith' },
          { label: 'Regex', value: 'regex' },
          { label: 'Range', value: 'range' }
        ]
      },
      { key: 'caseSensitive', name: 'Case Sensitive', type: 'boolean', description: 'Case sensitive matching', default: true },
      { key: 'fallthrough', name: 'Fallthrough', type: 'boolean', description: 'Continue to next case if matched', default: false }
    ],
    examples: [
      'Route by HTTP status code',
      'Handle different error types',
      'Process by content type',
      'Route by user role or permission'
    ],
    tags: ['switch', 'case', 'route', 'branch', 'multiple']
  },

  {
    id: 'retry',
    name: 'Retry',
    category: 'control',
    description: 'Retry operations with configurable backoff strategies',
    icon: '🔁',
    color: '#ef4444',
    inputs: [
      { key: 'operation', type: 'object', displayName: 'Operation', description: 'Operation to retry', required: true },
      { key: 'condition', type: 'string', displayName: 'Retry Condition', description: 'When to retry', required: false }
    ],
    outputs: [
      { key: 'result', type: 'any', displayName: 'Result', description: 'Final result after retries', required: true },
      { key: 'attempts', type: 'number', displayName: 'Attempts', description: 'Number of attempts made', required: true },
      { key: 'success', type: 'boolean', displayName: 'Success', description: 'Whether operation succeeded', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Errors from all attempts', required: false }
    ],
    properties: [
      { key: 'maxRetries', name: 'Max Retries', type: 'number', description: 'Maximum number of retry attempts', default: 3 },
      { key: 'backoffStrategy', name: 'Backoff Strategy', type: 'select', description: 'Delay strategy between retries', default: 'exponential',
        options: [
          { label: 'Fixed Delay', value: 'fixed' },
          { label: 'Exponential Backoff', value: 'exponential' },
          { label: 'Linear Backoff', value: 'linear' },
          { label: 'Random Jitter', value: 'jitter' },
          { label: 'No Delay', value: 'none' }
        ]
      },
      { key: 'initialDelay', name: 'Initial Delay (ms)', type: 'number', description: 'Initial delay before first retry', default: 1000 },
      { key: 'maxDelay', name: 'Max Delay (ms)', type: 'number', description: 'Maximum delay between retries', default: 30000 },
      { key: 'multiplier', name: 'Backoff Multiplier', type: 'number', description: 'Multiplier for exponential backoff', default: 2 },
      { key: 'retryOn', name: 'Retry On', type: 'multiSelect', description: 'When to retry',
        options: [
          { label: 'Network Errors', value: 'network' },
          { label: 'Timeout', value: 'timeout' },
          { label: 'HTTP 5xx', value: '5xx' },
          { label: 'HTTP 4xx', value: '4xx' },
          { label: 'Specific Status Codes', value: 'custom' }
        ]
      },
      { key: 'customStatusCodes', name: 'Custom Status Codes', type: 'string', description: 'Comma-separated status codes to retry on', required: false }
    ],
    examples: [
      'Retry failed API requests',
      'Handle rate limiting with backoff',
      'Retry database connections',
      'Resilient file upload operations'
    ],
    tags: ['retry', 'resilience', 'backoff', 'error-handling']
  },

  {
    id: 'delay',
    name: 'Delay',
    category: 'time',
    description: 'Add delays or wait conditions to workflows',
    icon: '⏱️',
    color: '#84cc16',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Input Data', description: 'Data to pass through after delay', required: true },
      { key: 'condition', type: 'string', displayName: 'Wait Condition', description: 'Condition to wait for', required: false }
    ],
    outputs: [
      { key: 'data', type: 'any', displayName: 'Output Data', description: 'Data passed through after delay', required: true },
      { key: 'waitTime', type: 'number', displayName: 'Actual Wait Time', description: 'Actual time waited in ms', required: true },
      { key: 'timestamp', type: 'string', displayName: 'Completion Time', description: 'When delay completed', required: true }
    ],
    properties: [
      { key: 'type', name: 'Delay Type', type: 'select', description: 'Type of delay', default: 'fixed',
        options: [
          { label: 'Fixed Duration', value: 'fixed' },
          { label: 'Random Range', value: 'random' },
          { label: 'Until Time', value: 'until' },
          { label: 'Until Condition', value: 'condition' },
          { label: 'Rate Limiting', value: 'ratelimit' }
        ]
      },
      { key: 'duration', name: 'Duration (ms)', type: 'number', description: 'Delay duration in milliseconds', default: 1000 },
      { key: 'minDelay', name: 'Min Delay (ms)', type: 'number', description: 'Minimum random delay', default: 500,
        conditional: { dependsOn: 'type', condition: 'equals', value: 'random' }
      },
      { key: 'maxDelay', name: 'Max Delay (ms)', type: 'number', description: 'Maximum random delay', default: 2000,
        conditional: { dependsOn: 'type', condition: 'equals', value: 'random' }
      },
      { key: 'targetTime', name: 'Target Time', type: 'datetime', description: 'Time to wait until', required: false,
        conditional: { dependsOn: 'type', condition: 'equals', value: 'until' }
      },
      { key: 'checkInterval', name: 'Check Interval (ms)', type: 'number', description: 'How often to check condition', default: 1000,
        conditional: { dependsOn: 'type', condition: 'equals', value: 'condition' }
      },
      { key: 'maxWait', name: 'Max Wait (ms)', type: 'number', description: 'Maximum time to wait', default: 60000 }
    ],
    examples: [
      'Rate limit API requests',
      'Wait for async operations to complete',
      'Schedule workflow execution',
      'Add breathing room between operations'
    ],
    tags: ['delay', 'wait', 'sleep', 'timeout', 'schedule']
  },

  {
    id: 'parallel',
    name: 'Parallel',
    category: 'control',
    description: 'Execute multiple workflows in parallel and combine results',
    icon: '⚡',
    color: '#10b981',
    inputs: [
      { key: 'data', type: 'any', displayName: 'Input Data', description: 'Data to send to all parallel branches', required: true },
      { key: 'workflows', type: 'array', displayName: 'Workflows', description: 'Workflows to execute in parallel', required: true }
    ],
    outputs: [
      { key: 'results', type: 'array', displayName: 'Results', description: 'Results from all parallel executions', required: true },
      { key: 'summary', type: 'object', displayName: 'Summary', description: 'Execution summary', required: true },
      { key: 'errors', type: 'array', displayName: 'Errors', description: 'Errors from failed executions', required: false }
    ],
    properties: [
      { key: 'maxConcurrency', name: 'Max Concurrency', type: 'number', description: 'Maximum parallel executions', default: 5 },
      { key: 'waitForAll', name: 'Wait for All', type: 'boolean', description: 'Wait for all branches to complete', default: true },
      { key: 'failFast', name: 'Fail Fast', type: 'boolean', description: 'Stop all on first error', default: false },
      { key: 'timeout', name: 'Timeout (ms)', type: 'number', description: 'Timeout for all parallel operations', default: 60000 },
      { key: 'combineResults', name: 'Combine Results', type: 'select', description: 'How to combine results', default: 'array',
        options: [
          { label: 'Array', value: 'array' },
          { label: 'Object by Index', value: 'object' },
          { label: 'Merge Objects', value: 'merge' },
          { label: 'First Success', value: 'first' }
        ]
      }
    ],
    examples: [
      'Call multiple APIs simultaneously',
      'Parallel validation of different data',
      'Fan-out/fan-in processing patterns',
      'Race conditions for fastest response'
    ],
    tags: ['parallel', 'concurrent', 'fanout', 'race']
  }
]
