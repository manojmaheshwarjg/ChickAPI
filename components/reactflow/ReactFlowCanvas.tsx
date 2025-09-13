'use client'

import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { BaseNode, NodeConnection } from '@/lib/types'
import { GroupNode as GroupNodeType } from '@/lib/grouping-types'
import { WorkflowNode } from './nodes/WorkflowNode'
import { GroupNode } from './nodes/GroupNode'
import { workflowEdgeTypes, WorkflowEdgeData } from './edges/WorkflowEdge'
import { useNodeGrouping } from '@/hooks/useNodeGrouping'

// Define custom node types
const nodeTypes = {
  workflow: WorkflowNode,
  group: GroupNode
}

interface ReactFlowCanvasProps {
  workflow: {
    id: string
    name: string
    nodes: BaseNode[]
    connections: NodeConnection[]
  }
  onNodeSelect: (node: BaseNode | null) => void
  onNodeAdd: (nodeType: string, position: { x: number; y: number }) => void
  onNodeUpdate?: (node: BaseNode) => void
  onNodeDelete?: (nodeId: string) => void
  onConnectionAdd?: (connection: NodeConnection) => void
  onConnectionDelete?: (connectionId: string) => void
  onGroupCreate?: (nodeIds: string[]) => void
  onGroupUngroup?: (groupId: string) => void
}

