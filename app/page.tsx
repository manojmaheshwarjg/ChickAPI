'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkles, Zap, Brain, Target, Users,
  ArrowRight, Play, Pause, Settings,
  PanelLeft, PanelRight, Maximize2
} from 'lucide-react'
import IntelligentReactFlowCanvas from '@/components/reactflow/IntelligentReactFlowCanvas'
import { IntelligentNodePalette } from '@/components/palette/IntelligentNodePalette'
import { NodeDetailModal } from '@/components/palette/NodeDetailModal'

// Mock workflow data with connections
const mockWorkflow = {
  id: 'workflow-1',
  name: 'User Authentication Flow',
  steps: [
    {
      id: 'step-1',
      type: 'request' as const,
      title: 'Login Request',
      description: 'POST /auth/login with credentials',
      status: 'success' as const,
      config: {
        method: 'POST',
        url: 'https://api.example.com/auth/login',
        body: { email: 'user@example.com', password: '******' }
      },
      preview: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', user: { id: 123, name: 'John Doe' } },
      suggestions: [
        'Validate token expiration',
        'Store token in environment',
        'Add refresh token logic'
      ],
      analytics: {
        successRate: 98.5,
        avgResponseTime: 245,
        usage: 1250
      }
    },
    {
      id: 'step-2', 
      type: 'transform' as const,
      title: 'Extract Token',
      description: 'Extract JWT token from response',
      status: 'success' as const,
      config: {
        transform: '$.token',
        variable: 'auth_token'
      },
      preview: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      suggestions: [
        'Validate token format',
        'Decode token payload',
        'Set token expiration'
      ],
      analytics: {
        successRate: 99.1,
        avgResponseTime: 12,
        usage: 980
      }
    },
    {
      id: 'step-3',
      type: 'request' as const,
      title: 'Get User Profile',
      description: 'GET /user/profile with auth token',
      status: 'running' as const,
      config: {
        method: 'GET',
        url: 'https://api.example.com/user/profile',
        headers: { 'Authorization': 'Bearer {{auth_token}}' }
      },
      preview: null,
      suggestions: [
        'Add error handling',
        'Cache user profile',
        'Update UI with user data'
      ],
      analytics: {
        successRate: 96.8,
        avgResponseTime: 180,
        usage: 890
      }
    }
  ],
  connections: [
    {
      id: 'edge-1-2',
      source: 'step-1',
      target: 'step-2',
      status: 'success' as const,
      label: 'auth response',
      data: { token: 'eyJhbGci...', user: { id: 123 } },
      successRate: 98.5,
      avgResponseTime: 120
    },
    {
      id: 'edge-2-3',
      source: 'step-2',
      target: 'step-3',
      status: 'active' as const,
      label: 'extracted token',
      data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      successRate: 96.8,
      avgResponseTime: 85
    }
  ]
}

