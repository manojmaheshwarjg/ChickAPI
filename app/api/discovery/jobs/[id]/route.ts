import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections, DiscoveryJob, APIEndpoint } from '@/lib/mongodb'

// GET /api/discovery/jobs/[id] - Get a specific discovery job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobsCollection = await getCollection<DiscoveryJob>(Collections.DISCOVERY_JOBS)
    const endpointsCollection = await getCollection<APIEndpoint>(Collections.API_ENDPOINTS)

    const job = await jobsCollection.findOne({ id: params.id })

    if (!job) {
      return NextResponse.json(
        { error: 'Discovery job not found' },
        { status: 404 }
      )
    }

    // Get endpoint count for this job
    const endpointCount = await endpointsCollection.countDocuments({ jobId: params.id })

    return NextResponse.json({
      id: job.id,
      name: job.name,
      status: job.status,
      schedule: job.schedule,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      endpointCount,
      config: job.config,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    })
  } catch (error) {
    console.error('Failed to fetch discovery job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discovery job' },
      { status: 500 }
    )
  }
}

// PUT /api/discovery/jobs/[id] - Update a discovery job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, config, schedule } = body

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Name and config are required' },
        { status: 400 }
      )
    }

    const job = await prisma.discoveryJob.update({
      where: { id: params.id },
      data: {
        name,
        config: JSON.stringify(config),
        schedule: schedule || null
      },
      include: {
        _count: {
          select: { endpoints: true }
        }
      }
    })

    return NextResponse.json({
      id: job.id,
      name: job.name,
      status: job.status,
      schedule: job.schedule,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      endpointCount: job._count.endpoints,
      config: JSON.parse(job.config || '{}'),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    })
  } catch (error) {
    console.error('Failed to update discovery job:', error)
    return NextResponse.json(
      { error: 'Failed to update discovery job' },
      { status: 500 }
    )
  }
}

// DELETE /api/discovery/jobs/[id] - Delete a discovery job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First delete related endpoints and results
    await prisma.aPIEndpoint.deleteMany({
      where: { jobId: params.id }
    })
    
    await prisma.discoveryResult.deleteMany({
      where: { jobId: params.id }
    })

    // Then delete the job
    await prisma.discoveryJob.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete discovery job:', error)
    return NextResponse.json(
      { error: 'Failed to delete discovery job' },
      { status: 500 }
    )
  }
}
