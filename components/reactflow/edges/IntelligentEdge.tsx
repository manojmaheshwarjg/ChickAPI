'use client'

import React, { useState } from 'react'
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  useReactFlow,
  EdgeProps
} from 'reactflow'
import { X, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface IntelligentEdgeData {
  label?: string
  status?: 'idle' | 'active' | 'success' | 'error' | 'warning'
  animated?: boolean
  onDelete?: (edgeId: string) => void
  transferredData?: any
  successRate?: number
  avgResponseTime?: number
}

export interface IntelligentEdgeProps extends EdgeProps {
  data: IntelligentEdgeData
}

export function IntelligentEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}: IntelligentEdgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { setEdges } = useReactFlow()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const onEdgeClick = () => {
    data.onDelete?.(id)
  }

  // Get status-based styling
  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: 2,
      stroke: 'hsl(var(--border))',
    }

    switch (data.status) {
      case 'active':
        return {
          ...baseStyle,
          stroke: 'hsl(var(--primary))',
          strokeWidth: 3,
          strokeDasharray: '8 4',
          animation: 'flow 2s linear infinite',
        }
      case 'success':
        return {
          ...baseStyle,
          stroke: '#10b981',
          strokeWidth: 2.5,
        }
      case 'error':
        return {
          ...baseStyle,
          stroke: '#ef4444',
          strokeWidth: 2.5,
          strokeDasharray: '4 4',
          animation: 'pulse 1s ease-in-out infinite',
        }
      case 'warning':
        return {
          ...baseStyle,
          stroke: '#f59e0b',
          strokeWidth: 2.5,
        }
      default:
        return {
          ...baseStyle,
          stroke: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
          strokeWidth: isHovered || selected ? 2.5 : 2,
        }
    }
  }

  // Get status icon
  const getStatusIcon = () => {
    switch (data.status) {
      case 'active':
        return <Clock className="w-3 h-3 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
      default:
        return <Zap className="w-3 h-3 text-muted-foreground" />
    }
  }

  return (
    <>
      {/* Main Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={getEdgeStyle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Animated flow particles for active edges */}
      {data.status === 'active' && (
        <>
          <circle r="3" fill="hsl(var(--primary))" opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
          </circle>
          <circle r="2" fill="white" opacity="1">
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
          </circle>
        </>
      )}

      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Main Label */}
          {(data.label || isHovered || selected) && (
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full shadow-sm transition-all ${
                isHovered || selected ? 'scale-110 shadow-md' : ''
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {getStatusIcon()}
              
              {data.label && (
                <span className="text-xs font-medium text-foreground">
                  {data.label}
                </span>
              )}
              
              {/* Performance badges for hovered/selected edges */}
              {(isHovered || selected) && data.successRate && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {data.successRate}%
                </Badge>
              )}
              
              {(isHovered || selected) && data.avgResponseTime && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {data.avgResponseTime}ms
                </Badge>
              )}

              {/* Delete button */}
              {(isHovered || selected) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                  onClick={onEdgeClick}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* Data preview tooltip for active transfers */}
          {data.status === 'active' && data.transferredData && (isHovered || selected) && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm max-w-48">
              <div className="text-xs font-medium text-blue-700 mb-1">
                Data Transfer
              </div>
              <div className="text-xs font-mono text-blue-600 bg-white rounded px-2 py-1 max-h-16 overflow-y-auto">
                {typeof data.transferredData === 'string' 
                  ? data.transferredData 
                  : JSON.stringify(data.transferredData, null, 2)
                }
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>

      <style jsx>{`
        @keyframes flow {
          0% {
            stroke-dashoffset: 12;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            stroke-width: 2;
          }
          50% {
            opacity: 0.8;
            stroke-width: 3;
          }
        }
      `}</style>
    </>
  )
}

// Edge types for React Flow
export const intelligentEdgeTypes = {
  intelligent: IntelligentEdge,
}
