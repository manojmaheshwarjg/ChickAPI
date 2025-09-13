'use client'

import React from 'react'
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline'

interface CanvasControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export function CanvasControls({ zoom, onZoomIn, onZoomOut, onZoomReset }: CanvasControlsProps) {
  const zoomPercentage = Math.round(zoom * 100)

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="px-3 py-2 text-xs font-medium text-gray-600 text-center border-y border-gray-200">
          {zoomPercentage}%
        </div>
        
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Additional controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1">
        <button
          onClick={onZoomReset}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Reset View"
        >
          <ArrowsPointingOutIcon className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Center View"
        >
          <ViewfinderCircleIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Minimap placeholder */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 w-32 h-24">
        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">Minimap</span>
        </div>
      </div>
    </div>
  )
}
