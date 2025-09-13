import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections, DiscoveryJob, APIEndpoint } from '@/lib/mongodb'

// GET /api/discovery/jobs - List all discovery jobs
export async function GET() {
  try {
    const jobsCollection = await getCollection<DiscoveryJob>(Collections.DISCOVERY_JOBS)
    const endpointsCollection = await getCollection<APIEndpoint>(Collections.API_ENDPOINTS)

    // Get all jobs sorted by creation date
    const jobs = await jobsCollection.find({}).sort({ createdAt: -1 }).toArray()

    // Get endpoint counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const endpointCount = await endpointsCollection.countDocuments({ jobId: job.id })
        return {
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
        }
      })
    )

    return NextResponse.json(jobsWithCounts)
  } catch (error) {
    console.error('Failed to fetch discovery jobs:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please ensure MongoDB is running and accessible.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch discovery jobs' },
      { status: 500 }
    )
  }
}

// POST /api/discovery/jobs - Create a new discovery job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, config, schedule } = body

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Name and config are required' },
        { status: 400 }
      )
    }

    // Validate config structure
    const requiredConfigFields = ['url', 'discoveryType']
    const missingFields = requiredConfigFields.filter(field => !config[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required config fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const jobsCollection = await getCollection<DiscoveryJob>(Collections.DISCOVERY_JOBS)
    
    // Generate a unique ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: DiscoveryJob = {
      id: jobId,
      name,
      status: 'pending',
      config,
      schedule: schedule || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await jobsCollection.insertOne(job)

    // Return the job data without MongoDB _id
    return NextResponse.json({
      id: job.id,
      name: job.name,
      status: job.status,
      schedule: job.schedule,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      endpointCount: 0,
      config: job.config,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create discovery job:', error)
    return NextResponse.json(
      { error: 'Failed to create discovery job' },
      { status: 500 }
    )
  }
}
