// Extended types for node grouping and sub-flows
import { BaseNode, NodeConnection, NodeMetadata, DataType } from './types'

// Group node that contains other nodes
export interface GroupNode extends Omit<BaseNode, 'type'> {
  type: 'group'
  groupConfig: {
    isCollapsed: boolean
    backgroundColor: string
    borderColor: string
    cornerRadius: number
    padding: number
    label: string
    labelColor: string
    allowNesting: boolean
  }
  childNodes: string[] // Node IDs that belong to this group
  groupInputs: GroupPort[] // External inputs to the group
  groupOutputs: GroupPort[] // External outputs from the group
  subWorkflow?: SubWorkflow // Optional sub-workflow for complex groups
}

// Port that represents an input/output for a group
export interface GroupPort {
  id: string
  name: string
  type: DataType
  required: boolean
  connectedNodeId?: string // Which internal node this connects to
  connectedPortId?: string // Which port on the internal node
  position: { x: number; y: number } // Relative position on group boundary
  isInput: boolean
  description?: string
  defaultValue?: any
}

// Sub-workflow for complex grouped logic
export interface SubWorkflow {
  id: string
  name: string
  nodes: BaseNode[]
  connections: NodeConnection[]
  inputMappings: PortMapping[] // Maps group inputs to internal nodes
  outputMappings: PortMapping[] // Maps internal nodes to group outputs
}

export interface PortMapping {
  externalPortId: string
  internalNodeId: string
  internalPortId: string
}

// Selection and grouping utilities
export interface NodeSelection {
  nodeIds: string[]
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface GroupingOperation {
  type: 'create_group' | 'ungroup' | 'add_to_group' | 'remove_from_group'
  groupId?: string
  nodeIds: string[]
  groupConfig?: Partial<GroupNode['groupConfig']>
}

// Animation and transition types
export interface NodeAnimation {
  nodeId: string
  property: 'position' | 'size' | 'opacity' | 'color'
  from: any
  to: any
  duration: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce'
  delay?: number
}

export interface TransitionConfig {
  duration: number
  easing: string
  delay?: number
}

// Collaborative editing types
export interface CollaboratorPresence {
  userId: string
  username: string
  color: string
  cursor?: { x: number; y: number }
  selection?: string[] // Selected node IDs
  viewport?: { x: number; y: number; zoom: number }
  lastSeen: Date
}

export interface CollaborativeEdit {
  id: string
  userId: string
  timestamp: Date
  operation: 'node_add' | 'node_update' | 'node_delete' | 'connection_add' | 'connection_delete' | 'group_operation'
  data: any
  conflictsWith?: string[] // Other edit IDs this conflicts with
}

export interface ConflictResolution {
  conflictId: string
  resolution: 'merge' | 'overwrite' | 'discard' | 'manual'
  resolvedBy: string
  resolvedAt: Date
}

// Advanced keyboard shortcuts
export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  keys: string[] // e.g., ['ctrl', 'shift', 'g']
  action: string
  category: 'navigation' | 'editing' | 'grouping' | 'execution' | 'view'
  context: 'global' | 'canvas' | 'node' | 'group'
  customizable: boolean
}

export interface ShortcutAction {
  type: string
  payload?: any
}

// Performance optimization types
export interface ViewportBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface VirtualizationConfig {
  enabled: boolean
  bufferSize: number // Number of nodes to render outside viewport
  chunkSize: number // Number of nodes per rendering chunk
  updateThreshold: number // Minimum movement before re-virtualization
}
