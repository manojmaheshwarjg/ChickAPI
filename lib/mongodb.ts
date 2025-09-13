import { MongoClient, Db, Collection } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB_NAME || 'chickapi'

const globalForMongo = globalThis as unknown as {
  _mongoClient: MongoClient | undefined
  _db: Db | undefined
}

let client: MongoClient
let db: Db

if (process.env.NODE_ENV === 'development') {
  if (!globalForMongo._mongoClient) {
    client = new MongoClient(uri)
    globalForMongo._mongoClient = client
  } else {
    client = globalForMongo._mongoClient
  }
} else {
  client = new MongoClient(uri)
}

async function connectToDatabase(): Promise<Db> {
  if (globalForMongo._db) {
    return globalForMongo._db
  }

  try {
    await client.connect()
    db = client.db(dbName)
    
    if (process.env.NODE_ENV === 'development') {
      globalForMongo._db = db
    }
    
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Collection interfaces
export interface DiscoveryJob {
  _id?: string
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  schedule: string | null
  config: {
    url: string
    discoveryType: 'static' | 'dynamic' | 'hybrid'
    crawlDepth: number
    timeout: number
    rateLimit: number
    simulateInteractions: boolean
    includeStaticAssets: boolean
    filters: {
      includePaths: string[]
      excludePaths: string[]
      includeHosts: string[]
      excludeHosts: string[]
    }
    authentication: {
      type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2'
      credentials: Record<string, any>
    }
  }
  lastRun?: Date
  nextRun?: Date
  createdAt: Date
  updatedAt: Date
}

export interface APIEndpoint {
  _id?: string
  id: string
  jobId: string
  url: string
  method: string
  statusCode?: number
  responseTime?: number
  contentType?: string
  parameters?: Record<string, any>
  headers?: Record<string, string>
  body?: any
  response?: any
  discoveredAt: Date
  source: string
}

// Helper functions
export async function getDb(): Promise<Db> {
  return await connectToDatabase()
}

export async function getCollection<T = any>(name: string): Promise<Collection<T>> {
  const database = await getDb()
  return database.collection<T>(name)
}

// Collection names
export const Collections = {
  DISCOVERY_JOBS: 'discoveryJobs',
  API_ENDPOINTS: 'apiEndpoints'
} as const

export { connectToDatabase }
