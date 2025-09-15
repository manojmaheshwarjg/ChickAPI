'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import NodePalette from '@/components/NodePalette'
import NodePropertiesPanel from '@/components/NodePropertiesPanel'
import PropertiesPanel from '@/components/PropertiesPanel'
import Console from '@/components/Console'
import Toolbar from '@/components/Toolbar'
import { BaseNode, NodeConnection, NodeStatus, ExecutionLog } from '@/lib/types'
import { NodeFactory } from '@/src/core/NodeFactory'
import { WorkflowExecutor } from '@/lib/WorkflowExecutor'
import { WorkflowStorage, WorkflowData } from '@/lib/WorkflowStorage'
import { WorkflowValidator } from '@/lib/WorkflowValidator'

// Dynamically import the React Flow canvas to avoid SSR issues
const ReactFlowCanvas = dynamic(() => import('@/components/reactflow/ReactFlowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading React Flow canvas...</p>
      </div>
    </div>
  ),
})

// Initialize built-in nodes and palette nodes
if (typeof window !== 'undefined') {
  Promise.all([
    import('@/src/core/NodeFactory'),
    import('@/lib/node-palette/bridge')
  ]).then(([{ initializeBuiltInNodes }, { registerPaletteNodes }]) => {
    initializeBuiltInNodes()
    registerPaletteNodes()
  })
}

export default function LegacyCanvas() {
  const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null)
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [workflow, setWorkflow] = useState<{
    id: string
    name: string
    nodes: BaseNode[]
    connections: NodeConnection[]
  }>({
    id: 'new-workflow',
    name: 'API Testing Workflow',
    nodes: [],
    connections: [],
  })
  const [logs, setLogs] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleNodeSelect = useCallback((node: BaseNode | null) => {
    setSelectedNode(node)
    if (node && !propertiesOpen) {
      setPropertiesOpen(true)
    }
  }, [propertiesOpen])

  const handleNodeAdd = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode = NodeFactory.createNode(nodeType, position)
    if (newNode) {
      setWorkflow(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }))
      addLog('info', `Added node: ${nodeType}`)
    }
  }, [])

  const handleNodeUpdate = useCallback((node: BaseNode) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === node.id ? node : n)
    }))
  }, [])

  const handleNodeDelete = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => 
        c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      )
    }))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
    addLog('info', `Deleted node: ${nodeId}`)
  }, [selectedNode])

  const handleConnectionAdd = useCallback((connection: NodeConnection) => {
    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }))
    addLog('info', `Connected nodes: ${connection.sourceNodeId} -> ${connection.targetNodeId}`)
  }, [])

  const handleConnectionDelete = useCallback((connectionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== connectionId)
    }))
    addLog('info', `Deleted connection: ${connectionId}`)
  }, [])

  const addLog = useCallback((level: string, message: string, data?: any) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      data
    }
    setLogs(prev => [...prev, newLog])
  }, [])

  const handleRunWorkflow = useCallback(async () => {
    // Validate workflow before execution
    const validation = WorkflowValidator.validate(workflow.nodes, workflow.connections)
    
    // Log validation errors and warnings
    validation.errors.forEach(error => addLog('error', error))
    validation.warnings.forEach(warning => addLog('warn', warning))
    
    if (!validation.isValid) {
      addLog('error', 'Workflow validation failed. Please fix the errors before running.')
      return
    }
    
    if (workflow.nodes.length === 0) {
      addLog('warn', 'No nodes in workflow to execute')
      return
    }

    addLog('info', 'Starting workflow execution...')
    
    // Create and run executor
    const executor = new WorkflowExecutor(
      workflow.nodes,
      workflow.connections,
      (log: ExecutionLog) => {
        addLog(log.level, log.message, log.data)
      },
      (nodeId: string, status: NodeStatus) => {
        setWorkflow(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => 
            n.id === nodeId ? { ...n, status } : n
          )
        }))
      }
    )

    try {
      await executor.execute()
      addLog('success', 'Workflow execution completed successfully')
    } catch (error) {
      addLog('error', `Workflow execution failed: ${error}`)
    }
  }, [workflow, addLog])

  const handleStopWorkflow = useCallback(() => {
    addLog('warn', 'Workflow execution stopped')
  }, [])

  // Save workflow
  const handleSaveWorkflow = useCallback(async () => {
    setIsSaving(true)
    try {
      const workflowData: WorkflowData = {
        ...workflow,
        version: '1.0.0',
        created: new Date(),
        modified: new Date()
      }
      WorkflowStorage.saveWorkflow(workflowData)
      addLog('success', 'Workflow saved successfully')
    } catch (error) {
      addLog('error', `Failed to save workflow: ${error}`)
    } finally {
      setIsSaving(false)
    }
  }, [workflow, addLog])

  // Load workflow on mount
  useEffect(() => {
    const savedWorkflow = WorkflowStorage.loadCurrentWorkflow()
    if (savedWorkflow) {
      setWorkflow({
        id: savedWorkflow.id,
        name: savedWorkflow.name,
        nodes: savedWorkflow.nodes || [],
        connections: savedWorkflow.connections || []
      })
      addLog('info', `Loaded workflow: ${savedWorkflow.name}`)
    }
  }, [])

  // Auto-save workflow on changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (workflow.nodes.length > 0 || workflow.connections.length > 0) {
        handleSaveWorkflow()
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [workflow])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header 
        workflowName={workflow.name} 
        onWorkflowNameChange={(name) => setWorkflow(prev => ({ ...prev, name }))} 
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <NodePalette 
            onNodeSelect={(node) => addLog('info', `Selected node: ${node.name}`)}
            onNodeDrag={(node) => addLog('info', `Dragging node: ${node.name}`)}
            favorites={[]}
            recentlyUsed={[]}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Toolbar 
            onRun={handleRunWorkflow}
            onStop={handleStopWorkflow}
            onSave={handleSaveWorkflow}
            onUndo={() => addLog('info', 'Undo')}
            onRedo={() => addLog('info', 'Redo')}
          />

          {/* Canvas and Console */}
          <div className="flex-1 flex flex-col relative">
            <div className={`flex-1 ${consoleOpen ? 'mb-48' : ''}`}>
              <ReactFlowCanvas
                workflow={workflow}
                onNodeSelect={handleNodeSelect}
                onNodeAdd={handleNodeAdd}
                onNodeUpdate={handleNodeUpdate}
                onNodeDelete={handleNodeDelete}
                onConnectionAdd={handleConnectionAdd}
                onConnectionDelete={handleConnectionDelete}
              />
            </div>

            {/* Console */}
            {consoleOpen && (
              <div className="absolute bottom-0 left-0 right-0 h-48 border-t border-gray-200 bg-white">
                <Console onClose={() => setConsoleOpen(false)} logs={logs} />
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className={`${propertiesOpen ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          {selectedNode ? (
            <NodePropertiesPanel 
              node={selectedNode as any}
              values={{}}
              onChange={(property, value) => addLog('info', `Changed ${property}: ${value}`)}
              onValidate={(isValid, errors) => {
                if (!isValid) addLog('warn', `Validation errors: ${errors.join(', ')}`)
              }}
            />
          ) : (
            <PropertiesPanel 
              node={selectedNode} 
              onClose={() => setPropertiesOpen(false)}
              onNodeUpdate={handleNodeUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}
