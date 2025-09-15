'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, Star, Package, Zap, Clock, ChevronDown, ChevronRight,
  Globe, RefreshCw, GitBranch, Shield, Database, 
  TestTube, Timer, Bot, Lock, BarChart3,
  Radio, Shuffle, Code, Mail, FileText,
  Hash, Upload, Activity, Eye, RotateCcw,
  ArrowRight, Filter as FilterIcon, Merge, Settings2,
  Server, Boxes, Key, Sparkles
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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

  // Enterprise Node Item Component
  const NodeItem = ({ node }: { node: NodePaletteItem }) => {
    const isFavorite = favorites.includes(node.id)
    const isRecent = recentlyUsed.includes(node.id)
    const [isHovered, setIsHovered] = useState(false)

    return (
      <div
        key={node.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, node)}
        onClick={(e) => {
          if (!e.defaultPrevented) {
            handleNodeClick(node)
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative bg-white border border-gray-200 rounded-lg
          cursor-grab active:cursor-grabbing
          hover:border-blue-400 hover:shadow-md
          transition-all duration-200
          ${isHovered ? 'transform scale-[1.02]' : ''}
        `}
        style={{ 
          userSelect: 'none',
          WebkitUserDrag: 'element'
        }}
      >
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${node.color}15, ${node.color}25)`,
                color: node.color 
              }}
            >
              {getNodeIcon(node.id)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {node.name}
                </h3>
                <div className="flex items-center gap-1 ml-2">
                  {isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  {node.premium && (
                    <Badge className="text-xs px-1.5 py-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                      PRO
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {node.description}
              </p>
            </div>
          </div>
          
          {/* Quick Info Bar */}
          {isHovered && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Click to add • Drag to place</span>
              {isRecent && (
                <span className="text-blue-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recently used
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Enterprise Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Component Library</h2>
          <p className="text-sm text-gray-600 mt-1">Drag components to build your workflow</p>
        </div>

        {/* Search with Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <Badge 
            variant="secondary" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-700"
          >
            {filteredNodes.length} items
          </Badge>
        </div>
      </div>

      {/* Node List with Categories */}
      <div className="flex-1 overflow-y-auto bg-gray-50" style={{ touchAction: 'none' }}>
        {Object.entries(groupedNodes).map(([categoryName, categoryNodes]) => {
          const isExpanded = expandedCategories.has(categoryName.toLowerCase())
          const categoryKey = categoryName.toLowerCase()
          
          // Get category color
          const categoryColor = categoryNodes[0]?.color || '#6b7280'
          
          return (
            <div key={categoryName} className="bg-white mb-px">
              {/* Category Header */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCategory(categoryKey)
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-l-4"
                style={{ 
                  touchAction: 'manipulation',
                  borderLeftColor: categoryColor
                }}
              >
                <div className="flex items-center gap-3">
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    {categoryName}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-gray-100 text-gray-700"
                  >
                    {categoryNodes.length} components
                  </Badge>
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 border-l-4" 
                  style={{ borderLeftColor: `${categoryColor}20` }}
                >
                  <div className="space-y-2">
                    {categoryNodes.map(node => (
                      <NodeItem key={node.id} node={node} />
                    ))}
                  </div>
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
