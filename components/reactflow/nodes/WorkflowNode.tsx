'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { BaseNode } from '@/lib/types'

interface WorkflowNodeProps {
  data: {
    node: BaseNode
    onSelect?: (node: BaseNode) => void
  }
  selected: boolean
}

export function WorkflowNode({ data, selected }: WorkflowNodeProps) {
  const { node, onSelect } = data

  const getNodeColor = () => {
    switch (node.type) {
      case 'http-get':
      case 'http-post':
      case 'http-put':
      case 'http-delete':
        return 'bg-blue-500'
      case 'json-path':
      case 'mapper':
      case 'filter':
        return 'bg-green-500'
      case 'condition':
      case 'loop':
      case 'parallel':
        return 'bg-purple-500'
      case 'assert':
      case 'test-case':
        return 'bg-orange-500'
      case 'variable':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getNodeIcon = () => {
    switch (node.type) {
      case 'http-get': return 'GET'
      case 'http-post': return 'POST'
      case 'http-put': return 'PUT'
      case 'http-delete': return 'DEL'
      case 'json-path': return '{ }'
      case 'condition': return 'IF'
      case 'loop': return '↻'
      case 'assert': return '✓'
      case 'variable': return 'VAR'
      default: return '?'
    }
  }

  const getStatusColor = () => {
    switch (node.status) {
      case 'running': return 'border-blue-500 bg-blue-50/50'
      case 'success': return 'border-green-500'
      case 'error': return 'border-red-500'
      case 'warning': return 'border-yellow-500'
      default: return 'border-gray-300'
    }
  }

  const handleNodeClick = () => {
    onSelect?.(node)
  }

  return (
    <div
      onClick={handleNodeClick}
      className={`bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer min-w-[200px] ${
        selected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${getStatusColor()}`}
    >
      {/* Input Handles */}
      {node.inputs?.map((port, index) => (
        <Handle
          key={port.id}
          type="target"
          position={Position.Left}
          id={port.id}
          style={{
            top: `${30 + (index * 20)}px`,
            width: '12px',
            height: '12px',
            backgroundColor: port.required ? '#f59e0b' : '#6b7280',
            borderColor: '#374151',
            borderWidth: '2px'
          }}
          title={port.name}
        />
      ))}

      {/* Output Handles */}
      {node.outputs?.map((port, index) => (
        <Handle
          key={port.id}
          type="source"
          position={Position.Right}
          id={port.id}
          style={{
            top: `${30 + (index * 20)}px`,
            width: '12px',
            height: '12px',
            backgroundColor: '#10b981',
            borderColor: '#374151',
            borderWidth: '2px'
          }}
          title={port.name}
        />
      ))}

      {/* Node Header */}
      <div className={`px-3 py-2 rounded-t-md ${getNodeColor()} text-white`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold">{getNodeIcon()}</span>
          <span className="text-xs truncate flex-1 mx-2">
            {node.metadata?.title || node.type}
          </span>
          {node.status === 'running' && (
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          )}
        </div>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2 min-h-[50px]">
        {node.metadata?.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {node.metadata.description}
          </p>
        )}
        
        {/* Display key config values */}
        {node.config?.url && (
          <p className="text-xs text-gray-500 truncate">
            URL: {node.config.url}
          </p>
        )}
        {node.config?.path && (
          <p className="text-xs text-gray-500 truncate">
            Path: {node.config.path}
          </p>
        )}
        {node.config?.name && (
          <p className="text-xs text-gray-500 truncate">
            {node.config.name}: {node.config.value}
          </p>
        )}
      </div>

      {/* Execution Info Badge */}
      {node.executionTime && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
            {node.executionTime}ms
          </span>
        </div>
      )}
    </div>
  )
}
