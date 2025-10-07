require("dotenv").config();
const { list } = require("@vercel/blob");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { page, limit = 100 } = req.query;

    const prefix = page ? `logs/${page}/` : "logs/";
    const { blobs } = await list({
      prefix,
      limit: parseInt(limit),
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

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

    res.status(200).json({
      ok: true,
      count: logs.filter((l) => l !== null).length,
      logs: logs.filter((l) => l !== null),
    });
  } catch (err) {
    console.error("Error retrieving logs:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
