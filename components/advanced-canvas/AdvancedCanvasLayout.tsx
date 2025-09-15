'use client'

import React from 'react'
import { 
  Settings, 
  Grid3X3, 
  Square, 
  Maximize,
  PanelLeftOpen,
  PanelRightOpen,
  PanelLeftClose,
  PanelRightClose,
  Layers,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdvancedCanvas } from './AdvancedCanvasContext'
import { AdvancedCanvasCore } from './AdvancedCanvasCore'
import { NodePalette } from '@/components/NodePalette'
import { NodePropertiesPanel } from '@/components/NodePropertiesPanel'
import { getNodeById } from '@/lib/node-palette/registry'
import './AdvancedCanvas.css'

interface AdvancedCanvasLayoutProps {
  showToolbar?: boolean
}

export const AdvancedCanvasLayout = ({ showToolbar = true }: AdvancedCanvasLayoutProps) => {
  const { state, actions } = useAdvancedCanvas()

  // Get selected node data for properties panel
  const selectedNode = state.selectedNodeId 
    ? state.nodes.find(n => n.id === state.selectedNodeId) 
    : null

  // Get node palette item for selected node
  const selectedNodePaletteItem = selectedNode ? getNodeById(selectedNode.type) : null

  const handleNodePaletteSelect = (item: any) => {
    console.log('Node palette item selected:', item)
  }

  const handleNodePaletteDrag = (item: any) => {
    console.log('Node palette item being dragged:', item)
  }

  const handlePropertiesChange = (property: string, value: any) => {
    if (selectedNode) {
      actions.updateNode(selectedNode.id, {
        config: {
          ...selectedNode.config,
          [property]: value
        }
      })
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Node Palette Sidebar */}
      <div className={`
        flex-shrink-0 transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm
        ${state.isNodePaletteOpen ? 'w-80' : 'w-0'}
        ${!state.isNodePaletteOpen && 'overflow-hidden'}
      `}>
        {state.isNodePaletteOpen && (
          <NodePalette
            onNodeSelect={handleNodePaletteSelect}
            onNodeDrag={handleNodePaletteDrag}
            className="h-full"
          />
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enterprise Toolbar */}
        {showToolbar && (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant={state.isNodePaletteOpen ? "secondary" : "ghost"}
                  size="sm"
                  onClick={actions.toggleNodePalette}
                  className="text-gray-700"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Components
                </Button>

                <div className="h-6 w-px bg-gray-300 mx-2" />

                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={state.showGrid ? "secondary" : "ghost"}
                    size="sm"
                    onClick={actions.toggleGrid}
                    className="text-gray-600 h-7 px-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={state.snapToGrid ? "secondary" : "ghost"}
                    size="sm"
                    onClick={actions.toggleSnapToGrid}
                    className="text-gray-600 h-7 px-2"
                  >
                    <Square className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.fitView}
                    className="text-gray-600 h-7 px-2"
                  >
                    <Target className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Center info */}
              <div className="flex items-center gap-4">
                {selectedNode && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {selectedNode.metadata?.title || selectedNode.type}
                  </Badge>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{state.nodes.length}</span> nodes
                  <span className="mx-2">•</span>
                  <span className="font-semibold">{state.connections.length}</span> connections
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant={state.isPropertiesPanelOpen ? "secondary" : "ghost"}
                  size="sm"
                  onClick={actions.togglePropertiesPanel}
                  className="text-gray-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Properties
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <AdvancedCanvasCore />
        </div>
      </div>

      {/* Properties Panel Sidebar */}
      <div className={`
        flex-shrink-0 transition-all duration-300 ease-in-out bg-white border-l border-gray-200 shadow-sm
        ${state.isPropertiesPanelOpen ? 'w-96' : 'w-0'}
        ${!state.isPropertiesPanelOpen && 'overflow-hidden'}
      `}>
        {state.isPropertiesPanelOpen && (
          <NodePropertiesPanel
            nodeId={selectedNode?.id}
            node={selectedNodePaletteItem}
            values={selectedNode?.config || {}}
            onChange={handlePropertiesChange}
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}