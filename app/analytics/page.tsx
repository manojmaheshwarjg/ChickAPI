'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalRequests: 2847293,
    uniqueEndpoints: 127,
    activeUsers: 8943,
    errorRate: 2.3,
    avgResponseTime: 245,
    uptime: 99.97,
    successRate: 97.7,
    totalProjects: 24,
    activeProjects: 18,
    totalExecutions: 156789,
    costSavings: 45600,
    performanceImprovement: 23.4
  },
  timeframe: {
    current: 'Last 30 days',
    previous: 'Previous 30 days'
  },
  trends: {
    requests: { current: 2847293, previous: 2456234, change: 15.9 },
    responseTime: { current: 245, previous: 312, change: -21.5 },
    errorRate: { current: 2.3, previous: 3.8, change: -39.5 },
    users: { current: 8943, previous: 7234, change: 23.6 },
    uptime: { current: 99.97, previous: 99.89, change: 0.08 },
    successRate: { current: 97.7, previous: 96.2, change: 1.6 }
  },
  topEndpoints: [
    {
      endpoint: '/api/v1/users',
      method: 'GET',
      requests: 456789,
      avgResponseTime: 125,
      successRate: 99.2,
      errors: 3654,
      trend: 12.3
    },
    {
      endpoint: '/api/v1/products',
      method: 'GET', 
      requests: 398234,
      avgResponseTime: 145,
      successRate: 98.8,
      errors: 4876,
      trend: 8.7
    },
    {
      endpoint: '/api/v1/orders',
      method: 'POST',
      requests: 234567,
      avgResponseTime: 320,
      successRate: 97.5,
      errors: 5894,
      trend: -2.1
    },
    {
      endpoint: '/api/v1/auth/login',
      method: 'POST',
      requests: 189456,
      avgResponseTime: 89,
      successRate: 99.8,
      errors: 234,
      trend: 18.9
    },
    {
      endpoint: '/api/v1/payments',
      method: 'POST',
      requests: 123789,
      avgResponseTime: 450,
      successRate: 96.2,
      errors: 4567,
      trend: 5.4
    }
  ],
  topErrors: [
    {
      error: '500 Internal Server Error',
      count: 12456,
      percentage: 45.2,
      lastOccurred: new Date('2024-09-15T14:30:00Z'),
      trend: -15.3,
      endpoints: ['/api/v1/orders', '/api/v1/payments']
    },
    {
      error: '429 Too Many Requests',
      count: 8934,
      percentage: 32.4,
      lastOccurred: new Date('2024-09-15T16:15:00Z'),
      trend: 23.7,
      endpoints: ['/api/v1/users', '/api/v1/products']
    },
    {
      error: '401 Unauthorized',
      count: 3456,
      percentage: 12.5,
      lastOccurred: new Date('2024-09-15T15:45:00Z'),
      trend: -8.2,
      endpoints: ['/api/v1/auth/*']
    },
    {
      error: '400 Bad Request',
      count: 2789,
      percentage: 10.1,
      lastOccurred: new Date('2024-09-15T13:20:00Z'),
      trend: 5.6,
      endpoints: ['/api/v1/orders', '/api/v1/products']
    }
  ],
  performanceMetrics: {
    cpu: { current: 68, max: 95, avg: 45 },
    memory: { current: 72, max: 89, avg: 58 },
    network: { current: 234, max: 512, avg: 189 },
    storage: { current: 45, max: 78, avg: 38 }
  },
  userMetrics: {
    totalUsers: 8943,
    newUsers: 1234,
    returningUsers: 7709,
    topCountries: [
      { country: 'United States', users: 2847, percentage: 31.8 },
      { country: 'Germany', users: 1456, percentage: 16.3 },
      { country: 'United Kingdom', users: 987, percentage: 11.0 },
      { country: 'France', users: 789, percentage: 8.8 },
      { country: 'Japan', users: 654, percentage: 7.3 }
    ],
    topDevices: [
      { device: 'Desktop', users: 4567, percentage: 51.0 },
      { device: 'Mobile', users: 3234, percentage: 36.2 },
      { device: 'Tablet', users: 1142, percentage: 12.8 }
    ]
  },
  projectMetrics: [
    {
      id: '1',
      name: 'E-commerce API',
      requests: 789456,
      successRate: 98.5,
      avgResponseTime: 245,
      errors: 11834,
      uptime: 99.8,
      trend: 15.3,
      status: 'healthy'
    },
    {
      id: '2', 
      name: 'User Auth API',
      requests: 456789,
      successRate: 99.2,
      avgResponseTime: 89,
      errors: 3654,
      uptime: 99.9,
      trend: 8.7,
      status: 'healthy'
    },
    {
      id: '3',
      name: 'Analytics Pipeline',
      requests: 234567,
      successRate: 95.8,
      avgResponseTime: 1850,
      errors: 9876,
      uptime: 97.5,
      trend: -2.1,
      status: 'warning'
    }
  ],
  costAnalysis: {
    totalCost: 12450,
    costPerRequest: 0.0044,
    costTrend: -8.3,
    savingsFromOptimization: 2340,
    projectedMonthlyCost: 15600,
    breakdown: [
      { category: 'Compute', cost: 6800, percentage: 54.6 },
      { category: 'Storage', cost: 2340, percentage: 18.8 },
      { category: 'Network', cost: 1890, percentage: 15.2 },
      { category: 'Monitoring', cost: 890, percentage: 7.1 },
      { category: 'Other', cost: 530, percentage: 4.3 }
    ]
  }
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | '1y'
type MetricType = 'requests' | 'response-time' | 'errors' | 'users' | 'success-rate'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('requests')
  const [showComparison, setShowComparison] = useState(true)

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '1h': return 'Last Hour'
      case '24h': return 'Last 24 Hours'
      case '7d': return 'Last 7 Days' 
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      case '1y': return 'Last Year'
      default: return 'Last 30 Days'
    }
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return '▲'
    if (change < 0) return '▼'
    return '■'
  }

  const getTrendColor = (change: number, isInverse = false) => {
    if (isInverse) {
      if (change > 0) return 'text-red-600'
      if (change < 0) return 'text-green-600'
    } else {
      if (change > 0) return 'text-green-600'
      if (change < 0) return 'text-red-600'
    }
    return 'text-gray-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                <h1 className="text-3xl font-light text-gray-900 tracking-tight">Analytics Dashboard</h1>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              </div>
              <p className="text-gray-600 font-medium">
                Monitor API performance, usage patterns, and system health
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Period:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      {getTimeRangeLabel(timeRange)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Time Range</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {([
                      { value: '1h', label: 'Last Hour' },
                      { value: '24h', label: 'Last 24 Hours' },
                      { value: '7d', label: 'Last 7 Days' },
                      { value: '30d', label: 'Last 30 Days' },
                      { value: '90d', label: 'Last 90 Days' },
                      { value: '1y', label: 'Last Year' }
                    ] as const).map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setTimeRange(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Refresh
              </Button>
              
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Export
              </Button>

              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Configure
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 bg-gray-50 min-h-screen">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Total Requests"
            value={mockAnalytics.overview.totalRequests.toLocaleString()}
            trend={mockAnalytics.trends.requests}
            icon="REQ"
            color="blue"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${mockAnalytics.overview.avgResponseTime}ms`}
            trend={mockAnalytics.trends.responseTime}
            icon="RES"
            color="green"
            isInverse
          />
          <MetricCard
            title="Error Rate"
            value={`${mockAnalytics.overview.errorRate}%`}
            trend={mockAnalytics.trends.errorRate}
            icon="ERR"
            color="red"
            isInverse
          />
          <MetricCard
            title="Active Users"
            value={mockAnalytics.overview.activeUsers.toLocaleString()}
            trend={mockAnalytics.trends.users}
            icon="USR"
            color="purple"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockAnalytics.overview.successRate}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockAnalytics.overview.uptime}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Endpoints</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockAnalytics.overview.uniqueEndpoints}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockAnalytics.overview.totalProjects}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Database className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cost Savings</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${mockAnalytics.overview.costSavings.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Performance</p>
                <p className="text-lg font-semibold text-gray-900">
                  +{mockAnalytics.overview.performanceImprovement}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-teal-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                <p className="text-sm text-gray-500">Request volume and response times</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Metric
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Requests</DropdownMenuItem>
                  <DropdownMenuItem>Response Time</DropdownMenuItem>
                  <DropdownMenuItem>Error Rate</DropdownMenuItem>
                  <DropdownMenuItem>Success Rate</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Interactive chart would be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Using Chart.js or similar library</p>
              </div>
            </div>
          </Card>

          {/* Geographic Distribution */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                <p className="text-sm text-gray-500">Requests by geographic location</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="space-y-4">
              {mockAnalytics.userMetrics.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">
                      {country.users.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Endpoints */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Endpoints</h3>
                <p className="text-sm text-gray-500">Most requested API endpoints</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Requests</th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Success</th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockAnalytics.topEndpoints.slice(0, 5).map((endpoint, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {endpoint.method}
                            </Badge>
                            <span className="text-sm font-mono text-gray-900 truncate">
                              {endpoint.endpoint}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {endpoint.requests.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm text-gray-900">
                          {endpoint.successRate}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm text-gray-900">
                          {endpoint.avgResponseTime}ms
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Errors */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Errors</h3>
                <p className="text-sm text-gray-500">Most common error responses</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Error Logs
              </Button>
            </div>
            <div className="space-y-4">
              {mockAnalytics.topErrors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-900">{error.error}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{error.count.toLocaleString()} occurrences</span>
                      <span>{error.percentage}% of errors</span>
                      <span className={getTrendColor(error.trend, true)}>
                        {error.trend > 0 ? '+' : ''}{error.trend.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${error.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
                <p className="text-sm text-gray-500">Resource utilization metrics</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">CPU Usage</p>
                    <p className="text-xs text-gray-500">Average: {mockAnalytics.performanceMetrics.cpu.avg}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{mockAnalytics.performanceMetrics.cpu.current}%</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${mockAnalytics.performanceMetrics.cpu.current}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <HardDrive className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Memory Usage</p>
                    <p className="text-xs text-gray-500">Average: {mockAnalytics.performanceMetrics.memory.avg}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{mockAnalytics.performanceMetrics.memory.current}%</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${mockAnalytics.performanceMetrics.memory.current}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Network className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Network I/O</p>
                    <p className="text-xs text-gray-500">Average: {mockAnalytics.performanceMetrics.network.avg} MB/s</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{mockAnalytics.performanceMetrics.network.current} MB/s</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Database className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Storage Usage</p>
                    <p className="text-xs text-gray-500">Average: {mockAnalytics.performanceMetrics.storage.avg}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{mockAnalytics.performanceMetrics.storage.current}%</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${mockAnalytics.performanceMetrics.storage.current}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cost Analysis */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
                <p className="text-sm text-gray-500">Resource costs and optimization opportunities</p>
              </div>
              <Button variant="outline" size="sm">
                <DollarSign className="w-4 h-4 mr-2" />
                Optimize
              </Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Monthly Cost</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${mockAnalytics.costAnalysis.totalCost.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cost per Request</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${mockAnalytics.costAnalysis.costPerRequest.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {mockAnalytics.costAnalysis.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-600" style={{
                        backgroundColor: `hsl(${index * 60}, 60%, 50%)`
                      }} />
                      <span className="text-sm text-gray-900">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">${item.cost.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-2">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-900">Potential Savings</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    ${mockAnalytics.costAnalysis.savingsFromOptimization.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on optimization recommendations
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Project Performance Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Performance</h3>
              <p className="text-sm text-gray-500">Individual project metrics and health status</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Run Diagnostics
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Requests</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Success Rate</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Avg Response</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Errors</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Uptime</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockAnalytics.projectMetrics.map((project, index) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Database className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{project.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {getTrendIcon(project.trend)}
                            <span className={`text-xs ${getTrendColor(project.trend)}`}>
                              {project.trend > 0 ? '+' : ''}{project.trend.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {project.requests.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm text-gray-900">{project.successRate}%</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm text-gray-900">{project.avgResponseTime}ms</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm text-gray-900">{project.errors.toLocaleString()}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm text-gray-900">{project.uptime}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}

// Reusable Metric Card Component
function MetricCard({
  title,
  value,
  trend,
  icon,
  color,
  isInverse = false
}: {
  title: string
  value: string
  trend: { current: number; previous: number; change: number }
  icon: string
  color: 'blue' | 'green' | 'red' | 'purple'
  isInverse?: boolean
}) {
  const colorClasses = {
    blue: 'bg-gray-800 text-white',
    green: 'bg-gray-700 text-white',
    red: 'bg-gray-900 text-white',
    purple: 'bg-slate-800 text-white'
  }

  const getTrendSymbol = (change: number) => {
    if (change > 0) return '▲'
    if (change < 0) return '▼'
    return '■'
  }

  const getTrendColor = (change: number, isInverse = false) => {
    if (isInverse) {
      if (change > 0) return 'text-red-600'
      if (change < 0) return 'text-green-600'
    } else {
      if (change > 0) return 'text-green-600'
      if (change < 0) return 'text-red-600'
    }
    return 'text-gray-500'
  }

  return (
    <Card className="p-6 border border-gray-300 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} flex items-center justify-center font-bold text-sm`}>
          {icon}
        </div>
        <div className={`flex items-center gap-2 ${getTrendColor(trend.change, isInverse)}`}>
          <span className="text-lg">{getTrendSymbol(trend.change)}</span>
          <span className="text-sm font-semibold">
            {Math.abs(trend.change).toFixed(1)}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-light text-gray-900 mb-2 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</p>
        <p className="text-xs text-gray-500 mt-2">
          vs. {trend.previous.toLocaleString()} previous period
        </p>
      </div>
    </Card>
  )
}
