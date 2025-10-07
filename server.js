/**
 * Simple Express server for a two-page marketing campaign.
 * - Serves static files from /public
 * - Logs events to Vercel Blob Storage (cloud-based for Vercel deployment)
 * - Adds server-side IP, country, and city (via geoip-lite)
 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const { put, list } = require("@vercel/blob");
const geoip = require("geoip-lite");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }));

// Trust reverse proxy headers if deployed behind one (e.g., Nginx/Heroku/Vercel)
// so req.ip and x-forwarded-for are respected.
app.set("trust proxy", true);

// Serve static content
app.use(express.static(path.join(__dirname, "public")));

// Utility: store event to Vercel Blob Storage
async function storeEvent(page, obj) {
  try {
    // Create unique blob name: logs/page1/2024-10-07T12-30-45-123Z-sessionid.json
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");
    const sessionId = obj.session_id || "unknown";
    const blobName = `logs/${page}/${timestamp}-${sessionId}.json`;

    // Store the event as a JSON blob
    const blob = await put(blobName, JSON.stringify(obj, null, 2), {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: "application/json",
    });

    console.log("Event stored:", blob.url);
  } catch (err) {
    console.error("Failed to store event to Vercel Blob:", err);
  }
}

// Resolve IP and geo data
function resolveIpAndGeo(req) {
  // Get best-effort client IP
  let ip =
    (req.headers["x-forwarded-for"] || "").split(",").shift().trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "";

  // Clean IPv6 localhost or IPv4-mapped IPv6
  if (ip === "::1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

  const geo = geoip.lookup(ip) || {};
  const country = geo.country || null;
  // geoip-lite returns city only with certain datasets; fallback to null
  const city = geo.city || null;

  return { ip, country, city };
}

// Logging endpoint for both pages
app.post("/api/log", (req, res) => {
  const { ip, country, city } = resolveIpAndGeo(req);

  // Payload from client
  const {
    event, // "page1_view" | "page1_click" | "page1_exit" | "page2_view" | "page2_select" | "page2_exit"
    session_id, // UUID generated client-side, persisted across pages
    timestamp, // client timestamp (ms)
    page, // "page1" or "page2"
    duration_ms, // time spent on page/step before event (ms)
    clicked, // boolean for page1 click
    // For page2
    chosen_option, // object with { id, title, season, price, years }
    language, // "ar" | "en" | "tr"
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
    clicked: typeof clicked === "boolean" ? clicked : undefined,
    chosen_option: chosen_option || undefined,
    user_agent: req.headers["user-agent"] || null,
    referer: req.headers["referer"] || null,
  };

  // Store event to Vercel Blob (non-blocking)
  storeEvent(page, entry).catch((err) => {
    console.error("Error storing event:", err);
  });

  res.json({ ok: true });
});

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Retrieve logs endpoint (for viewing your data)
app.get("/api/logs", async (req, res) => {
  try {
    const { page, limit = 100 } = req.query;

    // List blobs with optional prefix filter
    const prefix = page ? `logs/${page}/` : "logs/";
    const { blobs } = await list({
      prefix,
      limit: parseInt(limit),
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Fetch all blob contents
    const logs = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          return { ...data, blob_url: blob.url, uploaded_at: blob.uploadedAt };
        } catch (err) {
          console.error("Error fetching blob:", err);
          return null;
        }
      })
    );

    res.json({
      ok: true,
      count: logs.filter((l) => l !== null).length,
      logs: logs.filter((l) => l !== null),
    });
  } catch (err) {
    console.error("Error retrieving logs:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
