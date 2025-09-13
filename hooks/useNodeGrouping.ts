'use client'

import { useCallback, useState } from 'react'
import { BaseNode, NodeConnection } from '@/lib/types'
import { GroupNode, NodeSelection, GroupingOperation, GroupPort } from '@/lib/grouping-types'

export interface UseNodeGroupingOptions {
  nodes: BaseNode[]
  connections: NodeConnection[]
  onNodesChange: (nodes: BaseNode[]) => void
  onConnectionsChange: (connections: NodeConnection[]) => void
}

export function useNodeGrouping({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange
}: UseNodeGroupingOptions) {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [groupOperationHistory, setGroupOperationHistory] = useState<GroupingOperation[]>([])

  // Calculate selection bounds
  const calculateSelectionBounds = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return null

    const selectedNodes = nodes.filter(node => nodeIds.includes(node.id))
    if (selectedNodes.length === 0) return null

    const minX = Math.min(...selectedNodes.map(node => node.position.x))
    const minY = Math.min(...selectedNodes.map(node => node.position.y))
    const maxX = Math.max(...selectedNodes.map(node => node.position.x + node.size.width))
    const maxY = Math.max(...selectedNodes.map(node => node.position.y + node.size.height))

    return {
      x: minX - 20, // Add padding
      y: minY - 20,
      width: maxX - minX + 40,
      height: maxY - minY + 40
    }
  }, [nodes])

  // Create a group from selected nodes
  const createGroup = useCallback((
    nodeIds: string[],
    groupConfig?: Partial<GroupNode['groupConfig']>
  ): GroupNode | null => {
    if (nodeIds.length === 0) return null

    const bounds = calculateSelectionBounds(nodeIds)
    if (!bounds) return null

    const groupId = `group_${Date.now()}`
    
    // Find external connections (connections that cross group boundaries)
    const externalConnections = connections.filter(conn => {
      const sourceInGroup = nodeIds.includes(conn.sourceNodeId)
      const targetInGroup = nodeIds.includes(conn.targetNodeId)
      return sourceInGroup !== targetInGroup // One inside, one outside
    })

    // Create group input ports for connections coming into the group
    const groupInputs: GroupPort[] = externalConnections
      .filter(conn => !nodeIds.includes(conn.sourceNodeId) && nodeIds.includes(conn.targetNodeId))
      .map((conn, index) => ({
        id: `input_${index}`,
        name: `Input ${index + 1}`,
        type: conn.type,
        required: false,
        connectedNodeId: conn.targetNodeId,
        connectedPortId: conn.targetPortId,
        position: { x: 0, y: 40 + (index * 25) },
        isInput: true
      }))

    // Create group output ports for connections going out of the group
    const groupOutputs: GroupPort[] = externalConnections
      .filter(conn => nodeIds.includes(conn.sourceNodeId) && !nodeIds.includes(conn.targetNodeId))
      .map((conn, index) => ({
        id: `output_${index}`,
        name: `Output ${index + 1}`,
        type: conn.type,
        required: false,
        connectedNodeId: conn.sourceNodeId,
        connectedPortId: conn.sourcePortId,
        position: { x: bounds.width, y: 40 + (index * 25) },
        isInput: false
      }))

    const groupNode: GroupNode = {
      id: groupId,
      type: 'group',
      position: { x: bounds.x, y: bounds.y },
      size: { width: bounds.width, height: bounds.height },
      inputs: groupInputs,
      outputs: groupOutputs,
      config: {},
      metadata: {
        title: `Group ${groupId.split('_')[1]}`,
        description: `Group containing ${nodeIds.length} nodes`,
        category: 'UTILITY' as any,
        color: '#6b7280',
        version: '1.0.0'
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      status: 'idle' as any,
      groupConfig: {
        isCollapsed: false,
        backgroundColor: '#f9fafb',
        borderColor: '#d1d5db',
        cornerRadius: 8,
        padding: 20,
        label: groupConfig?.label || `Group ${groupId.split('_')[1]}`,
        labelColor: '#374151',
        allowNesting: true,
        ...groupConfig
      },
      childNodes: nodeIds,
      groupInputs,
      groupOutputs
    }

    // Record the operation
    const operation: GroupingOperation = {
      type: 'create_group',
      groupId,
      nodeIds,
      groupConfig: groupNode.groupConfig
    }
    setGroupOperationHistory(prev => [...prev, operation])

    return groupNode
  }, [nodes, connections, calculateSelectionBounds])

  // Ungroup a group node
  const ungroupNodes = useCallback((groupId: string) => {
    const groupNode = nodes.find(node => node.id === groupId) as GroupNode
    if (!groupNode || groupNode.type !== 'group') return

    // Remove the group node
    const updatedNodes = nodes.filter(node => node.id !== groupId)
    
    // Restore external connections
    const newConnections = [...connections]
    
    // Convert group input ports back to direct connections
    groupNode.groupInputs.forEach(groupPort => {
      const originalConnections = connections.filter(conn => 
        conn.targetNodeId === groupPort.connectedNodeId &&
        conn.targetPortId === groupPort.connectedPortId
      )
      
      // Find external connections that were connecting to this group port
      const groupConnections = connections.filter(conn => 
        conn.targetNodeId === groupId &&
        conn.targetPortId === groupPort.id
      )
      
      // Restore the direct connections
      groupConnections.forEach(groupConn => {
        if (groupPort.connectedNodeId && groupPort.connectedPortId) {
          const restoredConnection: NodeConnection = {
            id: `conn_${Date.now()}_${Math.random()}`,
            sourceNodeId: groupConn.sourceNodeId,
            sourcePortId: groupConn.sourcePortId,
            targetNodeId: groupPort.connectedNodeId,
            targetPortId: groupPort.connectedPortId,
            type: groupConn.type
          }
          newConnections.push(restoredConnection)
        }
      })
    })

    // Similar process for group outputs
    groupNode.groupOutputs.forEach(groupPort => {
      const groupConnections = connections.filter(conn => 
        conn.sourceNodeId === groupId &&
        conn.sourcePortId === groupPort.id
      )
      
      groupConnections.forEach(groupConn => {
        if (groupPort.connectedNodeId && groupPort.connectedPortId) {
          const restoredConnection: NodeConnection = {
            id: `conn_${Date.now()}_${Math.random()}`,
            sourceNodeId: groupPort.connectedNodeId,
            sourcePortId: groupPort.connectedPortId,
            targetNodeId: groupConn.targetNodeId,
            targetPortId: groupConn.targetPortId,
            type: groupConn.type
          }
          newConnections.push(restoredConnection)
        }
      })
    })

    // Remove group-related connections
    const finalConnections = newConnections.filter(conn => 
      conn.sourceNodeId !== groupId && conn.targetNodeId !== groupId
    )

    const operation: GroupingOperation = {
      type: 'ungroup',
      groupId,
      nodeIds: groupNode.childNodes
    }
    setGroupOperationHistory(prev => [...prev, operation])

    onNodesChange(updatedNodes)
    onConnectionsChange(finalConnections)
  }, [nodes, connections, onNodesChange, onConnectionsChange])

  // Toggle group collapse state
  const toggleGroupCollapse = useCallback((groupId: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === groupId && node.type === 'group') {
        const groupNode = node as GroupNode
        return {
          ...groupNode,
          groupConfig: {
            ...groupNode.groupConfig,
            isCollapsed: !groupNode.groupConfig.isCollapsed
          }
        }
      }
      return node
    })
    onNodesChange(updatedNodes)
  }, [nodes, onNodesChange])

  // Add nodes to existing group
  const addNodesToGroup = useCallback((groupId: string, nodeIds: string[]) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === groupId && node.type === 'group') {
        const groupNode = node as GroupNode
        const newChildNodes = [...groupNode.childNodes, ...nodeIds]
        return {
          ...groupNode,
          childNodes: newChildNodes
        }
      }
      return node
    })

    const operation: GroupingOperation = {
      type: 'add_to_group',
      groupId,
      nodeIds
    }
    setGroupOperationHistory(prev => [...prev, operation])

    onNodesChange(updatedNodes)
  }, [nodes, onNodesChange])

  // Remove nodes from group
  const removeNodesFromGroup = useCallback((groupId: string, nodeIds: string[]) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === groupId && node.type === 'group') {
        const groupNode = node as GroupNode
        const newChildNodes = groupNode.childNodes.filter(id => !nodeIds.includes(id))
        return {
          ...groupNode,
          childNodes: newChildNodes
        }
      }
      return node
    })

    const operation: GroupingOperation = {
      type: 'remove_from_group',
      groupId,
      nodeIds
    }
    setGroupOperationHistory(prev => [...prev, operation])

    onNodesChange(updatedNodes)
  }, [nodes, onNodesChange])

  // Get all nodes that are part of groups
  const getGroupedNodes = useCallback(() => {
    const groupNodes = nodes.filter(node => node.type === 'group') as GroupNode[]
    const groupedNodeIds = new Set<string>()
    
    groupNodes.forEach(group => {
      group.childNodes.forEach(nodeId => groupedNodeIds.add(nodeId))
    })
    
    return Array.from(groupedNodeIds)
  }, [nodes])

  // Check if nodes can be grouped (not already in a group)
  const canGroupNodes = useCallback((nodeIds: string[]) => {
    const groupedNodes = getGroupedNodes()
    return nodeIds.every(nodeId => !groupedNodes.includes(nodeId))
  }, [getGroupedNodes])

  return {
    selectedNodes,
    setSelectedNodes,
    createGroup,
    ungroupNodes,
    toggleGroupCollapse,
    addNodesToGroup,
    removeNodesFromGroup,
    calculateSelectionBounds,
    getGroupedNodes,
    canGroupNodes,
    groupOperationHistory
  }
}
