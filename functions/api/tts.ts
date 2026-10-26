// POST /api/tts
// Text-to-Speech via OpenAI TTS API — produces natural neural voice audio.
//
// Body JSON: { text: string, lang: ChatbotLang }
// Returns: audio/mpeg MP3 stream that the client can play directly via <audio>.
//
// Keeps the OpenAI API key server-side (never exposed to client).

interface Env {
  OPENAI_API_KEY?: string;
}

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

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

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ success: false, error: 'TTS service not configured.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Limit text length — OpenAI TTS max is 40k chars but we truncate for safety
  const truncatedText = text.length > 5000 ? text.slice(0, 5000) + '...' : text;

  try {
    const ttsRes = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: truncatedText,
        voice: 'nova', // Most natural-sounding across ES/EN/PT/DE
        response_format: 'mp3',
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      const errSlice = errText.length > 300 ? errText.slice(0, 300) : errText;
      return new Response(JSON.stringify({ success: false, error: `OpenAI TTS error (${ttsRes.status}): ${errSlice}` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
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
