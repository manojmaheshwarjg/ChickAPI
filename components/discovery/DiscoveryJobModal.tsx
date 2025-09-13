'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Separator
} from '@/components/ui'

interface DiscoveryJobModalProps {
  job?: any
  open: boolean
  onClose: () => void
  onSave: () => void
}

export default function DiscoveryJobModal({ job, open, onClose, onSave }: DiscoveryJobModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    discoveryType: 'dynamic',
    crawlDepth: 3,
    timeout: 30000,
    rateLimit: 10,
    simulateInteractions: true,
    includeStaticAssets: false,
    schedule: 'manual',
    authentication: {
      type: 'none',
      credentials: {}
    },
    filters: {
      includePaths: [] as string[],
      excludePaths: [] as string[],
      includeHosts: [] as string[],
      excludeHosts: [] as string[]
    }
  })

  const [authType, setAuthType] = useState('none')
  const [authCredentials, setAuthCredentials] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (job) {
      const config = typeof job.config === 'string' ? JSON.parse(job.config) : job.config
      setFormData({
        name: job.name,
        ...config,
        schedule: job.schedule || 'manual'
      })
      setAuthType(config.authentication?.type || 'none')
      setAuthCredentials(config.authentication?.credentials || {})
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const config = {
        url: formData.url,
        discoveryType: formData.discoveryType,
        crawlDepth: formData.crawlDepth,
        timeout: formData.timeout,
        rateLimit: formData.rateLimit,
        simulateInteractions: formData.simulateInteractions,
        includeStaticAssets: formData.includeStaticAssets,
        filters: formData.filters,
        authentication: {
          type: authType,
          credentials: authCredentials
        }
      }

      const body = {
        name: formData.name,
        config,
        schedule: formData.schedule === 'manual' ? null : formData.schedule
      }

      toast.loading(job ? 'Updating discovery job...' : 'Creating discovery job...', { id: 'save-job' })

      const response = await fetch(
        job ? `/api/discovery/jobs/${job.id}` : '/api/discovery/jobs',
        {
          method: job ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success(job ? 'Discovery job updated successfully!' : 'Discovery job created successfully!', { id: 'save-job' })
      onSave()
    } catch (error) {
      console.error('Failed to save job:', error)
      toast.error('Failed to save discovery job. Please check your inputs and try again.', { id: 'save-job' })
    } finally {
      setSaving(false)
    }
  }

  const handleFilterChange = (filterType: keyof typeof formData.filters, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v)
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: values
      }
    }))
  }

  const scheduleOptions = [
    { value: 'manual', label: 'Manual (No Schedule)' },
    { value: '*/5 * * * *', label: 'Every 5 minutes' },
    { value: '*/15 * * * *', label: 'Every 15 minutes' },
    { value: '*/30 * * * *', label: 'Every 30 minutes' },
    { value: '0 * * * *', label: 'Every hour' },
    { value: '0 0 * * *', label: 'Daily at midnight' },
    { value: '0 0 * * 0', label: 'Weekly on Sunday' },
    { value: '0 0 1 * *', label: 'Monthly on the 1st' }
  ]

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? 'Edit Discovery Job' : 'Create Discovery Job'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter job name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discovery-type">Discovery Type</Label>
                <Select
                  value={formData.discoveryType}
                  onValueChange={(value) => setFormData({ ...formData, discoveryType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discovery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Dynamic Crawling</SelectItem>
                    <SelectItem value="specification">From Specification</SelectItem>
                    <SelectItem value="traffic">From Traffic Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.discoveryType === 'dynamic' && (
                <div className="space-y-2">
                  <Label htmlFor="target-url">Target URL</Label>
                  <Input
                    id="target-url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://api.example.com"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Crawling Configuration */}
          {formData.discoveryType === 'dynamic' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Crawling Configuration</h3>
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crawl-depth">Crawl Depth</Label>
                  <Input
                    id="crawl-depth"
                    type="number"
                    value={formData.crawlDepth}
                    onChange={(e) => setFormData({ ...formData, crawlDepth: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (req/sec)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={formData.rateLimit}
                    onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="100"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 1000 })}
                    min="1000"
                    max="60000"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="simulate-interactions"
                    checked={formData.simulateInteractions}
                    onCheckedChange={(checked) => setFormData({ ...formData, simulateInteractions: checked })}
                  />
                  <Label htmlFor="simulate-interactions" className="text-sm">Simulate user interactions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-static"
                    checked={formData.includeStaticAssets}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeStaticAssets: checked })}
                  />
                  <Label htmlFor="include-static" className="text-sm">Include static assets</Label>
                </div>
              </div>
            </div>
          )}

          {/* Authentication */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Authentication</h3>
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-type">Authentication Type</Label>
                <Select
                  value={authType}
                  onValueChange={setAuthType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select auth type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="session">Session Cookie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {authType === 'bearer' && (
                <div className="space-y-2">
                  <Label htmlFor="bearer-token">Bearer Token</Label>
                  <Input
                    id="bearer-token"
                    type="password"
                    value={authCredentials.token || ''}
                    onChange={(e) => setAuthCredentials({ token: e.target.value })}
                    placeholder="Enter bearer token"
                  />
                </div>
              )}

              {authType === 'apikey' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key-header">API Key Header</Label>
                    <Input
                      id="api-key-header"
                      type="text"
                      value={authCredentials.apiKeyHeader || 'X-API-Key'}
                      onChange={(e) => setAuthCredentials({ ...authCredentials, apiKeyHeader: e.target.value })}
                      placeholder="X-API-Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key-value">API Key Value</Label>
                    <Input
                      id="api-key-value"
                      type="password"
                      value={authCredentials.apiKey || ''}
                      onChange={(e) => setAuthCredentials({ ...authCredentials, apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                </div>
              )}

              {authType === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={authCredentials.username || ''}
                      onChange={(e) => setAuthCredentials({ ...authCredentials, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authCredentials.password || ''}
                      onChange={(e) => setAuthCredentials({ ...authCredentials, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="include-paths">Include Paths (comma-separated)</Label>
                <Input
                  id="include-paths"
                  type="text"
                  value={formData.filters.includePaths.join(', ')}
                  onChange={(e) => handleFilterChange('includePaths', e.target.value)}
                  placeholder="/api, /v1, /endpoints"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exclude-paths">Exclude Paths (comma-separated)</Label>
                <Input
                  id="exclude-paths"
                  type="text"
                  value={formData.filters.excludePaths.join(', ')}
                  onChange={(e) => handleFilterChange('excludePaths', e.target.value)}
                  placeholder="/admin, /internal, /static"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="schedule">Run Schedule</Label>
              <Select
                value={formData.schedule}
                onValueChange={(value) => setFormData({ ...formData, schedule: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {scheduleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
