'use client'

import React, { useState, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { 
  Sparkles, Eye, Brain, TrendingUp, Play, 
  CheckCircle, AlertCircle, Clock, Zap,
  MessageSquare, RefreshCw, Target, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface IntelligentWorkflowNodeProps {
  data: {
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
    onSelect?: (node: any) => void
    onPreview?: (node: any) => void
    onSuggestionClick?: (suggestion: string) => void
  }
  selected: boolean
}

export function IntelligentWorkflowNode({ data, selected }: IntelligentWorkflowNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Auto-show suggestions when selected
  useEffect(() => {
    setShowSuggestions(selected && !!data.suggestions?.length)
  }, [selected, data.suggestions])

  // Stable hover handlers to prevent glitchy behavior
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setShowPreview(false) // Reset preview on mouse leave
  }

  const getNodeIcon = () => {
    switch (data.type) {
      case 'request': return <MessageSquare className="w-5 h-5" />
      case 'transform': return <RefreshCw className="w-5 h-5" />
      case 'condition': return <Target className="w-5 h-5" />
      case 'response': return <CheckCircle className="w-5 h-5" />
      case 'ai-assistant': return <Brain className="w-5 h-5" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  const getNodeColor = () => {
    switch (data.type) {
      case 'request': return 'hsl(var(--primary))'
      case 'transform': return '#10b981'
      case 'condition': return '#f59e0b'
      case 'response': return '#059669'
      case 'ai-assistant': return '#8b5cf6'
      default: return 'hsl(var(--muted-foreground))'
    }
  }

  const getStatusColor = () => {
    switch (data.status) {
      case 'success': return 'border-green-400 bg-green-50'
      case 'error': return 'border-red-400 bg-red-50'
      case 'running': return 'border-blue-400 bg-blue-50'
      case 'warning': return 'border-yellow-400 bg-yellow-50'
      default: return 'border-border bg-card hover:border-primary hover:shadow-lg'
    }
  }

  const handleNodeClick = () => {
    data.onSelect?.(data)
  }

  return (
    <>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 border-2 border-white shadow-lg"
        style={{ 
          background: getNodeColor(),
          left: -8,
          zIndex: 10
        }}
        isConnectable={true}
        id="input"
      />

      {/* Main Node Card */}
      <Card
        className={`w-80 transition-all duration-200 cursor-grab active:cursor-grabbing group ${getStatusColor()}`}
        style={{ 
          transform: selected ? 'scale(1.02)' : 'scale(1)',
          boxShadow: selected ? '0 10px 25px rgba(0, 0, 0, 0.1)' : undefined,
          userSelect: 'none' // Prevent text selection during drag
        }}
        onMouseDown={(e) => {
          // Allow dragging to work properly
          e.stopPropagation()
        }}
        onClick={(e) => {
          // Only handle click if not dragging
          e.stopPropagation()
          handleNodeClick()
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header with AI insights */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl text-white shadow-sm"
                style={{ backgroundColor: getNodeColor() }}
              >
                {getNodeIcon()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-base leading-tight">{data.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
                
                {/* Status indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={data.status === 'success' ? 'default' : data.status === 'error' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {data.status === 'running' && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                    {data.status}
                  </Badge>
                  
                  {data.analytics && (
                    <Badge variant="outline" className="text-xs">
                      {data.analytics.successRate}% success
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Live Preview Area */}
          {(isHovered || showPreview) && data.preview && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Live Preview</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs nodrag"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPreview(!showPreview)
                  }}
                >
                  {showPreview ? 'Hide' : 'Expand'}
                </Button>
              </div>
              <div className="bg-background rounded-lg px-3 py-2 text-xs font-mono max-h-20 overflow-y-auto">
                {typeof data.preview === 'string' 
                  ? data.preview 
                  : JSON.stringify(data.preview, null, 2)
                }
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          {data.analytics && isHovered && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Performance</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="font-bold text-green-600">{data.analytics.successRate}%</div>
                  <div className="text-muted-foreground">Success</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{data.analytics.avgResponseTime}ms</div>
                  <div className="text-muted-foreground">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{data.analytics.usage}</div>
                  <div className="text-muted-foreground">Uses</div>
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {showSuggestions && data.suggestions && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">AI Suggestions</span>
                <Sparkles className="w-3 h-3 text-purple-400" />
              </div>
              <div className="space-y-1">
                {data.suggestions.slice(0, 2).map((suggestion, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-2 py-1.5 text-xs bg-white/80 hover:bg-white border border-purple-200 hover:border-purple-300 rounded transition-all nodrag"
                    onClick={(e) => {
                      e.stopPropagation()
                      data.onSuggestionClick?.(suggestion)
                    }}
                  >
                    <span className="text-purple-600">💡</span> {suggestion}
                  </button>
                ))}
                {data.suggestions.length > 2 && (
                  <button className="w-full text-center py-1 text-xs text-purple-600 hover:text-purple-700">
                    +{data.suggestions.length - 2} more suggestions
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          {isHovered && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-2 h-8 text-xs nodrag"
                onClick={(e) => {
                  e.stopPropagation()
                  data.onPreview?.(data)
                }}
              >
                <Play className="w-3 h-3" />
                Test
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-2 h-8 text-xs nodrag"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSuggestions(!showSuggestions)
                }}
              >
                <Brain className="w-3 h-3" />
                AI Help
              </Button>
            </div>
          )}
        </CardContent>

        {/* Running animation overlay - smooth gradient sweep */}
        {data.status === 'running' && (
          <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
            {/* Base subtle background */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-lg" />
            {/* Animated sweep effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent rounded-lg"
              style={{
                animation: 'sweep 2s ease-in-out infinite',
                transform: 'translateX(-100%)'
              }}
            />
          </div>
        )}
      </Card>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 border-2 border-white shadow-lg"
        style={{ 
          background: getNodeColor(),
          right: -8,
          zIndex: 10
        }}
        isConnectable={true}
        id="output"
      />
    </>
  )
}
