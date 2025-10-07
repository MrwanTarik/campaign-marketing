# Quick Setup Instructions

## ✅ Migration Complete!

Your campaign site has been migrated from local JSON files to **Vercel Blob Storage**. This means your analytics data will persist when deployed to Vercel.

## 🚀 Next Steps

### 1. Get Your Vercel Blob Token

You need a `BLOB_READ_WRITE_TOKEN` to store and retrieve data:

1. Go to https://vercel.com/dashboard/stores
2. Click **"Create Database"** → **"Blob"**
3. Name it `campaign-analytics` (or your choice)
4. Copy the `BLOB_READ_WRITE_TOKEN` value

### 2. For Local Testing

Create a `.env` file in the project root:

```bash
BLOB_READ_WRITE_TOKEN=your_token_here
PORT=3000
```

Then run:

```bash
npm start
```

Visit:

- **Campaign**: http://localhost:3000
- **View Logs**: http://localhost:3000/view-logs.html

### 3. Deploy to Vercel

**Option A: Vercel CLI (Fastest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add BLOB_READ_WRITE_TOKEN production
# (paste your token when prompted)

# Deploy to production
vercel --prod
```

**Option B: GitHub + Vercel Dashboard**

1. Push to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variable: `BLOB_READ_WRITE_TOKEN`
5. Deploy!

## 📊 What Changed?

### Before (Local Files)

```
❌ Data stored in /data/page1.jsonl and /data/page2.jsonl
❌ Files don't persist on Vercel's serverless platform
❌ Can't access data after deployment
```

### After (Vercel Blob)

```
✅ Data stored in Vercel Blob Storage (cloud)
✅ Data persists across deployments
✅ Access data via /api/logs endpoint
✅ View analytics at /view-logs.html
```

## 🆕 New Features

1. **View Logs UI**: Visit `/view-logs.html` to see beautiful analytics dashboard
2. **API Endpoint**: `GET /api/logs` to retrieve data programmatically
3. **Filtering**: Filter by page (`?page=page1`) and limit (`?limit=50`)
4. **Download**: Export all data as JSON

## 📁 File Changes

- ✏️ `server.js` - Updated to use Vercel Blob instead of file system
- ➕ `public/view-logs.html` - New analytics viewer page
- ➕ `README.md` - Complete documentation
- ➕ `DEPLOYMENT.md` - Step-by-step deployment guide
- ➕ `vercel.json` - Vercel deployment configuration
- ➕ `.gitignore` - Ignore sensitive files

## ⚠️ Important Notes

1. **Old JSON files**: The existing `/data/*.jsonl` files are still there but won't be used in production
2. **Environment variable**: Make sure to add `BLOB_READ_WRITE_TOKEN` before deploying
3. **No database needed**: Vercel Blob is serverless - no database setup required!

## 🔍 Testing

After setting up your token:

1. Run `npm start`
2. Visit http://localhost:3000
3. Click around on both pages
4. Visit http://localhost:3000/view-logs.html
5. You should see your events logged! ✅

## 📚 More Help

- **Full documentation**: See [README.md](./README.md)
- **Deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vercel Blob docs**: https://vercel.com/docs/storage/vercel-blob

---

**Ready to deploy?** Follow the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)!
