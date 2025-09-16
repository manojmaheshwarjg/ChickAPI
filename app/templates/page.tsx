'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProjectTemplate } from '@/lib/types/project'

// Mock template data
const mockTemplates: ProjectTemplate[] = [
  {
    id: 'template-1',
    name: 'E-commerce API Starter',
    description: 'Complete e-commerce API with product management, cart, orders, payments, and user authentication. Includes Stripe integration and inventory management.',
    category: 'rest-api',
    subcategory: 'ecommerce',
    tags: ['ecommerce', 'payments', 'auth', 'inventory', 'stripe'],
    icon: '🛒',
    color: 'bg-gradient-to-br from-gray-700 to-gray-900',
    difficulty: 'intermediate',
    estimatedTime: 45,
    features: ['Product Catalog', 'Shopping Cart', 'Order Management', 'Payment Processing', 'User Authentication', 'Inventory Tracking'],
    technologies: ['REST API', 'JWT', 'Stripe', 'Database', 'Redis Cache'],
    useCases: ['Online Store', 'Marketplace', 'B2B Commerce', 'Subscription Commerce'],
    author: {
      id: 'author-1',
      name: 'ChickAPI Team',
      avatar: '👨‍💻'
    },
    stats: {
      downloads: 12500,
      rating: 4.8,
      reviews: 234,
      forks: 156
    },
    version: '2.1.0',
    lastUpdated: new Date('2024-09-10'),
    isOfficial: true,
    isFeatured: true,
    isVerified: true,
    template: {
      project: {} as any,
      instructions: 'This template provides a complete e-commerce API foundation...',
      setup: [
        { step: 1, title: 'Configure Database', description: 'Set up your database connection', type: 'action' },
        { step: 2, title: 'Install Dependencies', description: 'Run npm install to install required packages', type: 'action' },
        { step: 3, title: 'Setup Stripe', description: 'Configure your Stripe API keys', type: 'action' },
        { step: 4, title: 'Seed Data', description: 'Populate with sample products', type: 'action', optional: true }
      ]
    },
    preview: {
      images: ['/templates/ecommerce-preview-1.png', '/templates/ecommerce-preview-2.png'],
      demo: 'https://demo.chickapi.com/ecommerce'
    },
    license: 'MIT',
    sourceUrl: 'https://github.com/chickapi/templates/ecommerce-starter'
  },
  {
    id: 'template-2',
    name: 'GraphQL Social Media API',
    description: 'Modern social media API with GraphQL, real-time subscriptions, user feeds, messaging, and content moderation.',
    category: 'graphql',
    subcategory: 'social',
    tags: ['graphql', 'social-media', 'real-time', 'messaging', 'feeds'],
    icon: '📱',
    color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    difficulty: 'advanced',
    estimatedTime: 90,
    features: ['User Profiles', 'Real-time Feeds', 'Direct Messaging', 'Content Moderation', 'File Uploads', 'Push Notifications'],
    technologies: ['GraphQL', 'WebSockets', 'Redis', 'S3', 'Push API'],
    useCases: ['Social Networks', 'Community Platforms', 'Messaging Apps', 'Content Sharing'],
    author: {
      id: 'author-2',
      name: 'Alex Chen',
      avatar: '👩‍💻'
    },
    stats: {
      downloads: 8900,
      rating: 4.9,
      reviews: 167,
      forks: 89
    },
    version: '1.3.2',
    lastUpdated: new Date('2024-09-08'),
    isOfficial: false,
    isFeatured: true,
    isVerified: true,
    template: {
      project: {} as any,
      instructions: 'Build a modern social media platform with this GraphQL API...',
      setup: [
        { step: 1, title: 'Setup GraphQL Server', description: 'Configure Apollo Server', type: 'action' },
        { step: 2, title: 'Database Migration', description: 'Run database migrations', type: 'action' },
        { step: 3, title: 'Configure Redis', description: 'Set up Redis for caching and real-time', type: 'action' },
        { step: 4, title: 'Setup File Storage', description: 'Configure S3 or similar for uploads', type: 'action' }
      ]
    },
    preview: {
      images: ['/templates/social-preview-1.png'],
      demo: 'https://demo.chickapi.com/social-graphql'
    },
    license: 'Apache 2.0',
    sourceUrl: 'https://github.com/alexchen/social-graphql-api'
  },
  {
    id: 'template-3',
    name: 'Microservices Architecture',
    description: 'Enterprise-grade microservices setup with API Gateway, service discovery, monitoring, and distributed tracing.',
    category: 'microservices',
    subcategory: 'architecture',
    tags: ['microservices', 'api-gateway', 'docker', 'monitoring', 'distributed'],
    icon: '🏗️',
    color: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
    difficulty: 'advanced',
    estimatedTime: 120,
    features: ['API Gateway', 'Service Discovery', 'Load Balancing', 'Circuit Breaker', 'Distributed Tracing', 'Health Checks'],
    technologies: ['Docker', 'Kubernetes', 'Consul', 'Prometheus', 'Jaeger'],
    useCases: ['Enterprise Applications', 'Scalable APIs', 'Cloud Native', 'DevOps'],
    author: {
      id: 'author-3',
      name: 'DevOps Guild',
      avatar: '⚙️'
    },
    stats: {
      downloads: 5600,
      rating: 4.7,
      reviews: 89,
      forks: 134
    },
    version: '3.0.1',
    lastUpdated: new Date('2024-09-12'),
    isOfficial: false,
    isFeatured: false,
    isVerified: true,
    template: {
      project: {} as any,
      instructions: 'Deploy a complete microservices architecture...',
      setup: [
        { step: 1, title: 'Docker Setup', description: 'Ensure Docker is installed', type: 'info' },
        { step: 2, title: 'Deploy Services', description: 'Run docker-compose up', type: 'action' },
        { step: 3, title: 'Configure Gateway', description: 'Set up API Gateway routes', type: 'action' },
        { step: 4, title: 'Setup Monitoring', description: 'Configure Prometheus and Grafana', type: 'action' }
      ]
    },
    preview: {
      images: ['/templates/microservices-preview-1.png'],
      demo: 'https://demo.chickapi.com/microservices'
    },
    license: 'MIT',
    sourceUrl: 'https://github.com/devops-guild/microservices-template'
  },
  {
    id: 'template-4',
    name: 'Webhook Processing Hub',
    description: 'Scalable webhook processing system with queue management, retry logic, and payload validation.',
    category: 'webhooks',
    subcategory: 'processing',
    tags: ['webhooks', 'queues', 'processing', 'validation', 'retry'],
    icon: '🔗',
    color: 'bg-gradient-to-br from-stone-700 to-stone-900',
    difficulty: 'intermediate',
    estimatedTime: 60,
    features: ['Webhook Validation', 'Queue Processing', 'Retry Logic', 'Rate Limiting', 'Payload Transformation', 'Event Routing'],
    technologies: ['Redis Queue', 'Webhook Validation', 'Event Streams', 'Rate Limiter'],
    useCases: ['Payment Processing', 'Event Automation', 'Data Synchronization', 'Third-party Integrations'],
    author: {
      id: 'author-4',
      name: 'Integration Experts',
      avatar: '🔌'
    },
    stats: {
      downloads: 7200,
      rating: 4.6,
      reviews: 112,
      forks: 67
    },
    version: '1.8.0',
    lastUpdated: new Date('2024-09-05'),
    isOfficial: false,
    isFeatured: true,
    isVerified: false,
    template: {
      project: {} as any,
      instructions: 'Build a robust webhook processing system...',
      setup: [
        { step: 1, title: 'Configure Queues', description: 'Set up Redis or message queue', type: 'action' },
        { step: 2, title: 'Define Webhooks', description: 'Configure webhook endpoints', type: 'action' },
        { step: 3, title: 'Setup Validation', description: 'Configure payload validation rules', type: 'action' },
        { step: 4, title: 'Test Processing', description: 'Send test webhooks', type: 'action' }
      ]
    },
    preview: {
      images: ['/templates/webhook-preview-1.png'],
      demo: 'https://demo.chickapi.com/webhooks'
    },
    license: 'GPL v3',
    sourceUrl: 'https://github.com/integration-experts/webhook-hub'
  },
  {
    id: 'template-5',
    name: 'IoT Data Collection API',
    description: 'High-throughput API for IoT device data collection with real-time analytics and device management.',
    category: 'automation',
    subcategory: 'iot',
    tags: ['iot', 'real-time', 'analytics', 'mqtt', 'timeseries'],
    icon: '🌐',
    color: 'bg-gradient-to-br from-gray-600 to-gray-800',
    difficulty: 'intermediate',
    estimatedTime: 75,
    features: ['Device Registration', 'Data Ingestion', 'Real-time Analytics', 'Alert System', 'Dashboard API', 'Batch Processing'],
    technologies: ['MQTT', 'Time Series DB', 'WebSockets', 'Analytics Engine'],
    useCases: ['Smart Home', 'Industrial Monitoring', 'Environmental Sensors', 'Fleet Management'],
    author: {
      id: 'author-5',
      name: 'IoT Solutions',
      avatar: '📡'
    },
    stats: {
      downloads: 4300,
      rating: 4.5,
      reviews: 78,
      forks: 42
    },
    version: '2.2.1',
    lastUpdated: new Date('2024-08-28'),
    isOfficial: false,
    isFeatured: false,
    isVerified: true,
    template: {
      project: {} as any,
      instructions: 'Create a scalable IoT data collection system...',
      setup: [
        { step: 1, title: 'Setup MQTT Broker', description: 'Configure message broker', type: 'action' },
        { step: 2, title: 'Database Setup', description: 'Set up time series database', type: 'action' },
        { step: 3, title: 'Device Registration', description: 'Register your first device', type: 'action' },
        { step: 4, title: 'Test Data Flow', description: 'Send test telemetry data', type: 'action' }
      ]
    },
    preview: {
      images: ['/templates/iot-preview-1.png'],
      demo: 'https://demo.chickapi.com/iot'
    },
    license: 'MIT',
    sourceUrl: 'https://github.com/iot-solutions/data-collection-api'
  },
  {
    id: 'template-6',
    name: 'API Testing & Monitoring',
    description: 'Comprehensive API testing suite with automated monitoring, performance tracking, and alerting.',
    category: 'testing',
    subcategory: 'monitoring',
    tags: ['testing', 'monitoring', 'performance', 'alerts', 'automation'],
    icon: '🔍',
    color: 'bg-gradient-to-br from-slate-600 to-slate-800',
    difficulty: 'beginner',
    estimatedTime: 30,
    features: ['Automated Testing', 'Performance Monitoring', 'Uptime Checks', 'Alert System', 'Report Generation', 'API Documentation'],
    technologies: ['Testing Framework', 'Monitoring Tools', 'Alert Manager', 'Report Engine'],
    useCases: ['API Quality Assurance', 'Performance Testing', 'Uptime Monitoring', 'Regression Testing'],
    author: {
      id: 'author-6',
      name: 'QA Masters',
      avatar: '🧪'
    },
    stats: {
      downloads: 9800,
      rating: 4.9,
      reviews: 203,
      forks: 78
    },
    version: '1.5.3',
    lastUpdated: new Date('2024-09-15'),
    isOfficial: true,
    isFeatured: false,
    isVerified: true,
    template: {
      project: {} as any,
      instructions: 'Set up comprehensive API testing and monitoring...',
      setup: [
        { step: 1, title: 'Configure Tests', description: 'Set up your test suites', type: 'action' },
        { step: 2, title: 'Setup Monitoring', description: 'Configure monitoring endpoints', type: 'action' },
        { step: 3, title: 'Alert Configuration', description: 'Set up alert channels', type: 'action' },
        { step: 4, title: 'Run Tests', description: 'Execute initial test run', type: 'action' }
      ]
    },
    preview: {
      images: ['/templates/testing-preview-1.png'],
      demo: 'https://demo.chickapi.com/testing'
    },
    license: 'MIT',
    sourceUrl: 'https://github.com/qa-masters/api-testing-suite'
  }
]

