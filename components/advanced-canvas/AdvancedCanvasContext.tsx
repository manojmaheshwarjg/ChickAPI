'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import { BaseNode, NodeConnection, NodeStatus } from '@/lib/types'
import { NodePaletteItem } from '@/lib/node-palette/registry'

// Enhanced Node type for advanced canvas
export interface AdvancedCanvasNode extends BaseNode {
  // Enhanced visual properties
  gradient?: {
    from: string
    to: string
    direction?: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl' | 'to-t' | 'to-tr'
  }
  borderColor?: string
  shadowLevel?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  icon?: React.ReactNode
  subtitle?: string
  badge?: {
    text: string
    color: string
    variant?: 'solid' | 'outline'
  }
  // Animation properties  
  isAnimating?: boolean
  pulseOnExecution?: boolean
  
  // Comprehensive Layer Properties
  
  // Data Layer
  dataLayer?: {
    sources?: Array<{
      type: 'api' | 'database' | 'file' | 'stream' | 'webhook'
      name: string
      endpoint?: string
    }>
    inputFormat?: 'JSON' | 'XML' | 'CSV' | 'Binary' | 'Text'
    outputFormat?: 'JSON' | 'XML' | 'CSV' | 'Binary' | 'Text'
    schemaValidation?: boolean
    dataTransformation?: string // Custom transformation script
    caching?: {
      enabled: boolean
      ttl?: number // Time to live in seconds
      strategy?: 'memory' | 'redis' | 'disk'
    }
  }
  
  // Business Logic Layer (with GenAI)
  logicLayer?: {
    aiEnabled?: boolean
    aiModel?: 'GPT-4' | 'GPT-3.5' | 'Claude' | 'Custom'
    aiPrompt?: string
    processingType?: 'Synchronous' | 'Asynchronous' | 'Batch' | 'Stream'
    customCode?: string
    retryPolicy?: {
      maxAttempts: number
      backoffStrategy: 'linear' | 'exponential'
      initialDelay: number
    }
    errorHandling?: 'fail-fast' | 'continue' | 'fallback'
    fallbackLogic?: string
  }
  
  // Security Layer
  securityLayer?: {
    authType?: 'None' | 'API Key' | 'OAuth2' | 'JWT' | 'Basic' | 'Custom'
    accessToken?: string
    refreshToken?: string
    apiKey?: string
    credentials?: {
      username?: string
      password?: string
    }
    encryption?: 'None' | 'AES-256' | 'RSA' | 'TLS'
    rateLimit?: string // e.g., "100/min", "1000/hour"
    ipWhitelist?: string[]
    cors?: {
      enabled: boolean
      origins: string[]
      methods: string[]
    }
    dataPrivacy?: {
      piiMasking: boolean
      auditLogging: boolean
      gdprCompliant: boolean
    }
  }
  
  // Scalability Layer
  scalabilityLayer?: {
    currentRequests?: number
    expectedRequests?: number
    maxRequests?: number
    minInstances?: number
    maxInstances?: number
    activeHours?: string // e.g., "9-17" or "24/7"
    expectedSpike?: {
      time: string
      magnitude: number
    }
    spikeHandling?: 'Auto-scale' | 'Queue' | 'Rate-limit' | 'Reject'
    fallback?: 'Queue' | 'Cache' | 'Default-response' | 'Error'
    loadBalancing?: 'Round-robin' | 'Least-connections' | 'IP-hash' | 'Random'
    resourceLimits?: {
      cpu?: string // e.g., "2 cores"
      memory?: string // e.g., "4GB"
      timeout?: number // in seconds
    }
  }
}

export interface AdvancedCanvasConnection extends NodeConnection {
  // Enhanced connection properties
  animated?: boolean
  strokeWidth?: number
  strokeDasharray?: string
  gradient?: {
    from: string
    to: string
  }
  label?: string
  labelBgColor?: string
  labelTextColor?: string
}

