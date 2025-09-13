# 🚀 Quick Vercel Deployment Guide

## 1. Set up MongoDB Atlas (2 minutes)
1. Go to https://cloud.mongodb.com → Sign up (free)
2. Create cluster → Choose AWS free tier
3. Database Access → Add user → Username: `chickapi` → Generate password → Save password!
4. Network Access → Add IP → "Allow access from anywhere" (0.0.0.0/0)
5. Connect → Get connection string:
   ```
   mongodb+srv://chickapi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chickapi
   ```

## 2. Deploy to Vercel (1 minute)
```bash
# Option A: Vercel CLI (fastest)
npx vercel

# Option B: Vercel Dashboard
# 1. Go to vercel.com → New Project
# 2. Import from GitHub
# 3. Deploy
```

## 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```bash
MONGODB_URI = mongodb+srv://chickapi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chickapi
MONGODB_DB_NAME = chickapi  
NODE_ENV = production
```

## 4. Test Your App
1. Visit: `https://your-app.vercel.app`
2. Go to API Discovery page
3. Create a test job → Should work!

## Troubleshooting
- **500 Error**: Check MongoDB URI and network access
- **Connection Failed**: Verify MongoDB Atlas allows 0.0.0.0/0
- **Not Found**: Make sure environment variables are set

That's it! Your API Discovery tool is live! 🎉
