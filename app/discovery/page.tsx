'use client'

import { useState, useEffect } from 'react'
import { Plus, Play, Calendar, Download, Eye, Trash2, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DiscoveryJobModal from '@/components/discovery/DiscoveryJobModal'
import EndpointDetailModal from '@/components/discovery/EndpointDetailModal'
import DiscoveryResults from '@/components/discovery/DiscoveryResults'

interface DiscoveryJob {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'deleted'
  schedule?: string
  lastRun?: Date
  nextRun?: Date
  endpointCount: number
  config: any
}

export default function DiscoveryPage() {
  const [jobs, setJobs] = useState<DiscoveryJob[]>([])
  const [selectedJob, setSelectedJob] = useState<DiscoveryJob | null>(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [editingJob, setEditingJob] = useState<DiscoveryJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set())
  const [deletingJobs, setDeletingJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/discovery/jobs')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Failed to load discovery jobs:', error)
      const message = error instanceof Error ? error.message : 'Failed to load discovery jobs. Please try again.'
      
      if (message.includes('Database connection failed') || message.includes('ECONNREFUSED')) {
        toast.error('MongoDB not running. Please start MongoDB or check connection settings.')
      } else if (message.includes('Database not found') || message.includes('Prisma')) {
        toast.error('Database not initialized. Please run: npm run db:setup')
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setShowJobModal(true)
  }

  const handleEditJob = (job: DiscoveryJob) => {
    setEditingJob(job)
    setShowJobModal(true)
  }

  const handleRunJob = async (jobId: string) => {
    if (runningJobs.has(jobId)) return

    try {
      setRunningJobs(prev => new Set([...prev, jobId]))
      toast.loading('Starting discovery job...', { id: `run-${jobId}` })
      
      const response = await fetch(`/api/discovery/jobs/${jobId}/run`, { method: 'POST' })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success('Discovery job started successfully!', { id: `run-${jobId}` })
      await loadJobs()
    } catch (error) {
      console.error('Failed to run job:', error)
      toast.error('Failed to start discovery job. Please try again.', { id: `run-${jobId}` })
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return
    
    if (deletingJobs.has(jobId)) return

    try {
      setDeletingJobs(prev => new Set([...prev, jobId]))
      toast.loading('Deleting discovery job...', { id: `delete-${jobId}` })
      
      const response = await fetch(`/api/discovery/jobs/${jobId}`, { method: 'DELETE' })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success('Discovery job deleted successfully!', { id: `delete-${jobId}` })
      await loadJobs()
    } catch (error) {
      console.error('Failed to delete job:', error)
      toast.error('Failed to delete discovery job. Please try again.', { id: `delete-${jobId}` })
    } finally {
      setDeletingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  const handleViewResults = (job: DiscoveryJob) => {
    setSelectedJob(job)
    setShowResultsModal(true)
  }

  const handleExportJob = async (jobId: string, format: string) => {
    try {
      toast.loading('Preparing export...', { id: `export-${jobId}` })
      
      const response = await fetch(`/api/discovery/jobs/${jobId}/export?format=${format}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `api-discovery-${jobId}.${format === 'openapi' ? 'json' : format}`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Export completed successfully! (${format.toUpperCase()})`, { id: `export-${jobId}` })
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error('Failed to export discovery results. Please try again.', { id: `export-${jobId}` })
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'running': return 'default'
      case 'completed': return 'secondary'
      case 'failed': return 'destructive'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const formatSchedule = (schedule: string) => {
    if (!schedule || schedule === 'manual') return 'Manual'
    
    const schedules: Record<string, string> = {
      '* * * * *': 'Every minute',
      '*/5 * * * *': 'Every 5 minutes',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 * * * *': 'Every hour',
      '0 0 * * *': 'Daily',
      '0 0 * * 0': 'Weekly',
      '0 0 1 * *': 'Monthly'
    }
    return schedules[schedule] || schedule
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Workflow
            </Link>
            <div className="h-5 w-px bg-border"></div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">API Discovery</h1>
              <p className="text-sm text-muted-foreground">
                Automatically discover and document API endpoints
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => loadJobs()}
              variant="outline"
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleCreateJob}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Discovery Job
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">

          {/* Jobs List */}
          <div className="panel h-full flex flex-col">
            {loading ? (
              <div className="panel-body flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading discovery jobs...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="panel-body flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No discovery jobs yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get started by creating your first discovery job</p>
                  <Button onClick={handleCreateJob} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Discovery Job
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-border">
                  {/* Single Column Card Layout */}
                  {jobs.map((job) => (
                    <div key={job.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-foreground truncate">
                              {job.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">ID: {job.id.slice(0, 8)}...</p>
                          </div>
                          <Badge variant={getStatusVariant(job.status)} className="text-xs">
                            {job.status}
                          </Badge>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">Schedule:</span>
                            <span className="ml-1">
                              {job.schedule && job.schedule !== 'manual' ? formatSchedule(job.schedule) : 'Manual'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="font-medium">Endpoints:</span>
                            <span className="ml-1">{job.endpointCount}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            <span className="font-medium">Last Run:</span>
                            <span className="ml-1">
                              {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Button
                            onClick={() => handleRunJob(job.id)}
                            disabled={runningJobs.has(job.id) || job.status === 'running'}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            {runningJobs.has(job.id) || job.status === 'running' ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            {runningJobs.has(job.id) || job.status === 'running' ? 'Running' : 'Run'}
                          </Button>
                          <Button
                            onClick={() => handleViewResults(job)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <div className="relative group">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Export
                            </Button>
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-border hidden group-hover:block z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleExportJob(job.id, 'openapi')}
                                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  Export as OpenAPI
                                </button>
                                <button
                                  onClick={() => handleExportJob(job.id, 'postman')}
                                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  Export as Postman
                                </button>
                                <button
                                  onClick={() => handleExportJob(job.id, 'har')}
                                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  Export as HAR
                                </button>
                                <button
                                  onClick={() => handleExportJob(job.id, 'markdown')}
                                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  Export as Markdown
                                </button>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleEditJob(job)}
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deletingJobs.has(job.id)}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            {deletingJobs.has(job.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {deletingJobs.has(job.id) ? 'Deleting' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DiscoveryJobModal
        job={editingJob}
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSave={async () => {
          setShowJobModal(false)
          toast.success('Discovery job saved successfully!')
          await loadJobs()
        }}
      />

      {selectedJob && (
        <DiscoveryResults
          job={selectedJob}
          open={showResultsModal}
          onClose={() => setShowResultsModal(false)}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--primary-foreground))',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--destructive-foreground))',
            },
          },
        }}
      />
    </div>
  )
}
