'use client'

import React, { useState, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Zap,
  Settings,
  MoreVertical,
  Copy,
  Trash2,
  Shield,
  Server,
  Code2,
  TrendingUp,
  Database,
  Key,
  ChevronRight,
  Cpu,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdvancedCanvasNode } from '../AdvancedCanvasContext'

interface AdvancedNodeProps {
  data: {
    node: AdvancedCanvasNode
    isSelected?: boolean
    onSelect?: (node: AdvancedCanvasNode) => void
    onUpdate?: (node: AdvancedCanvasNode) => void
    onDelete?: (nodeId: string) => void
    onDuplicate?: (nodeId: string) => void
  }
  selected?: boolean
}

// Status icon mapping
const statusIcons = {
  idle: <Clock className="w-4 h-4 text-gray-500" />,
  running: <Play className="w-4 h-4 text-blue-500 animate-pulse" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  paused: <Pause className="w-4 h-4 text-gray-500" />
}

// Status colors for border
const statusBorderColors = {
  idle: 'border-gray-300',
  running: 'border-blue-400 shadow-blue-200',
  success: 'border-green-400 shadow-green-200', 
  error: 'border-red-400 shadow-red-200',
  warning: 'border-yellow-400 shadow-yellow-200',
  paused: 'border-gray-400'
}

// Shadow levels
const shadowLevels = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl'
}

