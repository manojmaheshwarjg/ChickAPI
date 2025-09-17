'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Search, Grid3X3, List, Play, Sparkles,
  MoreVertical, Star, Clock, Users, Lightbulb,
  Folder, ChevronRight, Settings, User, LogOut,
  Activity, TrendingUp, Zap, Box, Home, Rocket,
  FileText, Bell, HelpCircle, Command, Target,
  BarChart3, ArrowUp, ArrowDown, Minus, CheckCircle,
  AlertTriangle, Info, ExternalLink, Bookmark,
  GitBranch, Globe, Shield, Code, Database,
  Calendar, Filter, RefreshCw, ArrowRight,
  BookOpen, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Project {
  id: string
  name: string
  description: string
  icon: string
  color: string
  lastModified: string
  workflows: number
  collaborators: number
  status: 'active' | 'idle' | 'archived' | 'development' | 'production'
  favorite: boolean
  metrics: {
    executions: number
    successRate: number
    avgResponseTime: number
    trend: number
  }
  health: {
    score: number
    issues: Array<{
      type: 'warning' | 'error' | 'info'
      message: string
      action?: string
    }>
  }
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: string
  category: 'create' | 'discover' | 'analyze' | 'learn'
}

interface Recommendation {
  id: string
  type: 'optimization' | 'security' | 'feature' | 'template'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  action: string
  icon: React.ReactNode
}

interface Activity {
  id: string
  type: 'project_created' | 'workflow_executed' | 'template_used' | 'error_resolved' | 'milestone_reached'
  title: string
  description: string
  timestamp: Date
  user: string
  projectId?: string
  icon: React.ReactNode
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce API Suite',
    description: 'Complete API workflow for product management, orders, and payments',
    icon: 'EC',
    color: 'bg-gradient-to-br from-gray-700 to-gray-900',
    lastModified: '2 hours ago',
    workflows: 12,
    collaborators: 5,
    status: 'production',
    favorite: true,
    metrics: {
      executions: 1250,
      successRate: 98.5,
      avgResponseTime: 245,
      trend: 15.3
    },
    health: {
      score: 95,
      issues: []
    }
  },
  {
    id: '2',
    name: 'User Authentication Flow',
    description: 'OAuth2, JWT, and session management workflows',
    icon: 'UA',
    color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    lastModified: '1 day ago',
    workflows: 8,
    collaborators: 3,
    status: 'production',
    favorite: true,
    metrics: {
      executions: 890,
      successRate: 99.2,
      avgResponseTime: 120,
      trend: 8.7
    },
    health: {
      score: 98,
      issues: []
    }
  },
  {
    id: '3',
    name: 'Data Analytics Pipeline',
    description: 'ETL workflows for data processing and visualization',
    icon: 'DA',
    color: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
    lastModified: '3 days ago',
    workflows: 15,
    collaborators: 8,
    status: 'development',
    favorite: false,
    metrics: {
      executions: 450,
      successRate: 95.8,
      avgResponseTime: 1850,
      trend: -2.1
    },
    health: {
      score: 82,
      issues: [
        { type: 'warning', message: 'High response time detected', action: 'Optimize queries' },
        { type: 'info', message: 'Consider caching for better performance' }
      ]
    }
  },
  {
    id: '4',
    name: 'Email Marketing Automation',
    description: 'Campaign management and email delivery workflows',
    icon: 'EM',
    color: 'bg-gradient-to-br from-stone-700 to-stone-900',
    lastModified: '1 week ago',
    workflows: 6,
    collaborators: 2,
    status: 'active',
    favorite: false,
    metrics: {
      executions: 320,
      successRate: 97.1,
      avgResponseTime: 380,
      trend: 5.4
    },
    health: {
      score: 91,
      issues: []
    }
  },
  {
    id: '5',
    name: 'Social Media Integration',
    description: 'Multi-platform social media API workflows',
    icon: 'SM',
    color: 'bg-gradient-to-br from-gray-600 to-gray-800',
    lastModified: '2 weeks ago',
    workflows: 10,
    collaborators: 4,
    status: 'active',
    favorite: false,
    metrics: {
      executions: 780,
      successRate: 96.5,
      avgResponseTime: 420,
      trend: 3.2
    },
    health: {
      score: 88,
      issues: [
        { type: 'warning', message: 'API rate limits approaching', action: 'Review quotas' }
      ]
    }
  },
  {
    id: '6',
    name: 'Payment Gateway Hub',
    description: 'Stripe, PayPal, and crypto payment integrations',
    icon: 'PG',
    color: 'bg-gradient-to-br from-slate-600 to-slate-800',
    lastModified: '3 weeks ago',
    workflows: 9,
    collaborators: 6,
    status: 'archived',
    favorite: false,
    metrics: {
      executions: 150,
      successRate: 94.2,
      avgResponseTime: 580,
      trend: -12.5
    },
    health: {
      score: 75,
      issues: [
        { type: 'info', message: 'Project archived - performance baseline maintained', action: 'Reactivate if needed' }
      ]
    }
  }
]

