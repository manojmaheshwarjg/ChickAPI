'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Environment {
  id: string
  name: string
  type: 'development' | 'staging' | 'production' | 'testing'
  description: string
  url: string
  status: 'active' | 'inactive' | 'maintenance'
  lastDeployed: Date
  deployedBy: string
  variables: EnvironmentVariable[]
  health: {
    score: number
    uptime: string
    responseTime: string
    lastCheck: Date
  }
  deployments: {
    total: number
    successful: number
    failed: number
    lastResult: 'success' | 'failure' | 'pending'
  }
}

interface EnvironmentVariable {
  id: string
  key: string
  value?: string
  isSecret: boolean
  description?: string
  lastUpdated: Date
  updatedBy: string
}

interface Integration {
  id: string
  name: string
  type: 'authentication' | 'database' | 'messaging' | 'payment' | 'analytics' | 'storage' | 'notification'
  provider: string
  icon: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  connectionDate: Date
  lastSync: Date
  configuration: Record<string, any>
  endpoints?: string[]
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: Date
    responseTime?: number
  }
  usage: {
    requestsToday: number
    requestsThisMonth: number
    errorRate: number
  }
}

interface Secret {
  id: string
  name: string
  type: 'api_key' | 'password' | 'certificate' | 'token' | 'connection_string'
  description: string
  environments: string[]
  lastUpdated: Date
  updatedBy: string
  expiresAt?: Date
  isExpired: boolean
  usageCount: number
}

interface DeploymentPipeline {
  id: string
  name: string
  description: string
  source: {
    type: 'git' | 'manual'
    repository?: string
    branch?: string
  }
  stages: Array<{
    name: string
    environment: string
    status: 'pending' | 'running' | 'success' | 'failure' | 'skipped'
    duration?: number
  }>
  lastRun: Date
  status: 'idle' | 'running' | 'success' | 'failure'
  totalRuns: number
  successRate: number
}

