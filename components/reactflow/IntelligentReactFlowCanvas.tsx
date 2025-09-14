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
  Panel,
  useViewport
} from 'reactflow'
import 'reactflow/dist/style.css'

import { 
  Sparkles, Play, Pause, Brain, TrendingUp, 
  Users, Target, Lightbulb, ArrowRight, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { IntelligentWorkflowNode } from './nodes/IntelligentWorkflowNode'
import { intelligentEdgeTypes } from './edges/IntelligentEdge'

// Enhanced node types
const nodeTypes = {
  intelligent: IntelligentWorkflowNode,
}

interface WorkflowStep {
  id: string
  type: 'request' | 'transform' | 'condition' | 'response' | 'ai-assistant'
  title: string
  description: string
  status: 'idle' | 'running' | 'success' | 'error' | 'warning'
  config: Record<string, any>
  preview?: any
  suggestions?: string[]
  analytics?: {
    successRate: number
    avgResponseTime: number
    usage: number
  }
}

interface IntelligentReactFlowCanvasProps {
  workflow: {
    id: string
    name: string
    steps: WorkflowStep[]
    connections?: Array<{
      id: string
      source: string
      target: string
      status?: 'idle' | 'active' | 'success' | 'error' | 'warning'
      label?: string
      data?: any
    }>
  }
  onStepAdd: (stepType: string, position: { x: number; y: number }) => void
  onStepUpdate: (step: WorkflowStep) => void
  onStepDelete: (stepId: string) => void
  onConnectionAdd?: (connection: any) => void
  onConnectionDelete?: (connectionId: string) => void
  onNodeSelect?: (step: WorkflowStep | null) => void
  isRunning?: boolean
  onRun: () => void
  onStop: () => void
}

function IntelligentReactFlowCanvasInner({
  workflow,
  onStepAdd,
  onStepUpdate,
  onStepDelete,
  onConnectionAdd,
  onConnectionDelete,
  onNodeSelect,
  isRunning = false,
  onRun,
  onStop
}: IntelligentReactFlowCanvasProps) {
  const reactFlowInstance = useReactFlow()
  const { x, y, zoom } = useViewport()
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Convert workflow steps to React Flow nodes
  const convertToReactFlowNodes = useCallback((steps: WorkflowStep[]): Node[] => {
    return steps.map((step, index) => ({
      id: step.id,
      type: 'intelligent',
      position: { x: 100 + index * 400, y: 100 + (index % 3) * 200 }, // Smart auto-layout
      data: {
        ...step,
        onSelect: (nodeData: any) => {
          setSelectedNode(nodeData.id)
          onNodeSelect?.(step)
        },
        onPreview: (nodeData: any) => {
          console.log('Preview node:', nodeData)
          // Implement preview logic
        },
        onSuggestionClick: (suggestion: string) => {
          console.log('Suggestion clicked:', suggestion)
          // Implement AI suggestion handling
          handleAISuggestion(suggestion, step)
        }
      },
      draggable: true,
      selectable: true,
    }))
  }, [])

  // Convert connections to React Flow edges
  const convertToReactFlowEdges = useCallback((connections: any[] = []): Edge[] => {
    return connections.map(connection => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: 'intelligent',
      data: {
        label: connection.label,
        status: connection.status || 'idle',
        animated: connection.status === 'active',
        onDelete: onConnectionDelete,
        transferredData: connection.data,
        successRate: connection.successRate || 95,
        avgResponseTime: connection.avgResponseTime || 120,
      },
      animated: connection.status === 'active',
      style: {
        strokeWidth: 2,
      }
    }))
  }, [onConnectionDelete])

  const [nodes, setNodes, onNodesChange] = useNodesState(
    convertToReactFlowNodes(workflow.steps)
  )
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    convertToReactFlowEdges(workflow.connections)
  )

  // Update nodes when workflow changes
  useEffect(() => {
    setNodes(convertToReactFlowNodes(workflow.steps))
  }, [workflow.steps, convertToReactFlowNodes, setNodes])

  // Update edges when connections change
  useEffect(() => {
    setEdges(convertToReactFlowEdges(workflow.connections))
  }, [workflow.connections, convertToReactFlowEdges, setEdges])

  // Handle new connections
  const onConnect: OnConnect = useCallback((params) => {
    const newConnection = {
      id: `edge-${Date.now()}`,
      source: params.source!,
      target: params.target!,
      status: 'idle' as const,
      label: 'data flow',
    }
    
    onConnectionAdd?.(newConnection)
    setEdges((eds) => addEdge({
      ...params,
      id: newConnection.id,
      type: 'intelligent',
      data: {
        label: newConnection.label,
        status: newConnection.status,
        onDelete: onConnectionDelete,
      }
    }, eds))
  }, [onConnectionAdd, onConnectionDelete, setEdges])

  // Handle node drag end - update position
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    const step = workflow.steps.find(s => s.id === node.id)
    if (step) {
      onStepUpdate({
        ...step,
        // Update position if needed for persistence
      })
    }
  }, [workflow.steps, onStepUpdate])

  // Handle drop from node palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDraggingOver(true)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent) => {
    setIsDraggingOver(false)
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDraggingOver(false)

    const nodeType = event.dataTransfer.getData('nodeType')
    if (!nodeType || !reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    onStepAdd(nodeType, position)
  }, [onStepAdd, reactFlowInstance])

  // Handle AI suggestion
  const handleAISuggestion = useCallback((suggestion: string, step: WorkflowStep) => {
    console.log('Handling AI suggestion:', suggestion, 'for step:', step.id)
    
    // Smart suggestion handling
    if (suggestion.includes('validation')) {
      // Add validation step
      const position = { 
        x: 100 + workflow.steps.length * 400, 
        y: 100 + (workflow.steps.length % 3) * 200 
      }
      onStepAdd('validation', position)
    } else if (suggestion.includes('transform')) {
      // Add transform step
      const position = { 
        x: 100 + workflow.steps.length * 400, 
        y: 100 + (workflow.steps.length % 3) * 200 
      }
      onStepAdd('transform', position)
    }
    // Add more intelligent suggestion handling
  }, [workflow.steps, onStepAdd])

  // Smart suggestions for empty canvas
  const getSmartSuggestions = (): string[] => {
    if (workflow.steps.length === 0) {
      return [
        'Start with an HTTP request',
        'Import from Postman collection',
        'Use a pre-built template',
        'Connect to your API endpoint'
      ]
    }
    
    const lastStep = workflow.steps[workflow.steps.length - 1]
    switch (lastStep.type) {
      case 'request':
        return [
          'Add response validation',
          'Transform the response data',
          'Add conditional logic',
          'Store data in variables'
        ]
      case 'transform':
        return [
          'Add another transformation',
          'Validate the transformed data',
          'Send to next endpoint',
          'Add error handling'
        ]
      default:
        return [
          'Continue the workflow',
          'Add error handling',
          'Save results to database',
          'Send notification'
        ]
    }
  }

  // Workflow health calculation
  const workflowHealth = useMemo(() => {
    if (workflow.steps.length === 0) return { successRate: 0, avgTime: 0 }
    
    const totalSuccess = workflow.steps.reduce((sum, step) => 
      sum + (step.analytics?.successRate || 0), 0)
    const totalTime = workflow.steps.reduce((sum, step) => 
      sum + (step.analytics?.avgResponseTime || 0), 0)
    
    return {
      successRate: Math.round(totalSuccess / workflow.steps.length),
      avgTime: Math.round(totalTime / workflow.steps.length)
    }
  }, [workflow.steps])

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-background via-background to-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={intelligentEdgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        snapToGrid={false}
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={1.5}
        className={isDraggingOver ? 'ring-2 ring-primary ring-opacity-50' : ''}
      >
        {/* Intelligent Background */}
        <Background 
          variant="dots" 
          gap={24} 
          size={1}
          color="hsl(var(--muted-foreground))"
          style={{ opacity: 0.3 }}
        />

        {/* Enhanced Controls */}
        <Controls 
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
          className="bg-card border border-border rounded-lg shadow-lg"
        />

        {/* Intelligent MiniMap */}
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data.type) {
              case 'request': return 'hsl(var(--primary))'
              case 'transform': return '#10b981'
              case 'condition': return '#f59e0b'
              case 'ai-assistant': return '#8b5cf6'
              default: return 'hsl(var(--muted-foreground))'
            }
          }}
          nodeStrokeColor="hsl(var(--border))"
          nodeBorderRadius={8}
          maskColor="rgba(0, 0, 0, 0.08)"
          position="bottom-left"
          className="bg-card border border-border rounded-lg shadow-lg"
          style={{ width: 150, height: 100 }}
        />

        {/* Intelligent Toolbar */}
        <Panel position="top-left" className="flex items-center gap-3">
          <Card className="px-4 py-3 shadow-lg">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant={isRunning ? "secondary" : "default"}
                onClick={isRunning ? onStop : onRun}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </>
                )}
              </Button>
              
              <div className="h-4 w-px bg-border" />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>3 collaborators</span>
              </div>
            </div>
          </Card>

          {/* AI Assistant Toggle */}
          <Card className="px-4 py-3 shadow-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-primary"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
              <Brain className="w-4 h-4" />
              AI Assistant
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </Button>
          </Card>
        </Panel>

        {/* Workflow Health Dashboard */}
        <Panel position="top-right">
          <Card className="p-4 w-64 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-sm">Workflow Health</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {workflowHealth.successRate}%
                </div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {workflowHealth.avgTime}ms
                </div>
                <div className="text-muted-foreground">Avg Runtime</div>
              </div>
            </div>
            
            {/* Workflow progress */}
            {isRunning && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Running step {Math.min(3, workflow.steps.length)} of {workflow.steps.length}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            )}
          </Card>
        </Panel>

        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <Panel position="top-center">
            <Card className="p-4 max-w-md shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">AI Workflow Assistant</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    I can help optimize your workflow and suggest improvements
                  </p>
                  <div className="space-y-2">
                    {getSmartSuggestions().slice(0, 2).map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs h-8"
                        onClick={() => handleAISuggestion(suggestion, workflow.steps[0] || {} as WorkflowStep)}
                      >
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Panel>
        )}

        {/* Empty State */}
        {workflow.steps.length === 0 && (
          <Panel position="center">
            <Card className="p-8 text-center max-w-md shadow-lg">
              <div className="mb-4">
                <Lightbulb className="w-12 h-12 mx-auto text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Building Your API Workflow</h3>
              <p className="text-muted-foreground mb-4">
                Create powerful API workflows with our intelligent React Flow canvas
              </p>
              <div className="space-y-2">
                {getSmartSuggestions().map((suggestion, i) => (
                  <Button 
                    key={i}
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAISuggestion(suggestion, {} as WorkflowStep)}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </Card>
          </Panel>
        )}

        {/* Drop indicator */}
        {isDraggingOver && (
          <Panel position="center">
            <div className="bg-primary/10 border-2 border-dashed border-primary rounded-lg p-8">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto text-primary mb-2" />
                <p className="text-primary font-medium">Drop to add intelligent node</p>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

// Main component with ReactFlowProvider
export default function IntelligentReactFlowCanvas(props: IntelligentReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <IntelligentReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
