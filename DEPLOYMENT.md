# 🚀 Deploying ChickAPI to Vercel

## Prerequisites
- Vercel account (free)
- MongoDB Atlas account (free tier available)
- GitHub repository

## Step 1: Set up MongoDB Atlas (Production Database)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Sign up for free account

2. **Create a Cluster**
   - Click "Build a Database" → "Shared" (free tier)
   - Choose AWS, region closest to you
   - Cluster name: `chickapi-prod`

3. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Username: `chickapi-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - This is needed for Vercel's serverless functions

5. **Get Connection String**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string, it looks like:
   ```
   mongodb+srv://chickapi-user:<password>@chickapi-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? N
# - What's your project's name? chickapi
# - In which directory is your code located? ./
```

### Option B: Vercel Dashboard
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Framework preset: Next.js (auto-detected)
5. Configure environment variables (see below)
6. Deploy!

## Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Production Database
MONGODB_URI=mongodb+srv://chickapi-user:YOUR_PASSWORD@chickapi-prod.xxxxx.mongodb.net/chickapi?retryWrites=true&w=majority
MONGODB_DB_NAME=chickapi
NODE_ENV=production
```

## Step 4: Initialize Production Database

After deployment, initialize your production database:

1. **Option A: Use Vercel Function**
   - Go to your deployed URL: `https://your-app.vercel.app/api/discovery/jobs`
   - This will auto-create collections on first access

2. **Option B: Local Script to Production DB**
   ```bash
   # Set production MongoDB URI locally
   export MONGODB_URI="mongodb+srv://..."
   npm run db:init
   ```

## Step 5: Test Your Deployment

1. Visit: `https://your-app.vercel.app`
2. Navigate to API Discovery page
3. Create a test discovery job
4. Verify it saves to MongoDB Atlas

## Environment Variables Reference

| Variable | Development | Production |
|----------|-------------|------------|
| `MONGODB_URI` | `mongodb://localhost:27017` | `mongodb+srv://...atlas.mongodb.net/...` |
| `MONGODB_DB_NAME` | `chickapi` | `chickapi` |
| `NODE_ENV` | `development` | `production` |

## Troubleshooting

### Database Connection Issues
- Check MongoDB Atlas network access allows 0.0.0.0/0
- Verify connection string has correct password
- Ensure database user has proper permissions

### Vercel Function Timeout
- API discovery operations have 30s timeout (configured in vercel.json)
- For longer operations, consider using Vercel Edge Functions or background jobs

### Cold Starts
- First request after idle period may be slow
- MongoDB connection pooling helps with subsequent requests

## Performance Tips

1. **Connection Pooling**: Already configured in `lib/mongodb.ts`
2. **Indexes**: Auto-created on first database init
3. **Edge Runtime**: Consider for faster cold starts
4. **Caching**: Add Redis or Vercel KV for frequently accessed data

## Domain Configuration

After deployment, you can:
1. Add custom domain in Vercel dashboard
2. Configure DNS to point to Vercel
3. SSL certificates are automatic

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **MongoDB Atlas Monitoring**: Database performance metrics
- **Vercel Logs**: Real-time function logs

Your ChickAPI is now production-ready! 🎉
