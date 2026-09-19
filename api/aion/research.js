const SUPABASE_FUNCTION = "https://zksruwuirmjzcgpudvpl.supabase.co/functions/v1/aion-runtime/v1/capabilities/web-research";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Ot_URL7wRFCc_bsuN-6IYQ_4ir537fS";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  try {
    const auth = req.headers.authorization;
    const upstream = await fetch(SUPABASE_FUNCTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        ...(auth ? { Authorization: auth } : {})
      },
      body: JSON.stringify(req.body ?? {})
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch {
    return res.status(502).json({ error: "SUPABASE_RUNTIME_UNREACHABLE", gateway: "VERCEL" });
  }
}
