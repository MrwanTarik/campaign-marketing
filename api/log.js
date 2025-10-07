require("dotenv").config();
const { put } = require("@vercel/blob");
const geoip = require("geoip-lite");

// Utility: store event to Vercel Blob Storage
async function storeEvent(page, obj) {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");
    const sessionId = obj.session_id || "unknown";
    const blobName = `logs/${page}/${timestamp}-${sessionId}.json`;

    const blob = await put(blobName, JSON.stringify(obj, null, 2), {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: "application/json",
    });

    console.log("Event stored:", blob.url);
    return blob;
  } catch (err) {
    console.error("Failed to store event to Vercel Blob:", err);
    throw err;
  }
}

// Resolve IP and geo data
function resolveIpAndGeo(req) {
  let ip =
    (req.headers["x-forwarded-for"] || "").split(",").shift().trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "";

  if (ip === "::1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

  const geo = geoip.lookup(ip) || {};
  const country = geo.country || null;
  const city = geo.city || null;

  return { ip, country, city };
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { ip, country, city } = resolveIpAndGeo(req);

    const {
      event,
      session_id,
      timestamp,
      page,
      duration_ms,
      clicked,
      chosen_option,
      language,
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

    await storeEvent(page, entry);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error storing event:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
