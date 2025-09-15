'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Search, Star, TrendingUp, Clock, Zap, Play,
  ChevronRight, Filter, Sparkles, Brain,
  BarChart3, Users, CheckCircle, AlertCircle,
  Eye, Code, BookOpen, Rocket, Target, ArrowRight,
  Globe, RefreshCw, GitBranch, Database, Shield,
  Bell, TestTube, Timer, Activity, Hash, Upload,
  Bot, Settings2, Key, Server, Boxes
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Enhanced node definition
interface EnhancedNodeDefinition {
  id: string
  name: string
  category: string
  description: string
  longDescription: string
  icon: React.ReactNode
  color: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
  
  // Rich information
  inputs: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  outputs: Array<{
    name: string
    type: string
    description: string
  }>
  
  // Analytics & Usage
  analytics: {
    popularity: number // 1-100
    successRate: number // percentage
    avgResponseTime: number // ms
    weeklyUse: number
    rating: number // 1-5
    reviews: number
  }
  
  // Learning & Examples
  examples: Array<{
    name: string
    description: string
    config: Record<string, any>
    preview: string
  }>
  
  // Metadata
  tags: string[]
  author: string
  version: string
  lastUpdated: string
  premium: boolean
  beta: boolean
  
  // AI Insights
  aiInsights?: {
    recommendations: string[]
    commonUseCase: string
    difficulty: string
    learningTip: string
  }
}

