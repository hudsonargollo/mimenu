// POST /api/tts
// Text-to-Speech via the VPS edge-tts service (Microsoft Edge neural voices).
// Produces natural-sounding speech with no API key and no GPU required.
//
// Body JSON: { text: string, lang?: ChatbotLang }
// Returns: audio/mpeg MP3 that the client plays via HTMLAudioElement.

interface Env {
  TTS_SERVICE_URL?: string;
  TTS_FALLBACK_URL?: string;
}

const VOICE_MAP: Record<string, string> = {
  es: 'es-BO-SofiaNeural',
  en: 'en-US-JennyNeural',
  pt: 'pt-BR-FranciscaNeural',
  de: 'de-DE-KatjaNeural',
};

const DEFAULT_SERVICE_URLS = [
  'https://tts.clubemkt.online',
  'http://62.171.137.90:8788',
];

const TTS_TIMEOUT_MS = 9000;

let preferredServiceUrl: string | null = null;

async function requestTts(baseUrl: string, text: string, lang: string, voice?: string): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'mimenu-voice-agent/1.0',
      },
      body: JSON.stringify({ text, lang, voice }),
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`${response.status} ${response.statusText}: ${errorBody.slice(0, 200)}`);
    }

    const audio = await response.arrayBuffer();
    if (audio.byteLength === 0) throw new Error('Empty audio response');
    return audio;
  } finally {
    clearTimeout(timer);
  }
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  let body: { text?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const text = body.text?.trim();
  const lang = body.lang || 'es';

  if (!text) {
    return new Response(JSON.stringify({ success: false, error: 'text is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const truncatedText = text.length > 500 ? `${text.slice(0, 500)}...` : text;
  const voice = VOICE_MAP[lang] || VOICE_MAP['es'];

  const serviceUrls = Array.from(
    new Set(
      [preferredServiceUrl, env.TTS_SERVICE_URL, env.TTS_FALLBACK_URL, ...DEFAULT_SERVICE_URLS]
        .map((url) => url?.trim())
        .filter((url): url is string => Boolean(url)),
    ),
  );

  const failures: string[] = [];
  for (const serviceUrl of serviceUrls) {
    try {
      const audio = await requestTts(serviceUrl, truncatedText, lang, voice);
      preferredServiceUrl = serviceUrl;
      return new Response(audio, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${serviceUrl} -> ${message}`);
      console.warn(`TTS attempt failed: ${serviceUrl}`, message);
    }
  }

  console.error('TTS generation failed for every endpoint:', failures.join(' | '));
  return new Response(
    JSON.stringify({ success: false, error: 'TTS service unavailable.' }),
    {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};

export const onRequestOptions = async () => new Response(null, { status: 204 });
