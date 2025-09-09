import React from 'react'
import { 
  PlayIcon, 
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  workflowName: string
}

export default function Header({ workflowName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Text Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">ChickAPI</h1>
            <div className="h-5 w-px bg-gray-300"></div>
          </div>

          {/* Workflow Name */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={workflowName}
              className="text-base font-medium text-gray-700 bg-transparent border-none outline-none hover:bg-gray-50 px-2 py-1 rounded transition-colors"
              placeholder="Untitled Workflow"
            />
            <button className="text-gray-400 hover:text-gray-600">
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Section - Environment Selector */}
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>Development</option>
            <option>Staging</option>
            <option>Production</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <PlayIcon className="w-4 h-4" />
            Run
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CloudArrowUpIcon className="w-4 h-4" />
            <span>Saved</span>
          </div>

          <div className="h-5 w-px bg-gray-300"></div>

          {/* Action Buttons */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
          
          {/* User Menu */}
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <UserCircleIcon className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">User</span>
          </button>
        </div>
      </div>
    </header>
  )
}
