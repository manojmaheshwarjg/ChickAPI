// Comprehensive Node Palette Types for ChickAPI
// The ultimate API testing and workflow automation toolkit

import { BaseNode, Port, DataType } from '@/src/core/types'

export type NodeCategory = 
  | 'http'           // HTTP/API requests
  | 'data'           // Data processing & transformation  
  | 'control'        // Control flow & logic
  | 'auth'           // Authentication & security
  | 'database'       // Database operations
  | 'storage'        // File & cloud storage
  | 'notification'   // Alerts & messaging
  | 'testing'        // Validation & assertions
  | 'time'           // Scheduling & delays
  | 'integration'    // Third-party services
  | 'utility'        // Helper functions
  | 'ai'             // AI/ML integrations
  | 'security'       // Encryption & security
  | 'monitoring'     // Logging & metrics
  | 'realtime'       // WebSocket & streaming
  | 'mock'           // Mock data & servers
  | 'transform'      // Advanced data transforms
  | 'protocol'       // Various protocols (SOAP, GraphQL, gRPC)
  | 'browser'        // Browser automation
  | 'mobile'         // Mobile testing

export interface NodePaletteItem {
  id: string
  name: string
  category: NodeCategory
  description: string
  icon: string
  color: string
  inputs: PortDefinition[]
  outputs: PortDefinition[]
  properties: PropertyDefinition[]
  examples: string[]
  tags: string[]
  deprecated?: boolean
  premium?: boolean
}

export interface PortDefinition {
  key: string
  type: DataType
  displayName: string
  description: string
  required: boolean
  multiple?: boolean // Can accept multiple connections
  validation?: PortValidation
}

export interface PortValidation {
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: string[]
  customValidator?: string
}

export interface PropertyDefinition {
  key: string
  name: string
  type: PropertyType
  description: string
  required?: boolean
  default?: any
  options?: PropertyOption[]
  validation?: PropertyValidation
  conditional?: ConditionalProperty
  group?: string
  order?: number
}

export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'multiSelect'
  | 'json' 
  | 'code' 
  | 'headers'
  | 'keyValue'
  | 'file'
  | 'color'
  | 'date'
  | 'time'
  | 'datetime'
  | 'url'
  | 'email'
  | 'regex'
  | 'password'
  | 'textarea'
  | 'slider'
  | 'toggle'
  | 'tabs'

export interface PropertyOption {
  label: string
  value: any
  description?: string
  icon?: string
}

export interface PropertyValidation {
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: any[]
  custom?: string
}

export interface ConditionalProperty {
  dependsOn: string
  condition: 'equals' | 'notEquals' | 'contains' | 'custom'
  value: any
  customCondition?: string
}

// Extended node interface for palette nodes
export interface PaletteNode extends Omit<BaseNode, 'metadata'> {
  paletteId: string
  category: NodeCategory
  version: string
  runtime: NodeRuntime
  config: Record<string, any>
  paletteMetadata: NodeMetadata
}

export interface NodeRuntime {
  timeout: number
  retries: number
  async: boolean
  cacheable: boolean
  idempotent: boolean
}

export interface NodeMetadata {
  createdAt: string
  updatedAt: string
  author: string
  version: string
  changelog: string[]
  documentation: string
  examples: NodeExample[]
}

export interface NodeExample {
  name: string
  description: string
  config: Record<string, any>
  inputs: Record<string, any>
  expectedOutputs: Record<string, any>
}
