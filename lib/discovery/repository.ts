import { PrismaClient } from '@prisma/client'
import { APIEndpoint, DiscoveryConfig, DiscoveryResult } from './types'

const prisma = new PrismaClient()

export class DiscoveryRepository {
  // Discovery Job operations
  async createJob(name: string, config: DiscoveryConfig, schedule?: string) {
    return await prisma.discoveryJob.create({
      data: {
        name,
        config: JSON.stringify(config),
        schedule,
        status: 'pending',
        nextRun: schedule ? this.calculateNextRun(schedule) : undefined
      }
    })
  }

  async updateJobStatus(jobId: string, status: string) {
    return await prisma.discoveryJob.update({
      where: { id: jobId },
      data: { 
        status,
        lastRun: status === 'running' ? new Date() : undefined
      }
    })
  }

  async getScheduledJobs() {
    return await prisma.discoveryJob.findMany({
      where: {
        schedule: { not: null },
        nextRun: { lte: new Date() }
      }
    })
  }

  async getJob(jobId: string) {
    return await prisma.discoveryJob.findUnique({
      where: { id: jobId },
      include: {
        results: { orderBy: { discoveredAt: 'desc' }, take: 10 },
        endpoints: { take: 100 }
      }
    })
  }

  async getAllJobs() {
    return await prisma.discoveryJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { endpoints: true, results: true }
        }
      }
    })
  }

  // Discovery Result operations
  async saveDiscoveryResult(jobId: string, result: DiscoveryResult, duration: number) {
    return await prisma.discoveryResult.create({
      data: {
        jobId,
        statistics: JSON.stringify(result.statistics),
        endpointCount: result.endpoints.length,
        duration
      }
    })
  }

  // Endpoint operations
  async saveEndpoints(endpoints: APIEndpoint[], jobId?: string) {
    const savedEndpoints = []
    
    for (const endpoint of endpoints) {
      try {
        // Check if endpoint exists
        const existing = await prisma.aPIEndpoint.findUnique({
          where: {
            url_method: {
              url: endpoint.url,
              method: endpoint.method
            }
          }
        })

        if (existing) {
          // Update existing endpoint
          const updated = await this.updateEndpoint(existing.id, endpoint)
          savedEndpoints.push(updated)
        } else {
          // Create new endpoint
          const created = await this.createEndpoint(endpoint, jobId)
          savedEndpoints.push(created)
        }
      } catch (error) {
        console.error(`Failed to save endpoint ${endpoint.method} ${endpoint.url}:`, error)
      }
    }

    return savedEndpoints
  }

  private async createEndpoint(endpoint: APIEndpoint, jobId?: string) {
    return await prisma.aPIEndpoint.create({
      data: {
        jobId,
        url: endpoint.url,
        method: endpoint.method,
        pathPattern: endpoint.url,
        summary: endpoint.summary,
        description: endpoint.description,
        parameters: endpoint.parameters ? JSON.stringify(endpoint.parameters) : null,
        requestBody: endpoint.requestBody ? JSON.stringify(endpoint.requestBody) : null,
        responses: endpoint.responses ? JSON.stringify(endpoint.responses) : null,
        authentication: endpoint.authentication ? JSON.stringify(endpoint.authentication) : null,
        rateLimit: endpoint.rateLimit ? JSON.stringify(endpoint.rateLimit) : null,
        tags: endpoint.tags ? JSON.stringify(endpoint.tags) : null,
        source: endpoint.source || 'dynamic',
        complexity: endpoint.complexity,
        deprecated: endpoint.deprecated || false,
        documentation: endpoint.documentation,
        discoveredAt: endpoint.discoveredAt || new Date()
      }
    })
  }

  private async updateEndpoint(id: string, endpoint: APIEndpoint) {
    const existing = await prisma.aPIEndpoint.findUnique({ where: { id } })
    if (!existing) throw new Error('Endpoint not found')

    // Track changes
    const changes = this.detectChanges(existing, endpoint)
    if (changes.length > 0) {
      await this.saveChanges(id, changes)
    }

    return await prisma.aPIEndpoint.update({
      where: { id },
      data: {
        summary: endpoint.summary,
        description: endpoint.description,
        parameters: endpoint.parameters ? JSON.stringify(endpoint.parameters) : existing.parameters,
        requestBody: endpoint.requestBody ? JSON.stringify(endpoint.requestBody) : existing.requestBody,
        responses: endpoint.responses ? JSON.stringify(endpoint.responses) : existing.responses,
        authentication: endpoint.authentication ? JSON.stringify(endpoint.authentication) : existing.authentication,
        rateLimit: endpoint.rateLimit ? JSON.stringify(endpoint.rateLimit) : existing.rateLimit,
        tags: endpoint.tags ? JSON.stringify(endpoint.tags) : existing.tags,
        complexity: endpoint.complexity ?? existing.complexity,
        deprecated: endpoint.deprecated ?? existing.deprecated,
        documentation: endpoint.documentation ?? existing.documentation,
        lastSeen: new Date()
      }
    })
  }

  async getEndpoint(id: string) {
    const endpoint = await prisma.aPIEndpoint.findUnique({
      where: { id },
      include: {
        tests: true,
        changes: { orderBy: { detectedAt: 'desc' }, take: 10 }
      }
    })

    if (endpoint) {
      return this.deserializeEndpoint(endpoint)
    }
    return null
  }

  async getEndpoints(filters?: {
    method?: string
    source?: string
    tags?: string[]
    jobId?: string
  }) {
    const where: any = {}
    
    if (filters?.method) where.method = filters.method
    if (filters?.source) where.source = filters.source
    if (filters?.jobId) where.jobId = filters.jobId
    
    const endpoints = await prisma.aPIEndpoint.findMany({
      where,
      orderBy: { discoveredAt: 'desc' },
      take: 100
    })

    return endpoints.map(e => this.deserializeEndpoint(e))
  }

  async searchEndpoints(query: string) {
    const endpoints = await prisma.aPIEndpoint.findMany({
      where: {
        OR: [
          { url: { contains: query } },
          { summary: { contains: query } },
          { description: { contains: query } },
          { tags: { contains: query } }
        ]
      },
      take: 50
    })

    return endpoints.map(e => this.deserializeEndpoint(e))
  }

  // Change tracking
  private detectChanges(existing: any, updated: APIEndpoint): Array<{
    field: string
    oldValue: any
    newValue: any
  }> {
    const changes = []
    const fields = ['parameters', 'requestBody', 'responses', 'authentication', 'rateLimit']
    
    for (const field of fields) {
      const oldValue = existing[field] ? JSON.parse(existing[field]) : null
      const newValue = (updated as any)[field]
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field, oldValue, newValue })
      }
    }
    
    return changes
  }

  private async saveChanges(endpointId: string, changes: any[]) {
    for (const change of changes) {
      await prisma.endpointChange.create({
        data: {
          endpointId,
          changeType: 'modified',
          field: change.field,
          oldValue: JSON.stringify(change.oldValue),
          newValue: JSON.stringify(change.newValue)
        }
      })
    }
  }

  async getRecentChanges(limit = 50) {
    return await prisma.endpointChange.findMany({
      orderBy: { detectedAt: 'desc' },
      take: limit,
      include: {
        endpoint: true
      }
    })
  }

  // Test operations
  async saveTest(endpointId: string, test: {
    name: string
    description?: string
    testType: string
    testCode: string
  }) {
    return await prisma.aPITest.create({
      data: {
        endpointId,
        ...test
      }
    })
  }

  async getEndpointTests(endpointId: string) {
    return await prisma.aPITest.findMany({
      where: { endpointId }
    })
  }

  async updateTestResult(testId: string, result: string, error?: string) {
    return await prisma.aPITest.update({
      where: { id: testId },
      data: {
        lastRun: new Date(),
        lastResult: result,
        lastError: error
      }
    })
  }

  // Notification operations
  async createNotification(changeId: string, notification: {
    type: string
    recipient: string
    subject: string
    message: string
  }) {
    return await prisma.notification.create({
      data: {
        changeId,
        ...notification
      }
    })
  }

  async getPendingNotifications() {
    return await prisma.notification.findMany({
      where: { sent: false },
      include: {
        change: {
          include: { endpoint: true }
        }
      }
    })
  }

  async markNotificationSent(id: string, error?: string) {
    return await prisma.notification.update({
      where: { id },
      data: {
        sent: true,
        sentAt: new Date(),
        error
      }
    })
  }

  // Utility methods
  private deserializeEndpoint(dbEndpoint: any): any {
    return {
      ...dbEndpoint,
      parameters: dbEndpoint.parameters ? JSON.parse(dbEndpoint.parameters) : null,
      requestBody: dbEndpoint.requestBody ? JSON.parse(dbEndpoint.requestBody) : null,
      responses: dbEndpoint.responses ? JSON.parse(dbEndpoint.responses) : null,
      authentication: dbEndpoint.authentication ? JSON.parse(dbEndpoint.authentication) : null,
      rateLimit: dbEndpoint.rateLimit ? JSON.parse(dbEndpoint.rateLimit) : null,
      tags: dbEndpoint.tags ? JSON.parse(dbEndpoint.tags) : null
    }
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simple implementation - in production use node-cron or similar
    // For now, just add 1 hour
    return new Date(Date.now() + 60 * 60 * 1000)
  }

  async cleanup() {
    await prisma.$disconnect()
  }
}
