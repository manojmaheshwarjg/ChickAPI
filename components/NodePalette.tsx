'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, Star, Package, Zap, Clock, ChevronDown, ChevronRight,
  Globe, RefreshCw, GitBranch, Shield, Database, 
  TestTube, Timer, Bot, Lock, BarChart3,
  Radio, Shuffle, Code, Mail, FileText,
  Hash, Upload, Activity, Eye, RotateCcw,
  ArrowRight, Filter as FilterIcon, Merge, Settings2,
  Server, Boxes, Key
} from 'lucide-react'
import { Input, Button, Badge } from '@/components/ui'
import { 
  nodes, 
  categoryMetadata, 
  searchNodes,
  NodePaletteItem
} from '@/lib/node-palette/registry'

// Map node types to Lucide icons
function getNodeIcon(nodeId: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    // HTTP & API
    'http-request': <Globe className="w-4 h-4" />,
    'graphql-query': <Zap className="w-4 h-4" />,
    'soap-request': <Code className="w-4 h-4" />,
    'webhook-listener': <Radio className="w-4 h-4" />,
    'file-upload': <Upload className="w-4 h-4" />,
    'http-batch': <Package className="w-4 h-4" />,
    
    // Data Processing
    'json-transform': <RefreshCw className="w-4 h-4" />,
    'data-filter': <FilterIcon className="w-4 h-4" />,
    'data-validator': <Shield className="w-4 h-4" />,
    'csv-parser': <FileText className="w-4 h-4" />,
    'xml-parser': <Code className="w-4 h-4" />,
    'data-aggregator': <BarChart3 className="w-4 h-4" />,
    'data-merger': <Merge className="w-4 h-4" />,
    
    // AI & ML
    'openai-chat': <Bot className="w-4 h-4" />,
    'text-embedding': <Hash className="w-4 h-4" />,
    'sentiment-analysis': <Activity className="w-4 h-4" />,
    'text-classification': <TestTube className="w-4 h-4" />,
    'image-analysis': <Eye className="w-4 h-4" />,
    'code-generator': <Code className="w-4 h-4" />,
    
    // Control Flow
    'conditional': <GitBranch className="w-4 h-4" />,
    'loop': <RotateCcw className="w-4 h-4" />,
    'switch': <Shuffle className="w-4 h-4" />,
    'retry': <RefreshCw className="w-4 h-4" />,
    'delay': <Timer className="w-4 h-4" />,
    'parallel': <ArrowRight className="w-4 h-4" />,
    
    // Auth & Security
    'oauth2-auth': <Lock className="w-4 h-4" />,
    'jwt-decode': <Key className="w-4 h-4" />,
    
    // Database
    'sql-query': <Database className="w-4 h-4" />,
    
    // Mock & Testing
    'mock-server': <Server className="w-4 h-4" />,
    'data-generator': <Boxes className="w-4 h-4" />,
    
    // Notifications
    'email-send': <Mail className="w-4 h-4" />,
    
    // Utilities
    'variable-set': <Hash className="w-4 h-4" />,
    'logger': <FileText className="w-4 h-4" />
  }
  
  return iconMap[nodeId] || <Package className="w-4 h-4" />
}

interface NodePaletteProps {
  onNodeSelect?: (node: NodePaletteItem) => void
  onNodeDrag?: (node: NodePaletteItem) => void
  className?: string
  favorites?: string[]
  recentlyUsed?: string[]
}

export function NodePalette({ 
  onNodeSelect, 
  onNodeDrag,
  className = '',
  favorites = [],
  recentlyUsed = []
}: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['http & api'])) // Only HTTP & API expanded by default

  // Filter nodes based on search only
  const filteredNodes = useMemo(() => {
    let result = nodes

    // Search filter
    if (searchQuery) {
      result = searchNodes(searchQuery)
    }

    return result
  }, [searchQuery])

  // Group nodes by category for organized display
  const groupedNodes = useMemo(() => {
    const groups: Record<string, NodePaletteItem[]> = {}
    
    filteredNodes.forEach(node => {
      const categoryName = categoryMetadata[node.category]?.name || node.category
      if (!groups[categoryName]) {
        groups[categoryName] = []
      }
      groups[categoryName].push(node)
    })

    return groups
  }, [filteredNodes])

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Handle node drag start
  const handleDragStart = (e: React.DragEvent, node: NodePaletteItem) => {
    console.log('🎯 Drag started:', node.id, node.name)
    
    // Set data for drop handling
    e.dataTransfer.setData('nodeType', node.id)
    e.dataTransfer.setData('application/reactflow', node.id)
    e.dataTransfer.setData('text/plain', node.id)
    e.dataTransfer.setData('application/json', JSON.stringify(node))
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.dropEffect = 'copy'
    
    console.log('📦 DataTransfer types set:', Array.from(e.dataTransfer.types))
    
    onNodeDrag?.(node)
  }

  // Handle node click
  const handleNodeClick = (node: NodePaletteItem) => {
    onNodeSelect?.(node)
  }

  // Node component (single column list format)
  const NodeItem = ({ node }: { node: NodePaletteItem }) => {
    const isFavorite = favorites.includes(node.id)
    const isRecent = recentlyUsed.includes(node.id)

    return (
      <div
        key={node.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, node)}
        onClick={(e) => {
          // Only handle click if it wasn't a drag operation
          if (!e.defaultPrevented) {
            handleNodeClick(node)
          }
        }}
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-all group"
        style={{ 
          userSelect: 'none',
          WebkitUserDrag: 'element'
        }}
      >
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: node.color + '20', color: node.color }}
        >
          {getNodeIcon(node.id)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{node.name}</h3>
            {isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            {isRecent && <Clock className="w-4 h-4 text-blue-500" />}
            {node.premium && <Zap className="w-4 h-4 text-purple-500" />}
          </div>
          <p className="text-sm text-gray-600 truncate">{node.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`flex flex-col h-full bg-white ${className}`}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Node Palette</h2>
          <Badge variant="secondary" className="ml-auto">
            {filteredNodes.length} nodes
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

      </div>

      {/* Node List with Collapsible Categories */}
      <div className="flex-1 overflow-y-auto" style={{ touchAction: 'none' }}>
        {Object.entries(groupedNodes).map(([categoryName, categoryNodes]) => {
          const isExpanded = expandedCategories.has(categoryName.toLowerCase())
          const categoryKey = categoryName.toLowerCase()
          
          return (
            <div key={categoryName} className="border-b border-gray-100">
              {/* Collapsible Category Header */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCategory(categoryKey)
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <h3 className="font-semibold text-gray-900">{categoryName}</h3>
                  <Badge variant="outline" className="text-xs ml-2">
                    {categoryNodes.length}
                  </Badge>
                </div>
              </button>

              {/* Collapsible Category Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {categoryNodes.map(node => (
                    <NodeItem key={node.id} node={node} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Empty state */}
        {filteredNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No nodes found</h3>
            <p className="text-gray-600 max-w-sm">
              {searchQuery 
                ? `No nodes match "${searchQuery}". Try different keywords.`
                : 'Try searching for specific nodes.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NodePalette
