const { PrismaClient } = require('@prisma/client')

async function initDb() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🗄️  Initializing database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist by trying to count records
    const jobCount = await prisma.discoveryJob.count()
    console.log(`📊 Found ${jobCount} discovery jobs`)
    
    // Create a sample job if none exist
    if (jobCount === 0) {
      console.log('🆕 Creating sample discovery job...')
      await prisma.discoveryJob.create({
        data: {
          name: 'Sample API Discovery',
          status: 'pending',
          config: JSON.stringify({
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
          })
        }
      })
      console.log('✅ Sample job created')
    }
    
    console.log('🎉 Database initialization complete!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    
    if (error.code === 'P2021') {
      console.log('💡 Table does not exist. Run: npx prisma migrate dev')
    } else if (error.code === 'P1003') {
      console.log('💡 Database does not exist. Run: npx prisma migrate dev')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initDb()