const quickActions: QuickAction[] = [
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Start a new API project from scratch',
    icon: <></>,
    color: 'bg-gray-900',
    action: '/project/new',
    category: 'create'
  },
  {
    id: 'use-template',
    title: 'Use Template',
    description: 'Quick start with pre-built templates',
    icon: <></>,
    color: 'bg-gray-700',
    action: '/templates',
    category: 'create'
  },
  {
    id: 'import-api',
    title: 'Import API',
    description: 'Import from OpenAPI/Swagger spec',
    icon: <></>,
    color: 'bg-gray-800',
    action: '/import',
    category: 'discover'
  },
  {
    id: 'api-discovery',
    title: 'Discover APIs',
    description: 'Explore and reverse engineer APIs',
    icon: <></>,
    color: 'bg-slate-700',
    action: '/discovery',
    category: 'discover'
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Monitor performance and usage',
    icon: <></>,
    color: 'bg-slate-800',
    action: '/analytics',
    category: 'analyze'
  },
  {
    id: 'documentation',
    title: 'Learn & Docs',
    description: 'Tutorials and documentation',
    icon: <></>,
    color: 'bg-gray-600',
    action: '/docs',
    category: 'learn'
  }
]

const smartRecommendations: Recommendation[] = [
  {
    id: 'optimize-pipeline',
    type: 'optimization',
    title: 'Optimize Data Pipeline',
    description: 'Your analytics pipeline is showing high response times. Consider implementing caching.',
    impact: 'high',
    effort: 'medium',
    action: 'View Details',
    icon: <></>
  },
  {
    id: 'security-update',
    type: 'security',
    title: 'Security Update Available',
    description: 'Update authentication flow to use the latest JWT security practices.',
    impact: 'high',
    effort: 'low',
    action: 'Update Now',
    icon: <></>
  },
  {
    id: 'new-template',
    type: 'template',
    title: 'Try GraphQL Template',
    description: 'Based on your usage, you might benefit from our new GraphQL API template.',
    impact: 'medium',
    effort: 'low',
    action: 'Explore Template',
    icon: <></>
  },
  {
    id: 'monitoring-setup',
    type: 'feature',
    title: 'Enable Advanced Monitoring',
    description: 'Set up real-time monitoring and alerts for your production APIs.',
    impact: 'high',
    effort: 'medium',
    action: 'Set Up',
    icon: <></>
  }
]

