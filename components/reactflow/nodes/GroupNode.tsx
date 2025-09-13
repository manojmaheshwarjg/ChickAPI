'use client'

import React, { useState, useMemo } from 'react'
import { Handle, Position } from 'reactflow'
import { ChevronDownIcon, ChevronRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { GroupNode as GroupNodeType, GroupPort } from '@/lib/grouping-types'

interface GroupNodeProps {
  data: {
    groupNode: GroupNodeType
    onSelect?: (node: GroupNodeType) => void
    onToggleCollapse?: (nodeId: string) => void
    onGroupUpdate?: (node: GroupNodeType) => void
  }
  selected: boolean
}

export function GroupNode({ data, selected }: GroupNodeProps) {
  const { groupNode, onSelect, onToggleCollapse, onGroupUpdate } = data
  const [isHovered, setIsHovered] = useState(false)

  const groupConfig = groupNode.groupConfig

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(groupNode)
  }

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleCollapse?.(groupNode.id)
  }

  const handleLabelEdit = (newLabel: string) => {
    const updatedNode: GroupNodeType = {
      ...groupNode,
      groupConfig: {
        ...groupConfig,
        label: newLabel
      }
    }
    onGroupUpdate?.(updatedNode)
  }

  // Calculate dynamic size based on content and collapse state
  const nodeSize = useMemo(() => {
    if (groupConfig.isCollapsed) {
      return { width: 200, height: 60 }
    }
    
    // Calculate size based on child nodes (this would be calculated from actual child positions)
    const minWidth = Math.max(300, groupConfig.label.length * 8 + 100)
    const minHeight = Math.max(150, groupNode.childNodes.length * 30 + 100)
    
    return { width: minWidth, height: minHeight }
  }, [groupConfig.isCollapsed, groupConfig.label, groupNode.childNodes])

  // Render group input/output ports
  const renderGroupPorts = (ports: GroupPort[], isInput: boolean) => {
    return ports.map((port, index) => {
      const position = isInput ? Position.Left : Position.Right
      const top = 40 + (index * 25)
      
      return (
        <Handle
          key={port.id}
          type={isInput ? 'target' : 'source'}
          position={position}
          id={port.id}
          style={{
            top: `${top}px`,
            width: '14px',
            height: '14px',
            backgroundColor: isInput ? '#f59e0b' : '#10b981',
            borderColor: '#374151',
            borderWidth: '2px',
            borderRadius: '3px'
          }}
          title={`${port.name} (${port.type})`}
        />
      )
    })
  }

  return (
    <div
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${isHovered ? 'shadow-xl' : ''}
      `}
      style={{
        width: `${nodeSize.width}px`,
        height: `${nodeSize.height}px`,
        backgroundColor: groupConfig.backgroundColor || '#ffffff',
        borderColor: groupConfig.borderColor || '#d1d5db',
        borderRadius: `${groupConfig.cornerRadius || 8}px`,
      }}
    >
      {/* Input Handles */}
      {renderGroupPorts(groupNode.groupInputs, true)}

      {/* Output Handles */}
      {renderGroupPorts(groupNode.groupOutputs, false)}

      {/* Group Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* Collapse/Expand Button */}
          <button
            onClick={handleToggleCollapse}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={groupConfig.isCollapsed ? 'Expand Group' : 'Collapse Group'}
          >
            {groupConfig.isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Group Icon */}
          <Squares2X2Icon className="w-5 h-5 text-gray-600" />

          {/* Group Label */}
          <input
            type="text"
            value={groupConfig.label}
            onChange={(e) => handleLabelEdit(e.target.value)}
            className="font-medium text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-1"
            style={{ color: groupConfig.labelColor || '#1f2937' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Child Node Count Badge */}
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {groupNode.childNodes.length} nodes
        </span>
      </div>

      {/* Group Body */}
      {!groupConfig.isCollapsed && (
        <div className="p-3">
          {groupNode.subWorkflow ? (
            // Sub-workflow summary
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">{groupNode.subWorkflow.name}</p>
              <p className="text-xs">
                {groupNode.subWorkflow.nodes.length} internal nodes
              </p>
              <p className="text-xs">
                {groupNode.subWorkflow.connections.length} connections
              </p>
            </div>
          ) : (
            // Simple group content
            <div className="text-sm text-gray-600">
              <p className="mb-2">Contains {groupNode.childNodes.length} nodes:</p>
              <div className="flex flex-wrap gap-1">
                {groupNode.childNodes.slice(0, 6).map((nodeId) => (
                  <span 
                    key={nodeId}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {nodeId.slice(0, 8)}...
                  </span>
                ))}
                {groupNode.childNodes.length > 6 && (
                  <span className="text-xs text-gray-500">
                    +{groupNode.childNodes.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Port Mappings Info */}
          {(groupNode.groupInputs.length > 0 || groupNode.groupOutputs.length > 0) && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{groupNode.groupInputs.length} inputs</span>
                <span>{groupNode.groupOutputs.length} outputs</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Group Status Indicator */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
        groupNode.status === 'running' ? 'bg-blue-500 animate-pulse' :
        groupNode.status === 'success' ? 'bg-green-500' :
        groupNode.status === 'error' ? 'bg-red-500' :
        groupNode.status === 'warning' ? 'bg-yellow-500' :
        'bg-gray-300'
      }`} />

      {/* Resize Handle for collapsed state */}
      {groupConfig.isCollapsed && (
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-gray-400 opacity-50"></div>
      )}
    </div>
  )
}
