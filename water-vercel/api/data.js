export default async function handler(req, res) {
  const GIST_ID = process.env.GIST_ID;
  const GIST_TOKEN = process.env.GIST_TOKEN;
  const GIST_FILE = "water-ai-data.json";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // GET — read from Gist
    if (req.method === "GET") {
      const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: { Authorization: `token ${GIST_TOKEN}`, Accept: "application/vnd.github.v3+json" }
      });
      const data = await r.json();
      const content = data.files?.[GIST_FILE]?.content;
      return res.status(200).json(content ? JSON.parse(content) : null);
    }

    // POST — write to Gist
    if (req.method === "POST") {
      const payload = req.body;
      const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers: { Authorization: `token ${GIST_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
        body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(payload, null, 2) } } })
      });
      return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
