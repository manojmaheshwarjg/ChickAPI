import React from 'react'
import {
  PlayIcon,
  StopIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'

interface ToolbarProps {
  onRun: () => void
  onStop: () => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
}

export default function Toolbar({ onRun, onStop, onSave, onUndo, onRedo }: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2">
      <div className="flex items-center justify-between">
        {/* Left Section - Edit Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Undo"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Redo"
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          
          <button
            onClick={onSave}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Save"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Center Section - View Controls */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded">
            100%
          </span>
          
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Fit to Screen"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Grid View"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section - Empty for spacing */}
        <div className="w-24"></div>
      </div>
    </div>
  )
}
