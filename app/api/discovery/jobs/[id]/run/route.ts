import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections, DiscoveryJob, APIEndpoint } from '@/lib/mongodb'
import { DiscoveryOrchestrator } from '@/lib/discovery/DiscoveryOrchestrator'

// POST /api/discovery/jobs/[id]/run - Run a discovery job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the job
    const jobsCollection = await getCollection<DiscoveryJob>(Collections.DISCOVERY_JOBS)
    const job = await jobsCollection.findOne({ id: params.id })

    if (!job) {
      return NextResponse.json(
        { error: 'Discovery job not found' },
        { status: 404 }
      )
    }

    // Update job status to running
    await jobsCollection.updateOne(
      { id: params.id },
      {
        $set: {
          status: 'running',
          lastRun: new Date(),
          updatedAt: new Date()
        }
      }
    )

    // Get the job configuration
    const config = job.config
    
    // Create discovery configuration
    const discoveryConfig = {
      sources: {
        dynamicCrawl: config.discoveryType === 'dynamic' ? {
          enabled: true,
          url: config.url,
          maxDepth: config.crawlDepth || 3,
          timeout: config.timeout || 30000,
          rateLimit: config.rateLimit || 10,
          followRedirects: true,
          includeStaticAssets: config.includeStaticAssets || false,
          simulateInteractions: config.simulateInteractions !== false,
          authentication: config.authentication || { type: 'none' },
          filters: config.filters || {}
        } : undefined,
        specifications: config.discoveryType === 'specification' ? [
          { url: config.url, type: 'openapi' }
        ] : [],
        trafficLogs: config.discoveryType === 'traffic' ? [] : []
      },
      output: {
        format: config.exportFormat || 'openapi',
        includeExamples: true,
        validateSchema: true
      }
    }

    // Run discovery in the background
    setTimeout(async () => {
      try {
        const orchestrator = new DiscoveryOrchestrator()
        await orchestrator.startDiscovery(discoveryConfig)
        const results = orchestrator.getDiscoveryResults()

        // Save results to database
        await prisma.discoveryResult.create({
          data: {
            jobId: params.id,
            statistics: JSON.stringify(results.statistics),
            endpointCount: results.endpoints.length,
            duration: 0 // Would need to track actual duration
          }
        })

        // Save discovered endpoints
        for (const endpoint of results.endpoints) {
          await prisma.aPIEndpoint.create({
            data: {
              jobId: params.id,
              url: endpoint.url,
              method: endpoint.method,
              pathPattern: endpoint.url, // Simple pattern for now
              summary: endpoint.summary,
              description: endpoint.description,
              parameters: JSON.stringify(endpoint.parameters || []),
              requestBody: endpoint.requestBody ? JSON.stringify(endpoint.requestBody) : null,
              responses: JSON.stringify(endpoint.responses || []),
              authentication: endpoint.authentication ? JSON.stringify(endpoint.authentication) : null,
              rateLimit: endpoint.rateLimit ? JSON.stringify(endpoint.rateLimit) : null,
              tags: JSON.stringify(endpoint.tags || []),
              headers: JSON.stringify(endpoint.headers || {}),
              source: endpoint.source || 'dynamic',
              complexity: endpoint.complexity || 1.0
            }
          })
        }

        // Update job status to completed
        await prisma.discoveryJob.update({
          where: { id: params.id },
          data: { status: 'completed' }
        })
      } catch (error) {
        console.error('Discovery job failed:', error)
        
        // Update job status to failed
        await prisma.discoveryJob.update({
          where: { id: params.id },
          data: { status: 'failed' }
        })
      }
    }, 1000) // Start after 1 second to allow response to be sent

    return NextResponse.json({ 
      message: 'Discovery job started',
      status: 'running'
    })
  } catch (error) {
    console.error('Failed to start discovery job:', error)
    
    // Update job status back to pending
    try {
      await prisma.discoveryJob.update({
        where: { id: params.id },
        data: { status: 'failed' }
      })
    } catch (updateError) {
      console.error('Failed to update job status:', updateError)
    }

    return NextResponse.json(
      { error: 'Failed to start discovery job' },
      { status: 500 }
    )
  }
}
