import { BaseNode, NodeConnection, NodeStatus, ExecutionContext, ExecutionLog } from '@/lib/types'
import { EnvironmentManager } from '@/lib/EnvironmentManager'

export class WorkflowExecutor {
  private nodes: Map<string, BaseNode>
  private connections: NodeConnection[]
  private executionContext: ExecutionContext
  private onLog: (log: ExecutionLog) => void
  private onNodeStatusChange: (nodeId: string, status: NodeStatus) => void

  constructor(
    nodes: BaseNode[],
    connections: NodeConnection[],
    onLog: (log: ExecutionLog) => void,
    onNodeStatusChange: (nodeId: string, status: NodeStatus) => void
  ) {
    this.nodes = new Map(nodes.map(n => [n.id, n]))
    this.connections = connections
    this.onLog = onLog
    this.onNodeStatusChange = onNodeStatusChange
    
    this.executionContext = {
      workflowId: 'workflow-' + Date.now(),
      executionId: 'exec-' + Date.now(),
      startTime: new Date(),
      status: 'running',
      variables: new Map(),
      errors: [],
      logs: []
    }
  }

  async execute(): Promise<void> {
    try {
      this.log('info', 'Starting workflow execution')
      
      // Find start nodes (nodes with no incoming connections)
      const startNodes = this.findStartNodes()
      
      if (startNodes.length === 0) {
        throw new Error('No start nodes found in workflow')
      }

      // Execute nodes in topological order
      const executionOrder = this.getTopologicalOrder()
      
      for (const nodeId of executionOrder) {
        await this.executeNode(nodeId)
      }

      this.executionContext.status = 'completed'
      this.log('success', 'Workflow execution completed successfully')
    } catch (error) {
      this.executionContext.status = 'failed'
      this.log('error', `Workflow execution failed: ${error}`)
      throw error
    }
  }

