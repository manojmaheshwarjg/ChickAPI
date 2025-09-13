'use client'

import React, { useState } from 'react'
import {
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
  Edge,
  EdgeProps
} from 'reactflow'
import { Button } from '@/components/ui'
import { XMarkIcon } from '@heroicons/react/24/outline'

export interface WorkflowEdgeData {
  label?: string
  onDelete?: (edgeId: string) => void
  animated?: boolean
  status?: 'idle' | 'active' | 'success' | 'error'
  flowSpeed?: number
}

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps<WorkflowEdgeData>) {
  const { setEdges } = useReactFlow()
  const [isHovered, setIsHovered] = useState(false)

  // Generate bezier path for smooth curves
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDelete = () => {
    if (data?.onDelete) {
      data.onDelete(id)
    } else {
      // Default delete behavior
      setEdges((edges) => edges.filter((edge) => edge.id !== id))
    }
  }

  // Get edge colors based on status
  const getEdgeColors = () => {
    switch (data?.status) {
      case 'active':
        return {
          main: '#3b82f6', // blue-500
          animated: '#60a5fa' // blue-400
        }
      case 'success':
        return {
          main: '#10b981', // emerald-500
          animated: '#34d399' // emerald-400
        }
      case 'error':
        return {
          main: '#ef4444', // red-500
          animated: '#f87171' // red-400
        }
      default:
        return {
          main: isHovered ? '#6366f1' : '#9ca3af', // indigo-500 : gray-400
          animated: '#a5b4fc' // indigo-300
        }
    }
  }

  const colors = getEdgeColors()
  const isAnimated = data?.animated || data?.status === 'active'
  const flowSpeed = data?.flowSpeed || 2
  
  // Create a unique key based on path to restart animations when path changes
  const pathKey = edgePath.slice(0, 50) // Use first 50 chars of path as key

  return (
    <>
      {/* Main edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={colors.main}
        strokeWidth="2"
        markerEnd={markerEnd}
        className="react-flow__edge-path transition-all duration-300 ease-in-out"
        style={{
          ...style,
          strokeDasharray: isAnimated ? '8 4' : 'none',
          animation: isAnimated ? `flowAnimation ${flowSpeed}s linear infinite` : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Animated flow particles */}
      {isAnimated && (
        <>
          {/* Flow particles - key includes pathKey to restart animation on path change */}
          {[0, 0.33, 0.66].map((delay, index) => (
            <circle
              key={`particle-${index}-${pathKey}`}
              r="3"
              fill={colors.animated}
              className="pointer-events-none"
              style={{
                opacity: 0.8,
              }}
            >
              <animateMotion
                dur={`${flowSpeed}s`}
                repeatCount="indefinite"
                begin={`${delay * flowSpeed}s`}
                path={edgePath}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${flowSpeed}s`}
                repeatCount="indefinite"
                begin={`${delay * flowSpeed}s`}
              />
            </circle>
          ))}
        </>
      )}

      {/* Data pulse effect for active connections */}
      {data?.status === 'active' && (
        <path
          key={`pulse-${pathKey}`}
          d={edgePath}
          fill="none"
          stroke={colors.animated}
          strokeWidth="3"
          opacity="0.6"
          className="pointer-events-none"
          style={{
            animation: 'pulseFlow 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Edge label with delete button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className={`flex items-center gap-1 bg-white border rounded-md shadow-sm px-2 py-1 transition-all duration-200 ${
            isHovered ? 'border-indigo-300 shadow-md' : 'border-gray-200'
          }`}>
            {data?.label && (
              <span className={`text-xs transition-colors ${
                isHovered ? 'text-indigo-700' : 'text-gray-600'
              }`}>
                {data.label}
              </span>
            )}
            
            {/* Status indicator */}
            {data?.status && data.status !== 'idle' && (
              <div className={`w-2 h-2 rounded-full ${
                data.status === 'active' ? 'bg-blue-500 animate-pulse' :
                data.status === 'success' ? 'bg-green-500' :
                data.status === 'error' ? 'bg-red-500 animate-pulse' :
                'bg-gray-400'
              }`} />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-4 w-4 p-0 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete connection"
            >
              <XMarkIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </EdgeLabelRenderer>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes flowAnimation {
          0% { stroke-dashoffset: 12; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes pulseFlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  )
}

// Define the custom edge type for React Flow
export const workflowEdgeTypes = {
  workflow: WorkflowEdge
}