export const AdvancedNode = ({ data, selected }: AdvancedNodeProps) => {
  const { node, onSelect, onUpdate, onDelete, onDuplicate } = data
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(node.isAnimating || false)
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({})

  // Handle pulse animation for execution
  useEffect(() => {
    if (node.pulseOnExecution && node.status === 'running') {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [node.status, node.pulseOnExecution])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(node)
  }

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'duplicate':
        onDuplicate?.(node.id)
        break
      case 'delete':
        onDelete?.(node.id)
        break
      case 'settings':
        onSelect?.(node)
        break
    }
  }

  const toggleLayer = (layer: string) => {
    setExpandedLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  return (
    <div 
      className={`
        relative min-w-[320px] bg-white rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200 ease-out
        border border-gray-200
        shadow-sm hover:shadow-lg
        ${selected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        ${isHovered ? 'transform scale-[1.01] shadow-xl' : ''}
        ${isAnimating ? 'animate-pulse' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ width: node.size?.width || 360, minHeight: node.size?.height || 'auto' }}
    >
      {/* Input Handles */}
      {node.inputs?.map((input, index) => (
        <Handle
          key={`input-${input.id || index}`}
          type="target"
          position={Position.Left}
          id={input.id || `input-${index}`}
          style={{ 
            top: `${30 + index * 15}px`,
            background: input.required ? '#ef4444' : '#6b7280',
            border: '2px solid white',
            width: '12px',
            height: '12px'
          }}
          className="transition-all duration-200 hover:scale-125"
        />
      ))}

      {/* Output Handles */}
      {node.outputs?.map((output, index) => (
        <Handle
          key={`output-${output.id || index}`}
          type="source" 
          position={Position.Right}
          id={output.id || `output-${index}`}
          style={{ 
            top: `${30 + index * 15}px`,
            background: '#10b981',
            border: '2px solid white',
            width: '12px',
            height: '12px'
          }}
          className="transition-all duration-200 hover:scale-125"
        />
      ))}

      {/* Enterprise Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {statusIcons[node.status]}
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {node.metadata?.title || node.type}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                  {node.metadata?.category || 'API Node'}
                </Badge>
                {node.badge && (
                  <Badge className="bg-yellow-400/90 text-yellow-900 border-0 text-xs">
                    {node.badge.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleMenuAction('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('duplicate')}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleMenuAction('delete')} 
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              node.status === 'success' ? 'bg-green-500' :
              node.status === 'error' ? 'bg-red-500' :
              node.status === 'running' ? 'bg-blue-500 animate-pulse' :
              'bg-gray-400'
            }`} />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              {node.status || 'Ready'}
            </span>
          </div>
          {node.executionTime && (
            <span className="text-xs text-gray-500">
              {node.executionTime}ms
            </span>
          )}
        </div>
      </div>

      {/* Enterprise Layers */}
      <div className="p-4 space-y-2">
        {/* Data Layer */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleLayer('data')}
            className="flex items-center justify-between w-full p-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">Data Layer</div>
                <div className="text-xs text-gray-500">
                  {node.dataLayer?.sources?.length || 0} sources • {node.dataLayer?.inputFormat || 'JSON'}
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedLayers['data'] ? 'rotate-90' : ''
            }`} />
          </button>
          {expandedLayers['data'] && (
            <div className="px-3 pb-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Input Format</div>
                  <div className="font-medium text-sm text-gray-900">{node.dataLayer?.inputFormat || 'JSON'}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Output Format</div>
                  <div className="font-medium text-sm text-gray-900">{node.dataLayer?.outputFormat || 'JSON'}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Validation</div>
                  <div className="font-medium text-sm text-gray-900">
                    {node.dataLayer?.schemaValidation ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Caching</div>
                  <div className="font-medium text-sm text-gray-900">
                    {node.dataLayer?.caching?.enabled ? 'Active' : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Business Logic Layer */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleLayer('logic')}
            className="flex items-center justify-between w-full p-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">Business Logic</div>
                <div className="text-xs text-gray-500">
                  {node.logicLayer?.aiEnabled ? 'AI-Enhanced' : 'Standard'} • {node.logicLayer?.processingType || 'Sync'}
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedLayers['logic'] ? 'rotate-90' : ''
            }`} />
          </button>
          {expandedLayers['logic'] && (
            <div className="px-3 pb-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">AI Model</div>
                  <div className="font-medium text-sm text-gray-900">{node.logicLayer?.aiModel || 'GPT-4'}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Processing</div>
                  <div className="font-medium text-sm text-gray-900">{node.logicLayer?.processingType || 'Sync'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Layer */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleLayer('security')}
            className="flex items-center justify-between w-full p-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Lock className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">Security</div>
                <div className="text-xs text-gray-500">
                  {node.securityLayer?.authType || 'OAuth2'} • {node.securityLayer?.encryption || 'AES-256'}
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedLayers['security'] ? 'rotate-90' : ''
            }`} />
          </button>
          {expandedLayers['security'] && (
            <div className="px-3 pb-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Auth Type</div>
                  <div className="font-medium text-sm text-gray-900">{node.securityLayer?.authType || 'OAuth2'}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Encryption</div>
                  <div className="font-medium text-sm text-gray-900">{node.securityLayer?.encryption || 'AES-256'}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Rate Limit</div>
                  <div className="font-medium text-sm text-gray-900">{node.securityLayer?.rateLimit || '1000/min'}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Access Token</div>
                  <div className="font-medium text-sm text-gray-900">
                    {node.securityLayer?.accessToken ? '••••••' : 'Not Set'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scalability Layer */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleLayer('scalability')}
            className="flex items-center justify-between w-full p-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">Scalability</div>
                <div className="text-xs text-gray-500">
                  {node.scalabilityLayer?.maxRequests || '1000'} req/min • {node.scalabilityLayer?.maxInstances || '10'} max
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedLayers['scalability'] ? 'rotate-90' : ''
            }`} />
          </button>
          {expandedLayers['scalability'] && (
            <div className="px-3 pb-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Current Load</div>
                  <div className="font-medium text-sm text-gray-900">{node.scalabilityLayer?.currentRequests || 0} req</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Expected</div>
                  <div className="font-medium text-sm text-gray-900">{node.scalabilityLayer?.expectedRequests || 100} req</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Instances</div>
                  <div className="font-medium text-sm text-gray-900">
                    {node.scalabilityLayer?.minInstances || 1}-{node.scalabilityLayer?.maxInstances || 10}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Active Hours</div>
                  <div className="font-medium text-sm text-gray-900">{node.scalabilityLayer?.activeHours || '24/7'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}