function ReactFlowCanvasInner({
  workflow,
  onNodeSelect,
  onNodeAdd,
  onNodeUpdate,
  onNodeDelete,
  onConnectionAdd,
  onConnectionDelete,
  onGroupCreate,
  onGroupUngroup
}: ReactFlowCanvasProps) {
  const reactFlowInstance = useReactFlow()
  
  // Create stable references to avoid infinite loops
  const onNodeUpdateRef = useRef(onNodeUpdate)
  const onConnectionAddRef = useRef(onConnectionAdd)
  const onNodeDeleteRef = useRef(onNodeDelete)
  const onConnectionDeleteRef = useRef(onConnectionDelete)
  const onNodeAddRef = useRef(onNodeAdd)
  const onGroupCreateRef = useRef(onGroupCreate)
  const onGroupUngroupRef = useRef(onGroupUngroup)
  
  useEffect(() => {
    onNodeUpdateRef.current = onNodeUpdate
    onConnectionAddRef.current = onConnectionAdd
    onNodeDeleteRef.current = onNodeDelete
    onConnectionDeleteRef.current = onConnectionDelete
    onNodeAddRef.current = onNodeAdd
    onGroupCreateRef.current = onGroupCreate
    onGroupUngroupRef.current = onGroupUngroup
  }, [onNodeUpdate, onConnectionAdd, onNodeDelete, onConnectionDelete, onNodeAdd, onGroupCreate, onGroupUngroup])

  // Node grouping functionality with stable callbacks
  const nodeGroupingCallbacks = useMemo(() => ({
    onNodesChange: (nodes: BaseNode[]) => {
      // Avoid calling onNodeUpdate in a loop - this causes infinite re-renders
      // Instead, we'll handle this in the component that uses this hook
    },
    onConnectionsChange: (connections: NodeConnection[]) => {
      // Handle connection changes if needed
    }
  }), [])

  const {
    selectedNodes,
    setSelectedNodes,
    createGroup,
    ungroupNodes,
    toggleGroupCollapse,
    addNodesToGroup,
    removeNodesFromGroup,
    canGroupNodes
  } = useNodeGrouping({
    nodes: workflow.nodes,
    connections: workflow.connections,
    ...nodeGroupingCallbacks
  })
  
  // Create stable callback references
  const stableCallbacks = useMemo(() => ({
    onSelect: onNodeSelect,
    onToggleCollapse: toggleGroupCollapse,
    onGroupUpdate: (node: BaseNode) => onNodeUpdateRef.current?.(node)
  }), [onNodeSelect, toggleGroupCollapse])

  // Convert BaseNode[] to ReactFlow Node[]
  const convertNodesToReactFlow = useCallback((nodes: BaseNode[]): Node[] => {
    return nodes.map(node => {
      if (node.type === 'group') {
        const groupNode = node as GroupNodeType
        return {
          id: node.id,
          type: 'group',
          position: node.position,
          data: {
            groupNode,
            onSelect: stableCallbacks.onSelect,
            onToggleCollapse: stableCallbacks.onToggleCollapse,
            onGroupUpdate: stableCallbacks.onGroupUpdate
          },
          draggable: true,
          selectable: true,
          style: {
            width: node.size.width,
            height: node.size.height,
            backgroundColor: 'transparent'
          }
        }
      }
      
      return {
        id: node.id,
        type: 'workflow',
        position: node.position,
        data: {
          node,
          onSelect: stableCallbacks.onSelect
        },
        draggable: true,
        selectable: true
      }
    })
  }, [stableCallbacks])

  // Convert NodeConnection[] to ReactFlow Edge[]
  const convertConnectionsToReactFlow = useCallback((connections: NodeConnection[]): Edge<WorkflowEdgeData>[] => {
    return connections.map(connection => ({
      id: connection.id,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      sourceHandle: connection.sourcePortId,
      targetHandle: connection.targetPortId,
      type: 'workflow',
      data: {
        label: connection.type,
        onDelete: onConnectionDelete,
        animated: true, // Enable flowing animation by default
        status: 'idle', // Can be 'idle', 'active', 'success', 'error'
        flowSpeed: 2 // Animation speed in seconds
      },
      animated: true, // ReactFlow's built-in animation (we override this with custom animation)
      style: {
        strokeWidth: 2,
      }
    }))
  }, [onConnectionDelete])

  const [nodes, setNodes, defaultOnNodesChange] = useNodesState(
    convertNodesToReactFlow(workflow.nodes || [])
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    convertConnectionsToReactFlow(workflow.connections || [])
  )
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Custom nodes change handler for immediate updates
  const onNodesChange = useCallback(
    (changes: any[]) => {
      // Apply changes immediately for smooth dragging
      defaultOnNodesChange(changes)
    },
    [defaultOnNodesChange]
  )

  // Update nodes and edges when workflow prop changes
  useEffect(() => {
    setNodes(convertNodesToReactFlow(workflow.nodes || []))
    setEdges(convertConnectionsToReactFlow(workflow.connections || []))
  }, [workflow.nodes, workflow.connections, convertNodesToReactFlow, convertConnectionsToReactFlow, setNodes, setEdges])

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        const newConnection: NodeConnection = {
          id: `conn_${Date.now()}`,
          sourceNodeId: connection.source,
          sourcePortId: connection.sourceHandle || 'default',
          targetNodeId: connection.target,
          targetPortId: connection.targetHandle || 'default',
          type: 'any' as any
        }
        
        onConnectionAddRef.current?.(newConnection)
        
        // Create edge directly instead of using conversion function to avoid dependencies
        const newEdge: Edge<WorkflowEdgeData> = {
          id: newConnection.id,
          source: newConnection.sourceNodeId,
          target: newConnection.targetNodeId,
          sourceHandle: newConnection.sourcePortId,
          targetHandle: newConnection.targetPortId,
          type: 'workflow',
          data: {
            label: newConnection.type,
            onDelete: onConnectionDelete,
            animated: true, // Enable flowing animation
            status: 'active', // New connections start as active
            flowSpeed: 2
          },
          animated: true,
          style: {
            strokeWidth: 2,
          }
        }
        
        setEdges((eds) => addEdge(newEdge, eds))
      }
    },
    [onConnectionDelete, setEdges]
  )

  // Handle real-time node dragging for immediate edge updates
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Force immediate edge re-rendering by updating the node position
      setNodes((nds) => 
        nds.map((n) => 
          n.id === node.id 
            ? { ...n, position: node.position }
            : n
        )
      )
      
      // The CSS transitions are already disabled, so this should update immediately
    },
    [setNodes]
  )

  // Handle node position changes on drag stop
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (!node || !node.id) {
        console.error('Invalid node passed to onNodeDragStop:', node)
        return
      }

      const existingNode = nodes.find(n => n.id === node.id)
      if (!existingNode || !existingNode.data?.node) {
        console.error('Could not find node data for node:', node.id)
        return
      }

      const updatedNode: BaseNode = {
        ...existingNode.data.node,
        position: node.position
      }
      onNodeUpdateRef.current?.(updatedNode)
    },
    [nodes]
  )

  // Handle selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (selectedNodes.length > 0) {
        const selectedNode = selectedNodes[0].data.node as BaseNode
        onNodeSelect(selectedNode)
      } else {
        onNodeSelect(null)
      }
    },
    [onNodeSelect]
  )

  // Handle keyboard shortcuts
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Delete selected nodes/edges
      if (event.key === 'Delete') {
        const selectedReactFlowNodes = reactFlowInstance.getNodes().filter(node => node.selected)
        const selectedEdges = reactFlowInstance.getEdges().filter(edge => edge.selected)
        
        selectedReactFlowNodes.forEach(node => {
          onNodeDeleteRef.current?.(node.id)
        })
        
        selectedEdges.forEach(edge => {
          onConnectionDeleteRef.current?.(edge.id)
        })
        
        setNodes(nodes => nodes.filter(node => !node.selected))
        setEdges(edges => edges.filter(edge => !edge.selected))
      }
      
      // Group selected nodes (Ctrl+G)
      if (event.ctrlKey && event.key === 'g' && !event.shiftKey) {
        event.preventDefault()
        const selectedReactFlowNodes = reactFlowInstance.getNodes().filter(node => node.selected)
        const selectedNodeIds = selectedReactFlowNodes.map(node => node.id)
        
        if (selectedNodeIds.length > 1 && canGroupNodes(selectedNodeIds)) {
          const groupNode = createGroup(selectedNodeIds)
          if (groupNode) {
            onNodeAddRef.current?.('group', groupNode.position)
            onGroupCreateRef.current?.(selectedNodeIds)
          }
        }
      }
      
      // Ungroup selected group (Ctrl+Shift+G)
      if (event.ctrlKey && event.shiftKey && event.key === 'G') {
        event.preventDefault()
        const selectedReactFlowNodes = reactFlowInstance.getNodes().filter(node => node.selected)
        const groupNodes = selectedReactFlowNodes.filter(node => node.type === 'group')
        
        groupNodes.forEach(groupNode => {
          ungroupNodes(groupNode.id)
          onGroupUngroupRef.current?.(groupNode.id)
        })
      }
      
      // Select All (Ctrl+A)
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault()
        const allNodes = reactFlowInstance.getNodes().map(node => ({ ...node, selected: true }))
        setNodes(allNodes)
      }
      
      // Toggle group collapse (Space when group is selected)
      if (event.key === ' ' && !event.ctrlKey) {
        event.preventDefault()
        const selectedReactFlowNodes = reactFlowInstance.getNodes().filter(node => node.selected)
        const groupNodes = selectedReactFlowNodes.filter(node => node.type === 'group')
        
        groupNodes.forEach(groupNode => {
          toggleGroupCollapse(groupNode.id)
        })
      }
    },
    [reactFlowInstance, setNodes, setEdges, canGroupNodes, createGroup, ungroupNodes, toggleGroupCollapse]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
    console.log('🎯 Drag over canvas')
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDraggingOver(false)
    console.log('🎯 Drag leave canvas')
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      console.log('🎯 Drop event fired!')
      event.preventDefault()
      event.stopPropagation()
      setIsDraggingOver(false)
      
      console.log('📦 Available drop types:', Array.from(event.dataTransfer.types || []))
      
      const nodeType =
        event.dataTransfer.getData('nodeType') ||
        event.dataTransfer.getData('application/reactflow') ||
        event.dataTransfer.getData('text/plain')
      
      console.log('🎯 Extracted nodeType:', nodeType)
      
      if (nodeType) {
        // Compute drop position in flow coordinates
        const screenToFlow = (reactFlowInstance as any).screenToFlowPosition || reactFlowInstance.project
        const position = screenToFlow({ x: event.clientX, y: event.clientY })
        
        console.log('🎯 Drop position:', position)
        console.log('🎯 Calling onNodeAdd with:', nodeType, position)
        
        // Call the node add function
        onNodeAddRef.current?.(nodeType, position)
      } else {
        // Minimal logging to help diagnose drag-drop issues
        console.warn('❌ Drop ignored: missing nodeType in dataTransfer. Available types:',
          Array.from(event.dataTransfer.types || []))
      }
    },
    [reactFlowInstance, onNodeAddRef]
  )

  return (
    <div 
      className="w-full h-full relative" 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={onDrop}
      style={{ position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={workflowEdgeTypes}
        connectionMode={ConnectionMode.Loose}
        elevateEdgesOnSelect={true}
        snapToGrid={false}
        fitView
        attributionPosition="top-right"
        className={isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      >
        <Controls 
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
        />
        <MiniMap 
          nodeStrokeColor="#374151"
          nodeColor="#f3f4f6"
          nodeBorderRadius={8}
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-left"
          style={{
            width: 120,
            height: 80
          }}
        />
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color="#d1d5db"
        />
      </ReactFlow>

      {/* Drop indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none flex items-center justify-center border-2 border-dashed border-blue-400">
          <div className="bg-white rounded-lg shadow-lg px-6 py-3 border border-blue-200">
            <p className="text-blue-600 font-medium">Drop to add node</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Main component with ReactFlowProvider
export default function ReactFlowCanvas(props: ReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