  private async executeNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId)
    if (!node) return

    try {
      this.onNodeStatusChange(nodeId, 'running' as NodeStatus)
      this.log('debug', `Executing node: ${nodeId} (${node.type})`, { nodeId })

      // Get input data from connected nodes
      const inputData = this.getNodeInputData(nodeId)

      // Simulate node execution based on type
      await this.simulateNodeExecution(node, inputData)

      this.onNodeStatusChange(nodeId, 'success' as NodeStatus)
      this.log('success', `Node ${nodeId} executed successfully`, { nodeId })
    } catch (error) {
      this.onNodeStatusChange(nodeId, 'error' as NodeStatus)
      this.log('error', `Node ${nodeId} execution failed: ${error}`, { nodeId })
      throw error
    }
  }

  private async simulateNodeExecution(node: BaseNode, inputData: any): Promise<any> {
    // Simulate different node types
    switch (node.type) {
      case 'http-get':
      case 'http-post':
      case 'http-put':
      case 'http-delete':
        return this.executeHttpNode(node)
      
      case 'json-path':
        return this.executeJsonPathNode(node, inputData)
      
      case 'condition':
        return this.executeConditionNode(node, inputData)
      
      case 'assert':
        return this.executeAssertNode(node, inputData)
      
      case 'variable':
        return this.executeVariableNode(node)
      
      default:
        // Simulate generic execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))
        return { success: true }
    }
  }

  private async executeHttpNode(node: BaseNode): Promise<any> {
    const config = node.config
    // Interpolate environment variables in URL
    const url = EnvironmentManager.interpolateVariables(config.url)
    
    if (!url) {
      throw new Error('URL is required for HTTP request')
    }
    
    this.log('info', `Making ${config.method || 'GET'} request to ${url}`, { nodeId: node.id })
    
    try {
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...config.headers
      }
      
      // Prepare request options
      const requestOptions: RequestInit = {
        method: config.method || 'GET',
        headers,
        mode: 'cors',
        cache: 'no-cache'
      }
      
      // Add body for POST/PUT requests
      if ((config.method === 'POST' || config.method === 'PUT') && config.body) {
        if (typeof config.body === 'string') {
          requestOptions.body = config.body
        } else {
          requestOptions.body = JSON.stringify(config.body)
        }
      }
      
      // Make the request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000)
      requestOptions.signal = controller.signal
      
      const startTime = Date.now()
      const response = await fetch(url, requestOptions)
      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      
      // Parse response
      let responseBody: any
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json()
      } else {
        responseBody = await response.text()
      }
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        responseTime
      }
      
      if (!response.ok) {
        this.log('warn', `HTTP request returned status ${response.status}`, { nodeId: node.id, status: response.status })
      } else {
        this.log('success', `HTTP request completed successfully (${response.status})`, { nodeId: node.id, responseTime })
      }
      
      this.executionContext.variables.set(`${node.id}_response`, result)
      return result
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`HTTP request timed out after ${config.timeout || 30000}ms`)
      }
      throw new Error(`HTTP request failed: ${error.message}`)
    }
  }

  private async executeJsonPathNode(node: BaseNode, inputData: any): Promise<any> {
    const config = node.config
    const path = config.path || '$'
    
    this.log('info', `Extracting data with JSONPath: ${path}`, { nodeId: node.id })
    
    try {
      // Get the data to extract from
      let sourceData = inputData
      
      // If no input data, try to get from previous node results
      if (!sourceData || Object.keys(sourceData).length === 0) {
        // Look for the most recent HTTP response or other data
        for (const [key, value] of this.executionContext.variables.entries()) {
          if (key.endsWith('_response') && value?.body) {
            sourceData = value.body
            break
          } else if (key.endsWith('_result')) {
            sourceData = value
            break
          }
        }
      }
      
      if (!sourceData) {
        throw new Error('No input data available for JSONPath extraction')
      }
      
      // Apply JSONPath - dynamic import to avoid SSR issues
      const jsonpath = await import('jsonpath')
      const result = jsonpath.query(sourceData, path)
      
      // Handle result
      const extractedValue = result.length === 1 ? result[0] : result
      
      this.log('success', `Extracted ${result.length} item(s) with JSONPath`, { 
        nodeId: node.id, 
        path,
        resultCount: result.length 
      })
      
      this.executionContext.variables.set(`${node.id}_result`, extractedValue)
      return extractedValue
    } catch (error: any) {
      throw new Error(`JSONPath extraction failed: ${error.message}`)
    }
  }

  private async executeConditionNode(node: BaseNode, inputData: any): Promise<any> {
    const config = node.config
    this.log('info', `Evaluating condition: ${config.operator || 'equals'}`, { nodeId: node.id })
    
    // Simulate condition evaluation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const result = Math.random() > 0.5
    this.executionContext.variables.set(`${node.id}_result`, result)
    return result
  }

  private async executeAssertNode(node: BaseNode, inputData: any): Promise<any> {
    const config = node.config
    this.log('info', `Running assertion: ${config.assertion || 'equals'}`, { nodeId: node.id })
    
    // Simulate assertion
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const passed = Math.random() > 0.3
    if (!passed) {
      this.log('warn', `Assertion failed: ${config.message || 'Assertion failed'}`, { nodeId: node.id })
    }
    
    return { passed }
  }

  private async executeVariableNode(node: BaseNode): Promise<any> {
    const config = node.config
    this.log('info', `Setting variable: ${config.name} = ${config.value}`, { nodeId: node.id })
    
    // Store variable in context
    this.executionContext.variables.set(config.name || node.id, config.value)
    return config.value
  }

  private getNodeInputData(nodeId: string): any {
    // Get data from nodes connected to this node's inputs
    const incomingConnections = this.connections.filter(c => c.targetNodeId === nodeId)
    const inputData: any = {}
    
    for (const connection of incomingConnections) {
      const sourceNodeData = this.executionContext.variables.get(`${connection.sourceNodeId}_result`)
      if (sourceNodeData !== undefined) {
        inputData[connection.targetPortId] = sourceNodeData
      }
    }
    
    return inputData
  }

  private findStartNodes(): string[] {
    const nodesWithIncoming = new Set(this.connections.map(c => c.targetNodeId))
    return Array.from(this.nodes.keys()).filter(id => !nodesWithIncoming.has(id))
  }

  private getTopologicalOrder(): string[] {
    const visited = new Set<string>()
    const order: string[] = []
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      // Visit dependencies first
      const dependencies = this.connections
        .filter(c => c.targetNodeId === nodeId)
        .map(c => c.sourceNodeId)
      
      for (const dep of dependencies) {
        visit(dep)
      }
      
      order.push(nodeId)
    }
    
    // Visit all nodes
    for (const nodeId of this.nodes.keys()) {
      visit(nodeId)
    }
    
    return order
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error' | 'success', message: string, data?: any): void {
    const log: ExecutionLog = {
      level,
      message,
      timestamp: new Date(),
      nodeId: data?.nodeId,
      data: data?.nodeId ? undefined : data
    }
    
    this.executionContext.logs.push(log)
    this.onLog(log)
  }
}
