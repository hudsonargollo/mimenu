import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Loader2, Mic, MicOff, Pause, Send, Volume2, X } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { useLang } from '@/i18n/LanguageProvider';
import { ConciergeOrb, OrbState } from './ConciergeOrb';
import { MenuChatbotLegacy } from './MenuChatbotLegacy';

type UiLang = 'es' | 'en' | 'pt';

type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };

type AgentConfig = {
  enabled: boolean;
  assistant?: { name?: string; greeting?: string };
  widget?: { token?: string; apiEndpoint?: string };
};

type PublicTurn = {
  id: string;
  status: string;
  user_message: { text: string } | null;
  assistant_message: { text: string } | null;
  assistant_messages: Array<{ text: string }> | null;
};

type PublicSession = {
  revision: number;
  state: string;
  is_completed: boolean;
  turns: PublicTurn[];
};

type Labels = {
  title: string;
  launcher: string;
  placeholder: string;
  privacy: string;
  listening: string;
  error: string;
  retry: string;
  playReply: string;
  stopSpeaking: string;
  mic: string;
  micDenied: string;
  voiceUnsupported: string;
};

const labels: Record<UiLang, Labels> = {
  es: {
    title: 'Asistente',
    launcher: 'Asistente',
    placeholder: 'Escribe tu mensaje…',
    privacy: 'Conversación con el concierge virtual de {venue}.',
    listening: 'Te escucho…',
    error: 'No pude responder. Tocá para reintentar.',
    retry: 'Reintentar',
    playReply: 'Escuchar respuesta',
    stopSpeaking: 'Detener audio',
    mic: 'Micrófono',
    micDenied: 'No pude acceder al micrófono. Revisá los permisos del navegador.',
    voiceUnsupported: 'Este navegador no admite micrófono.'
  },
  en: {
    title: 'Assistant',
    launcher: 'Assistant',
    placeholder: 'Type a message…',
    privacy: 'Conversation with the {venue} virtual concierge.',
    listening: 'Listening…',
    error: 'I could not reply. Tap to retry.',
    retry: 'Retry',
    playReply: 'Play reply',
    stopSpeaking: 'Stop audio',
    mic: 'Microphone',
    micDenied: "I couldn't access the microphone. Check your browser permissions.",
    voiceUnsupported: "This browser doesn't support a microphone."
  },
  pt: {
    title: 'Assistente',
    launcher: 'Assistente',
    placeholder: 'Digite sua mensagem…',
    privacy: 'Conversa com o concierge virtual de {venue}.',
    listening: 'Estou ouvindo…',
    error: 'Não consegui responder. Toque para tentar de novo.',
    retry: 'Tentar de novo',
    playReply: 'Ouvir resposta',
    stopSpeaking: 'Parar áudio',
    mic: 'Microfone',
    micDenied: 'Não consegui acessar o microfone. Verifique as permissões do navegador.',
    voiceUnsupported: 'Este navegador não oferece microfone.'
  }
};

// Map UI language to BCP-47 tags for speech recognition and TTS.
const LANG_TAGS: Record<UiLang, string> = { es: 'es-BO', en: 'en-US', pt: 'pt-BR' };

interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

interface SpeechResultList {
  isFinal: boolean;
  0?: { transcript?: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const W = typeof window !== 'undefined' ? (window as any) : {};
const SpeechRecognitionCtor: (new () => SpeechRecognitionInstance) | null =
  W.SpeechRecognition || W.webkitSpeechRecognition || null;

function detailToText(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  try {
    return JSON.stringify(detail);
  } catch {
    return 'error';
  }
}

export function MenuChatbot() {
  const { venue } = useMimenu();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const { lang } = useLang();
  const t = labels[lang];

  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const sessionRef = useRef<{ token: string; revision: number; turnCount: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const audioResolveRef = useRef<((played: boolean) => void) | null>(null);
  const browserSpeechResolveRef = useRef<(() => void) | null>(null);
  const speechGenerationRef = useRef(0);
  const listeningRef = useRef(false);
  const busyRef = useRef(false);
  const openRef = useRef(false);
  const submitRef = useRef<(message: string) => void>(() => {});

  useEffect(() => {
    let active = true;
    fetch(`/api/concierge/agent?venue=${encodeURIComponent(venue.slug)}`)
      .then(res => (res.ok ? res.json() : null))
      .then((config: AgentConfig | null) => {
        if (active && config) setAgent(config);
      })
      .catch(() => {
        // Config unreachable: fall back to the legacy local engine.
        if (active) setAgent({ enabled: false });
      });
    return () => {
      active = false;
    };
  }, [venue.slug]);

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open, interim]);

  useEffect(() => {
    if (!open) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
      listeningRef.current = false;
      setListening(false);
      setInterim('');
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 320);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  /* ---------- speech output (neural TTS with browser fallback) ---------- */

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    speechGenerationRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
    }
    releaseObjectUrl();
    const resolveAudio = audioResolveRef.current;
    audioResolveRef.current = null;
    resolveAudio?.(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const resolveBrowser = browserSpeechResolveRef.current;
    browserSpeechResolveRef.current = null;
    resolveBrowser?.();
    setSpeaking(false);
    setSpeakingId(null);
  }, [releaseObjectUrl]);

