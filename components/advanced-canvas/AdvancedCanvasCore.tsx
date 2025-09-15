'use client'

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react'
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
  BackgroundVariant
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useAdvancedCanvas, AdvancedCanvasNode, AdvancedCanvasConnection } from './AdvancedCanvasContext'
import { AdvancedNode } from './nodes/AdvancedNode'
import { AdvancedBezierEdge, advancedEdgeTypes } from './edges/AdvancedBezierEdge'
import { getNodeById } from '@/lib/node-palette/registry'

// Node types configuration
const nodeTypes = {
  advanced: AdvancedNode,
  default: AdvancedNode
}


const AdvancedCanvasCoreInner = () => {
  const { state, actions } = useAdvancedCanvas()
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Convert canvas nodes to ReactFlow nodes directly 
  const nodes = state.nodes.map(node => ({
    id: node.id,
    type: 'advanced',
    position: node.position,
    data: {
      node,
      onSelect: (selectedNode: AdvancedCanvasNode) => actions.selectNode(selectedNode.id),
      onUpdate: actions.updateNode,
      onDelete: actions.deleteNode,
      onDuplicate: actions.duplicateNode
    },
    draggable: true,
    selectable: true,
    style: {
      width: node.size?.width || 360,
      height: node.size?.height === 'auto' ? undefined : (node.size?.height || undefined)
    }
  }))

  // Convert canvas connections to ReactFlow edges directly
  const edges = state.connections.map(connection => ({
    id: connection.id,
    source: connection.sourceNodeId,
    target: connection.targetNodeId,
    sourceHandle: connection.sourcePortId,
    targetHandle: connection.targetPortId,
    type: 'advanced',
    data: {
      label: connection.label || connection.type,
      animated: connection.animated || false,
      gradient: connection.gradient,
      strokeWidth: connection.strokeWidth || 2,
      status: 'idle',
      flowSpeed: 2,
      onDelete: actions.deleteConnection,
      labelBgColor: connection.labelBgColor,
      labelTextColor: connection.labelTextColor
    },
    animated: connection.animated || false,
    style: {
      strokeWidth: connection.strokeWidth || 2
    }
  }))

  // Use ReactFlow's internal state management
  const [, , onNodesChange] = useNodesState([])
  const [, , onEdgesChange] = useEdgesState([])

  // Handle new connections with enhanced feedback
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        // Prevent self-connections
        if (connection.source === connection.target) {
          console.warn('Self-connections are not allowed');
          return;
        }
        
        // Check for duplicate connections
        const isDuplicate = state.connections.some(conn => 
          conn.sourceNodeId === connection.source &&
          conn.targetNodeId === connection.target &&
          conn.sourcePortId === (connection.sourceHandle || 'output') &&
          conn.targetPortId === (connection.targetHandle || 'input')
        );
        
        if (isDuplicate) {
          console.warn('Connection already exists');
          return;
        }
        
        // Get source and target nodes for color gradient
        const sourceNode = state.nodes.find(n => n.id === connection.source);
        const targetNode = state.nodes.find(n => n.id === connection.target);
        
        const newConnection: Omit<AdvancedCanvasConnection, 'id'> = {
          sourceNodeId: connection.source,
          sourcePortId: connection.sourceHandle || 'output',
          targetNodeId: connection.target,
          targetPortId: connection.targetHandle || 'input',
          type: 'data',
          animated: true,
          strokeWidth: 2,
          gradient: sourceNode && targetNode ? {
            from: sourceNode.metadata?.color || '#6b7280',
            to: targetNode.metadata?.color || '#6b7280'
          } : undefined
        };
        
        actions.addConnection(newConnection);
        console.log('✅ Connection created successfully');
      }
    },
    [actions, state.nodes, state.connections]
  )

  // Handle node position updates
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node && node.id && node.data?.node) {
        actions.updateNode(node.id, {
          position: node.position
        })
      }
    },
    [actions]
  )

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (selectedNodes.length > 0) {
        actions.selectNode(selectedNodes[0].id)
      } else {
        actions.selectNode(null)
      }
    },
    [actions]
  )

  // Drag and drop handling
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    // Check if we're actually leaving the canvas area
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDraggingOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDraggingOver(false)

      console.log('🎯 Drop event triggered');
      console.log('DataTransfer types:', Array.from(event.dataTransfer.types));

      // Try multiple ways to get the node data
      let nodeType = null;
      let nodeData = null;

      // Method 1: Try to get JSON data
      try {
        const jsonData = event.dataTransfer.getData('application/json');
        if (jsonData) {
          nodeData = JSON.parse(jsonData);
          nodeType = nodeData.id;
          console.log('✅ Got node from JSON:', nodeType);
        }
      } catch (e) {
        console.log('JSON parse failed:', e);
      }

      // Method 2: Try standard data types
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('nodeType') ||
          event.dataTransfer.getData('application/reactflow') ||
          event.dataTransfer.getData('text/plain') ||
          event.dataTransfer.getData('text');
        console.log('Got node from standard types:', nodeType);
      }

      if (!nodeType) {
        console.warn('❌ No node type found in drag data');
        return;
      }

      console.log('✅ Creating node with type:', nodeType);

      // Get the canvas bounding rect for accurate position calculation
      const canvasRect = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      
      // Calculate position relative to the canvas
      const position = reactFlowInstance ? 
        reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        }) : {
          x: canvasRect ? event.clientX - canvasRect.left : event.clientX,
          y: canvasRect ? event.clientY - canvasRect.top : event.clientY
        };

      console.log('📍 Drop position:', position);

      // Get node definition from registry or use nodeData
      const nodeDefinition = nodeData || getNodeById(nodeType);
      if (nodeDefinition) {
        // Create new node with enhanced properties and comprehensive layers
        actions.addNode(nodeType, position, {
          size: { width: 360, height: 'auto' },
          metadata: {
            title: nodeDefinition.name,
            description: nodeDefinition.description,
            category: nodeDefinition.category,
            color: nodeDefinition.color,
            version: '1.0.0'
          },
          inputs: nodeDefinition.inputs || [{ id: 'input', name: 'Input', type: 'any', required: false }],
          outputs: nodeDefinition.outputs || [{ id: 'output', name: 'Output', type: 'any', required: false }],
          gradient: {
            from: nodeDefinition.color,
            to: adjustColorBrightness(nodeDefinition.color, -20),
            direction: 'to-br'
          },
          shadowLevel: 'lg',
          // Initialize comprehensive layers with defaults
          dataLayer: {
            inputFormat: 'JSON',
            outputFormat: 'JSON',
            schemaValidation: false,
            sources: []
          },
          logicLayer: {
            aiEnabled: false,
            aiModel: 'GPT-4',
            processingType: 'Synchronous',
            errorHandling: 'fail-fast'
          },
          securityLayer: {
            authType: 'OAuth2',
            encryption: 'AES-256',
            rateLimit: 'Unlimited'
          },
          scalabilityLayer: {
            currentRequests: 0,
            expectedRequests: 100,
            maxRequests: 1000,
            minInstances: 1,
            maxInstances: 10,
            activeHours: '24/7',
            spikeHandling: 'Auto-scale',
            fallback: 'Queue'
          }
        });
        console.log('✅ Node created successfully');
      } else {
        // Fallback: create basic node
        console.log('⚠️ Creating basic node (no definition found)');
        actions.addNode(nodeType, position);
      }
    },
    [reactFlowInstance, actions]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected nodes/edges
      if (event.key === 'Delete') {
        const selectedNodes = reactFlowInstance.getNodes().filter(node => node.selected)
        const selectedEdges = reactFlowInstance.getEdges().filter(edge => edge.selected)

        selectedNodes.forEach(node => actions.deleteNode(node.id))
        selectedEdges.forEach(edge => actions.deleteConnection(edge.id))
      }

      // Duplicate selected node (Ctrl+D)
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault()
        const selectedNodes = reactFlowInstance.getNodes().filter(node => node.selected)
        if (selectedNodes.length === 1) {
          actions.duplicateNode(selectedNodes[0].id)
        }
      }

      // Select all (Ctrl+A) - Note: This functionality is handled by ReactFlow internally
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault()
        // ReactFlow handles selection internally, we just prevent the default browser behavior
      }

      // Fit view (F)
      if (event.key === 'f') {
        actions.fitView()
        reactFlowInstance.fitView({ padding: 0.2 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [reactFlowInstance, actions])

  // Enterprise background configuration
  const backgroundConfig = {
    variant: BackgroundVariant.Dots as BackgroundVariant,
    gap: 20,
    size: 1,
    color: '#e5e7eb',
    style: {
      backgroundColor: '#fafbfc'
    }
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        onSelectionChange={onSelectionChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={advancedEdgeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineType="bezier"
        connectionLineStyle={{
          strokeWidth: 2,
          stroke: '#2563eb',
          strokeDasharray: '5 5'
        }}
        connectionLineComponent={({ fromX, fromY, toX, toY }) => (
          <g>
            <path
              d={`M${fromX},${fromY} C${fromX + 100},${fromY} ${toX - 100},${toY} ${toX},${toY}`}
              stroke="#2563eb"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5 5"
              opacity="0.6"
            />
            <circle cx={toX} cy={toY} r="3" fill="#2563eb" />
          </g>
        )}
        snapToGrid={state.snapToGrid}
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 800 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'advanced',
          animated: true
        }}
        className={`${isDraggingOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        proOptions={{ hideAttribution: true }}
      >
        <Controls 
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
        />
        
        {state.showMiniMap && (
          <MiniMap
            nodeStrokeColor="#374151"
            nodeColor="#f3f4f6"
            nodeBorderRadius={8}
            maskColor="rgba(0, 0, 0, 0.1)"
            position="bottom-left"
            style={{
              width: 150,
              height: 100
            }}
          />
        )}
        
        <Background {...backgroundConfig} />
      </ReactFlow>

      {/* Drop indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none flex items-center justify-center border-2 border-dashed border-blue-400 rounded-lg">
          <div className="bg-white rounded-lg shadow-lg px-6 py-3 border border-blue-200">
            <p className="text-blue-600 font-medium">Drop to add node</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#'
  const col = usePound ? color.slice(1) : color
  const num = parseInt(col, 16)
  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0x00FF) + amount
  let b = (num & 0x0000FF) + amount
  r = r > 255 ? 255 : r < 0 ? 0 : r
  g = g > 255 ? 255 : g < 0 ? 0 : g
  b = b > 255 ? 255 : b < 0 ? 0 : b
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0')
}

export const AdvancedCanvasCore = () => {
  return (
    <ReactFlowProvider>
      <AdvancedCanvasCoreInner />
    </ReactFlowProvider>
  )
}