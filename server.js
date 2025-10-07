
/**
 * Simple Express server for a two-page marketing campaign.
 * - Serves static files from /public
 * - Logs events to JSONL files in /data without a database
 * - Adds server-side IP, country, and city (via geoip-lite)
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// Trust reverse proxy headers if deployed behind one (e.g., Nginx/Heroku/Vercel)
// so req.ip and x-forwarded-for are respected.
app.set('trust proxy', true);

// Serve static content
app.use(express.static(path.join(__dirname, 'public')));

// Utility: append a JSON object to a JSON Lines file
function appendJSONL(filename, obj) {
  const line = JSON.stringify(obj) + "\n";
  fs.appendFile(path.join(__dirname, 'data', filename), line, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
}

// Resolve IP and geo data
function resolveIpAndGeo(req) {
  // Get best-effort client IP
  let ip =
    (req.headers['x-forwarded-for'] || '').split(',').shift().trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '';

  // Clean IPv6 localhost or IPv4-mapped IPv6
  if (ip === '::1') ip = '127.0.0.1';
  if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

  const geo = geoip.lookup(ip) || {};
  const country = geo.country || null;
  // geoip-lite returns city only with certain datasets; fallback to null
  const city = geo.city || null;

  return { ip, country, city };
}

// Logging endpoint for both pages
app.post('/api/log', (req, res) => {
  const { ip, country, city } = resolveIpAndGeo(req);

  // Payload from client
  const {
    event,            // "page1_view" | "page1_click" | "page1_exit" | "page2_view" | "page2_select" | "page2_exit"
    session_id,       // UUID generated client-side, persisted across pages
    timestamp,        // client timestamp (ms)
    page,             // "page1" or "page2"
    duration_ms,      // time spent on page/step before event (ms)
    clicked,          // boolean for page1 click
    // For page2
    chosen_option,    // object with { id, title, season, price, years }
    language          // "ar" | "en" | "tr"
  } = req.body || {};

  const entry = {
    server_received_at: new Date().toISOString(),
    ip,
    country,
    city,
    event,
    session_id,
    timestamp,
    page,
    duration_ms,
    language,
    clicked: typeof clicked === 'boolean' ? clicked : undefined,
    chosen_option: chosen_option || undefined,
    user_agent: req.headers['user-agent'] || null,
    referer: req.headers['referer'] || null
  };

  // Choose file by page to make later analysis simple
  const filename = page === 'page2' ? 'page2.jsonl' : 'page1.jsonl';
  appendJSONL(filename, entry);

  res.json({ ok: true });
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