type SortField = 'name' | 'downloads' | 'rating' | 'updated' | 'difficulty'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState(mockTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [filterOfficial, setFilterOfficial] = useState(false)
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [sortField, setSortField] = useState<SortField>('downloads')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique categories and tags
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    templates.forEach(template => categorySet.add(template.category))
    return Array.from(categorySet).sort()
  }, [templates])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    templates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [templates])

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
      const matchesOfficial = !filterOfficial || template.isOfficial
      const matchesFeatured = !filterFeatured || template.isFeatured
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesOfficial && matchesFeatured
    })

    // Sort templates
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'downloads':
          aValue = a.stats.downloads
          bValue = b.stats.downloads
          break
        case 'rating':
          aValue = a.stats.rating
          bValue = b.stats.rating
          break
        case 'updated':
          aValue = a.lastUpdated.getTime()
          bValue = b.lastUpdated.getTime()
          break
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
          aValue = difficultyOrder[a.difficulty]
          bValue = difficultyOrder[b.difficulty]
          break
        default:
          aValue = a.stats.downloads
          bValue = b.stats.downloads
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [templates, searchQuery, selectedCategory, selectedDifficulty, filterOfficial, filterFeatured, sortField, sortDirection])

  const handleTemplateClick = (template: ProjectTemplate) => {
    // Navigate to template detail or use template
    router.push(`/templates/${template.id}`)
  }

  const handleUseTemplate = (template: ProjectTemplate) => {
    // Create new project from template
    router.push(`/project/new?template=${template.id}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-light text-gray-900 tracking-tight">Template Library</h1>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              </div>
              <p className="text-gray-600 font-medium">
                Discover and use pre-built API workflow templates to accelerate your development
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Create Template
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Documentation
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Banner */}
        <div className="px-8 pb-6">
          <div className="relative overflow-hidden border border-gray-300">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200" />
            
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
            
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">Featured Templates</h2>
                  <p className="text-gray-700 font-medium">
                    Professionally crafted templates to jumpstart your API development
                  </p>
                </div>
                <Button variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100">
                  View All Featured
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="border-gray-300"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 transition-colors ${
                showFilters ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Filters
            </button>

            {/* Sort */}
            <select 
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <option value="downloads">Sort: Downloads</option>
              <option value="rating">Sort: Rating</option>
              <option value="updated">Sort: Recently Updated</option>
              <option value="name">Sort: Name</option>
              <option value="difficulty">Sort: Difficulty</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-1 bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOfficial}
                      onChange={(e) => setFilterOfficial(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Official Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterFeatured}
                      onChange={(e) => setFilterFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Featured Only</span>
                  </label>
                </div>
              </div>

              {/* Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{filteredAndSortedTemplates.length} templates found</div>
                  <div>{categories.length} categories</div>
                  <div>{templates.filter(t => t.isOfficial).length} official</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Category Quick Access */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const count = templates.filter(t => t.category === category).length
              return (
                <div
                  key={category}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900 capitalize text-sm mb-1">
                      {category.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">{count} templates</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Templates Grid/List */}
        {filteredAndSortedTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400 font-medium">
              No Results
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm text-center">
              {searchQuery ? `No templates match "${searchQuery}"` : 'Try adjusting your filters'}
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
              setFilterOfficial(false)
              setFilterFeatured(false)
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredAndSortedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                viewMode={viewMode}
                onClick={() => handleTemplateClick(template)}
                onUseTemplate={() => handleUseTemplate(template)}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Template Card Component
function TemplateCard({ 
  template, 
  viewMode, 
  onClick,
  onUseTemplate,
  getDifficultyColor
}: { 
  template: ProjectTemplate
  viewMode: ViewMode
  onClick: () => void
  onUseTemplate: () => void
  getDifficultyColor: (difficulty: string) => string
}) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer p-4" onClick={onClick}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-lg ${template.color} flex items-center justify-center text-2xl`}>
            {template.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <div className="flex gap-2">
                {template.isOfficial && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Official</span>}
                {template.isVerified && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Verified</span>}
                {template.isFeatured && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">Featured</span>}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-center">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {template.stats.downloads.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">downloads</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {template.stats.rating}
              </div>
              <div className="text-xs text-gray-500">rating</div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
              {template.difficulty}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onUseTemplate()
              }}
            >
              Use
            </button>
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Like
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all cursor-pointer overflow-hidden group" onClick={onClick}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center text-xl`}>
            {template.icon}
          </div>
          
          <div className="flex flex-col gap-1">
            {template.isOfficial && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Official</span>}
            {template.isVerified && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Verified</span>}
            {template.isFeatured && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">Featured</span>}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description}</p>

        {/* Category & Difficulty */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            <span className="capitalize">{template.category.replace('-', ' ')}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-medium">{template.stats.downloads.toLocaleString()}</div>
            <div className="text-xs text-gray-500">downloads</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{template.stats.rating}</div>
            <div className="text-xs text-gray-500">rating</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{template.estimatedTime}min</div>
            <div className="text-xs text-gray-500">setup</div>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <span className="text-lg">{template.author.avatar}</span>
          <span>by {template.author.name}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation()
              onUseTemplate()
            }}
          >
            Use Template
          </button>
          <button className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Like
          </button>
          <button className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Share
          </button>
        </div>
      </div>
    </div>
  )
}