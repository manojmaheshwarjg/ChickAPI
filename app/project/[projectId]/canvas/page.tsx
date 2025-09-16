'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AdvancedCanvasProvider, useAdvancedCanvas } from '@/components/advanced-canvas/AdvancedCanvasContext'
import { AdvancedCanvasLayout } from '@/components/advanced-canvas/AdvancedCanvasLayout'
import Link from 'next/link'

// Mock project data
const mockProjects: Record<string, any> = {
  '1': {
    id: '1',
    name: 'E-commerce API Suite',
    description: 'Complete API workflow for product management, orders, and payments'
  },
  '2': {
    id: '2',
    name: 'User Authentication Flow',
    description: 'OAuth2, JWT, and session management workflows'
  }
}

// Advanced Canvas Integration Component
function AdvancedCanvasWithHeader() {
  const params = useParams()
  const projectId = params.projectId as string
  const project = mockProjects[projectId] || mockProjects['1']
  const [isRunning, setIsRunning] = useState(false)
  
  // Get advanced canvas context
  const { state, actions } = useAdvancedCanvas()

  const handleRun = useCallback(() => {
    setIsRunning(true)
    // Simulate workflow execution
    state.nodes.forEach(node => {
      actions.updateNode(node.id, { status: 'running' })
    })
    
    // Simulate completion after 3 seconds
    setTimeout(() => {
      state.nodes.forEach(node => {
        actions.updateNode(node.id, { status: 'success' })
      })
      setIsRunning(false)
    }, 3000)
  }, [state.nodes, actions])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    state.nodes.forEach(node => {
      actions.updateNode(node.id, { status: 'idle' })
    })
  }, [state.nodes, actions])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-gray-300">
        {/* Top Navigation Bar */}
        <div className="px-8 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Workspace Selector */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                  WS
                </div>
                <div>
                  <div className="font-medium text-gray-900">My Workspace</div>
                  <div className="text-sm text-gray-600">Personal projects</div>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300" />
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Projects
                </Link>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-gray-900">{project.name}</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500" />
                  <span className="text-gray-700 font-medium">LIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">Last saved 2m ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">3 collaborators</span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300" />
              
              <div className="flex items-center gap-3">
                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors">
                  Version 2.1
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Control Bar */}
        <div className="px-8 py-6 bg-gray-100 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Workflow Metrics */}
              <div className="flex items-center gap-12">
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">{state.nodes.length}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">NODES</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">{state.connections.length}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">CONNECTIONS</div>
                </div>
                
                <div className="h-12 w-px bg-gray-300" />
                
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">98%</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">SUCCESS RATE</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">245</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">MS AVG</div>
                </div>
              </div>
              
              <div className="h-12 w-px bg-gray-300" />
              
              {/* Validation Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300">
                  <div className="w-3 h-3 bg-green-500" />
                  <span className="text-sm font-medium text-gray-900">WORKFLOW VALID</span>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium uppercase tracking-wide">
                  OPTIMIZED
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
            {/* Action Buttons */}
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
              Export
            </button>
            
            <button 
              onClick={() => console.log('Save')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              Save Changes
            </button>
              
              {/* Run Controls */}
              {isRunning ? (
                <button
                  onClick={handleStop}
                  className="px-6 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white border border-red-600 transition-colors"
                >
                  Stop Execution
                </button>
              ) : (
                <button
                  onClick={handleRun}
                  className="px-6 py-2 text-sm font-medium bg-black hover:bg-gray-800 text-white border border-black transition-colors"
                >
                  Deploy Workflow
                </button>
              )}
              
              {/* Settings */}
              <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Advanced Canvas */}
      <div className="flex-1">
        <AdvancedCanvasLayout showToolbar={false} />
      </div>
    </div>
  )
}

export default function ProjectCanvasPage() {
  return (
    <AdvancedCanvasProvider>
      <AdvancedCanvasWithHeader />
    </AdvancedCanvasProvider>
  )
}