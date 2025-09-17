'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Project, ProjectStatus } from '@/lib/types/project'

// Enhanced mock data with comprehensive project details
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce API Suite',
    description: 'Complete API workflow for product management, orders, and payments with microservices architecture',
    icon: 'EC',
    color: 'bg-gradient-to-br from-gray-700 to-gray-900',
    tags: ['ecommerce', 'microservices', 'payments', 'rest-api'],
    status: 'production' as ProjectStatus,
    visibility: 'team',
    collections: [],
    workflows: [],
    environments: [],
    owner: 'user-1',
    team: [],
    permissions: [],
    version: '2.1.0',
    versions: [],
    integrations: [],
    settings: {} as any,
    metrics: {
      totalExecutions: 15420,
      successRate: 98.5,
      avgResponseTime: 245,
      errorRate: 1.5,
      uptime: 99.8,
      topErrors: [],
      performanceTrends: [],
      usage: { daily: 850, weekly: 5200, monthly: 18500 }
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-09-14'),
    createdBy: 'user-1',
    lastModifiedBy: 'user-2',
    lastAccessed: new Date('2024-09-15'),
    insights: {
      suggestions: [],
      health_score: 95,
      complexity_score: 78,
      maintainability_score: 88
    }
  },
  {
    id: '2',
    name: 'User Authentication & Authorization',
    description: 'OAuth2, JWT, RBAC, and session management with multi-factor authentication',
    icon: 'UA',
    color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    tags: ['auth', 'security', 'oauth2', 'jwt', 'rbac'],
    status: 'production' as ProjectStatus,
    visibility: 'private',
    collections: [],
    workflows: [],
    environments: [],
    owner: 'user-1',
    team: [],
    permissions: [],
    version: '3.0.2',
    versions: [],
    integrations: [],
    settings: {} as any,
    metrics: {
      totalExecutions: 8920,
      successRate: 99.2,
      avgResponseTime: 120,
      errorRate: 0.8,
      uptime: 99.9,
      topErrors: [],
      performanceTrends: [],
      usage: { daily: 450, weekly: 3100, monthly: 12800 }
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-09-13'),
    createdBy: 'user-1',
    lastModifiedBy: 'user-1',
    lastAccessed: new Date('2024-09-15'),
    insights: {
      suggestions: [],
      health_score: 98,
      complexity_score: 65,
      maintainability_score: 92
    }
  },
  {
    id: '3',
    name: 'Data Analytics Pipeline',
    description: 'ETL workflows for data processing, transformation, and real-time visualization',
    icon: 'DA',
    color: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
    tags: ['analytics', 'etl', 'data-processing', 'real-time'],
    status: 'development' as ProjectStatus,
    visibility: 'team',
    collections: [],
    workflows: [],
    environments: [],
    owner: 'user-2',
    team: [],
    permissions: [],
    version: '1.5.0',
    versions: [],
    integrations: [],
    settings: {} as any,
    metrics: {
      totalExecutions: 4520,
      successRate: 95.8,
      avgResponseTime: 1850,
      errorRate: 4.2,
      uptime: 97.5,
      topErrors: [],
      performanceTrends: [],
      usage: { daily: 220, weekly: 1450, monthly: 5800 }
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-09-15'),
    createdBy: 'user-2',
    lastModifiedBy: 'user-3',
    lastAccessed: new Date('2024-09-15'),
    insights: {
      suggestions: [],
      health_score: 82,
      complexity_score: 89,
      maintainability_score: 75
    }
  },
  {
    id: '4',
    name: 'Email Marketing Automation',
    description: 'Campaign management, email delivery, and customer journey automation',
    icon: 'EM',
    color: 'bg-gradient-to-br from-stone-700 to-stone-900',
    tags: ['marketing', 'automation', 'email', 'campaigns'],
    status: 'active' as ProjectStatus,
    visibility: 'public',
    collections: [],
    workflows: [],
    environments: [],
    owner: 'user-3',
    team: [],
    permissions: [],
    version: '2.3.1',
    versions: [],
    integrations: [],
    settings: {} as any,
    metrics: {
      totalExecutions: 3280,
      successRate: 97.1,
      avgResponseTime: 380,
      errorRate: 2.9,
      uptime: 98.2,
      topErrors: [],
      performanceTrends: [],
      usage: { daily: 180, weekly: 980, monthly: 4200 }
    },
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-09-10'),
    createdBy: 'user-3',
    lastModifiedBy: 'user-3',
    lastAccessed: new Date('2024-09-12'),
    insights: {
      suggestions: [],
      health_score: 91,
      complexity_score: 56,
      maintainability_score: 85
    }
  },
  {
    id: '5',
    name: 'Payment Gateway Hub',
    description: 'Stripe, PayPal, crypto payments with fraud detection and reconciliation',
    icon: 'PG',
    color: 'bg-gradient-to-br from-gray-600 to-gray-800',
    tags: ['payments', 'fintech', 'stripe', 'paypal', 'crypto'],
    status: 'archived' as ProjectStatus,
    visibility: 'private',
    collections: [],
    workflows: [],
    environments: [],
    owner: 'user-1',
    team: [],
    permissions: [],
    version: '1.8.5',
    versions: [],
    integrations: [],
    settings: {} as any,
    metrics: {
      totalExecutions: 1150,
      successRate: 94.2,
      avgResponseTime: 580,
      errorRate: 5.8,
      uptime: 95.1,
      topErrors: [],
      performanceTrends: [],
      usage: { daily: 0, weekly: 0, monthly: 25 }
    },
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-07-15'),
    createdBy: 'user-1',
    lastModifiedBy: 'user-1',
    lastAccessed: new Date('2024-08-20'),
    insights: {
      suggestions: [],
      health_score: 76,
      complexity_score: 82,
      maintainability_score: 68
    }
  }
]

type SortField = 'name' | 'updated' | 'created' | 'status' | 'executions' | 'success-rate' | 'health'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'grid' | 'list' | 'table'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState(mockProjects)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all')
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'private' | 'team' | 'public'>('all')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('updated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique tags from all projects
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    projects.forEach(project => {
      project.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [projects])

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus
      const matchesVisibility = filterVisibility === 'all' || project.visibility === filterVisibility
      const matchesTags = filterTags.length === 0 || filterTags.some(tag => project.tags.includes(tag))
      
      return matchesSearch && matchesStatus && matchesVisibility && matchesTags
    })

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'updated':
          aValue = a.updatedAt.getTime()
          bValue = b.updatedAt.getTime()
          break
        case 'created':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'executions':
          aValue = a.metrics.totalExecutions
          bValue = b.metrics.totalExecutions
          break
        case 'success-rate':
          aValue = a.metrics.successRate
          bValue = b.metrics.successRate
          break
        case 'health':
          aValue = a.insights?.health_score || 0
          bValue = b.insights?.health_score || 0
          break
        default:
          aValue = a.updatedAt.getTime()
          bValue = b.updatedAt.getTime()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [projects, searchQuery, filterStatus, filterVisibility, filterTags, sortField, sortDirection])

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  const handleSelectProject = (projectId: string, selected: boolean) => {
    const newSelection = new Set(selectedProjects)
    if (selected) {
      newSelection.add(projectId)
    } else {
      newSelection.delete(projectId)
    }
    setSelectedProjects(newSelection)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProjects(new Set(filteredAndSortedProjects.map(p => p.id)))
    } else {
      setSelectedProjects(new Set())
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on projects:`, Array.from(selectedProjects))
    // Implement bulk actions
    setSelectedProjects(new Set())
  }

  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case 'production':
        return { color: 'bg-green-600', label: 'PRODUCTION', textColor: 'text-green-800 bg-green-100 border-green-200' }
      case 'development':
        return { color: 'bg-blue-600', label: 'DEVELOPMENT', textColor: 'text-blue-800 bg-blue-100 border-blue-200' }
      case 'active':
        return { color: 'bg-emerald-600', label: 'ACTIVE', textColor: 'text-emerald-800 bg-emerald-100 border-emerald-200' }
      case 'idle':
        return { color: 'bg-yellow-600', label: 'IDLE', textColor: 'text-yellow-800 bg-yellow-100 border-yellow-200' }
      case 'archived':
        return { color: 'bg-gray-600', label: 'ARCHIVED', textColor: 'text-gray-800 bg-gray-100 border-gray-200' }
      default:
        return { color: 'bg-gray-500', label: status.toUpperCase(), textColor: 'text-gray-800 bg-gray-100 border-gray-200' }
    }
  }

  const getVisibilityConfig = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return { label: 'PUBLIC', color: 'text-green-800 bg-green-100 border-green-200' }
      case 'team':
        return { label: 'TEAM', color: 'text-blue-800 bg-blue-100 border-blue-200' }
      case 'private':
        return { label: 'PRIVATE', color: 'text-gray-800 bg-gray-100 border-gray-200' }
      default:
        return { label: visibility.toUpperCase(), color: 'text-gray-800 bg-gray-100 border-gray-200' }
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 75) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-light text-gray-900 tracking-tight">Projects</h1>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              </div>
              <p className="text-gray-600 font-medium">
                Manage and monitor your API development projects
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Import
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Export
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-medium">
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Controls */}
      <div className="px-8 py-6 bg-white border-b border-gray-300">
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="h-10 bg-gray-50 border-gray-300 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-gray-300 ${showFilters ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Filters
            </Button>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Sort:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    {sortField.charAt(0).toUpperCase() + sortField.slice(1).replace('-', ' ')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    { value: 'name', label: 'Name' },
                    { value: 'updated', label: 'Last Updated' },
                    { value: 'created', label: 'Created' },
                    { value: 'status', label: 'Status' },
                    { value: 'executions', label: 'Executions' },
                    { value: 'success-rate', label: 'Success Rate' },
                    { value: 'health', label: 'Health Score' }
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortField(option.value as SortField)}
                      className="justify-between"
                    >
                      {option.label}
                      {sortField === option.value && (
                        <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">View:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
                >
                  Table
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'production', 'development', 'active', 'idle', 'archived'].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus(status as any)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Visibility Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'private', 'team', 'public'].map((visibility) => (
                    <Button
                      key={visibility}
                      variant={filterVisibility === visibility ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setFilterVisibility(visibility as any)}
                      className="capitalize"
                    >
                      {visibility}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={filterTags.includes(tag) ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (filterTags.includes(tag)) {
                          setFilterTags(filterTags.filter(t => t !== tag))
                        } else {
                          setFilterTags([...filterTags, tag])
                        }
                      }}
                      className="text-xs"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProjects.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProjects(new Set())}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{projects.length}</div>
                <div className="text-sm text-gray-500">Total Projects</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {projects.filter(p => ['production', 'active'].includes(p.status)).length}
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {projects.reduce((acc, p) => acc + p.metrics.totalExecutions, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Executions</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {(projects.reduce((acc, p) => acc + p.metrics.successRate, 0) / projects.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Avg Success Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Projects Grid/List/Table */}
        {filteredAndSortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Box className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm text-center">
              {searchQuery ? `No projects match "${searchQuery}"` : 'Create your first project to get started'}
            </p>
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <ProjectTable
            projects={filteredAndSortedProjects}
            selectedProjects={selectedProjects}
            onSelectProject={handleSelectProject}
            onSelectAll={handleSelectAll}
            onProjectClick={handleProjectClick}
            getStatusConfig={getStatusConfig}
            getVisibilityConfig={getVisibilityConfig}
            getHealthColor={getHealthColor}
          />
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredAndSortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
                isSelected={selectedProjects.has(project.id)}
                onSelect={(selected) => handleSelectProject(project.id, selected)}
                onClick={() => handleProjectClick(project.id)}
                getStatusConfig={getStatusConfig}
                getVisibilityConfig={getVisibilityConfig}
                getHealthColor={getHealthColor}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Project Card Component
function ProjectCard({ 
  project, 
  viewMode, 
  isSelected,
  onSelect,
  onClick, 
  getStatusConfig,
  getVisibilityConfig,
  getHealthColor
}: { 
  project: Project
  viewMode: ViewMode
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onClick: () => void
  getStatusConfig: (status: ProjectStatus) => any
  getVisibilityConfig: (visibility: string) => any
  getHealthColor: (score: number) => string
}) {
  const status = getStatusConfig(project.status)
  const visibility = getVisibilityConfig(project.visibility)
  const StatusIcon = status.icon
  const VisibilityIcon = visibility.icon
  const healthScore = project.insights?.health_score || 0

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all cursor-pointer p-4" onClick={onClick}>
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className={`w-12 h-12 rounded-lg ${project.color} flex items-center justify-center text-white font-semibold`}>
            {project.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <VisibilityIcon className={`w-3 h-3 ${visibility.color}`} />
            </div>
            <p className="text-sm text-gray-500">{project.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {project.metrics.totalExecutions.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">executions</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {project.metrics.successRate}%
              </div>
              <div className="text-xs text-gray-500">success</div>
            </div>
            <div>
              <div className={`text-lg font-semibold px-2 py-1 rounded ${getHealthColor(healthScore)}`}>
                {healthScore}
              </div>
              <div className="text-xs text-gray-500">health</div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer overflow-hidden group" onClick={onClick}>
      {/* Status Bar */}
      <div className={`h-1 ${status.color}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <div className={`w-12 h-12 rounded-lg ${project.color} flex items-center justify-center text-white font-semibold`}>
              {project.icon}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <VisibilityIcon className={`w-4 h-4 ${visibility.color}`} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-sm font-semibold text-gray-900">
              {project.metrics.totalExecutions.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">executions</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-sm font-semibold text-gray-900">
              {project.metrics.successRate}%
            </div>
            <div className="text-xs text-gray-500">success</div>
          </div>
        </div>

        {/* Health Score */}
        <div className={`flex items-center justify-between p-2 rounded-lg ${getHealthColor(healthScore)}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Health: {healthScore}/100
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <StatusIcon className="w-3 h-3" />
            <span>{status.label}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{project.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Project Table Component
function ProjectTable({
  projects,
  selectedProjects,
  onSelectProject,
  onSelectAll,
  onProjectClick,
  getStatusConfig,
  getVisibilityConfig,
  getHealthColor
}: {
  projects: Project[]
  selectedProjects: Set<string>
  onSelectProject: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onProjectClick: (id: string) => void
  getStatusConfig: (status: ProjectStatus) => any
  getVisibilityConfig: (visibility: string) => any
  getHealthColor: (score: number) => string
}) {
  const allSelected = projects.length > 0 && projects.every(p => selectedProjects.has(p.id))
  const someSelected = projects.some(p => selectedProjects.has(p.id))

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected
                  }}
                  onCheckedChange={onSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Executions
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => {
              const status = getStatusConfig(project.status)
              const visibility = getVisibilityConfig(project.visibility)
              const StatusIcon = status.icon
              const VisibilityIcon = visibility.icon
              const healthScore = project.insights?.health_score || 0

              return (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onProjectClick(project.id)}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedProjects.has(project.id)}
                      onCheckedChange={(checked) => onSelectProject(project.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${project.color} flex items-center justify-center text-white font-semibold text-sm`}>
                        {project.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.version}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      <span className="text-sm text-gray-900">{status.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <VisibilityIcon className={`w-4 h-4 ${visibility.color}`} />
                      <span className="text-sm text-gray-900">{visibility.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {project.metrics.totalExecutions.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {project.metrics.successRate}%
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getHealthColor(healthScore)}`}>
                      {healthScore}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {project.updatedAt.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}