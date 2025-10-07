# Deployment Guide - Vercel Blob Storage Setup

## Quick Start

### 1. Create a Vercel Account

Go to https://vercel.com and sign up if you haven't already.

### 2. Create a Blob Store

1. Visit https://vercel.com/dashboard/stores
2. Click **"Create Database"**
3. Select **"Blob"**
4. Give it a name (e.g., `campaign-analytics`)
5. Click **"Create"**

### 3. Get Your Token

After creating the Blob store:

1. You'll see **Environment Variables** section
2. Copy the `BLOB_READ_WRITE_TOKEN` value
3. Save it somewhere secure - you'll need it!

### 4. Deploy Your Site

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# When prompted:
# - Link to existing project? No
# - Project name: campaign-site (or your choice)
# - Directory: ./ (press Enter)
# - Build command: (leave empty, press Enter)
# - Output directory: (leave empty, press Enter)

# Add environment variable
vercel env add BLOB_READ_WRITE_TOKEN production

# Paste your token when prompted

# Deploy to production
vercel --prod
```

#### Option B: Using GitHub + Vercel Dashboard

1. **Push to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/campaign-site.git
   git push -u origin main
   ```

2. **Import to Vercel:**

   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Add Environment Variable:**

   - In the import screen, click "Environment Variables"
   - Add variable:
     - **Name**: `BLOB_READ_WRITE_TOKEN`
     - **Value**: (paste your token from step 3)
   - Click "Add"

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

### 5. Verify Deployment

Once deployed, visit:

- **Your site**: `https://your-project.vercel.app`
- **View logs**: `https://your-project.vercel.app/view-logs.html`
- **API endpoint**: `https://your-project.vercel.app/api/logs`

## Testing Locally First

Before deploying, test locally:

1. **Create `.env` file:**

   ```env
   BLOB_READ_WRITE_TOKEN=your_token_here
   PORT=3000
   ```

2. **Run the server:**

   ```bash
   npm start
   ```

3. **Test the app:**
   - Visit http://localhost:3000
   - Click around on both pages
   - Visit http://localhost:3000/view-logs.html
   - You should see your events logged!

## Connecting Multiple Environments

You can use the same Blob store for development and production, or create separate stores:

### Same Store (Easier)

- Use the same `BLOB_READ_WRITE_TOKEN` locally and in production
- Logs will be mixed together
- Good for small projects

### Separate Stores (Better Practice)

- Create two Blob stores: `campaign-dev` and `campaign-prod`
- Use different tokens for each environment
- Keeps production data clean

## Environment Variables

| Variable                | Required | Description                  |
| ----------------------- | -------- | ---------------------------- |
| `BLOB_READ_WRITE_TOKEN` | ✅ Yes   | Token from Vercel Blob store |
| `PORT`                  | No       | Server port (default: 3000)  |

## Viewing Your Analytics

### In Browser

Visit: `https://your-site.vercel.app/view-logs.html`

### Via API

```bash
# All logs
curl https://your-site.vercel.app/api/logs

# Page 1 only
curl https://your-site.vercel.app/api/logs?page=page1

# Last 50 logs
curl https://your-site.vercel.app/api/logs?limit=50
```

### In Vercel Dashboard

1. Go to https://vercel.com/dashboard/stores
2. Click on your Blob store
3. Browse the `logs/` folder
4. Click on any file to view its contents

## Troubleshooting

### "Failed to store event to Vercel Blob"

**Problem**: Missing or invalid `BLOB_READ_WRITE_TOKEN`

**Solution**:

1. Check if environment variable is set in Vercel
2. Redeploy: `vercel --prod`

### "Error 500" on /api/logs

**Problem**: Can't read from Blob storage

**Solution**:

1. Verify token is correct
2. Check Vercel logs: `vercel logs`
3. Ensure Blob store exists

### No logs showing up

**Problem**: Events aren't being saved

**Solution**:

1. Open browser console (F12)
2. Check for network errors
3. Verify `/api/log` endpoint is receiving requests
4. Check server logs in Vercel dashboard

## Cost Considerations

Vercel Blob Storage pricing (as of 2024):

- **Free tier**: 100GB storage, 100GB bandwidth/month
- **Pro**: Starts at $20/month for more

For a marketing campaign, the free tier is usually sufficient unless you expect millions of events.

## Data Export

To export all your data:

1. **Via Browser**: Visit `/view-logs.html` and click "Download JSON"

2. **Via Command Line**:

   ```bash
   curl "https://your-site.vercel.app/api/logs?limit=10000" > analytics.json
   ```

3. **Via Vercel CLI**:
   ```bash
   vercel blob ls logs/
   ```

## Next Steps

After deployment:

- [ ] Share your campaign URL
- [ ] Monitor analytics at `/view-logs.html`
- [ ] Set up custom domain (optional)
- [ ] Add more analytics tracking as needed

Need help? Check the [main README](./README.md) for more details!
