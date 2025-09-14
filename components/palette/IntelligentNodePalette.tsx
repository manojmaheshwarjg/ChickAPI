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
    color: '#3b82f6',
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

  // Rich Node Card Component
  const NodeCard = ({ node, compact = false }: { node: EnhancedNodeDefinition; compact?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false)

    if (compact) {
      return (
        <div
          className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer group"
          draggable
          onDragStart={() => onNodeDrag(node)}
          onClick={() => setSelectedNode(node)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: node.color }}
          >
            {node.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{node.name}</h3>
              {node.premium && <Zap className="w-4 h-4 text-yellow-500" />}
              {node.beta && <Badge variant="secondary" className="text-xs">Beta</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate">{node.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              {node.analytics.popularity}%
            </div>
            <div className="text-xs text-green-600 font-medium">
              {node.analytics.successRate}% success
            </div>
          </div>
        </div>
      )
    }

    return (
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        draggable
        onDragStart={() => onNodeDrag(node)}
        onClick={() => setSelectedNode(node)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: node.color }}
            >
              {node.icon}
            </div>
            <div className="flex flex-col gap-1">
              {node.premium && <Zap className="w-4 h-4 text-yellow-500" />}
              {node.beta && <Badge variant="outline" className="text-xs px-1">Beta</Badge>}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                {node.analytics.rating}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg leading-tight">{node.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
          </div>
          
          {/* Complexity & Category */}
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={node.complexity === 'beginner' ? 'default' : node.complexity === 'intermediate' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {node.complexity}
            </Badge>
            <span className="text-xs text-muted-foreground">{node.category}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Analytics Bar */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-sm font-bold text-green-600">{node.analytics.successRate}%</div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">{node.analytics.avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">{node.analytics.weeklyUse.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Uses/week</div>
            </div>
          </div>

          {/* Quick Preview */}
          {isHovered && node.examples.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Quick Preview</span>
              </div>
              <div className="text-xs font-mono bg-background rounded px-2 py-1">
                {node.examples[0].preview}
              </div>
            </div>
          )}

          {/* Input/Output Summary */}
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span>{node.inputs.length} inputs</span>
            <span>{node.outputs.length} outputs</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {node.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {node.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{node.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation()
                setShowPreview(node.id)
              }}
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation()
                onNodeSelect(node)
              }}
            >
              <Play className="w-4 h-4" />
              Use
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
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