export default function Home() {
  const [workflow, setWorkflow] = useState(mockWorkflow)
  const [isRunning, setIsRunning] = useState(false)
  const [showNodePalette, setShowNodePalette] = useState(true)
  const [showProperties, setShowProperties] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeDetailModal, setNodeDetailModal] = useState<any>(null)

  const handleStepAdd = useCallback((stepType: string, position: { x: number; y: number }) => {
    const stepTypeMap: Record<string, string> = {
      'http-request': 'request',
      'json-transform': 'transform',
      'conditional': 'condition',
      'ai-assistant': 'ai-assistant',
    }
    
    const mappedType = stepTypeMap[stepType] || stepType
    
    const newStep = {
      id: `step-${Date.now()}`,
      type: mappedType as any,
      title: `New ${mappedType}`,
      description: `A new ${mappedType} step`,
      status: 'idle' as const,
      config: {},
      preview: null,
      suggestions: ['Configure this step', 'Add validation', 'Test the step'],
      analytics: {
        successRate: 0,
        avgResponseTime: 0,
        usage: 0
      }
    }

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }, [])

  const handleStepUpdate = useCallback((updatedStep: any) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      )
    }))
  }, [])

  const handleStepDelete = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }, [])

  const handleRun = useCallback(() => {
    setIsRunning(true)
    // Simulate workflow execution
    setTimeout(() => setIsRunning(false), 3000)
  }, [])

  const handleStop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node)
    if (node && node.id && node.id.startsWith('step-')) {
      // This is a canvas node selection - show properties
      setShowProperties(true)
    } else {
      // This is a palette node selection - show detail modal
      setNodeDetailModal(node)
    }
  }, [])

  const handleCanvasNodeSelect = useCallback((step: any) => {
    setSelectedNode(step)
    if (step) {
      setShowProperties(true)
    }
  }, [])

  const handleNodeDrag = useCallback((node: any) => {
    console.log('Node dragged:', node)
  }, [])

  const handleUseNode = useCallback((node: any) => {
    // Add node to canvas
    const position = { x: 50 + workflow.steps.length * 200, y: 200 }
    handleStepAdd(node.id, position)
    setNodeDetailModal(null)
  }, [workflow.steps.length, handleStepAdd])

  const handleAddToFavorites = useCallback((nodeId: string) => {
    console.log('Added to favorites:', nodeId)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">ChickAPI Studio</h1>
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
                Next-Gen Canvas
              </Badge>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{workflow.name}</span>
              <Badge variant="outline" className="text-xs">
                {workflow.steps.length} steps
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="gap-2"
            >
              <PanelLeft className="w-4 h-4" />
              Palette
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProperties(!showProperties)}
              className="gap-2"
            >
              <PanelRight className="w-4 h-4" />
              Properties
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>3 collaborators</span>
              </div>
              <Users className="w-4 h-4" />
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette Sidebar */}
        {showNodePalette && (
          <div className="w-96 border-r border-border">
            <IntelligentNodePalette
              onNodeSelect={handleNodeSelect}
              onNodeDrag={handleNodeDrag}
            />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <IntelligentReactFlowCanvas
            workflow={workflow}
            onStepAdd={handleStepAdd}
            onStepUpdate={handleStepUpdate}
            onStepDelete={handleStepDelete}
            onNodeSelect={handleCanvasNodeSelect}
            onConnectionAdd={(connection) => {
              setWorkflow(prev => ({
                ...prev,
                connections: [...(prev.connections || []), connection]
              }))
            }}
            onConnectionDelete={(connectionId) => {
              setWorkflow(prev => ({
                ...prev,
                connections: (prev.connections || []).filter(c => c.id !== connectionId)
              }))
            }}
            isRunning={isRunning}
            onRun={handleRun}
            onStop={handleStop}
          />

          {/* Quick Actions FAB */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <Button size="lg" className="rounded-full shadow-lg gap-2">
              <Brain className="w-5 h-5" />
              AI Help
            </Button>
            <Button variant="outline" size="lg" className="rounded-full shadow-lg gap-2">
              <Target className="w-5 h-5" />
              Templates
            </Button>
            <Button variant="outline" size="lg" className="rounded-full shadow-lg gap-2">
              <Maximize2 className="w-5 h-5" />
              Full Screen
            </Button>
          </div>
        </div>

        {/* Properties Panel */}
        {showProperties && selectedNode && (
          <div className="w-80 border-l border-border bg-card">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Step Properties</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProperties(false)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input 
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                    defaultValue={selectedNode.title || 'Step Name'}
                    onChange={(e) => {
                      const updatedStep = { ...selectedNode, title: e.target.value }
                      handleStepUpdate(updatedStep)
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm h-20"
                    defaultValue={selectedNode.description || ''}
                    placeholder="Describe what this step does..."
                    onChange={(e) => {
                      const updatedStep = { ...selectedNode, description: e.target.value }
                      handleStepUpdate(updatedStep)
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-1 px-3 py-2 border border-border rounded-md text-sm bg-muted">
                    {selectedNode.type}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={selectedNode.status === 'success' ? 'default' : selectedNode.status === 'error' ? 'destructive' : 'secondary'}
                    >
                      {selectedNode.status}
                    </Badge>
                  </div>
                </div>
                {selectedNode.analytics && (
                  <div>
                    <label className="text-sm font-medium">Analytics</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Success Rate:</span>
                        <span className="font-medium">{selectedNode.analytics.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Avg Response Time:</span>
                        <span className="font-medium">{selectedNode.analytics.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Usage Count:</span>
                        <span className="font-medium">{selectedNode.analytics.usage}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Node Detail Modal */}
      {nodeDetailModal && (
        <NodeDetailModal
          node={nodeDetailModal}
          open={!!nodeDetailModal}
          onClose={() => setNodeDetailModal(null)}
          onUseNode={handleUseNode}
          onAddToFavorites={handleAddToFavorites}
        />
      )}

    </div>
  )
}