const mockEnvironments: Environment[] = [
  {
    id: '1',
    name: 'Production',
    type: 'production',
    description: 'Live production environment serving customers',
    url: 'https://api.chickapi.com',
    status: 'active',
    lastDeployed: new Date('2024-09-15T10:30:00Z'),
    deployedBy: 'John Doe',
    variables: [
      {
        id: 'v1',
        key: 'DATABASE_URL',
        isSecret: true,
        description: 'Primary database connection',
        lastUpdated: new Date('2024-09-10T14:20:00Z'),
        updatedBy: 'John Doe'
      },
      {
        id: 'v2',
        key: 'API_BASE_URL',
        value: 'https://api.chickapi.com/v1',
        isSecret: false,
        description: 'Base URL for API endpoints',
        lastUpdated: new Date('2024-09-12T09:15:00Z'),
        updatedBy: 'Jane Smith'
      }
    ],
    health: {
      score: 98,
      uptime: '99.9%',
      responseTime: '145ms',
      lastCheck: new Date('2024-09-15T14:45:00Z')
    },
    deployments: {
      total: 45,
      successful: 44,
      failed: 1,
      lastResult: 'success'
    }
  },
  {
    id: '2',
    name: 'Staging',
    type: 'staging',
    description: 'Pre-production environment for testing',
    url: 'https://staging.chickapi.com',
    status: 'active',
    lastDeployed: new Date('2024-09-15T13:45:00Z'),
    deployedBy: 'Mike Johnson',
    variables: [
      {
        id: 'v3',
        key: 'DATABASE_URL',
        isSecret: true,
        description: 'Staging database connection',
        lastUpdated: new Date('2024-09-14T11:30:00Z'),
        updatedBy: 'Mike Johnson'
      }
    ],
    health: {
      score: 95,
      uptime: '99.5%',
      responseTime: '180ms',
      lastCheck: new Date('2024-09-15T14:44:00Z')
    },
    deployments: {
      total: 78,
      successful: 75,
      failed: 3,
      lastResult: 'success'
    }
  },
  {
    id: '3',
    name: 'Development',
    type: 'development',
    description: 'Development environment for active development',
    url: 'https://dev.chickapi.com',
    status: 'maintenance',
    lastDeployed: new Date('2024-09-15T12:15:00Z'),
    deployedBy: 'Sarah Wilson',
    variables: [
      {
        id: 'v4',
        key: 'DEBUG_MODE',
        value: 'true',
        isSecret: false,
        description: 'Enable debug logging',
        lastUpdated: new Date('2024-09-15T08:00:00Z'),
        updatedBy: 'Sarah Wilson'
      }
    ],
    health: {
      score: 78,
      uptime: '95.2%',
      responseTime: '320ms',
      lastCheck: new Date('2024-09-15T14:40:00Z')
    },
    deployments: {
      total: 156,
      successful: 142,
      failed: 14,
      lastResult: 'failure'
    }
  }
]

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Stripe Payment',
    type: 'payment',
    provider: 'Stripe',
    icon: '💳',
    description: 'Payment processing and subscription management',
    status: 'connected',
    connectionDate: new Date('2024-08-20T10:00:00Z'),
    lastSync: new Date('2024-09-15T14:30:00Z'),
    configuration: {
      publishableKey: 'pk_live_****',
      webhookEndpoint: 'https://api.chickapi.com/webhooks/stripe'
    },
    endpoints: ['/payments', '/subscriptions', '/webhooks/stripe'],
    health: {
      status: 'healthy',
      lastCheck: new Date('2024-09-15T14:30:00Z'),
      responseTime: 125
    },
    usage: {
      requestsToday: 1247,
      requestsThisMonth: 45623,
      errorRate: 0.2
    }
  },
  {
    id: '2',
    name: 'MongoDB Atlas',
    type: 'database',
    provider: 'MongoDB',
    icon: '🍃',
    description: 'Primary database for application data',
    status: 'connected',
    connectionDate: new Date('2024-07-15T09:30:00Z'),
    lastSync: new Date('2024-09-15T14:35:00Z'),
    configuration: {
      cluster: 'chickapi-cluster',
      database: 'production',
      ssl: true
    },
    health: {
      status: 'healthy',
      lastCheck: new Date('2024-09-15T14:35:00Z'),
      responseTime: 45
    },
    usage: {
      requestsToday: 5634,
      requestsThisMonth: 187532,
      errorRate: 0.1
    }
  },
  {
    id: '3',
    name: 'SendGrid Email',
    type: 'notification',
    provider: 'SendGrid',
    icon: '📧',
    description: 'Email delivery and marketing automation',
    status: 'error',
    connectionDate: new Date('2024-08-01T14:20:00Z'),
    lastSync: new Date('2024-09-15T10:15:00Z'),
    configuration: {
      apiKey: 'SG.****',
      fromEmail: 'noreply@chickapi.com'
    },
    endpoints: ['/email/send', '/email/templates'],
    health: {
      status: 'degraded',
      lastCheck: new Date('2024-09-15T14:25:00Z'),
      responseTime: 2340
    },
    usage: {
      requestsToday: 234,
      requestsThisMonth: 8945,
      errorRate: 12.5
    }
  }
]

const mockSecrets: Secret[] = [
  {
    id: '1',
    name: 'STRIPE_SECRET_KEY',
    type: 'api_key',
    description: 'Stripe secret key for payment processing',
    environments: ['production', 'staging'],
    lastUpdated: new Date('2024-08-20T10:00:00Z'),
    updatedBy: 'John Doe',
    expiresAt: new Date('2024-12-31T23:59:59Z'),
    isExpired: false,
    usageCount: 1247
  },
  {
    id: '2',
    name: 'DATABASE_PASSWORD',
    type: 'password',
    description: 'MongoDB Atlas database password',
    environments: ['production', 'staging', 'development'],
    lastUpdated: new Date('2024-07-15T09:30:00Z'),
    updatedBy: 'John Doe',
    expiresAt: new Date('2025-07-15T09:30:00Z'),
    isExpired: false,
    usageCount: 5634
  },
  {
    id: '3',
    name: 'JWT_SECRET',
    type: 'token',
    description: 'JSON Web Token signing secret',
    environments: ['production', 'staging'],
    lastUpdated: new Date('2024-06-01T15:45:00Z'),
    updatedBy: 'Jane Smith',
    expiresAt: new Date('2024-10-01T15:45:00Z'),
    isExpired: true,
    usageCount: 23456
  }
]