export interface AdvancedCanvasState {
  // Workflow data
  nodes: AdvancedCanvasNode[]
  connections: AdvancedCanvasConnection[]
  
  // UI State
  selectedNodeId: string | null
  selectedConnectionIds: string[]
  isNodePaletteOpen: boolean
  isPropertiesPanelOpen: boolean
  
  // Canvas settings
  snapToGrid: boolean
  showGrid: boolean
  showMiniMap: boolean
  canvasTheme: 'light' | 'dark'
  
  // Zoom and pan
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export interface AdvancedCanvasActions {
  // Node operations
  addNode: (nodeType: string, position: { x: number; y: number }, data?: Partial<AdvancedCanvasNode>) => void
  updateNode: (nodeId: string, updates: Partial<AdvancedCanvasNode>) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  duplicateNode: (nodeId: string) => void
  
  // Connection operations
  addConnection: (connection: Omit<AdvancedCanvasConnection, 'id'>) => void
  updateConnection: (connectionId: string, updates: Partial<AdvancedCanvasConnection>) => void
  deleteConnection: (connectionId: string) => void
  
  // UI operations
  toggleNodePalette: () => void
  togglePropertiesPanel: () => void
  setCanvasTheme: (theme: 'light' | 'dark') => void
  toggleSnapToGrid: () => void
  toggleGrid: () => void
  toggleMiniMap: () => void
  
  // Viewport operations
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  fitView: () => void
  
  // Batch operations
  clearCanvas: () => void
  importWorkflow: (nodes: AdvancedCanvasNode[], connections: AdvancedCanvasConnection[]) => void
  exportWorkflow: () => { nodes: AdvancedCanvasNode[], connections: AdvancedCanvasConnection[] }
}

const AdvancedCanvasContext = createContext<{
  state: AdvancedCanvasState
  actions: AdvancedCanvasActions
} | null>(null)

export const useAdvancedCanvas = () => {
  const context = useContext(AdvancedCanvasContext)
  if (!context) {
    throw new Error('useAdvancedCanvas must be used within an AdvancedCanvasProvider')
  }
  return context
}

// Sample workflow for initial state
const sampleNodes: AdvancedCanvasNode[] = [
  {
    id: 'start-node',
    type: 'trigger',
    position: { x: 100, y: 100 },
    size: { width: 360, height: 'auto' },
    status: 'success' as NodeStatus,
    metadata: {
      title: 'API Trigger',
      description: 'Webhook endpoint to start workflow',
      category: 'Triggers',
      color: '#10b981',
      version: '1.0.0'
    },
    validation: { isValid: true, errors: [], warnings: [] },
    config: { path: '/webhook/start' },
    inputs: [],
    outputs: [{ id: 'output', name: 'Payload', type: 'object', required: false }],
    gradient: { from: '#10b981', to: '#059669', direction: 'to-br' },
    shadowLevel: 'lg',
    subtitle: 'Webhook Trigger',
    dataLayer: {
      inputFormat: 'JSON',
      outputFormat: 'JSON',
      schemaValidation: true,
      sources: [{ type: 'webhook', name: 'Main Webhook', endpoint: '/api/webhook' }]
    },
    logicLayer: {
      aiEnabled: false,
      processingType: 'Synchronous',
      errorHandling: 'fail-fast'
    },
    securityLayer: {
      authType: 'API Key',
      encryption: 'TLS',
      rateLimit: '100/min'
    },
    scalabilityLayer: {
      currentRequests: 12,
      expectedRequests: 100,
      maxRequests: 1000,
      minInstances: 1,
      maxInstances: 5,
      activeHours: '24/7',
      spikeHandling: 'Auto-scale',
      fallback: 'Queue'
    }
  },
  {
    id: 'transform-node',
    type: 'data-transform',
    position: { x: 500, y: 100 },
    size: { width: 360, height: 'auto' },
    status: 'idle' as NodeStatus,
    metadata: {
      title: 'Transform Data',
      description: 'Transform and validate incoming data',
      category: 'Data Processing',
      color: '#3b82f6',
      version: '1.0.0'
    },
    validation: { isValid: true, errors: [], warnings: [] },
    config: { transformScript: 'return data.map(item => ({ ...item, processed: true }))' },
    inputs: [{ id: 'input', name: 'Data', type: 'object', required: true }],
    outputs: [{ id: 'output', name: 'Transformed', type: 'object', required: false }],
    gradient: { from: '#3b82f6', to: '#1d4ed8', direction: 'to-br' },
    shadowLevel: 'lg',
    badge: { text: 'Pro', color: '#8b5cf6', variant: 'solid' }
  },
  {
    id: 'save-node',
    type: 'database',
    position: { x: 900, y: 100 },
    size: { width: 360, height: 'auto' },
    status: 'idle' as NodeStatus,
    metadata: {
      title: 'Save to Database',
      description: 'Store processed data in database',
      category: 'Database',
      color: '#f59e0b',
      version: '1.0.0'
    },
    validation: { isValid: true, errors: [], warnings: [] },
    config: { table: 'processed_data', operation: 'insert' },
    inputs: [{ id: 'input', name: 'Data', type: 'object', required: true }],
    outputs: [{ id: 'output', name: 'Result', type: 'object', required: false }],
    gradient: { from: '#f59e0b', to: '#d97706', direction: 'to-br' },
    shadowLevel: 'lg'
  }
]

const sampleConnections: AdvancedCanvasConnection[] = [
  {
    id: 'conn-1',
    sourceNodeId: 'start-node',
    sourcePortId: 'output',
    targetNodeId: 'transform-node',
    targetPortId: 'input',
    type: 'object',
    animated: true,
    strokeWidth: 2,
    gradient: { from: '#10b981', to: '#3b82f6' }
  },
  {
    id: 'conn-2',
    sourceNodeId: 'transform-node',
    sourcePortId: 'output',
    targetNodeId: 'save-node',
    targetPortId: 'input',
    type: 'object',
    animated: true,
    strokeWidth: 2,
    gradient: { from: '#3b82f6', to: '#f59e0b' }
  }
]

export const AdvancedCanvasProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AdvancedCanvasState>({
    nodes: sampleNodes,
    connections: sampleConnections,
    selectedNodeId: null,
    selectedConnectionIds: [],
    isNodePaletteOpen: true,
    isPropertiesPanelOpen: true,
    snapToGrid: true,
    showGrid: true,
    showMiniMap: true,
    canvasTheme: 'light',
    viewport: { x: 0, y: 0, zoom: 1 }
  })

