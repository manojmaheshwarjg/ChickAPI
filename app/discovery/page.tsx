'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
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

  // Mock data for discovery jobs
  const mockJobs: DiscoveryJob[] = [
    {
      id: '1',
      name: 'E-commerce API Discovery',
      status: 'completed',
      schedule: '0 0 * * *',
      lastRun: new Date('2024-09-15T10:30:00Z'),
      nextRun: new Date('2024-09-16T10:30:00Z'),
      endpointCount: 47,
      config: {
        baseUrl: 'https://api.shopify.com',
        depth: 3,
        includeAuth: true
      }
    },
    {
      id: '2',
      name: 'Payment Gateway Analysis',
      status: 'running',
      schedule: 'manual',
      lastRun: new Date('2024-09-15T14:15:00Z'),
      endpointCount: 23,
      config: {
        baseUrl: 'https://api.stripe.com',
        depth: 2,
        includeAuth: true
      }
    },
    {
      id: '3',
      name: 'Social Media API Scan',
      status: 'pending',
      schedule: '*/30 * * * *',
      nextRun: new Date('2024-09-15T15:00:00Z'),
      endpointCount: 0,
      config: {
        baseUrl: 'https://api.twitter.com',
        depth: 4,
        includeAuth: false
      }
    },
    {
      id: '4',
      name: 'Internal API Audit',
      status: 'failed',
      lastRun: new Date('2024-09-14T09:00:00Z'),
      endpointCount: 12,
      config: {
        baseUrl: 'https://internal-api.company.com',
        depth: 5,
        includeAuth: true
      }
    }
  ]

  const loadJobs = async () => {
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setJobs(mockJobs)
    } catch (error) {
      console.error('Failed to load discovery jobs:', error)
      toast.error('Failed to load discovery jobs. Please try again.')
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update job status to running
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'running' as const, lastRun: new Date() }
          : job
      ))

      toast.success('Discovery job started successfully!', { id: `run-${jobId}` })
      
      // Simulate job completion after 3 seconds
      setTimeout(() => {
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'completed' as const, endpointCount: Math.floor(Math.random() * 50) + 10 }
            : job
        ))
        toast.success(`Discovery job ${jobId} completed!`)
      }, 3000)
      
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Remove job from state
      setJobs(prev => prev.filter(job => job.id !== jobId))

      toast.success('Discovery job deleted successfully!', { id: `delete-${jobId}` })
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create mock export data
      const mockData = {
        openapi: {
          openapi: "3.0.0",
          info: { title: "Discovered API", version: "1.0.0" },
          paths: {},
          components: { schemas: {} }
        },
        json: { endpoints: [], schemas: [], metadata: {} },
        csv: "endpoint,method,status,responseTime\n/api/users,GET,200,150ms\n/api/orders,POST,201,200ms"
      }
      
      const data = format === 'csv' ? mockData.csv : JSON.stringify(mockData[format as keyof typeof mockData], null, 2)
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' })
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                ← Back to Workflow
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-light text-gray-900 tracking-tight">API Discovery</h1>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                </div>
                <p className="text-gray-600 font-medium">
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
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </Button>
              <Button
                onClick={handleCreateJob}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-medium"
              >
                New Discovery Job
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto">

          {/* Jobs List */}
          <div className="bg-white border border-gray-300 min-h-[600px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading discovery jobs...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4 font-bold text-gray-700">
                    API
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-2 tracking-tight">No discovery jobs yet</h3>
                  <p className="text-gray-600 mb-6 font-medium">Get started by creating your first discovery job</p>
                  <Button onClick={handleCreateJob} className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-medium">
                    Create Discovery Job
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 p-6 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                            API
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-gray-900 tracking-tight">{job.name}</h3>
                            <p className="text-gray-600 font-medium text-sm">ID: {job.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-sm font-medium border ${
                            job.status === 'running' 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : job.status === 'completed' 
                              ? 'bg-green-50 text-green-800 border-green-200' 
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {job.status === 'running' && '●'} {job.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium block mb-1">Schedule</span>
                          <p className="text-gray-900 font-medium">
                            {job.schedule && job.schedule !== 'manual' ? formatSchedule(job.schedule) : 'Manual'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium block mb-1">Endpoints</span>
                          <p className="text-gray-900 font-medium">{job.endpointCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium block mb-1">Last Run</span>
                          <p className="text-gray-900 font-medium">
                            {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleRunJob(job.id)}
                            disabled={runningJobs.has(job.id) || job.status === 'running'}
                            className={`px-4 py-2 text-sm font-medium border transition-colors ${
                              runningJobs.has(job.id) || job.status === 'running'
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-black text-white border-black hover:bg-gray-800'
                            }`}
                          >
                            {runningJobs.has(job.id) || job.status === 'running' ? 'Running...' : 'Run'}
                          </button>
                          
                          <button 
                            onClick={() => handleViewResults(job)}
                            className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            View
                          </button>
                          
                          <div className="relative group">
                            <button className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                              Export ▼
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg hidden group-hover:block z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleExportJob(job.id, 'openapi')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                  Export as OpenAPI
                                </button>
                                <button
                                  onClick={() => handleExportJob(job.id, 'postman')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                  Export as Postman
                                </button>
                                <button
                                  onClick={() => handleExportJob(job.id, 'har')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                  Export as HAR
                                </button>
                                <button
                                  onClick={() => handleExportJob(job.id, 'markdown')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                  Export as Markdown
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleEditJob(job)}
                            className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deletingJobs.has(job.id)}
                            className={`px-4 py-2 text-sm font-medium border transition-colors ${
                              deletingJobs.has(job.id)
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                            }`}
                          >
                            {deletingJobs.has(job.id) ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
