import React, { useState } from 'react'
import { 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  CubeIcon,
  CircleStackIcon,
  BoltIcon,
  BeakerIcon,
  CpuChipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  onNodeDragStart: (nodeType: string) => void
}

const nodeCategories = [
  {
    name: 'HTTP',
    icon: CubeIcon,
    color: 'text-blue-600',
    nodes: [
      { id: 'http-get', name: 'GET Request', description: 'Make a GET request' },
      { id: 'http-post', name: 'POST Request', description: 'Send data with POST' },
      { id: 'http-put', name: 'PUT Request', description: 'Update with PUT' },
      { id: 'http-delete', name: 'DELETE Request', description: 'Delete resources' },
    ]
  },
  {
    name: 'Data Transform',
    icon: ArrowPathIcon,
    color: 'text-green-600',
    nodes: [
      { id: 'json-path', name: 'JSON Path', description: 'Extract JSON data' },
      { id: 'mapper', name: 'Data Mapper', description: 'Transform data structure' },
      { id: 'filter', name: 'Filter', description: 'Filter array data' },
      { id: 'aggregate', name: 'Aggregate', description: 'Aggregate data' },
    ]
  },
  {
    name: 'Control Flow',
    icon: BoltIcon,
    color: 'text-purple-600',
    nodes: [
      { id: 'condition', name: 'Condition', description: 'If/else branching' },
      { id: 'loop', name: 'Loop', description: 'Iterate over data' },
      { id: 'parallel', name: 'Parallel', description: 'Run in parallel' },
      { id: 'delay', name: 'Delay', description: 'Add delay' },
    ]
  },
  {
    name: 'Testing',
    icon: BeakerIcon,
    color: 'text-orange-600',
    nodes: [
      { id: 'assert', name: 'Assert', description: 'Validate response' },
      { id: 'test-case', name: 'Test Case', description: 'Define test case' },
      { id: 'mock', name: 'Mock Response', description: 'Mock API response' },
    ]
  },
]

export default function Sidebar({ onNodeDragStart }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['HTTP'])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0)

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.name} className="border-b border-gray-100">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronRightIcon 
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  expandedCategories.includes(category.name) ? 'rotate-90' : ''
                }`}
              />
              <category.icon className={`w-4 h-4 ${category.color}`} />
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
              <span className="ml-auto text-xs text-gray-400">{category.nodes.length}</span>
            </button>

            {/* Category Nodes */}
            {expandedCategories.includes(category.name) && (
              <div className="px-3 py-2 space-y-1">
                {category.nodes.map((node) => (
                  <div
                    key={node.id}
                    draggable
                    onDragStart={() => onNodeDragStart(node.id)}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-move transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-1 h-12 ${category.color.replace('text', 'bg')} rounded-full mt-1`}></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                          {node.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{node.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button className="w-full btn-secondary text-xs">
          <CpuChipIcon className="w-4 h-4 mr-1" />
          Import Custom Node
        </button>
      </div>
    </div>
  )
}