  // Node operations
  const addNode = useCallback((nodeType: string, position: { x: number; y: number }, data?: Partial<AdvancedCanvasNode>) => {
    const newNode: AdvancedCanvasNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      size: data?.size || { width: 360, height: 'auto' },
      status: 'idle',
      metadata: data?.metadata || {
        title: `New ${nodeType}`,
        description: `A new ${nodeType} node`,
        category: 'General',
        color: '#6b7280',
        version: '1.0.0'
      },
      validation: { isValid: true, errors: [], warnings: [] },
      config: {},
      inputs: data?.inputs || [{ id: 'input', name: 'Input', type: 'any', required: false }],
      outputs: data?.outputs || [{ id: 'output', name: 'Output', type: 'any', required: false }],
      gradient: data?.gradient || { from: '#6b7280', to: '#4b5563', direction: 'to-br' },
      shadowLevel: data?.shadowLevel || 'md',
      dataLayer: data?.dataLayer,
      logicLayer: data?.logicLayer,
      securityLayer: data?.securityLayer,
      scalabilityLayer: data?.scalabilityLayer,
      ...data
    }

    setState(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }))
  }, [])

  const updateNode = useCallback((nodeId: string, updates: Partial<AdvancedCanvasNode>) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }))
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn =>
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      ),
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId
    }))
  }, [])

  const selectNode = useCallback((nodeId: string | null) => {
    setState(prev => ({ ...prev, selectedNodeId: nodeId }))
  }, [])

  const duplicateNode = useCallback((nodeId: string) => {
    const nodeToClone = state.nodes.find(n => n.id === nodeId)
    if (nodeToClone) {
      addNode(nodeToClone.type, 
        { x: nodeToClone.position.x + 50, y: nodeToClone.position.y + 50 }, 
        { ...nodeToClone, id: undefined }
      )
    }
  }, [state.nodes, addNode])

  // Connection operations
  const addConnection = useCallback((connection: Omit<AdvancedCanvasConnection, 'id'>) => {
    const newConnection: AdvancedCanvasConnection = {
      ...connection,
      id: `conn-${Date.now()}`,
      animated: true,
      strokeWidth: 2
    }

    setState(prev => ({ ...prev, connections: [...prev.connections, newConnection] }))
  }, [])

  const updateConnection = useCallback((connectionId: string, updates: Partial<AdvancedCanvasConnection>) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.map(conn =>
        conn.id === connectionId ? { ...conn, ...updates } : conn
      )
    }))
  }, [])

  const deleteConnection = useCallback((connectionId: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId),
      selectedConnectionIds: prev.selectedConnectionIds.filter(id => id !== connectionId)
    }))
  }, [])

  // UI operations
  const toggleNodePalette = useCallback(() => {
    setState(prev => ({ ...prev, isNodePaletteOpen: !prev.isNodePaletteOpen }))
  }, [])

  const togglePropertiesPanel = useCallback(() => {
    setState(prev => ({ ...prev, isPropertiesPanelOpen: !prev.isPropertiesPanelOpen }))
  }, [])

  const setCanvasTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, canvasTheme: theme }))
  }, [])

  const toggleSnapToGrid = useCallback(() => {
    setState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }))
  }, [])

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }))
  }, [])

  const toggleMiniMap = useCallback(() => {
    setState(prev => ({ ...prev, showMiniMap: !prev.showMiniMap }))
  }, [])

  // Viewport operations
  const setViewport = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    setState(prev => ({ ...prev, viewport }))
  }, [])

  const fitView = useCallback(() => {
    // This would be implemented with ReactFlow's fitView function
    console.log('Fit view called')
  }, [])

  // Batch operations
  const clearCanvas = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      nodes: [], 
      connections: [], 
      selectedNodeId: null, 
      selectedConnectionIds: [] 
    }))
  }, [])

  const importWorkflow = useCallback((nodes: AdvancedCanvasNode[], connections: AdvancedCanvasConnection[]) => {
    setState(prev => ({ 
      ...prev, 
      nodes, 
      connections, 
      selectedNodeId: null, 
      selectedConnectionIds: [] 
    }))
  }, [])

  const exportWorkflow = useCallback(() => {
    return { nodes: state.nodes, connections: state.connections }
  }, [state.nodes, state.connections])

  const actions: AdvancedCanvasActions = useMemo(() => ({
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    duplicateNode,
    addConnection,
    updateConnection,
    deleteConnection,
    toggleNodePalette,
    togglePropertiesPanel,
    setCanvasTheme,
    toggleSnapToGrid,
    toggleGrid,
    toggleMiniMap,
    setViewport,
    fitView,
    clearCanvas,
    importWorkflow,
    exportWorkflow
  }), [
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    duplicateNode,
    addConnection,
    updateConnection,
    deleteConnection,
    toggleNodePalette,
    togglePropertiesPanel,
    setCanvasTheme,
    toggleSnapToGrid,
    toggleGrid,
    toggleMiniMap,
    setViewport,
    fitView,
    clearCanvas,
    importWorkflow,
    exportWorkflow
  ])

  return (
    <AdvancedCanvasContext.Provider value={{ state, actions }}>
      {children}
    </AdvancedCanvasContext.Provider>
  )
}