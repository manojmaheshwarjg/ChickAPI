'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import PropertiesPanel from '@/components/PropertiesPanel'
import Console from '@/components/Console'
import Toolbar from '@/components/Toolbar'

// Dynamically import the canvas to avoid SSR issues
const WorkflowCanvas = dynamic(() => import('@/components/WorkflowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="spinner w-8 h-8 mb-4"></div>
        <p className="text-gray-600">Loading canvas...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [workflow, setWorkflow] = useState({
    id: 'new-workflow',
    name: 'Untitled Workflow',
    nodes: [],
    connections: [],
  })

  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node)
    if (!propertiesOpen) {
      setPropertiesOpen(true)
    }
  }, [propertiesOpen])

  const handleNodeAdd = useCallback((nodeType: string, position: { x: number; y: number }) => {
    // Add node to workflow
    console.log('Adding node:', nodeType, position)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header workflowName={workflow.name} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <Sidebar onNodeDragStart={(nodeType) => console.log('Dragging:', nodeType)} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Toolbar 
            onRun={() => console.log('Run workflow')}
            onStop={() => console.log('Stop workflow')}
            onSave={() => console.log('Save workflow')}
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
          />

          {/* Canvas and Console */}
          <div className="flex-1 flex flex-col relative">
            <div className={`flex-1 ${consoleOpen ? 'mb-48' : ''}`}>
              <WorkflowCanvas
                workflow={workflow}
                onNodeSelect={handleNodeSelect}
                onNodeAdd={handleNodeAdd}
              />
            </div>

            {/* Console */}
            {consoleOpen && (
              <div className="absolute bottom-0 left-0 right-0 h-48 border-t border-gray-200 bg-white">
                <Console onClose={() => setConsoleOpen(false)} />
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className={`${propertiesOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <PropertiesPanel 
            node={selectedNode} 
            onClose={() => setPropertiesOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
