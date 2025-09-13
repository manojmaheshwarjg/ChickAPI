import * as cron from 'node-cron'
import { DiscoveryOrchestrator } from './DiscoveryOrchestrator'
import { DiscoveryRepository } from './repository'
import { DiscoveryConfig } from './types'

export class DiscoveryScheduler {
  private orchestrator: DiscoveryOrchestrator
  private repository: DiscoveryRepository
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map()
  private isRunning = false

  constructor() {
    this.orchestrator = new DiscoveryOrchestrator()
    this.repository = new DiscoveryRepository()
  }

  async start() {
    if (this.isRunning) {
      console.log('Scheduler is already running')
      return
    }

    this.isRunning = true
    console.log('Discovery Scheduler started')

    // Load and schedule existing jobs
    await this.loadScheduledJobs()

    // Start the main scheduler loop
    this.startMainLoop()
  }

  async stop() {
    this.isRunning = false

    // Stop all scheduled tasks
    for (const [jobId, task] of this.scheduledTasks) {
      task.stop()
      console.log(`Stopped scheduled task for job ${jobId}`)
    }
    this.scheduledTasks.clear()

    console.log('Discovery Scheduler stopped')
  }

  async scheduleJob(
    name: string,
    config: DiscoveryConfig,
    schedule: string
  ): Promise<string> {
    // Validate cron expression
    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`)
    }

    // Save job to database
    const job = await this.repository.createJob(name, config, schedule)

    // Schedule the job
    await this.scheduleDiscoveryJob(job.id, config, schedule)

    console.log(`Scheduled job ${job.id} with cron: ${schedule}`)
    return job.id
  }

  async runJobNow(jobId: string) {
    const job = await this.repository.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    const config = JSON.parse(job.config) as DiscoveryConfig
    await this.executeDiscoveryJob(jobId, config)
  }

  async updateJobSchedule(jobId: string, newSchedule: string) {
    if (!cron.validate(newSchedule)) {
      throw new Error(`Invalid cron expression: ${newSchedule}`)
    }

    // Stop existing schedule if any
    if (this.scheduledTasks.has(jobId)) {
      this.scheduledTasks.get(jobId)!.stop()
      this.scheduledTasks.delete(jobId)
    }

    // Get job from database
    const job = await this.repository.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    // Update job in database
    const config = JSON.parse(job.config) as DiscoveryConfig
    
    // Reschedule the job
    await this.scheduleDiscoveryJob(jobId, config, newSchedule)

    console.log(`Updated schedule for job ${jobId} to: ${newSchedule}`)
  }

  async deleteJob(jobId: string) {
    // Stop scheduled task if exists
    if (this.scheduledTasks.has(jobId)) {
      this.scheduledTasks.get(jobId)!.stop()
      this.scheduledTasks.delete(jobId)
    }

    // Update job status in database
    await this.repository.updateJobStatus(jobId, 'deleted')

    console.log(`Deleted job ${jobId}`)
  }

  private async loadScheduledJobs() {
    const jobs = await this.repository.getAllJobs()
    
    for (const job of jobs) {
      if (job.schedule && job.status !== 'deleted') {
        const config = JSON.parse(job.config) as DiscoveryConfig
        await this.scheduleDiscoveryJob(job.id, config, job.schedule)
      }
    }

    console.log(`Loaded ${jobs.length} scheduled jobs`)
  }

  private async scheduleDiscoveryJob(
    jobId: string,
    config: DiscoveryConfig,
    schedule: string
  ) {
    const task = cron.schedule(schedule, async () => {
      await this.executeDiscoveryJob(jobId, config)
    }, {
      scheduled: false
    })

    // Start the task
    task.start()

    // Store the task
    this.scheduledTasks.set(jobId, task)
  }

  private async executeDiscoveryJob(jobId: string, config: DiscoveryConfig) {
    console.log(`Starting discovery job ${jobId}`)
    const startTime = Date.now()

    try {
      // Update job status
      await this.repository.updateJobStatus(jobId, 'running')

      // Run discovery
      await this.orchestrator.startDiscovery(config)

      // Get results
      const results = this.orchestrator.getDiscoveryResults()

      // Save endpoints to database
      await this.repository.saveEndpoints(results.endpoints, jobId)

      // Save discovery result
      const duration = Date.now() - startTime
      await this.repository.saveDiscoveryResult(jobId, results, duration)

      // Detect changes and create notifications
      await this.detectAndNotifyChanges(results.endpoints)

      // Update job status
      await this.repository.updateJobStatus(jobId, 'completed')

      console.log(`Completed discovery job ${jobId} in ${duration}ms`)
      console.log(`Discovered ${results.endpoints.length} endpoints`)

    } catch (error) {
      console.error(`Failed to execute discovery job ${jobId}:`, error)
      await this.repository.updateJobStatus(jobId, 'failed')
    } finally {
      // Clean up
      await this.orchestrator.stopDiscovery()
    }
  }

  private async detectAndNotifyChanges(endpoints: any[]) {
    const recentChanges = await this.repository.getRecentChanges(100)
    
    for (const change of recentChanges) {
      // Create notifications for significant changes
      if (this.isSignificantChange(change)) {
        await this.createChangeNotification(change)
      }
    }
  }

  private isSignificantChange(change: any): boolean {
    // Determine if a change is significant enough to notify
    const significantTypes = ['added', 'removed']
    const significantFields = ['authentication', 'parameters', 'responses']
    
    return significantTypes.includes(change.changeType) ||
           significantFields.includes(change.field)
  }

  private async createChangeNotification(change: any) {
    const message = this.generateChangeMessage(change)
    
    await this.repository.createNotification(change.id, {
      type: 'in-app',
      recipient: 'admin', // In production, this would be configurable
      subject: `API Change Detected: ${change.endpoint.method} ${change.endpoint.url}`,
      message
    })
  }

  private generateChangeMessage(change: any): string {
    const endpoint = change.endpoint
    let message = `Change detected in API endpoint:\n`
    message += `${endpoint.method} ${endpoint.url}\n\n`
    
    switch (change.changeType) {
      case 'added':
        message += `New endpoint discovered`
        break
      case 'removed':
        message += `Endpoint removed or no longer accessible`
        break
      case 'modified':
        message += `Field '${change.field}' was modified\n`
        if (change.oldValue && change.newValue) {
          message += `Old: ${JSON.stringify(change.oldValue, null, 2)}\n`
          message += `New: ${JSON.stringify(change.newValue, null, 2)}`
        }
        break
    }
    
    return message
  }

  private startMainLoop() {
    // Check for jobs that need to run every minute
    setInterval(async () => {
      if (!this.isRunning) return

      try {
        const jobsToRun = await this.repository.getScheduledJobs()
        
        for (const job of jobsToRun) {
          if (!this.scheduledTasks.has(job.id)) {
            // This job should have been scheduled but wasn't
            const config = JSON.parse(job.config) as DiscoveryConfig
            await this.executeDiscoveryJob(job.id, config)
          }
        }
      } catch (error) {
        console.error('Error in scheduler main loop:', error)
      }
    }, 60000) // Check every minute
  }

  async getJobStatus(jobId: string) {
    const job = await this.repository.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    return {
      id: job.id,
      name: job.name,
      status: job.status,
      schedule: job.schedule,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      endpointCount: job.endpoints.length,
      resultCount: job.results.length,
      isScheduled: this.scheduledTasks.has(job.id)
    }
  }

  async getAllJobStatuses() {
    const jobs = await this.repository.getAllJobs()
    
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      status: job.status,
      schedule: job.schedule,
      lastRun: job.lastRun,
      endpointCount: job._count?.endpoints || 0,
      resultCount: job._count?.results || 0,
      isScheduled: this.scheduledTasks.has(job.id)
    }))
  }

  // Predefined schedule templates
  static readonly SCHEDULES = {
    EVERY_MINUTE: '* * * * *',
    EVERY_5_MINUTES: '*/5 * * * *',
    EVERY_15_MINUTES: '*/15 * * * *',
    EVERY_30_MINUTES: '*/30 * * * *',
    HOURLY: '0 * * * *',
    DAILY: '0 0 * * *',
    WEEKLY: '0 0 * * 0',
    MONTHLY: '0 0 1 * *'
  }

  static getCronDescription(expression: string): string {
    const descriptions: Record<string, string> = {
      '* * * * *': 'Every minute',
      '*/5 * * * *': 'Every 5 minutes',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 * * * *': 'Every hour',
      '0 0 * * *': 'Daily at midnight',
      '0 0 * * 0': 'Weekly on Sunday',
      '0 0 1 * *': 'Monthly on the 1st'
    }
    
    return descriptions[expression] || expression
  }
}
