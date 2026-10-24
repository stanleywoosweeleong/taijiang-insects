/**
 * Taijiang Insects — photo identification Worker (Cloudflare Workers).
 *
 * The app POSTs { image: <base64 JPEG>, lang: "hans"|"hant"|"en"|"ms" }.
 * The Worker asks a vision model to match the photo against the 180 species in
 * data.js — and ONLY those — returning strict JSON:
 *   { match: <page number>|null, confidence: 0..1, alternatives: [pages],
 *     guess: { order, family, scientific, common_en }, notes: "<short, in lang>" }
 *
 * Secrets / vars (wrangler secret put / wrangler.toml [vars]):
 *   GEMINI_API_KEY   — from Google AI Studio (free tier is enough for a demo)
 *   DATA_URL         — https://<user>.github.io/<repo>/data.js
 *   ALLOWED_ORIGIN   — https://<user>.github.io   (CORS; "*" while testing)
 *   MODEL            — e.g. "gemini-2.5-flash" (check the current model list)
 *
 * The key never reaches the browser. Add a Cloudflare rate-limiting rule on the
 * route (e.g. 20 requests / minute / IP) before sharing the URL widely.
 */

let CANDIDATES = null; // module-scope cache: survives between requests on a warm isolate

async function loadCandidates(env) {
  if (CANDIDATES) return CANDIDATES;
  const res = await fetch(env.DATA_URL, { cf: { cacheTtl: 3600 } });
  if (!res.ok) throw new Error("cannot load data.js: " + res.status);
  const js = await res.text();
  const json = js.slice(js.indexOf("{"), js.lastIndexOf("}") + 1);
  const data = JSON.parse(json);
  CANDIDATES = data.species.map(s => ({
    p: s.p, zh: s.name.hant, en: s.name.en, sci: s.sci, order: s.order, fam: s.fam,
    size: s.size ? `${s.size[0]}-${s.size[1]} mm ${s.st || ""}`.trim() : "",
    id: (s.id.en || "").slice(0, 220),
  }));
  return CANDIDATES;
}

function cors(env, extra = {}) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    ...extra,
  };
}

const LANG_NAME = { hans: "Simplified Chinese", hant: "Traditional Chinese", en: "English", ms: "Malay (Bahasa Melayu)" };

function buildPrompt(cands, lang) {
  const list = cands.map(c =>
    `p${c.p} | ${c.zh} | ${c.en} | ${c.sci} | ${c.order} / ${c.fam} | ${c.size} | ${c.id}`
  ).join("\n");
  return `You are helping a visitor identify an insect photographed in or near Taijiang National Park, Tainan, Taiwan (coastal lowland: mangroves, windbreak forest, wet and dry grassland, ponds).

Compare the photo with the candidate list below. Each line is: page | Chinese name | English name | scientific name | order / family | size | key identification points.

Rules:
- Choose a match ONLY from the list, and only if the photo really fits that species' key points. Do not force a match.
- "confidence" is your honest probability (0 to 1) that the match is correct. Below 0.5 means a weak guess.
- "alternatives": up to 3 other plausible pages from the list, most likely first (may be empty).
- If the insect is not in the list, set "match" to null and fill "guess" with your best idea of its order, family, scientific name and English common name (empty strings where unsure).
- If the photo shows no insect, or is too blurry to judge, set match null, confidence 0, and say so in notes.
- "notes": one or two short sentences in ${LANG_NAME[lang] || "English"} explaining what features you relied on or what to check (e.g. "count the spots on the wing covers").
- Output strict JSON only, no markdown: {"match": number|null, "confidence": number, "alternatives": number[], "guess": {"order": "", "family": "", "scientific": "", "common_en": ""}, "notes": ""}

Candidates:
${list}`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(env) });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: cors(env) });

    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: cors(env) }); }
    const image = (body.image || "").replace(/^data:image\/\w+;base64,/, "");
    if (!image || image.length > 2_800_000) // ~2 MB of JPEG
      return new Response(JSON.stringify({ error: "image missing or too large" }), { status: 400, headers: cors(env) });
    const lang = ["hans", "hant", "en", "ms"].includes(body.lang) ? body.lang : "en";

    try {
      const cands = await loadCandidates(env);
      const model = env.MODEL || "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      const payload = {
        contents: [{ role: "user", parts: [
          { text: buildPrompt(cands, lang) },
          { inline_data: { mime_type: "image/jpeg", data: image } },
        ]}],
        generationConfig: { temperature: 0.2, response_mime_type: "application/json", max_output_tokens: 600 },
      };
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) {
        const txt = await r.text();
        return new Response(JSON.stringify({ error: "model error " + r.status, detail: txt.slice(0, 300) }), { status: 502, headers: cors(env) });
      }
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
      let out;
      try { out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); }
      catch { return new Response(JSON.stringify({ error: "unparseable model output" }), { status: 502, headers: cors(env) }); }

      // normalise & validate against the candidate list — never pass through a page that does not exist
      const pages = new Set(cands.map(c => c.p));
      const num = v => (typeof v === "string" ? Number(v.replace(/^p/i, "")) : Number(v));
      const match = out.match === null || out.match === undefined ? null : (pages.has(num(out.match)) ? num(out.match) : null);
      const result = {
        match,
        confidence: Math.max(0, Math.min(1, Number(out.confidence) || 0)),
        alternatives: Array.isArray(out.alternatives) ? out.alternatives.map(num).filter(p => pages.has(p) && p !== match).slice(0, 3) : [],
        guess: {
          order: String(out.guess?.order || ""), family: String(out.guess?.family || ""),
          scientific: String(out.guess?.scientific || ""), common_en: String(out.guess?.common_en || ""),
        },
        notes: String(out.notes || "").slice(0, 400),
        model,
      };
      return new Response(JSON.stringify(result), { headers: cors(env) });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: cors(env) });
    }
  },
};
