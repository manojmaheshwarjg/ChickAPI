'use client'

import React, { useState } from 'react'
import ReactFlowCanvas from './ReactFlowCanvas'
import { BaseNode, NodeConnection, NodeStatus } from '@/lib/types'

// Sample workflow data for testing
const sampleWorkflow = {
  id: 'demo-workflow',
  name: 'React Flow Demo',
  nodes: [
    {
      id: 'http-node',
      type: 'http-get',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      status: 'success' as NodeStatus,
      metadata: {
        title: 'Fetch Users',
        description: 'Get list of users from API',
        category: 'HTTP',
        color: '#3b82f6',
        version: '1.0.0'
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      config: {
        url: 'https://jsonplaceholder.typicode.com/users',
        method: 'GET'
      },
      inputs: [],
      outputs: [
        {
          id: 'response',
          name: 'Response',
          type: 'http_response',
          required: false
        }
      ],
      executionTime: 145
    },
    {
      id: 'json-node',
      type: 'json-path',
      position: { x: 400, y: 100 },
      size: { width: 200, height: 100 },
      status: 'idle' as NodeStatus,
      metadata: {
        title: 'Extract Names',
        description: 'Extract user names from response',
        category: 'Data Transform',
        color: '#10b981',
        version: '1.0.0'
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      config: {
        path: '$[*].name'
      },
      inputs: [
        {
          id: 'data',
          name: 'Data',
          type: 'object',
          required: true
        }
      ],
      outputs: [
        {
          id: 'result',
          name: 'Result',
          type: 'array',
          required: false
        }
      ]
    },
    {
      id: 'condition-node',
      type: 'condition',
      position: { x: 700, y: 100 },
      size: { width: 200, height: 100 },
      status: 'warning' as NodeStatus,
      metadata: {
        title: 'Check Count',
        description: 'Verify we have users',
        category: 'Control Flow',
        color: '#8b5cf6',
        version: '1.0.0'
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      config: {
        operator: 'greater_than',
        value: '0'
      },
      inputs: [
        {
          id: 'input',
          name: 'Input',
          type: 'array',
          required: true
        }
      ],
      outputs: [
        {
          id: 'true',
          name: 'True',
          type: 'boolean',
          required: false
        },
        {
          id: 'false',
          name: 'False', 
          type: 'boolean',
          required: false
        }
      ]
    }
  ] as BaseNode[],
  connections: [
    {
      id: 'conn-1',
      sourceNodeId: 'http-node',
      sourcePortId: 'response',
      targetNodeId: 'json-node',
      targetPortId: 'data',
      type: 'object' as any
    },
    {
      id: 'conn-2',
      sourceNodeId: 'json-node',
      sourcePortId: 'result',
      targetNodeId: 'condition-node',
      targetPortId: 'input',
      type: 'array' as any
    }
  ] as NodeConnection[]
}

export default function ReactFlowDemo() {
  const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null)
  const [workflow, setWorkflow] = useState(sampleWorkflow)

  const handleNodeSelect = (node: BaseNode | null) => {
    setSelectedNode(node)
  }

  const handleNodeAdd = (nodeType: string, position: { x: number; y: number }) => {
    const newNode: BaseNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      size: { width: 200, height: 100 },
      status: 'idle' as NodeStatus,
      metadata: {
        title: `New ${nodeType}`,
        description: `A new ${nodeType} node`,
        category: 'General',
        color: '#6b7280',
        version: '1.0.0'
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      config: {},
      inputs: [
        {
          id: 'input',
          name: 'Input',
          type: 'any',
          required: false
        }
      ],
      outputs: [
        {
          id: 'output',
          name: 'Output', 
          type: 'any',
          required: false
        }
      ]
    }

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }

  const handleNodeUpdate = (updatedNode: BaseNode) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      )
    }))
  }

  const handleNodeDelete = (nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    }))
  }

  const handleConnectionAdd = (connection: NodeConnection) => {
    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }))
  }

  const handleConnectionDelete = (connectionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }))
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">React Flow Demo</h1>
          <p className="text-sm text-muted-foreground">
            {workflow.nodes.length} nodes, {workflow.connections.length} connections
          </p>
        </div>
        {selectedNode && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{selectedNode.metadata?.title || selectedNode.type}</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlowCanvas
          workflow={workflow}
          onNodeSelect={handleNodeSelect}
          onNodeAdd={handleNodeAdd}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onConnectionAdd={handleConnectionAdd}
          onConnectionDelete={handleConnectionDelete}
        />
      </div>
    </div>
  )
}
