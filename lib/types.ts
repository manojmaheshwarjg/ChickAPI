// Re-export core types for web application
export * from '@/src/core/types'

// Additional web-specific types can be added here
export interface WorkflowState {
  id: string
  name: string
  nodes: BaseNode[]
  connections: NodeConnection[]
  isDirty: boolean
  lastSaved?: Date
}

// Import the specific types we need to avoid circular dependencies
import type { 
  BaseNode, 
  NodeConnection, 
  NodeStatus,
  NodeCategory,
  DataType,
  Port,
  NodeMetadata,
  NodeConfig,
  ValidationState
} from '@/src/core/types'

export type {
  BaseNode,
  NodeConnection,
  NodeStatus,
  NodeCategory,
  DataType,
  Port,
  NodeMetadata,
  NodeConfig,
  ValidationState
}