const mockNodes: EnhancedNodeDefinition[] = [
  {
    id: 'http-request',
    name: 'HTTP Request',
    category: 'HTTP & API',
    description: 'Send HTTP requests to any endpoint',
    longDescription: 'The most popular node for API testing. Supports all HTTP methods, headers, authentication, and response validation. Perfect for REST API integration.',
    icon: <Globe className="w-5 h-5" />,
    color: 'hsl(var(--primary))',
    complexity: 'beginner',
    inputs: [
      { name: 'URL', type: 'string', required: true, description: 'The endpoint URL' },
      { name: 'Method', type: 'select', required: true, description: 'HTTP method (GET, POST, etc.)' },
      { name: 'Headers', type: 'object', required: false, description: 'Request headers' },
      { name: 'Body', type: 'any', required: false, description: 'Request payload' }
    ],
    outputs: [
      { name: 'Response', type: 'object', description: 'HTTP response object' },
      { name: 'Status', type: 'number', description: 'HTTP status code' },
      { name: 'Headers', type: 'object', description: 'Response headers' }
    ],
    analytics: {
      popularity: 95,
      successRate: 94.2,
      avgResponseTime: 240,
      weeklyUse: 15420,
      rating: 4.8,
      reviews: 1250
    },
    examples: [
      {
        name: 'Simple GET Request',
        description: 'Fetch user profile from JSON Placeholder API',
        config: { method: 'GET', url: 'https://jsonplaceholder.typicode.com/users/1' },
        preview: '{\n  "name": "Leanne Graham",\n  "username": "Bret",\n  "email": "Sincere@april.biz"\n}'
      },
      {
        name: 'POST with Authentication',
        description: 'Create a new resource with Bearer token',
        config: { 
          method: 'POST', 
          url: 'https://api.example.com/users',
          headers: { 'Authorization': 'Bearer {{token}}' }
        },
        preview: '{\n  "id": 123,\n  "status": "created"\n}'
      }
    ],
    tags: ['api', 'http', 'rest', 'request', 'popular'],
    author: 'ChickAPI Team',
    version: '2.1.0',
    lastUpdated: '2 days ago',
    premium: false,
    beta: false,
    aiInsights: {
      recommendations: [
        'Add response validation after this node',
        'Consider adding retry logic for production',
        'Use environment variables for URLs'
      ],
      commonUseCase: 'API integration and testing',
      difficulty: 'Very easy to use, great for beginners',
      learningTip: 'Start with GET requests before moving to POST/PUT operations'
    }
  },
  {
    id: 'json-transform',
    name: 'JSON Transform',
    category: 'Data Processing',
    description: 'Transform and manipulate JSON data',
    longDescription: 'Powerful JSON transformation engine with JSONPath, JMESPath, and JavaScript support. Perfect for data cleaning, restructuring, and API response processing.',
    icon: <RefreshCw className="w-5 h-5" />,
    color: '#10b981',
    complexity: 'intermediate',
    inputs: [
      { name: 'Data', type: 'object', required: true, description: 'JSON data to transform' },
      { name: 'Transform', type: 'string', required: true, description: 'JSONPath or JavaScript expression' },
      { name: 'Options', type: 'object', required: false, description: 'Transformation options' }
    ],
    outputs: [
      { name: 'Result', type: 'any', description: 'Transformed data' },
      { name: 'Success', type: 'boolean', description: 'Transformation success status' }
    ],
    analytics: {
      popularity: 78,
      successRate: 91.5,
      avgResponseTime: 45,
      weeklyUse: 8900,
      rating: 4.6,
      reviews: 620
    },
    examples: [
      {
        name: 'Extract User Names',
        description: 'Extract all user names from an array',
        config: { transform: '$.users[*].name' },
        preview: '["Alice", "Bob", "Charlie"]'
      }
    ],
    tags: ['json', 'transform', 'jsonpath', 'data'],
    author: 'Community',
    version: '1.8.2',
    lastUpdated: '1 week ago',
    premium: false,
    beta: false,
    aiInsights: {
      recommendations: [
        'Use JSONPath for simple extractions',
        'Switch to JavaScript for complex logic',
        'Test transformations with sample data first'
      ],
      commonUseCase: 'API response processing',
      difficulty: 'Requires JSONPath knowledge',
      learningTip: 'Master JSONPath syntax for powerful data extraction'
    }
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    category: 'AI & ML',
    description: 'Get intelligent help with your workflow',
    longDescription: 'Advanced AI assistant powered by GPT-4. Helps with API testing, data validation, test case generation, and workflow optimization. Your intelligent testing companion.',
    icon: <Brain className="w-5 h-5" />,
    color: '#8b5cf6',
    complexity: 'advanced',
    inputs: [
      { name: 'Query', type: 'string', required: true, description: 'Your question or request' },
      { name: 'Context', type: 'object', required: false, description: 'Workflow context' },
      { name: 'Mode', type: 'select', required: false, description: 'AI operation mode' }
    ],
    outputs: [
      { name: 'Response', type: 'string', description: 'AI response' },
      { name: 'Suggestions', type: 'array', description: 'Action suggestions' },
      { name: 'Confidence', type: 'number', description: 'Response confidence score' }
    ],
    analytics: {
      popularity: 85,
      successRate: 96.8,
      avgResponseTime: 1200,
      weeklyUse: 5600,
      rating: 4.9,
      reviews: 340
    },
    examples: [
      {
        name: 'Generate Test Cases',
        description: 'Generate comprehensive test cases for an API endpoint',
        config: { 
          query: 'Generate test cases for user registration API',
          mode: 'test-generation'
        },
        preview: 'Generated 12 test cases covering validation, edge cases, and security'
      }
    ],
    tags: ['ai', 'assistant', 'testing', 'automation', 'beta'],
    author: 'ChickAPI Labs',
    version: '0.9.1',
    lastUpdated: '3 days ago',
    premium: true,
    beta: true,
    aiInsights: {
      recommendations: [
        'Provide clear, specific questions',
        'Include relevant context for better responses',
        'Review AI suggestions before implementation'
      ],
      commonUseCase: 'Test case generation and optimization',
      difficulty: 'Easy to use, powerful results',
      learningTip: 'The more context you provide, the better the AI responses'
    }
  }
]

interface IntelligentNodePaletteProps {
  onNodeSelect: (node: EnhancedNodeDefinition) => void
  onNodeDrag: (node: EnhancedNodeDefinition) => void
  className?: string
}

