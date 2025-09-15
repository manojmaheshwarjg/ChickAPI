'use client'

import React, { useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  MarkerType
} from 'reactflow'
import { X, Zap, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdvancedCanvasConnection } from '../AdvancedCanvasContext'

interface AdvancedBezierEdgeData {
  label?: string
  animated?: boolean
  gradient?: { from: string; to: string }
  strokeWidth?: number
  onDelete?: (id: string) => void
  status?: 'idle' | 'active' | 'success' | 'error'
  flowSpeed?: number
  labelBgColor?: string
  labelTextColor?: string
}

export interface AdvancedBezierEdgeProps extends EdgeProps<AdvancedBezierEdgeData> {}

// Generate unique IDs for gradients
let gradientIdCounter = 0

export const AdvancedBezierEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected
}: AdvancedBezierEdgeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [gradientId] = useState(() => `gradient-${++gradientIdCounter}`)

  const {
    label,
    animated = false,
    gradient,
    strokeWidth = 2,
    onDelete,
    status = 'idle',
    flowSpeed = 2,
    labelBgColor = '#ffffff',
    labelTextColor = '#374151'
  } = data || {}

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  // Enterprise status-based styling
  const statusStyles = {
    idle: {
      stroke: '#94a3b8',
      strokeOpacity: 0.8,
      strokeDasharray: 'none'
    },
    active: {
      stroke: '#2563eb',
      strokeOpacity: 1,
      strokeDasharray: 'none'
    },
    success: {
      stroke: '#16a34a',
      strokeOpacity: 1,
      strokeDasharray: 'none'
    },
    error: {
      stroke: '#dc2626',
      strokeOpacity: 1,
      strokeDasharray: '5,5'
    }
  }

  const currentStyle = statusStyles[status]

  // Enhanced hover and selection styles
  const interactionStyles = {
    strokeWidth: isHovered || selected ? strokeWidth + 1 : strokeWidth,
    strokeOpacity: isHovered || selected ? 1 : currentStyle.strokeOpacity,
    filter: isHovered || selected ? currentStyle.filter : undefined
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const statusIcons = {
    idle: null,
    active: <Zap className="w-3 h-3 text-blue-500" />,
    success: <div className="w-2 h-2 bg-green-500 rounded-full" />,
    error: <X className="w-3 h-3 text-red-500" />
  }

  return (
    <>

      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          ...currentStyle,
          ...interactionStyles,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        markerEnd={MarkerType.ArrowClosed}
        className={`
          transition-all duration-300 cursor-pointer
          ${selected ? 'stroke-blue-500' : ''}
          ${isHovered ? 'stroke-blue-400' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Animated flow particles */}
      {animated && status === 'active' && (
        <g>
          {[0, 1, 2].map((index) => (
            <circle
              key={index}
              r="3"
              fill="#3b82f6"
              className="opacity-80"
            >
              <animateMotion
                dur={`${flowSpeed}s`}
                repeatCount="indefinite"
                begin={`${index * 0.7}s`}
              >
                <mpath href={`#path-${id}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${flowSpeed}s`}
                repeatCount="indefinite"
                begin={`${index * 0.7}s`}
              />
            </circle>
          ))}
          {/* Hidden path for animation */}
          <path id={`path-${id}`} d={edgePath} fill="none" opacity="0" />
        </g>
      )}

      {/* Selection highlight */}
      {selected && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke: '#3b82f6',
            strokeWidth: strokeWidth + 4,
            strokeOpacity: 0.2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }}
        />
      )}

      {/* Enterprise Edge Label */}
      {(label || isHovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              backgroundColor: '#ffffff',
              borderColor: currentStyle.stroke
            }}
            className={`
              absolute pointer-events-auto flex items-center gap-2 px-2 py-1 rounded text-xs font-medium
              border shadow-sm transition-all duration-200 text-gray-700
              ${isHovered || selected ? 'shadow-md' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Status icon */}
            {statusIcons[status]}
            
            {/* Label text */}
            {label && (
              <span className="whitespace-nowrap">
                {label}
              </span>
            )}

            {/* Data type badge */}
            {!label && status === 'idle' && (
              <Badge variant="outline" className="text-xs">
                data
              </Badge>
            )}

            {/* Delete button (on hover/selection) */}
            {(isHovered || selected) && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="w-5 h-5 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

// Edge types configuration
export const advancedEdgeTypes = {
  advanced: AdvancedBezierEdge,
  default: AdvancedBezierEdge
}