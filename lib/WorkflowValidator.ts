import { BaseNode, NodeConnection } from '@/lib/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class WorkflowValidator {
  
  static validate(nodes: BaseNode[], connections: NodeConnection[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check if workflow is empty
    if (nodes.length === 0) {
      errors.push('Workflow has no nodes')
      return { isValid: false, errors, warnings }
    }
    
    // Check for disconnected nodes
    const connectedNodes = new Set<string>()
    connections.forEach(conn => {
      connectedNodes.add(conn.sourceNodeId)
      connectedNodes.add(conn.targetNodeId)
    })
    
    const disconnectedNodes = nodes.filter(node => 
      !connectedNodes.has(node.id) && nodes.length > 1
    )
    
    if (disconnectedNodes.length > 0) {
      warnings.push(`${disconnectedNodes.length} node(s) are not connected`)
    }
    
    // Check for cycles
    if (this.hasCycle(nodes, connections)) {
      warnings.push('Workflow contains cycles, which may cause infinite loops')
    }
    
    // Validate individual nodes
    nodes.forEach(node => {
      // Check HTTP nodes have URLs
      if (node.type?.startsWith('http-')) {
        if (!node.config?.url) {
          errors.push(`HTTP node "${node.metadata?.title || node.id}" is missing URL`)
        } else if (!this.isValidUrl(node.config.url)) {
          warnings.push(`HTTP node "${node.metadata?.title || node.id}" has invalid URL format`)
        }
      }
      
      // Check JSONPath nodes have paths
      if (node.type === 'json-path') {
        if (!node.config?.path) {
          warnings.push(`JSONPath node "${node.metadata?.title || node.id}" is missing path expression`)
        }
      }
      
      // Check condition nodes have operators
      if (node.type === 'condition') {
        if (!node.config?.operator) {
          errors.push(`Condition node "${node.metadata?.title || node.id}" is missing operator`)
        }
      }
      
      // Check variable nodes have names
      if (node.type === 'variable') {
        if (!node.config?.name) {
          warnings.push(`Variable node "${node.metadata?.title || node.id}" is missing variable name`)
        }
      }
    })
    
    // Check for duplicate connections
    const connectionSet = new Set<string>()
    const duplicates: string[] = []
    
    connections.forEach(conn => {
      const key = `${conn.sourceNodeId}-${conn.sourcePortId}-${conn.targetNodeId}-${conn.targetPortId}`
      if (connectionSet.has(key)) {
        duplicates.push(key)
      }
      connectionSet.add(key)
    })
    
    if (duplicates.length > 0) {
      warnings.push(`Found ${duplicates.length} duplicate connection(s)`)
    }
    
    // Check for invalid connections (connecting to non-existent nodes)
    const nodeIds = new Set(nodes.map(n => n.id))
    const invalidConnections = connections.filter(
      conn => !nodeIds.has(conn.sourceNodeId) || !nodeIds.has(conn.targetNodeId)
    )
    
    if (invalidConnections.length > 0) {
      errors.push(`Found ${invalidConnections.length} connection(s) to non-existent nodes`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  private static hasCycle(nodes: BaseNode[], connections: NodeConnection[]): boolean {
    const adjacencyList = new Map<string, string[]>()
    
    // Build adjacency list
    nodes.forEach(node => adjacencyList.set(node.id, []))
    connections.forEach(conn => {
      const neighbors = adjacencyList.get(conn.sourceNodeId) || []
      neighbors.push(conn.targetNodeId)
      adjacencyList.set(conn.sourceNodeId, neighbors)
    })
    
    // DFS to detect cycle
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    
    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      
      const neighbors = adjacencyList.get(nodeId) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          return true
        }
      }
      
      recursionStack.delete(nodeId)
      return false
    }
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true
      }
    }
    
    return false
  }
  
  private static isValidUrl(url: string): boolean {
    try {
      // Allow template variables
      if (url.includes('{{') && url.includes('}}')) {
        return true
      }
      
      new URL(url)
      return true
    } catch {
      // Check if it's a relative URL or localhost
      return url.startsWith('/') || 
             url.startsWith('http://localhost') || 
             url.startsWith('https://localhost') ||
             url.includes('127.0.0.1') ||
             url.includes('::1')
    }
  }
}