export function IntelligentNodePalette({ onNodeSelect, onNodeDrag, className }: IntelligentNodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedNode, setSelectedNode] = useState<EnhancedNodeDefinition | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)

  // Smart filtering with AI-powered search
  const filteredNodes = useMemo(() => {
    let result = mockNodes

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(node => 
        node.name.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.tags.some(tag => tag.includes(query)) ||
        node.longDescription.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      result = result.filter(node => node.category === selectedCategory)
    }

    // Sort by relevance and popularity
    return result.sort((a, b) => b.analytics.popularity - a.analytics.popularity)
  }, [searchQuery, selectedCategory])

  // Categories with counts
  const categories = useMemo(() => {
    const cats = ['all', ...Array.from(new Set(mockNodes.map(n => n.category)))]
    return cats.map(cat => ({
      name: cat,
      count: cat === 'all' ? mockNodes.length : mockNodes.filter(n => n.category === cat).length
    }))
  }, [])

  // Handle node drag start
  const handleDragStart = (e: React.DragEvent, node: EnhancedNodeDefinition) => {
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

  // Rich Node Card Component
  const NodeCard = ({ node, compact = false }: { node: EnhancedNodeDefinition; compact?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    if (compact) {
      return (
        <>
          <div
            className="group relative p-4 border border-border/60 rounded-lg bg-white hover:bg-gray-50/80 hover:border-border hover:shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing"
            style={{
              userSelect: 'none',
              WebkitUserDrag: 'element',
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.15) 1px, transparent 0)
              `,
              backgroundSize: '20px 20px'
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            onClick={() => setSelectedNode(node)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 2px 2px, rgba(156, 163, 175, 0.2) 0.5px, transparent 0)
                  `,
                  backgroundSize: '8px 8px'
                }}
              >
                {React.cloneElement(node.icon as React.ReactElement, {
                  className: 'w-3.5 h-3.5 text-gray-600'
                })}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-900 truncate">{node.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{node.description}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {node.category}
                  </span>
                  {node.analytics.rating >= 4.5 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-600">{node.analytics.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Expandable content */}
          {isExpanded && (
            <div 
              className="ml-9 mt-2 p-3 bg-gray-50 rounded-md border-l-2 border-gray-200"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(156, 163, 175, 0.03) 25%, transparent 25%),
                  linear-gradient(-45deg, rgba(156, 163, 175, 0.03) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, rgba(156, 163, 175, 0.03) 75%),
                  linear-gradient(-45deg, transparent 75%, rgba(156, 163, 175, 0.03) 75%)
                `,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
            >
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Inputs: {node.inputs.length}</span>
                <span>Outputs: {node.outputs.length}</span>
                <span className="text-gray-500">{node.complexity}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {node.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="inline-block px-1.5 py-0.5 bg-white rounded text-xs text-gray-600 border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )
    }

    return (
      <div
        className="group relative border border-gray-200 rounded-lg bg-white hover:bg-gray-50/50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing"
        style={{
          userSelect: 'none',
          WebkitUserDrag: 'element',
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.1) 1px, transparent 0)
          `,
          backgroundSize: '24px 24px'
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, node)}
        onClick={() => setSelectedNode(node)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 2px 2px, rgba(156, 163, 175, 0.15) 0.5px, transparent 0)
                  `,
                  backgroundSize: '10px 10px'
                }}
              >
                {React.cloneElement(node.icon as React.ReactElement, {
                  className: 'w-4 h-4 text-gray-600'
                })}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base text-gray-900 mb-1">{node.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{node.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {node.premium && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Zap className="w-3 h-3 mr-1" />
                  Pro
                </span>
              )}
              {node.beta && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Beta
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {node.category}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
              node.complexity === 'beginner' ? 'bg-green-100 text-green-800' :
              node.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {node.complexity}
            </span>
            {node.analytics.rating >= 4.5 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-600">{node.analytics.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="px-4 pb-4">
          <Button 
            size="sm" 
            className="w-full h-9 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onNodeSelect(node)
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Add to Canvas
          </Button>
        </div>
        
        {/* Expandable Content */}
        {isExpanded && (
          <div 
            className="border-t border-gray-200 p-4 bg-gray-50/50"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(156, 163, 175, 0.025) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(156, 163, 175, 0.025) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(156, 163, 175, 0.025) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(156, 163, 175, 0.025) 75%)
              `,
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
            }}
          >
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">{node.analytics.successRate}%</div>
                  <div className="text-xs text-gray-500">Success</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">{node.analytics.avgResponseTime}ms</div>
                  <div className="text-xs text-gray-500">Response</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">{node.analytics.weeklyUse}</div>
                  <div className="text-xs text-gray-500">Uses/week</div>
                </div>
              </div>
              
              {/* I/O Info */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{node.inputs.length} inputs</span>
                <span>{node.outputs.length} outputs</span>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {node.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="inline-block px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`flex flex-col h-full bg-background ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.08) 1px, transparent 0)
        `,
        backgroundSize: '32px 32px'
      }}
    >
      {/* Header with Smart Search */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Smart Node Palette</h2>
          <Badge variant="secondary" className="text-xs">AI Powered</Badge>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes, describe what you need..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoComplete="off"
          />
        </div>

        {/* Node Count */}
        <div className="flex justify-end">
          <div className="text-xs text-muted-foreground">
            {filteredNodes.length} nodes
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name === 'all' ? 'All' : cat.name} ({cat.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Nodes - Single Column */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          {filteredNodes.map(node => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>

        {filteredNodes.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No nodes found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or category filter</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
