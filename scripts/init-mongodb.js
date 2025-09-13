const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB_NAME || 'chickapi'

async function initMongoDB() {
  const client = new MongoClient(uri)
  
  try {
    console.log('🗄️  Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(dbName)
    
    // Create collections with indexes
    console.log('📊 Creating collections and indexes...')
    
    // Discovery Jobs collection
    const jobsCollection = db.collection('discoveryJobs')
    await jobsCollection.createIndex({ id: 1 }, { unique: true })
    await jobsCollection.createIndex({ status: 1 })
    await jobsCollection.createIndex({ createdAt: -1 })
    
    // API Endpoints collection
    const endpointsCollection = db.collection('apiEndpoints')
    await endpointsCollection.createIndex({ id: 1 }, { unique: true })
    await endpointsCollection.createIndex({ jobId: 1 })
    await endpointsCollection.createIndex({ url: 1, method: 1 })
    await endpointsCollection.createIndex({ discoveredAt: -1 })
    
    console.log('✅ Collections and indexes created')
    
    // Check if sample data exists
    const jobCount = await jobsCollection.countDocuments()
    
    if (jobCount === 0) {
      console.log('🆕 Creating sample discovery job...')
      
      const sampleJob = {
        id: `job_${Date.now()}_sample`,
        name: 'Sample API Discovery',
        status: 'pending',
        config: {
          url: 'https://api.example.com',
          discoveryType: 'dynamic',
          crawlDepth: 3,
          timeout: 30000,
          rateLimit: 10,
          simulateInteractions: true,
          includeStaticAssets: false,
          filters: {
            includePaths: [],
            excludePaths: [],
            includeHosts: [],
            excludeHosts: []
          },
          authentication: {
            type: 'none',
            credentials: {}
          }
        },
        schedule: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await jobsCollection.insertOne(sampleJob)
      console.log('✅ Sample job created')
    }
    
    console.log('🎉 MongoDB initialization complete!')
    console.log(`📊 Database: ${dbName}`)
    console.log(`🔗 URI: ${uri}`)
    
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB server not running. Try:')
      console.log('   • Run: docker run -d --name chickapi-mongo -p 27017:27017 mongo:latest')
      console.log('   • Or install MongoDB locally')
    }
    
    process.exit(1)
  } finally {
    await client.close()
  }
}

initMongoDB()
