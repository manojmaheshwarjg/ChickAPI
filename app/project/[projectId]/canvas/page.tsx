'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, Settings, CheckCircle,
  MoreVertical, Save, Share2, Download, GitBranch,
  Clock, Users, Activity, Layers, Zap, FileJson,
  AlertCircle, ChevronRight, Home, FolderOpen,
  Box, Grid3x3
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        {/* Top Navigation Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Workspace Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 font-medium">
                    <Grid3x3 className="w-4 h-4" />
                    My Workspace
                    <ChevronRight className="w-3 h-3 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem className="gap-2">
                    <Home className="w-4 h-4" />
                    <div>
                      <div className="font-medium">My Workspace</div>
                      <div className="text-xs text-gray-500">Personal projects</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Team Projects</div>
                      <div className="text-xs text-gray-500">Shared workflows</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <Box className="w-4 h-4" />
                    <span>All Projects</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Projects
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{project.name}</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-gray-600">Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Last saved 2m ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">3 collaborators</span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-200" />
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Version 2.1
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Control Bar */}
        <div className="px-6 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Workflow Metrics */}
              <div className="flex items-center gap-8">
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-gray-900">{state.nodes.length}</span>
                    <span className="text-sm text-gray-500">nodes</span>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-gray-900">{state.connections.length}</span>
                    <span className="text-sm text-gray-500">connections</span>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-gray-300" />
                
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-gray-900">98%</span>
                    <span className="text-sm text-gray-500">success</span>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-gray-900">245</span>
                    <span className="text-sm text-gray-500">ms avg</span>
                  </div>
                </div>
              </div>
              
              <div className="h-10 w-px bg-gray-300" />
              
              {/* Validation Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-300">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Workflow Valid</span>
                </div>
                <Badge variant="secondary" className="border-gray-300">
                  <Zap className="w-3 h-3 mr-1" />
                  Optimized
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
            {/* Action Buttons */}
            <Button
              variant="outline"
              size="default"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="secondary"
              size="default"
              onClick={() => console.log('Save')}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
              
              {/* Run Controls */}
              {isRunning ? (
                <Button
                  onClick={handleStop}
                  size="default"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Execution
                </Button>
              ) : (
                <Button
                  onClick={handleRun}
                  size="default"
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Deploy Workflow
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="gap-2">
                    <Activity className="w-4 h-4" />
                    Performance Monitor
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Error Logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <Settings className="w-4 h-4" />
                    Workflow Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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