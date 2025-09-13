# MongoDB Setup for ChickAPI

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Start MongoDB container
docker run -d --name chickapi-mongo -p 27017:27017 mongo:latest

# Initialize database
npm run db:setup
```

### Option 2: Local MongoDB Installation
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Run: `npm run db:setup`

### Option 3: MongoDB Atlas (Cloud)
1. Create account at https://cloud.mongodb.com
2. Create cluster and get connection string
3. Set environment variable:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chickapi
   ```
4. Run: `npm run db:setup`

## Environment Variables

Create a `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=chickapi
NODE_ENV=development
```

## Benefits of MongoDB for API Discovery

✅ **Native JSON Storage** - No need to stringify/parse complex API configurations
✅ **Flexible Schema** - Handle varied endpoint structures easily  
✅ **Better Performance** - Document queries perfect for filtering endpoints
✅ **Scalability** - Handle large volumes of discovered API data
✅ **No Migrations** - Schema changes are seamless

## Data Structure

### Discovery Jobs
```javascript
{
  id: "job_123456_abc",
  name: "My API Discovery",
  status: "completed",
  config: {
    url: "https://api.example.com",
    discoveryType: "dynamic",
    // ... complex nested configuration
  },
  schedule: "*/30 * * * *",
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### API Endpoints
```javascript
{
  id: "endpoint_123",
  jobId: "job_123456_abc", 
  url: "/api/users",
  method: "GET",
  parameters: { ... },
  response: { ... },
  discoveredAt: ISODate()
}
```

## Commands

- `npm run db:init` - Initialize MongoDB with sample data
- `npm run db:setup` - Full database setup
- `npm run dev:next` - Start development server