const recentActivities: Activity[] = [
  {
    id: 'act1',
    type: 'project_created',
    title: 'New project created',
    description: 'Payment Gateway Integration project was created',
    timestamp: new Date('2024-09-15T16:30:00Z'),
    user: 'John Doe',
    projectId: '5',
    icon: <></>
  },
  {
    id: 'act2',
    type: 'workflow_executed',
    title: 'Workflow executed successfully',
    description: 'E-commerce order processing completed 1,234 executions',
    timestamp: new Date('2024-09-15T15:45:00Z'),
    user: 'System',
    projectId: '1',
    icon: <></>
  },
  {
    id: 'act3',
    type: 'template_used',
    title: 'Template applied',
    description: 'REST API Starter template was used for new project',
    timestamp: new Date('2024-09-15T14:20:00Z'),
    user: 'Jane Smith',
    icon: <></>
  },
  {
    id: 'act4',
    type: 'error_resolved',
    title: 'Error resolved',
    description: 'Database connection timeout in Analytics Pipeline fixed',
    timestamp: new Date('2024-09-15T13:15:00Z'),
    user: 'Mike Johnson',
    projectId: '3',
    icon: <></>
  },
  {
    id: 'act5',
    type: 'milestone_reached',
    title: 'Milestone achieved',
    description: 'User Authentication Flow reached 99% uptime',
    timestamp: new Date('2024-09-15T12:00:00Z'),
    user: 'System',
    projectId: '2',
    icon: <></>
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'archived'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const favoriteProjects = filteredProjects.filter(p => p.favorite)
  const recentProjects = filteredProjects.filter(p => !p.favorite)

  const handleProjectClick = (projectId: string) => {
    // Navigate to canvas with project context
    router.push(`/project/${projectId}/canvas`)
  }

  const toggleFavorite = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, favorite: !p.favorite } : p
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-gray-300">
        {/* Top Navigation */}
        <div className="px-8 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo and Brand */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <span className="text-white text-sm font-bold">CA</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">ChickAPI</h1>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Enterprise Platform</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300" />
              
              {/* Navigation */}
              <nav className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-gray-900 font-medium px-4 py-2">
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 px-4 py-2">
                  Projects
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 px-4 py-2">
                  Templates
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 px-4 py-2">
                  Analytics
                </Button>
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Global Search */}
              <div className="relative w-64">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="h-9 bg-gray-50 border-gray-300 focus:bg-white pl-4 pr-16"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1">⌘K</kbd>
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative px-3 py-2">
                <span className="text-sm font-medium text-gray-700">Notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500" />
              </Button>
              
              {/* Help */}
              <Button variant="ghost" size="sm" className="px-3 py-2">
                <span className="text-sm font-medium text-gray-700">Help</span>
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">JD</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">John Doe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@example.com</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/auth/signin')} className="text-red-600">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Enterprise Stats Bar */}
        <div className="px-8 py-6 bg-white">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-4 gap-12">
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-1">{projects.length}</div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {projects.reduce((acc, p) => acc + p.metrics.executions, 0).toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Executions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {(projects.reduce((acc, p) => acc + p.metrics.successRate, 0) / projects.length).toFixed(1)}%
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Success Rate</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-medium"
            >
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-10 bg-gray-50 min-h-screen">
        <div className="max-w-[1400px] mx-auto space-y-10">
          {/* Welcome Section - Enterprise Glass */}
          <div className="relative overflow-hidden h-52 border border-gray-300">
            {/* Subtle monochrome background with depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-200 to-slate-300" />
            
            {/* Floating geometric shapes for depth */}
            <div className="absolute inset-0">
              <div className="absolute top-6 left-12 w-32 h-32 bg-gradient-to-r from-gray-300 to-gray-400 opacity-60 blur-2xl" 
                   style={{animation: 'float 8s ease-in-out infinite'}} />
              <div className="absolute top-12 right-16 w-24 h-24 bg-gradient-to-r from-slate-300 to-slate-400 opacity-50 blur-xl" 
                   style={{animation: 'float 6s ease-in-out infinite 3s'}} />
              <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-gradient-to-r from-zinc-300 to-zinc-400 opacity-40 blur-xl" 
                   style={{animation: 'float 7s ease-in-out infinite 1s'}} />
              <div className="absolute bottom-12 right-8 w-28 h-28 bg-gradient-to-r from-gray-400 to-gray-500 opacity-30 blur-2xl" 
                   style={{animation: 'float 9s ease-in-out infinite 4s'}} />
            </div>
            
            {/* Primary glass surface */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl border-none" />
            
            {/* Secondary frosted glass layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-gray-500/5" />
            
            {/* Subtle inner glow */}
            <div className="absolute inset-px bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            
            <div className="relative z-10 p-10 h-full flex items-center">
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 max-w-2xl">
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">Welcome back</h1>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-400 to-transparent" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Dashboard Overview</p>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-gray-700 text-lg font-normal leading-relaxed">
                      You have <span className="font-semibold text-gray-900">{projects.filter(p => p.status === 'active' || p.status === 'production').length} active projects</span> with <span className="font-semibold text-gray-900">{projects.reduce((acc, p) => acc + p.metrics.executions, 0).toLocaleString()} total executions</span>
                    </p>
                    
                    <div className="flex items-center gap-12">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-700" />
                        <span className="text-sm text-gray-600 font-medium">
                          {(projects.reduce((acc, p) => acc + p.metrics.successRate, 0) / projects.length).toFixed(1)}% Success Rate
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-600" />
                        <span className="text-sm text-gray-600 font-medium">
                          {(projects.reduce((acc, p) => acc + (p.health?.score || 0), 0) / projects.filter(p => p.health).length).toFixed(0)} Avg Health
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative">
                    {/* Enterprise Code Block */}
                    <div className="w-32 h-32 bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-2xl relative overflow-hidden">
                      {/* Inner highlight */}
                      <div className="absolute inset-2 bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <div className="text-2xl font-bold text-gray-700 mb-1">API</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wider">Platform</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-light text-gray-900 tracking-tight">Quick Actions</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <div 
                  key={action.id} 
                  className="border border-gray-300 hover:border-gray-400 transition-all duration-200 cursor-pointer group bg-white hover:bg-gray-50"
                  onClick={() => router.push(action.action)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        {action.category.toUpperCase()}
                      </div>
                      <div className="w-2 h-2 bg-gray-400 group-hover:bg-gray-600 transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-black transition-colors">{action.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">{action.description}</p>
                  </div>
                  <div className="h-1 bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Smart Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-light text-gray-900 tracking-tight">System Recommendations</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              </div>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Configure
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartRecommendations.slice(0, 4).map((rec) => {
                const impactColor = rec.impact === 'high' ? 'bg-red-100 text-red-800 border-red-200' : 
                                   rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'
                const effortColor = rec.effort === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                                   rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'
                return (
                  <div key={rec.id} className="border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                          {rec.type.toUpperCase()}
                        </div>
                        <div className="flex gap-2">
                          <div className={`text-xs px-2 py-1 border ${impactColor} font-medium`}>
                            {rec.impact.toUpperCase()} IMPACT
                          </div>
                          <div className={`text-xs px-2 py-1 border ${effortColor} font-medium`}>
                            {rec.effort.toUpperCase()} EFFORT
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{rec.description}</p>
                      <Button size="sm" variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100">
                        {rec.action}
                      </Button>
                    </div>
                    <div className="h-1 bg-gray-100" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-light text-gray-900 tracking-tight">Recent Projects</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                </div>
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    View All
                  </Button>
                </Link>
              </div>

          {/* Filters and View Controls */}
          <div className="flex items-center justify-between mb-6 bg-white border border-gray-300 p-4">
            <div className="flex items-center gap-6">
              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mr-3">Filter:</span>
                {(['all', 'active', 'idle', 'archived'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`capitalize h-8 px-3 ${
                      filterStatus === status 
                        ? 'bg-gray-900 text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              <div className="h-6 w-px bg-gray-300" />

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Sort:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      Most Recent
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Most Recent</DropdownMenuItem>
                    <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                    <DropdownMenuItem>Most Active</DropdownMenuItem>
                    <DropdownMenuItem>Success Rate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* View Toggle */}
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
              </div>
            </div>
          </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((project) => (
                  <EnhancedProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project.id)}
                    onToggleFavorite={() => toggleFavorite(project.id)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-light text-gray-900 tracking-tight">Recent Activity</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                </div>
                <div className="space-y-3">
                  {recentActivities.slice(0, 6).map((activity) => {
                    const timeAgo = new Date().getTime() - activity.timestamp.getTime()
                    const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60))
                    const displayTime = hoursAgo < 1 ? 'Just now' : 
                                       hoursAgo < 24 ? `${hoursAgo}h ago` : 
                                       `${Math.floor(hoursAgo / 24)}d ago`
                    
                    return (
                      <div key={activity.id} className="border-l-2 border-gray-300 pl-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                            {activity.type.replace('_', ' ')}
                          </div>
                          <div className="w-1 h-1 bg-gray-400" />
                          <span className="text-xs text-gray-500">{displayTime}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{activity.title}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{activity.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          by {activity.user}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50">
                  View All Activity
                </Button>
              </div>

              {/* System Health */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-light text-gray-900 tracking-tight">System Status</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                </div>
                <div className="space-y-3">
                  <div className="border border-green-300 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-green-700 font-medium mb-1">OPERATIONAL</div>
                        <span className="text-sm font-medium text-gray-900">All Systems Running</span>
                      </div>
                      <span className="text-lg font-light text-green-700">99.9%</span>
                    </div>
                  </div>
                  <div className="border border-gray-300 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-600 font-medium mb-1">RESPONSE</div>
                        <span className="text-sm text-gray-900">Average Response Time</span>
                      </div>
                      <span className="text-lg font-light text-gray-700">245ms</span>
                    </div>
                  </div>
                  <div className="border border-gray-300 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-600 font-medium mb-1">USERS</div>
                        <span className="text-sm text-gray-900">Currently Active</span>
                      </div>
                      <span className="text-lg font-light text-gray-700">8,943</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

// Create Project Modal Component
function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  
  const templates = [
    { id: 'blank', name: 'Blank Project', description: 'Start from scratch', icon: '📋' },
    { id: 'rest-api', name: 'REST API', description: 'RESTful API template', icon: '🌐' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Online store API', icon: '🛒' },
    { id: 'auth', name: 'Authentication', description: 'User auth system', icon: '🔐' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim()) {
      // In a real app, this would create the project
      console.log('Creating project:', { projectName, projectDescription, selectedTemplate })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <Input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome API"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Describe your project..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{template.icon}</span>
                      <span className="font-medium text-sm text-gray-900">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <Button type="submit" className="flex-1">
              Create Project
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Enhanced Project Card Component
function EnhancedProjectCard({ 
  project, 
  onClick, 
  onToggleFavorite 
}: { 
  project: Project
  onClick: () => void
  onToggleFavorite: () => void
}) {
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'production': return { color: 'bg-green-600', label: 'PRODUCTION', textColor: 'text-green-800 bg-green-100 border-green-200' }
      case 'development': return { color: 'bg-blue-600', label: 'DEVELOPMENT', textColor: 'text-blue-800 bg-blue-100 border-blue-200' }
      case 'active': return { color: 'bg-emerald-600', label: 'ACTIVE', textColor: 'text-emerald-800 bg-emerald-100 border-emerald-200' }
      case 'idle': return { color: 'bg-yellow-600', label: 'IDLE', textColor: 'text-yellow-800 bg-yellow-100 border-yellow-200' }
      case 'archived': return { color: 'bg-gray-600', label: 'ARCHIVED', textColor: 'text-gray-800 bg-gray-100 border-gray-200' }
      default: return { color: 'bg-gray-500', label: status.toUpperCase(), textColor: 'text-gray-800 bg-gray-100 border-gray-200' }
    }
  }

  const getTrendIndicator = (trend: number) => {
    if (trend > 0) return { symbol: '▲', color: 'text-green-600' }
    if (trend < 0) return { symbol: '▼', color: 'text-red-600' }
    return { symbol: '■', color: 'text-gray-400' }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'border-green-300 bg-green-50'
    if (score >= 75) return 'border-yellow-300 bg-yellow-50'
    return 'border-red-300 bg-red-50'
  }

  const status = getStatusConfig(project.status)
  const trend = getTrendIndicator(project.metrics.trend)

  return (
    <div className="border border-gray-300 hover:border-gray-400 transition-all duration-300 cursor-pointer group bg-white hover:bg-gray-50" onClick={onClick}>
      {/* Status Bar */}
      <div className={`h-1 ${status.color}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 ${project.color} flex items-center justify-center text-white font-bold text-lg`}>
              {project.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`text-xs px-2 py-1 border font-medium ${status.textColor}`}>
                  {status.label}
                </div>
                {project.favorite && (
                  <div className="text-xs px-2 py-1 bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                    STARRED
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            {project.favorite ? 'Unstar' : 'Star'}
          </Button>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{project.description}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-light text-gray-900">{project.workflows}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Workflows</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-light text-gray-900">{project.metrics.executions.toLocaleString()}</span>
              <span className={`text-xs ${trend.color}`}>{trend.symbol}</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Executions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-gray-900">{project.metrics.successRate}%</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Success</div>
          </div>
        </div>

        {/* Health Score */}
        <div className={`border p-3 mb-4 ${getHealthColor(project.health.score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">
                System Health: {project.health.score}/100
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Avg Response: {project.metrics.avgResponseTime}ms
            </div>
          </div>
        </div>

        {/* Health Issues */}
        {project.health.issues.length > 0 && (
          <div className="mb-4 space-y-2">
            {project.health.issues.slice(0, 2).map((issue, index) => (
              <div key={index} className="text-xs text-gray-600 border-l-2 border-gray-300 pl-3">
                <span className="font-medium uppercase tracking-wider">{issue.type}:</span> {issue.message}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <span className="font-medium">{project.collaborators}</span> collaborators
          </div>
          <div className="text-xs text-gray-500">
            Updated {project.lastModified}
          </div>
        </div>
      </div>
    </div>
  )
}