const mockPipelines: DeploymentPipeline[] = [
  {
    id: '1',
    name: 'Production Deployment',
    description: 'Automated deployment pipeline for production releases',
    source: {
      type: 'git',
      repository: 'github.com/company/chickapi',
      branch: 'main'
    },
    stages: [
      { name: 'Build', environment: 'ci', status: 'success', duration: 120 },
      { name: 'Test', environment: 'ci', status: 'success', duration: 180 },
      { name: 'Deploy to Staging', environment: 'staging', status: 'success', duration: 90 },
      { name: 'Deploy to Production', environment: 'production', status: 'success', duration: 150 }
    ],
    lastRun: new Date('2024-09-15T10:30:00Z'),
    status: 'success',
    totalRuns: 45,
    successRate: 97.8
  },
  {
    id: '2',
    name: 'Feature Branch Testing',
    description: 'Continuous integration for feature branches',
    source: {
      type: 'git',
      repository: 'github.com/company/chickapi',
      branch: 'feature/*'
    },
    stages: [
      { name: 'Build', environment: 'ci', status: 'running', duration: 85 },
      { name: 'Test', environment: 'ci', status: 'pending' },
      { name: 'Deploy to Dev', environment: 'development', status: 'pending' }
    ],
    lastRun: new Date('2024-09-15T14:20:00Z'),
    status: 'running',
    totalRuns: 234,
    successRate: 89.2
  }
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'environments' | 'integrations' | 'secrets' | 'pipelines'>('environments')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'healthy':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'inactive':
      case 'disconnected':
      case 'pending':
      case 'running':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
      case 'error':
      case 'unhealthy':
      case 'failure':
        return 'bg-red-100 text-red-800'
      case 'degraded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnvironmentTypeColor = (type: string) => {
    switch (type) {
      case 'production':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'testing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                  INT
                </div>
                <div>
                  <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                    Integrations & Environments
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Manage environments, external integrations, secrets, and deployment pipelines
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                Sync All
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-black border border-black hover:bg-gray-800 transition-colors">
                Add Integration
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex items-center gap-1 border-b border-gray-300">
            {[
              { id: 'environments', label: 'Environments' },
              { id: 'integrations', label: 'Integrations' },
              { id: 'secrets', label: 'Secrets' },
              { id: 'pipelines', label: 'Pipelines' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-black text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {selectedTab === 'environments' && (
            <EnvironmentsTab
              environments={mockEnvironments}
              getStatusColor={getStatusColor}
              getEnvironmentTypeColor={getEnvironmentTypeColor}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {selectedTab === 'integrations' && (
            <IntegrationsTab
              integrations={mockIntegrations}
              getStatusColor={getStatusColor}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {selectedTab === 'secrets' && (
            <SecretsTab
              secrets={mockSecrets}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {selectedTab === 'pipelines' && (
            <PipelinesTab
              pipelines={mockPipelines}
              getStatusColor={getStatusColor}
              formatTimeAgo={formatTimeAgo}
            />
          )}
        </div>
      </main>
    </div>
  )
}

// Environments Tab Component
function EnvironmentsTab({ environments, getStatusColor, getEnvironmentTypeColor, formatTimeAgo }: any) {
  return (
    <div className="space-y-6">
      {/* Environment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {environments.map((env: Environment) => (
          <Card key={env.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                  <Badge className={`text-xs ${getEnvironmentTypeColor(env.type)}`}>
                    {env.type}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(env.status)}`}>
                    {env.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{env.description}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <External className="w-3 h-3" />
                  {env.url}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Deploy
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Environment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{env.health.score}%</div>
                <div className="text-xs text-gray-500">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{env.health.uptime}</div>
                <div className="text-xs text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{env.health.responseTime}</div>
                <div className="text-xs text-gray-500">Response Time</div>
              </div>
            </div>

            {/* Deployment Info */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last deployed</span>
                <span className="font-medium text-gray-900">{formatTimeAgo(env.lastDeployed)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">By</span>
                <span className="text-gray-900">{env.deployedBy}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Success Rate</span>
                <span className="text-gray-900">
                  {((env.deployments.successful / env.deployments.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Variables</span>
                <span className="text-xs text-gray-500">{env.variables.length} vars</span>
              </div>
              <div className="space-y-1">
                {env.variables.slice(0, 2).map((variable) => (
                  <div key={variable.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <span className="font-mono text-gray-700">{variable.key}</span>
                    <div className="flex items-center gap-1">
                      {variable.isSecret ? (
                        <Lock className="w-3 h-3 text-red-500" />
                      ) : (
                        <Unlock className="w-3 h-3 text-green-500" />
                      )}
                      {!variable.isSecret && variable.value && (
                        <span className="text-gray-600 truncate max-w-24">{variable.value}</span>
                      )}
                    </div>
                  </div>
                ))}
                {env.variables.length > 2 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{env.variables.length - 2} more variables
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Environment Button */}
      <Card className="p-8 border-dashed border-gray-300 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add New Environment</h3>
            <p className="text-sm text-gray-500 mt-1">Create a new deployment environment</p>
          </div>
          <Button variant="outline">Create Environment</Button>
        </div>
      </Card>
    </div>
  )
}

// Integrations Tab Component
function IntegrationsTab({ integrations, getStatusColor, formatTimeAgo }: any) {
  const getIntegrationTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳'
      case 'database': return '🗄️'
      case 'messaging': return '💬'
      case 'authentication': return '🔐'
      case 'analytics': return '📊'
      case 'storage': return '📦'
      case 'notification': return '📧'
      default: return '🔌'
    }
  }

  return (
    <div className="space-y-6">
      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration: Integration) => (
          <Card key={integration.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <Badge className={`text-xs ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getIntegrationTypeIcon(integration.type)} {integration.type}
                    </Badge>
                    <span className="text-xs text-gray-500">by {integration.provider}</span>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test Connection
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="w-4 h-4 mr-2" />
                    View Logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Health and Usage Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    integration.health.status === 'healthy' ? 'bg-green-500' :
                    integration.health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {integration.health.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Health</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {integration.usage.requestsToday.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Requests Today</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {integration.usage.errorRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Error Rate</div>
              </div>
            </div>

            {/* Connection Info */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Connected</span>
                <span className="font-medium text-gray-900">{formatTimeAgo(integration.connectionDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Last sync</span>
                <span className="text-gray-900">{formatTimeAgo(integration.lastSync)}</span>
              </div>
              {integration.health.responseTime && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Response time</span>
                  <span className="text-gray-900">{integration.health.responseTime}ms</span>
                </div>
              )}
            </div>

            {/* Endpoints */}
            {integration.endpoints && integration.endpoints.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Endpoints</div>
                <div className="space-y-1">
                  {integration.endpoints.slice(0, 2).map((endpoint, index) => (
                    <div key={index} className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                      {endpoint}
                    </div>
                  ))}
                  {integration.endpoints.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{integration.endpoints.length - 2} more endpoints
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'AWS S3', icon: '☁️', type: 'storage' },
            { name: 'Slack', icon: '💬', type: 'messaging' },
            { name: 'GitHub', icon: '🐙', type: 'version control' },
            { name: 'Datadog', icon: '📊', type: 'monitoring' },
            { name: 'Auth0', icon: '🔐', type: 'authentication' },
            { name: 'Twilio', icon: '📱', type: 'communication' }
          ].map((service) => (
            <Card key={service.name} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">{service.icon}</div>
              <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{service.type}</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                Connect
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Secrets Tab Component
function SecretsTab({ secrets, formatTimeAgo }: any) {
  const [showValues, setShowValues] = useState<Set<string>>(new Set())

  const toggleSecretVisibility = (secretId: string) => {
    const newShowValues = new Set(showValues)
    if (newShowValues.has(secretId)) {
      newShowValues.delete(secretId)
    } else {
      newShowValues.add(secretId)
    }
    setShowValues(newShowValues)
  }

  const getSecretTypeIcon = (type: string) => {
    switch (type) {
      case 'api_key': return <Key className="w-4 h-4" />
      case 'password': return <Lock className="w-4 h-4" />
      case 'certificate': return <Shield className="w-4 h-4" />
      case 'token': return <Zap className="w-4 h-4" />
      case 'connection_string': return <Database className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Secrets List */}
      <div className="space-y-4">
        {secrets.map((secret: Secret) => (
          <Card key={secret.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getSecretTypeIcon(secret.type)}
                  <h3 className="text-lg font-semibold text-gray-900">{secret.name}</h3>
                  <Badge className={`text-xs ${secret.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {secret.isExpired ? 'Expired' : 'Active'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {secret.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{secret.description}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Environments:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {secret.environments.map((env) => (
                        <Badge key={env} variant="outline" className="text-xs">
                          {env}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last updated:</span>
                    <div className="font-medium text-gray-900">{formatTimeAgo(secret.lastUpdated)}</div>
                    <div className="text-xs text-gray-500">by {secret.updatedBy}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Usage count:</span>
                    <div className="font-medium text-gray-900">{secret.usageCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <div className={`font-medium ${secret.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {secret.expiresAt ? formatTimeAgo(secret.expiresAt) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleSecretVisibility(secret.id)}
                >
                  {showValues.has(secret.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Secret
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rotate Secret
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Secret
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Secret Button */}
      <Card className="p-8 border-dashed border-gray-300 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add New Secret</h3>
            <p className="text-sm text-gray-500 mt-1">Securely store API keys, passwords, and certificates</p>
          </div>
          <Button variant="outline">Create Secret</Button>
        </div>
      </Card>
    </div>
  )
}

// Pipelines Tab Component
function PipelinesTab({ pipelines, getStatusColor, formatTimeAgo }: any) {
  const getStageIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failure': return <XCircle className="w-4 h-4 text-red-600" />
      case 'running': return <Clock className="w-4 h-4 text-blue-600" />
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />
      case 'skipped': return <XCircle className="w-4 h-4 text-gray-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Cards */}
      <div className="space-y-6">
        {pipelines.map((pipeline: DeploymentPipeline) => (
          <Card key={pipeline.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{pipeline.name}</h3>
                  <Badge className={`text-xs ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{pipeline.description}</p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Source:</span>
                    <div className="font-medium text-gray-900">{pipeline.source.repository}</div>
                    <div className="text-xs text-gray-500">{pipeline.source.branch}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last run:</span>
                    <div className="font-medium text-gray-900">{formatTimeAgo(pipeline.lastRun)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Success rate:</span>
                    <div className="font-medium text-gray-900">{pipeline.successRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{pipeline.totalRuns} total runs</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Run Pipeline
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Terminal className="w-4 h-4 mr-2" />
                      View Logs
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Pipeline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pipeline Stages</h4>
              <div className="flex items-center gap-4 overflow-x-auto">
                {pipeline.stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      {getStageIcon(stage.status)}
                      <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                      {stage.duration && (
                        <span className="text-xs text-gray-500">({stage.duration}s)</span>
                      )}
                    </div>
                    {index < pipeline.stages.length - 1 && (
                      <div className="w-4 h-0.5 bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Pipeline Button */}
      <Card className="p-8 border-dashed border-gray-300 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Create New Pipeline</h3>
            <p className="text-sm text-gray-500 mt-1">Set up automated deployment workflows</p>
          </div>
          <Button variant="outline">Create Pipeline</Button>
        </div>
      </Card>
    </div>
  )
}