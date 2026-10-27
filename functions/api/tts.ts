// POST /api/tts
// Text-to-Speech via the local VPS edge-tts service (Microsoft Edge neural voices).
// Produces natural-sounding speech with no API key and no GPU required.
//
// Body JSON: { text: string, lang?: ChatbotLang }
// Returns: audio/mpeg MP3 stream that the client plays via <audio>.

interface Env {
  TTS_SERVICE_URL?: string;
}

// Fallback URL — the nginx reverse proxy for the edge-tts container
const TTS_SERVICE_URL = 'https://tts.clubemkt.online';

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  let body: { text?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const text = body.text?.trim();
  const lang = body.lang || 'es';

  if (!text) {
    return new Response(JSON.stringify({ success: false, error: 'text is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const serviceUrl = env.TTS_SERVICE_URL || TTS_SERVICE_URL;

  // Limit text length — edge-tts handles long text but we cap for latency
  const truncatedText = text.length > 500 ? text.slice(0, 500) + '...' : text;

  try {
    const ttsRes = await fetch(`${serviceUrl}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: truncatedText, lang }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      const errSlice = errText.length > 300 ? errText.slice(0, 300) : errText;
      return new Response(JSON.stringify({ success: false, error: `TTS service error (${ttsRes.status}): ${errSlice}` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    // Stream the MP3 directly to the client
    return new Response(ttsRes.body, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (err) {
    console.error('TTS generation failed:', err);
    const msg = err instanceof Error ? err.message : 'Unexpected error.';
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const onRequestOptions = async () => new Response(null, { status: 204 });
