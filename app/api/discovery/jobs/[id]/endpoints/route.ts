import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections, APIEndpoint } from '@/lib/mongodb'

// GET /api/discovery/jobs/[id]/endpoints - Get endpoints for a discovery job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const endpointsCollection = await getCollection<APIEndpoint>(Collections.API_ENDPOINTS)
    const endpoints = await endpointsCollection.find({ jobId: params.id }).sort({ discoveredAt: -1 }).toArray()

    // Transform the data to match the expected format
    const transformedEndpoints = endpoints.map(endpoint => ({
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

    return NextResponse.json(transformedEndpoints)
  } catch (error) {
    console.error('Failed to fetch endpoints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endpoints' },
      { status: 500 }
    )
  }
}
