const SUPABASE_FUNCTION = "https://zksruwuirmjzcgpudvpl.supabase.co/functions/v1/aion-runtime/health";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Ot_URL7wRFCc_bsuN-6IYQ_4ir537fS";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
    const upstream = await fetch(SUPABASE_FUNCTION, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY }
    });
    const body = await upstream.json();
    return res.status(upstream.status).json({
      ...body,
      gateway: "VERCEL",
      gateway_status: "CONNECTED"
    });
  } catch {
    return res.status(502).json({ error: "SUPABASE_RUNTIME_UNREACHABLE", gateway: "VERCEL" });
  }
}
