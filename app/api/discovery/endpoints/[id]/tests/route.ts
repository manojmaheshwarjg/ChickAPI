import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TestGenerator } from '@/lib/discovery/TestGenerator'

// GET /api/discovery/endpoints/[id]/tests - Generate tests for an endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const endpoint = await prisma.aPIEndpoint.findUnique({
      where: { id: params.id }
    })

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }

    // Transform endpoint to expected format
    const endpointData = {
      id: endpoint.id,
      url: endpoint.url,
      method: endpoint.method,
      summary: endpoint.summary,
      description: endpoint.description,
      parameters: endpoint.parameters ? JSON.parse(endpoint.parameters) : [],
      requestBody: endpoint.requestBody ? JSON.parse(endpoint.requestBody) : undefined,
      responses: endpoint.responses ? JSON.parse(endpoint.responses) : [],
      authentication: endpoint.authentication ? JSON.parse(endpoint.authentication) : undefined,
      tags: endpoint.tags ? JSON.parse(endpoint.tags) : [],
      headers: endpoint.headers ? JSON.parse(endpoint.headers) : {}
    }

    const testGenerator = new TestGenerator()
    const testCode = await testGenerator.generateTests(endpointData, {
      framework: 'jest',
      includeAuth: true,
      includeValidation: true,
      includePerformance: false
    })

    return new NextResponse(testCode, {
      headers: {
        'Content-Type': 'application/javascript',
        'Content-Disposition': `attachment; filename="tests-${endpoint.id}.js"`
      }
    })
  } catch (error) {
    console.error('Failed to generate tests:', error)
    return NextResponse.json(
      { error: 'Failed to generate tests' },
      { status: 500 }
    )
  }
}

// dummy 3


