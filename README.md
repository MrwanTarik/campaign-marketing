# Campaign Site - Two-Page Marketing Campaign

A multilingual (Arabic, English, Turkish) two-page marketing campaign site with analytics tracking using Vercel Blob Storage.

## Features

- 📊 **Analytics Tracking**: Tracks page views, clicks, and user selections with geolocation data
- 🌍 **Multilingual**: Supports Arabic (RTL), English, and Turkish
- ☁️ **Cloud Storage**: Uses Vercel Blob Storage for persistent event logging
- 🗺️ **Geolocation**: Server-side IP geolocation with country and city detection
- 📱 **Responsive**: Modern, mobile-friendly UI

## Tech Stack

- **Backend**: Node.js + Express
- **Storage**: Vercel Blob Storage
- **Geolocation**: geoip-lite
- **Frontend**: Vanilla JavaScript, CSS

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
PORT=3000
```

**To get your Vercel Blob token:**

1. Go to https://vercel.com/dashboard/stores
2. Create a new Blob store (or use an existing one)
3. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Run the Server

```bash
npm start
```

Visit `http://localhost:3000` to view the site.

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Create a Blob Store:**

   - Go to https://vercel.com/dashboard/stores
   - Click "Create Database" → "Blob"
   - Copy the `BLOB_READ_WRITE_TOKEN`

3. **Deploy:**

   ```bash
   vercel
   ```

4. **Set Environment Variable:**

   ```bash
   vercel env add BLOB_READ_WRITE_TOKEN
   ```

   Paste your token when prompted.

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard

1. **Create a Blob Store:**

   - Go to https://vercel.com/dashboard/stores
   - Create a new Blob store
   - Copy the `BLOB_READ_WRITE_TOKEN`

2. **Import Repository:**

   - Go to https://vercel.com/new
   - Import your Git repository

3. **Configure Environment Variables:**

   - In project settings, add:
     - Key: `BLOB_READ_WRITE_TOKEN`
     - Value: (paste your token)

4. **Deploy:**
   - Click "Deploy"

## API Endpoints

### `POST /api/log`

Logs user events (page views, clicks, selections).

**Request Body:**

```json
{
  "event": "page1_view",
  "session_id": "uuid",
  "timestamp": 1234567890,
  "page": "page1",
  "language": "ar"
}
```

### `GET /api/logs`

Retrieves stored event logs.

**Query Parameters:**

- `page` (optional): Filter by page (`page1` or `page2`)
- `limit` (optional): Maximum number of logs to return (default: 100)

**Example:**

```bash
# Get all logs
curl https://your-site.vercel.app/api/logs

# Get page1 logs only
curl https://your-site.vercel.app/api/logs?page=page1

# Get last 50 logs
curl https://your-site.vercel.app/api/logs?limit=50
```

**Response:**

```json
{
  "ok": true,
  "count": 10,
  "logs": [
    {
      "server_received_at": "2025-10-07T10:08:51.820Z",
      "ip": "192.168.1.1",
      "country": "SA",
      "city": "Riyadh",
      "event": "page1_view",
      "session_id": "uuid",
      "blob_url": "https://...",
      "uploaded_at": "2025-10-07T10:08:51.820Z"
    }
  ]
}
```

## Data Structure

Each event is stored as a separate JSON blob in Vercel Blob Storage with the following structure:

```json
{
  "server_received_at": "ISO timestamp",
  "ip": "client IP",
  "country": "country code",
  "city": "city name",
  "event": "event type",
  "session_id": "session UUID",
  "timestamp": "client timestamp",
  "page": "page identifier",
  "duration_ms": "time on page",
  "language": "selected language",
  "user_agent": "browser user agent",
  "referer": "referrer URL"
}
```

## Viewing Your Data

### In the Browser

Visit: `https://your-site.vercel.app/api/logs`

### Download as JSON

```bash
curl https://your-site.vercel.app/api/logs > analytics.json
```

### View in Vercel Dashboard

1. Go to https://vercel.com/dashboard/stores
2. Click on your Blob store
3. Browse the `logs/` folder

## Project Structure

```
campaign-site/
├── data/              # Legacy JSONL files (not used in production)
├── public/
│   ├── assets/        # Flag images
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── translations.js
│   ├── index.html     # Page 1
│   └── options.html   # Page 2
├── server.js          # Express server
├── package.json
├── vercel.json        # Vercel configuration
└── README.md
```

## License

Private project - All rights reserved
