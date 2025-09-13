'use client'

import { useState, useEffect } from 'react'
import { Download, Code, Shield, Search, Filter } from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui'
import EndpointDetailModal from './EndpointDetailModal'

interface DiscoveryResultsProps {
  job: any | null
  open: boolean
  onClose: () => void
}

interface APIEndpoint {
  id: string
  url: string
  method: string
  summary?: string
  description?: string
  parameters?: any[]
  authentication?: any
  responses?: any[]
  complexity?: number
  tags?: string[]
  source: string
  discoveredAt: Date
}

export default function DiscoveryResults({ job, open, onClose }: DiscoveryResultsProps) {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [filteredEndpoints, setFilteredEndpoints] = useState<APIEndpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMethod, setFilterMethod] = useState('ALL')
  const [filterTag, setFilterTag] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (job && open) {
      loadEndpoints()
    } else if (!job) {
      // Reset state when job is null
      setEndpoints([])
      setFilteredEndpoints([])
      setLoading(false)
    }
  }, [job, open])

  useEffect(() => {
    filterEndpoints()
  }, [endpoints, searchTerm, filterMethod, filterTag])

  const loadEndpoints = async () => {
    if (!job) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/discovery/jobs/${job.id}/endpoints`)
      const data = await response.json()
      setEndpoints(data)
    } catch (error) {
      console.error('Failed to load endpoints:', error)
      setEndpoints([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterEndpoints = () => {
    let filtered = [...endpoints]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ep => 
        ep.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Method filter
    if (filterMethod !== 'ALL') {
      filtered = filtered.filter(ep => ep.method === filterMethod)
    }

    // Tag filter
    if (filterTag !== 'ALL') {
      filtered = filtered.filter(ep => ep.tags?.includes(filterTag))
    }

    setFilteredEndpoints(filtered)
  }

  const handleExport = async (format: string) => {
    if (!job) return
    
    try {
      const response = await fetch(`/api/discovery/jobs/${job.id}/export?format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${job.name}-endpoints.${format === 'openapi' ? 'json' : format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  const handleGenerateTests = async (endpointId: string) => {
    try {
      const response = await fetch(`/api/discovery/endpoints/${endpointId}/tests`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tests-${endpointId}.js`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate tests:', error)
    }
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      PATCH: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800',
      HEAD: 'bg-gray-100 text-gray-800',
      OPTIONS: 'bg-purple-100 text-purple-800'
    }
    return colors[method] || 'bg-gray-100 text-gray-800'
  }

  const getAllTags = () => {
    const tags = new Set<string>()
    endpoints.forEach(ep => {
      ep.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  const getComplexityBadge = (complexity?: number) => {
    if (!complexity) return null
    
    let color = 'bg-green-100 text-green-800'
    let label = 'Simple'
    
    if (complexity > 5) {
      color = 'bg-yellow-100 text-yellow-800'
      label = 'Medium'
    }
    if (complexity > 8) {
      color = 'bg-red-100 text-red-800'
      label = 'Complex'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    )
  }

  // Don't render if no job is provided
  if (!job && open) {
    return null
  }

  return (
    <Dialog open={open && !!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-lg">
                Discovery Results: {job?.name || 'Unknown Job'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredEndpoints.length} of {endpoints.length} endpoints
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExport('openapi')}>
                    OpenAPI Specification
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('postman')}>
                    Postman Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('markdown')}>
                    Markdown Documentation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    CSV Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="bg-muted/50 px-6 py-3 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search endpoints..."
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-3 flex items-center space-x-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground">Method</label>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground">Tag</label>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Tags</SelectItem>
                    {getAllTags().map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading endpoints...</p>
            </div>
          ) : filteredEndpoints.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No endpoints found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Auth</TableHead>
                  <TableHead>Complexity</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell>
                      <Badge
                        variant={endpoint.method === 'GET' ? 'success' : 
                                endpoint.method === 'POST' ? 'default' : 
                                endpoint.method === 'PUT' ? 'warning' : 
                                endpoint.method === 'DELETE' ? 'destructive' : 
                                'outline'}
                        className="font-mono text-xs"
                      >
                        {endpoint.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-foreground">{endpoint.url}</div>
                        {endpoint.summary && (
                          <div className="text-sm text-muted-foreground">{endpoint.summary}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {endpoint.authentication ? (
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-muted-foreground">
                            {endpoint.authentication.type}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getComplexityBadge(endpoint.complexity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {endpoint.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEndpoint(endpoint)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateTests(endpoint.id)}
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>

      {/* Endpoint Detail Modal */}
      {selectedEndpoint && (
        <EndpointDetailModal
          endpoint={selectedEndpoint}
          open={!!selectedEndpoint}
          onClose={() => setSelectedEndpoint(null)}
        />
      )}
    </Dialog>
  )
}
