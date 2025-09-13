import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Exporter } from '@/lib/discovery/Exporter'

// GET /api/discovery/jobs/[id]/export - Export discovery job results
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'openapi'

    // Get the job and its endpoints
    const job = await prisma.discoveryJob.findUnique({
      where: { id: params.id },
      include: {
        endpoints: true
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Discovery job not found' },
        { status: 404 }
      )
    }

    // Transform endpoints to the expected format
    const endpoints = job.endpoints.map(endpoint => ({
      id: endpoint.id,
      url: endpoint.url,
      method: endpoint.method,
      summary: endpoint.summary,
      description: endpoint.description,
      parameters: endpoint.parameters ? JSON.parse(endpoint.parameters) : [],
      requestBody: endpoint.requestBody ? JSON.parse(endpoint.requestBody) : undefined,
      responses: endpoint.responses ? JSON.parse(endpoint.responses) : [],
      authentication: endpoint.authentication ? JSON.parse(endpoint.authentication) : undefined,
      rateLimit: endpoint.rateLimit ? JSON.parse(endpoint.rateLimit) : undefined,
      tags: endpoint.tags ? JSON.parse(endpoint.tags) : [],
      headers: endpoint.headers ? JSON.parse(endpoint.headers) : {},
      source: endpoint.source,
      complexity: endpoint.complexity,
      deprecated: endpoint.deprecated,
      documentation: endpoint.documentation,
      discoveredAt: endpoint.discoveredAt,
      lastSeen: endpoint.lastSeen,
      lastUpdated: endpoint.lastUpdated
    }))

    const exporter = new Exporter()
    const exportData = await exporter.export(endpoints, format as any)

    // Set appropriate content type and filename
    let contentType = 'application/json'
    let filename = `${job.name}-endpoints.json`
    
    switch (format) {
      case 'openapi':
        contentType = 'application/json'
        filename = `${job.name}-openapi.json`
        break
      case 'postman':
        contentType = 'application/json'
        filename = `${job.name}-postman.json`
        break
      case 'har':
        contentType = 'application/json'
        filename = `${job.name}-endpoints.har`
        break
      case 'markdown':
        contentType = 'text/markdown'
        filename = `${job.name}-endpoints.md`
        break
      case 'csv':
        contentType = 'text/csv'
        filename = `${job.name}-endpoints.csv`
        break
    }

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Failed to export discovery job:', error)
    return NextResponse.json(
      { error: 'Failed to export discovery job' },
      { status: 500 }
    )
  }
}