  useEffect(() => {
    if (open) return;
    stopSpeech();
  }, [open, stopSpeech]);

  const fetchTtsAudio = useCallback(async (replyText: string): Promise<Blob | null> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, lang }),
        signal: controller.signal
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      return blob.size > 0 ? blob : null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }, [lang]);

  const playAudioBlob = useCallback(
    (blob: Blob) =>
      new Promise<boolean>(resolve => {
        const audio = audioRef.current;
        if (!audio) {
          resolve(false);
          return;
        }
        releaseObjectUrl();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        audioResolveRef.current = resolve;
        const settle = (played: boolean) => {
          if (audioResolveRef.current !== resolve) return;
          audioResolveRef.current = null;
          audio.onended = null;
          audio.onerror = null;
          resolve(played);
        };
        audio.onended = () => settle(true);
        audio.onerror = () => settle(false);
        audio.src = url;
        audio.play().catch(() => settle(false));
      }),
    [releaseObjectUrl]
  );

  const speakWithBrowser = useCallback(
    (replyText: string) =>
      new Promise<void>(resolve => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          resolve();
          return;
        }
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(replyText);
        utterance.lang = LANG_TAGS[lang];
        utterance.rate = 1.02;
        const voices = synth.getVoices();
        const matchedVoice = voices.find(voice => voice.lang?.toLowerCase().startsWith(lang));
        if (matchedVoice) utterance.voice = matchedVoice;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          browserSpeechResolveRef.current = null;
          resolve();
        };
        browserSpeechResolveRef.current = finish;
        utterance.onend = finish;
        utterance.onerror = finish;
        try {
          synth.speak(utterance);
        } catch {
          finish();
        }
      }),
    [lang]
  );

  const speakText = useCallback(
    async (replyText: string, messageId: string) => {
      stopSpeech();
      const generation = speechGenerationRef.current;
      setSpeaking(true);
      setSpeakingId(messageId);
      try {
        const blob = await fetchTtsAudio(replyText);
        if (speechGenerationRef.current !== generation) return;
        if (blob && (await playAudioBlob(blob))) return;
        if (speechGenerationRef.current !== generation) return;
        await speakWithBrowser(replyText);
      } finally {
        if (speechGenerationRef.current === generation) {
          setSpeaking(false);
          setSpeakingId(null);
        }
      }
    },
    [fetchTtsAudio, playAudioBlob, speakWithBrowser, stopSpeech]
  );

  /* ------------------------- speech input ------------------------- */

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setVoiceNote(t.voiceUnsupported);
      return;
    }
    if (busyRef.current || listeningRef.current) return;
    const rec = recognitionRef.current;
    if (!rec) return;
    stopSpeech();
    rec.lang = LANG_TAGS[lang];
    try {
      rec.start();
      listeningRef.current = true;
      setListening(true);
      setInterim('');
      setVoiceNote(null);
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  }, [lang, stopSpeech, t.voiceUnsupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    listeningRef.current = false;
    setListening(false);
    setInterim('');
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;
    const rec = new SpeechRecognitionCtor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = LANG_TAGS[lang];

    rec.addEventListener('result', (ev: unknown) => {
      const e = ev as { results?: ArrayLike<SpeechResultList> };
      const results = e.results;
      if (!results) return;
      let transcript = '';
      let isFinal = false;
      for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        transcript += result?.[0]?.transcript ?? '';
        if (result?.isFinal) isFinal = true;
      }
      transcript = transcript.trim();
      if (!transcript) return;
      setInterim(transcript);
      if (!isFinal) return;
      setInterim('');
      listeningRef.current = false;
      setListening(false);
      submitRef.current(transcript);
    });

    rec.addEventListener('end', () => {
      listeningRef.current = false;
      setListening(false);
      setInterim('');
    });

    rec.addEventListener('error', (ev: unknown) => {
      const error = (ev as { error?: string }).error ?? '';
      listeningRef.current = false;
      setListening(false);
      setInterim('');
      if (error === 'aborted') return;
      if (error === 'not-allowed' || error === 'service-not-allowed' || error === 'audio-capture') {
        setVoiceNote(t.micDenied);
        return;
      }
    });

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ---------------------- Dograh conversation ---------------------- */

  const endpoint = agent?.widget?.apiEndpoint || 'https://voice.clubemkt.digital';

  const applySession = useCallback((session: PublicSession) => {
    const current = sessionRef.current;
    const knownTurns = current?.turnCount ?? 0;
    const fresh: ChatMessage[] = [];
    session.turns.slice(knownTurns).forEach((turn, index) => {
      if (turn.user_message) {
        fresh.push({ id: `${turn.id}-user`, role: 'user', text: turn.user_message.text });
      }
      const assistantTexts = turn.assistant_messages ?? (turn.assistant_message ? [turn.assistant_message] : []);
      assistantTexts.forEach((msg, msgIndex) => {
        fresh.push({ id: `${turn.id}-assistant-${index}-${msgIndex}`, role: 'assistant', text: msg.text });
      });
    });
    if (fresh.length) setMessages(prev => [...prev, ...fresh]);
    sessionRef.current = {
      token: current?.token ?? '',
      revision: session.revision,
      turnCount: session.turns.length
    };
  }, []);

  const initSession = useCallback(async (): Promise<boolean> => {
    const token = agent?.widget?.token;
    if (!token) return false;
    try {
      const res = await fetch(`${endpoint}/api/v1/public/embed/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { session_token: string; chat_session?: PublicSession };
      sessionRef.current = { token: data.session_token, revision: 0, turnCount: 0 };
      if (data.chat_session) applySession(data.chat_session);
      return true;
    } catch {
      return false;
    }
  }, [agent, endpoint, applySession]);

  const ensureSession = useCallback(async (): Promise<boolean> => {
    if (sessionRef.current) return true;
    return initSession();
  }, [initSession]);

  useEffect(() => {
    if (open && agent?.enabled && !sessionRef.current) {
      void ensureSession();
    }
  }, [open, agent, ensureSession]);

  const sendToDograh = useCallback(
    async (message: string) => {
      const session = sessionRef.current;
      if (!session) return;
      try {
        const res = await fetch(`${endpoint}/api/v1/public/embed/chat/${session.token}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message, expected_revision: session.revision })
        });
        if (res.status === 404 || res.status === 400) {
          // Session expired or completed: start a fresh conversation.
          sessionRef.current = null;
          if (await initSession()) {
            await sendToDograh(message);
          }
          return;
        }
        if (res.status === 409) {
          // Revision drift: reload the transcript and retry once.
          const sync = await fetch(`${endpoint}/api/v1/public/embed/chat/${session.token}`);
          if (sync.ok) {
            applySession((await sync.json()) as PublicSession);
            await sendToDograh(message);
          }
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
          throw new Error(detailToText(body?.detail ?? res.status));
        }
        applySession((await res.json()) as PublicSession);
      } catch (error) {
        console.error('Concierge turn failed:', error);
        setMessages(prev => [...prev, { id: `${Date.now()}-error`, role: 'assistant', text: t.error }]);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [endpoint, applySession, initSession, t.error]
  );

  const handleSubmit = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || busyRef.current) return;
      if (listeningRef.current) {
        try {
          recognitionRef.current?.stop();
        } catch {
          /* noop */
        }
        listeningRef.current = false;
        setListening(false);
        setInterim('');
      }
      setText('');
      setVoiceNote(null);
      setMessages(prev => [...prev, { id: `${Date.now()}-user`, role: 'user', text: trimmed }]);
      busyRef.current = true;
      setBusy(true);
      void (async () => {
        if (await ensureSession()) {
          await sendToDograh(trimmed);
        } else {
          setMessages(prev => [...prev, { id: `${Date.now()}-error`, role: 'assistant', text: t.error }]);
          busyRef.current = false;
          setBusy(false);
        }
      })();
    },
    [ensureSession, sendToDograh, t.error]
  );

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    handleSubmit(text);
  };

  const handlePlayMessage = (message: ChatMessage) => {
    if (speakingId === message.id && speaking) {
      stopSpeech();
      return;
    }
    void speakText(message.text, message.id);
  };

  useEffect(
    () => () => {
      speechGenerationRef.current += 1;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  if (agent && !agent.enabled) {
    return <MenuChatbotLegacy />;
  }

  const orbState: OrbState = busy ? 'thinking' : speaking ? 'speaking' : listening ? 'listening' : 'idle';
  const assistantName = agent?.assistant?.name || t.title;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="concierge-sheet"
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              aria-label="Cerrar chat"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#050507]/70 backdrop-blur-md"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label={assistantName}
              className="relative flex h-[min(92vh,820px)] w-full flex-col overflow-hidden rounded-t-[32px] border-x border-t border-[#E8C15A]/15 bg-[#0B0B0E] shadow-[0_-24px_80px_-20px_rgba(0,0,0,0.9)] sm:h-[min(85vh,760px)] sm:max-w-xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            >
              <div
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#E8C15A]/70 to-transparent"
                aria-hidden="true"
              />
              <header className="relative bg-gradient-to-b from-[#121217] to-[#0B0B0E] px-5 pb-4 pt-3">
                <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[#E8C15A]/30" aria-hidden="true" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ConciergeOrb size={42} state={orbState} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#C8B26A]">
                        Concierge
                      </p>
                      <p className="truncate font-display text-lg leading-tight text-[#F5E7C1]">
                        {assistantName}
                      </p>
                      <p className="truncate text-[11px] text-[#9A9484]">{venue.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar chat"
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-[#C8B26A] transition-colors hover:border-[#E8C15A]/40 hover:text-[#F5D68A]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'ml-auto rounded-2xl rounded-br-md bg-gradient-to-br from-[#F5D68A] via-[#E8C15A] to-[#C9973C] text-[#1A1408] shadow-[0_8px_24px_-10px_rgba(232,193,90,0.45)]'
                        : 'rounded-2xl rounded-bl-md border border-white/5 bg-[#16161C] text-[#EDEAE0]'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="flex items-end gap-2">
                        <span className="min-w-0 flex-1 whitespace-pre-wrap">{message.text}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayMessage(message)}
                          aria-label={
                            speakingId === message.id && speaking ? t.stopSpeaking : t.playReply
                          }
                          className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-transparent bg-transparent text-[#C8B26A] transition-colors hover:bg-[#E8C15A]/10 hover:text-[#F5D68A]"
                          title={speakingId === message.id && speaking ? t.stopSpeaking : t.playReply}
                        >
                          {speakingId === message.id && speaking ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{message.text}</span>
                    )}
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2 px-1 text-xs text-[#C8B26A]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />…
                  </div>
                )}
              </div>
              <form
                onSubmit={submitMessage}
                className="border-t border-white/5 bg-[#0B0B0E] px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3"
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={event => setText(event.target.value)}
                    placeholder={t.placeholder}
                    aria-label={t.placeholder}
                    disabled={busy}
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#14141A] px-4 py-3 text-sm text-[#EDEAE0] outline-none transition-colors placeholder:text-[#6B6B75] focus:border-[#E8C15A]/50 focus:ring-1 focus:ring-[#E8C15A]/40"
                  />
                  {SpeechRecognitionCtor && (
                    <button
                      type="button"
                      onClick={() => (listening ? stopListening() : startListening())}
                      disabled={busy}
                      aria-label={listening ? t.stopSpeaking : t.mic}
                      title={t.listening}
                      className={`rounded-2xl border px-3 transition-colors disabled:opacity-50 ${
                        listening
                          ? 'border-transparent bg-rose-500 text-white hover:bg-rose-600'
                          : 'border-[#E8C15A]/30 bg-[#1C1C23] text-[#F5D68A] hover:bg-[#E8C15A]/10'
                      }`}
                    >
                      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy || !text.trim()}
                    aria-label="Enviar mensaje"
                    className="rounded-2xl border-transparent bg-gradient-to-b from-[#F5D68A] to-[#D9A93F] px-4 text-[#1A1408] shadow-[0_8px_20px_-8px_rgba(232,193,90,0.6)] transition-opacity disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {listening && (
                  <p className="mt-2 text-center text-[11px] text-[#E8C15A]">
                    {t.listening}
                    {interim ? ` “${interim}”` : ''}
                  </p>
                )}
                {!listening && voiceNote && (
                  <p className="mt-2 text-center text-[11px] text-[#9A9484]">{voiceNote}</p>
                )}
                <p className="mt-2 text-center text-[10px] leading-tight text-[#6B6B75]">
                  {t.privacy.replace('{venue}', venue.name)}
                </p>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div
          className="fixed inset-x-0 z-40 flex justify-center px-4"
          style={{ bottom: `calc(${cartCount > 0 ? '5.5rem' : '1rem'} + env(safe-area-inset-bottom))` }}
        >
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir chat"
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-2.5 rounded-full border border-[#E8C15A]/25 bg-[#0B0B0E]/95 py-1.5 pl-1.5 pr-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8),0_0_24px_-6px_rgba(232,193,90,0.35)] backdrop-blur transition-transform hover:-translate-y-0.5"
          >
            <ConciergeOrb size={44} state="idle" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#C8B26A]">
                Concierge
              </span>
              <span className="font-display text-[15px] text-[#F5E7C1]">{assistantName}</span>
            </span>
            <ChevronUp
              className="h-4 w-4 text-[#E8C15A] transition-transform group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </motion.button>
        </div>
      )}
    </>
  );
}
