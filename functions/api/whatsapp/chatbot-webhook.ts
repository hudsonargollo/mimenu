/**
 * Cloudflare Function: WhatsApp Chatbot Webhook for Evolution API
 *
 * Receives inbound WhatsApp messages from Evolution API, routes them
 * to the correct venue (multi-tenant via slug), processes them through
 * the chatbot engine, and sends the reply back via Evolution API.
 *
 * Bound to each venue: the slug is extracted from the webhook URL path
 * (/api/whatsapp/chatbot-webhook/<venueSlug>) or from the payload.
 *
 * Evolution API webhook format (v2):
 *   POST /webhook/chatbot-webhook/<slug>
 *   { "data": { "key": { "remoteJid": "5511999999999@s.whatsapp.net" },
 *               "message": { "conversation": "hi" | "extendedTextMessage": { "text": "..." } } } }
 */

interface Env {
  // Per-venue Evolution API overrides (if set, these take priority over env defaults)
  EVOLUTION_API_URL?: string;
  EVOLUTION_API_KEY?: string;
  EVOLUTION_INSTANCE_NAME?: string;
  // KV namespace for multi-tenant session state (shared with other WhatsApp features)
  MIMENU_KV: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
  };
}

// --- Inline chatbot engine (shared types + logic) ---
// These types mirror the src/lib/chatbot/engine.ts exports.
// Duplicated here because Pages Functions don't import from src/ at runtime.

type ChatbotLang = 'es' | 'en' | 'pt' | 'de';
type ChatSource = 'web' | 'whatsapp';
type ReservationStep = 'idle' | 'party_size' | 'date' | 'time' | 'name' | 'phone' | 'confirm';

interface ChatbotVenueContext {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
}

interface ChatbotMenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

interface ReservationDraft {
  step: ReservationStep;
  partySize?: number;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
  idempotencyKey?: string;
}

interface ChatbotSessionState {
  language: ChatbotLang;
  userName?: string;
  reservationDraft?: ReservationDraft;
  lastReservation?: {
    id: string;
    customerName: string;
    customerPhone: string;
    partySize: number;
    reservationDate: string;
    reservationTime: string;
    idempotencyKey: string;
  };
}

interface ReservationRequest {
  venueId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  source: ChatSource;
  idempotencyKey?: string;
}

interface ChatbotResponse {
  reply: string;
  detectedLang: ChatbotLang;
  nextState: ChatbotSessionState;
  actionRequired?: 'create_reservation';
  reservationData?: ReservationRequest;
}

// --- Inlined engine functions ---

function normalize(s: string): string {
  return s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function detectLanguage(text: string, fallback: ChatbotLang): ChatbotLang {
  const s = normalize(text);
  const tokens = s.split(/\s+/);
  const scores: Record<ChatbotLang, number> = { es: 0, en: 0, pt: 0, de: 0 };
  for (const token of tokens) {
    if (/\b(hola|buenos|buenas|tardes|carta|menu|platos|comida|reservar|gracias|horario|donde|ubicacion|tapas|paella|churro|tacos|ceviche|tiradito)\b/.test(token)) scores.es += 1;
    if (/\b(hello|hi|hey|good|great|menu|booking|table|hours|thanks|please|how|what|where|address|location|reservation|already|said|yes|no|name|want|need|like|can|could|would|should|tell|show|give)\b/.test(token)) scores.en += 1;
    if (/\b(ola|oi|com|para|obrigado|cardapio|prato|bebida|cerveja|carne|peixe|salada|arroz|feijao|frango|porco|vinho|caipirinha|cuscuz|tapioca|acai|doce|sobremesa|suco)\b/.test(token)) scores.pt += 1;
    if (/\b(hallo|guten|tag|bitte|danke|speisekarte|gericht|essen|trinken|reservierung|tisch|personen|zeit|wo|adresse|offnungszeiten|bestellung|bezahlen)\b/.test(token)) scores.de += 1;
  }
  const best = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a);
  if (best[1] > 0) return best[0] as ChatbotLang;
  return fallback;
}

function formatItems(items: ChatbotMenuItem[]): string {
  return items.filter(i => i.isAvailable !== false).slice(0, 12)
    .map(i => `• ${i.name} — ${Number(i.price).toFixed(2)}` + (i.description ? ` (${i.description})` : ''))
    .join('\n');
}

const affirmative = /^(si|yes|sim|ja|confirmar|confirm|ok|okay|dale|vale|claro|sure|please|gerne|certo|perfeito|super|absolutely|por supuesto|of course)\b/i;
const negative = /^(no|nao|nein|cancel|cancelar|abbrechen|stop|nie|nicht|never|pass)\b/i;

function extractName(text: string): string | null {
  const n = normalize(text);
  const patterns = [
    /\b(?:me llamo|my name is|chamo|ich bin|je m'appelle|me chamo|yo soy|i am)\s+(.+)/i,
    /^(?:hola|h|hi)\s+(.+)/i,
    /^soy\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = n.match(p);
    if (m && m[1]) {
      const candidate = m[1].split(/\s+/).filter(w => w.length > 1 && !/[0-9]/.test(w)).slice(0, 3).join(' ');
      if (candidate.length >= 2) return candidate;
    }
  }
  return null;
}

function isLikelyName(text: string): boolean {
  const n = normalize(text);
  if (/\b(menu|carta|cardapio|horario|hours|ubicacion|address|location|reserv|reserve|booking|mesa|table|vegano|vegan|vegetariano|vegetarian|gluten|price|precio|costo|cost|hola|hello|hi|hey|ola|hallo|buenos|buenas|tardes|noches|oi)\b/.test(n)) return false;
  const words = n.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 1 && words.length <= 4) {
    if (/^(que|como|cual|donde|por|para|cuantos|cuantas|cuando|porque|por que|me|puedes|puedo|quiero|sirve|tiene|hay|existe)\b/.test(n)) return false;
    return true;
  }
  return false;
}

// Copy function (returns formatted strings per language)
function getCopy(lang: ChatbotLang): Record<string, any> {
  const copies: Record<string, Record<string, any>> = {
    es: {
      welcome: (v: string, n?: string) => n ? `¡Hola ${n}! Bienvenido/a a ${v}. ¿En qué puedo ayudarte?` : `¡Hola! Bienvenido/a a ${v}. ¿Cómo te llamas?`,
      askNameFirst: '¡Hola! Para atenderte mejor, ¿cómo te llamas?',
      menu: (i: string) => i ? `Algunas opciones del menú:\n${i}` : 'Todavía no hay platos disponibles para mostrar.',
      noItems: 'No encontré platos con ese criterio. Prueba con otro nombre o categoría.',
      hours: (v: string) => `Nuestro horario es: ${v}`,
      location: (v: string) => `Estamos en: ${v}`,
      vegetarian: (i: string) => `Opciones vegetarianas:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
      vegan: (i: string) => `Opciones veganas:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
      glutenFree: (i: string) => `Opciones sin gluten:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
      bestSellers: (i: string) => i ? `Nuestros platos más pedidos:\n${i}` : 'Aún no hay platos destacados.',
      featured: (i: string) => i ? `Platos recomendados:\n${i}` : 'Aún no hay recomendaciones.',
      reserve: (n?: string) => n ? `Claro ${n}, ¿para cuántas personas es la reserva?` : '¿Para cuántas personas?',
      askParty: 'Indícame cuántas personas (de 1 a 50).',
      reservationTip: (party: number) => party >= 2 ? `Perfecto para grupos. Tenemos mesas para ${party} personas.` : '',
      askDate: '¿Para qué fecha? Indícala, por favor.',
      askTime: '¿A qué hora?',
      askName: '¿A nombre de quién?',
      askPhone: '¿Qué teléfono de contacto podemos usar?',
      confirm: (d: any, n?: string) => `Muy bien ${n || d.name}. ${d.partySize} personas el ${d.date} a las ${d.time}. ¿Confirmo la reserva?`,
      submitted: (d: any, n?: string) => `¡Gracias ${n || d.name}! Le envié la solicitud al restaurante para ${d.partySize} personas el ${d.date} a las ${d.time}. Te contactarán pronto para confirmar.`,
      alreadySubmitted: 'Esta solicitud ya fue enviada y está pendiente de confirmación del restaurante.',
      cancelled: (n?: string) => n ? `Entendido ${n}. ¿En qué más puedo ayudarte?` : 'Solicitud cancelada. ¿Puedo ayudarte con algo más?',
      fallback: (n?: string) => n ? `Perdón ${n}, no entendí. ¿Quieres que te muestre el menú, horarios, ubicación o una reserva?` : 'No entendí la consulta. Puedes preguntar por el menú, horarios, ubicación o una reserva.',
    },
    en: {
      welcome: (v: string, n?: string) => n ? `Hi ${n}! Welcome to ${v}. What can I help you with?` : `Hello! Welcome to ${v}. What's your name?`,
      askNameFirst: "Hello! To serve you better, what's your name?",
      menu: (i: string) => i ? `A few menu options:\n${i}` : 'There are no menu items available to show yet.',
      noItems: 'I couldn\'t find a matching dish. Try another name or category.',
      hours: (v: string) => `Our opening hours are: ${v}`,
      location: (v: string) => `We are located at: ${v}`,
      vegetarian: (i: string) => `Vegetarian options:\n${i || 'Please ask the restaurant about available options.'}`,
      vegan: (i: string) => `Vegan options:\n${i || 'Please ask the restaurant about available options.'}`,
      glutenFree: (i: string) => `Gluten-free options:\n${i || 'Please ask the restaurant about available options.'}`,
      bestSellers: (i: string) => i ? `Our most popular dishes:\n${i}` : 'No featured dishes available yet.',
      featured: (i: string) => i ? `Staff recommendations:\n${i}` : 'No recommendations available yet.',
      reserve: (n?: string) => n ? `Sure ${n}, how many guests for the reservation?` : 'How many guests?',
      askParty: 'Please give the number of guests (1–50).',
      reservationTip: (party: number) => party >= 2 ? `Great for groups. We have tables for ${party} guests.` : '',
      askDate: 'What date would you like?',
      askTime: 'What time?',
      askName: 'What name should I use?',
      askPhone: 'What phone number can the restaurant use to contact you?',
      confirm: (d: any, n?: string) => `Great ${n || d.name}. ${d.partySize} guests on ${d.date} at ${d.time}. Shall I confirm the reservation?`,
      submitted: (d: any, n?: string) => `Thanks ${n || d.name}! I sent your request for ${d.partySize} guests on ${d.date} at ${d.time}. The restaurant will contact you soon to confirm.`,
      alreadySubmitted: 'This request has already been submitted and is pending restaurant confirmation.',
      cancelled: (n?: string) => n ? `Got it ${n}. Anything else I can help with?` : 'Request cancelled. Can I help with anything else?',
      fallback: (n?: string) => n ? `Sorry ${n}, I didn't catch that. Want to hear about the menu, hours, location, or make a reservation?` : `I didn't understand. Ask about the menu, hours, location, or a reservation.`,
    },
    pt: {
      welcome: (v: string, n?: string) => n ? `Oi ${n}! Bem-vindo(a) ao ${v}. Em que posso ajudar?` : `Olá! Bem-vindo(a) ao ${v}. Como você se chama?`,
      askNameFirst: 'Olá! Para te atender melhor, como você se chama?',
      menu: (i: string) => i ? `Algumas opções do cardápio:\n${i}` : 'Ainda não há itens disponíveis para mostrar.',
      noItems: 'Não encontrei um prato correspondente. Tente outro nome ou categoria.',
      hours: (v: string) => `Nosso horário é: ${v}`,
      location: (v: string) => `Estamos em: ${v}`,
      vegetarian: (i: string) => `Opções vegetarianas:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
      vegan: (i: string) => `Opções veganas:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
      glutenFree: (i: string) => `Opções sem glúten:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
      bestSellers: (i: string) => i ? `Nossos pratos mais pedidos:\n${i}` : 'Ainda não há pratos destacados.',
      featured: (i: string) => i ? `Recomendações da casa:\n${i}` : 'Ainda não há recomendações.',
      reserve: (n?: string) => n ? `Claro ${n}, para quantas pessoas é a reserva?` : 'Para quantas pessoas?',
      askParty: 'Informe o número de pessoas (1 a 50).',
      reservationTip: (party: number) => party >= 2 ? `Perfeito para grupos. Temos mesas para ${party} pessoas.` : '',
      askDate: 'Para qual data?',
      askTime: 'A que horas?',
      askName: 'Em nome de quem?',
      askPhone: 'Qual telefone podemos usar para contato?',
      confirm: (d: any, n?: string) => `Perfeito ${n || d.name}. ${d.partySize} pessoas em ${d.date} às ${d.time}. Confirmo a reserva?`,
      submitted: (d: any, n?: string) => `Obrigado ${n || d.name}! Enviei sua solicitação ao restaurante para ${d.partySize} pessoas em ${d.date} às ${d.time}. Eles entrarão em contato em breve para confirmar.`,
      alreadySubmitted: 'Esta solicitação já foi enviada e aguarda confirmação do restaurante.',
      cancelled: (n?: string) => n ? `Certo ${n}. Posso te ajudar com algo mais?` : 'Solicitação cancelada. Posso ajudar em algo mais?',
      fallback: (n?: string) => n ? `Desculpe ${n}, não entendi. Quer que eu mostre o cardápio, horários, localização ou faço uma reserva?` : 'Não entendi. Pergunte sobre o cardápio, horários, localização ou reserva.',
    },
    de: {
      welcome: (v: string, n?: string) => n ? `Hallo ${n}! Willkommen bei ${v}. Wie kann ich helfen?` : `Hallo! Willkommen bei ${v}. Wie darf ich dich nennen?`,
      askNameFirst: 'Hallo! Wie darf ich dich nennen, damit ich dir besser helfen kann?',
      menu: (i: string) => i ? `Einige Speisen:\n${i}` : 'Derzeit sind keine Speisen verfügbar.',
      noItems: 'Ich habe kein passendes Gericht gefunden. Versuchen Sie einen anderen Namen oder eine Kategorie.',
      hours: (v: string) => `Unsere Öffnungszeiten: ${v}`,
      location: (v: string) => `Sie finden uns hier: ${v}`,
      vegetarian: (i: string) => `Vegetarische Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
      vegan: (i: string) => `Vegane Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
      glutenFree: (i: string) => `Glutenfreie Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
      bestSellers: (i: string) => i ? `Unsere beliebtesten Gerichte:\n${i}` : 'Noch keine beliebten Gerichte verfügbar.',
      featured: (i: string) => i ? `Empfohlene Gerichte:\n${i}` : 'Keine Empfehlungen verfügbar.',
      reserve: (n?: string) => n ? `Klar ${n}, für wie viele Personen?` : 'Für wie viele Personen?',
      askParty: 'Bitte nennen Sie die Personenzahl (1 bis 50).',
      reservationTip: (party: number) => party >= 2 ? `Perfekt für Gruppen. Wir haben Tische für ${party} Personen.` : '',
      askDate: 'Für welches Datum?',
      askTime: 'Um wie viel Uhr?',
      askName: 'Auf welchen Namen?',
      askPhone: 'Welche Telefonnummer darf das Restaurant verwenden?',
      confirm: (d: any, n?: string) => `Super ${n || d.name}. ${d.partySize} Personen am ${d.date} um ${d.time}. Soll ich die Reservierung bestätigen?`,
      submitted: (d: any, n?: string) => `Danke ${n || d.name}! Ich habe deine Anfrage für ${d.partySize} Personen am ${d.date} um ${d.time} an das Restaurant gesendet. Sie melden sich bald zur Bestätigung.`,
      alreadySubmitted: 'Diese Anfrage wurde bereits gesendet und wartet auf die Bestätigung des Restaurants.',
      cancelled: (n?: string) => n ? `Alles klar ${n}. Kann ich sonst helfen?` : 'Anfrage abgebrochen. Kann ich sonst helfen?',
      fallback: (n?: string) => n ? `Entschuldigung ${n}, das habe ich nicht verstanden. Willst du die Speisekarte, Öffnungszeiten, die Adresse oder eine Reservierung?` : 'Das habe ich nicht verstanden. Fragen Sie nach Speisekarte, Öffnungszeiten, Anfahrt oder Reservierung.',
    },
  };
  return copies[lang] || copies.es;
}

/**
 * Process a single user message and return the chatbot response.
 * This mirrors the logic in src/lib/chatbot/engine.ts.
 */
function processMessage(
  message: string,
  state: ChatbotSessionState,
  venue: ChatbotVenueContext,
  menuItems: ChatbotMenuItem[],
  source: ChatSource
): ChatbotResponse {
  const text = message.trim();
  const n = normalize(text);
  const lang = detectLanguage(text, state.language || 'es');
  const c = getCopy(lang);
  const name = state.userName;

  let draft: ReservationDraft = { step: 'idle', ...(state.reservationDraft || {}) };
  let nextState: ChatbotSessionState = { ...state, language: lang };

  const response = (
    reply: string,
    nextDraft: ReservationDraft = draft,
    extra: Partial<ChatbotResponse> = {}
  ): ChatbotResponse => ({
    reply,
    detectedLang: lang,
    nextState: { ...nextState, language: lang, reservationDraft: nextDraft },
    ...extra,
  });

  // --- First: if we don't have a user name yet, ask for it ---
  if (!name) {
    const extracted = extractName(text);
    if (extracted) {
      nextState = { ...state, language: lang, userName: extracted };
      return response(c.welcome(venue.name, extracted), draft, {});
    }
    if (isLikelyName(text)) {
      const guessedName = text.split(/\s+/)
        .filter(w => w.length > 1 && !/[0-9]/.test(w) && !/^(yo|soy|my|name|is|ya|i|am|already|said|that|this|the|a|an|to|for|and|or|on)$/i.test(w))
        .slice(0, 3).join(' ');
      if (guessedName.length >= 2) {
        nextState = { ...state, language: lang, userName: guessedName };
        return response(c.welcome(venue.name, guessedName), draft, {});
      }
    }
    if (!text) return response(c.askNameFirst);
    return response(c.askNameFirst);
  }

  // --- We have the user's name: proceed with normal conversation ---
  if (!text) return response(c.fallback(name));

  // A repeated affirmative after submission must not start another insert.
  if (draft.step === 'idle' && state.lastReservation && affirmative.test(n)) {
    return response(c.alreadySubmitted);
  }

  if (draft.step !== 'idle' && /^(cancel|cancelar|stop|abbrechen|sair|nein|no)\b/i.test(n)) {
    return response(c.cancelled(name), { step: 'idle' });
  }

  if (draft.step === 'party_size') {
    const m = n.match(/\d{1,2}/);
    const count = m ? Number(m[0]) : 0;
    if (count < 1 || count > 50) return response(c.askParty, draft);
    draft = { ...draft, partySize: count, step: 'date' };
    const tip = (c.reservationTip && c.reservationTip(count)) || '';
    return response(tip ? `${c.askDate} ${tip}` : c.askDate, draft);
  }
  if (draft.step === 'date') {
    if (text.length > 80) return response(c.askDate, draft);
    draft = { ...draft, date: text, step: 'time' };
    return response(c.askTime, draft);
  }
  if (draft.step === 'time') {
    if (text.length > 40) return response(c.askTime, draft);
    draft = { ...draft, time: text, step: 'name' };
    return response(c.askName, draft);
  }
  if (draft.step === 'name') {
    if (text.length < 2 || text.length > 100) return response(c.askName, draft);
    draft = { ...draft, name: text, step: 'phone' };
    return response(c.askPhone, draft);
  }
  if (draft.step === 'phone') {
    const digits = text.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 18) return response(c.askPhone, draft);
    draft = { ...draft, phone: text, step: 'confirm',
      idempotencyKey: draft.idempotencyKey ||
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID()
          : `chatbot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`) };
    return response(c.confirm(
      { name: draft.name!, partySize: draft.partySize!, date: draft.date!, time: draft.time! }, name), draft);
  }
  if (draft.step === 'confirm') {
    if (affirmative.test(n)) {
      const data: ReservationRequest = {
        venueId: venue.id,
        customerName: draft.name!,
        customerPhone: draft.phone!,
        partySize: draft.partySize!,
        reservationDate: draft.date!,
        reservationTime: draft.time!,
        source,
        idempotencyKey: draft.idempotencyKey,
      };
      return response(
        c.submitted(
          { name: draft.name!, partySize: draft.partySize!, date: draft.date!, time: draft.time! }, name),
        { step: 'idle' },
        { actionRequired: 'create_reservation', reservationData: data });
    }
    if (negative.test(n)) return response(c.cancelled(name), { step: 'idle' });
    return response(c.confirm(
      { name: draft.name!, partySize: draft.partySize!, date: draft.date!, time: draft.time! }, name), draft);
  }

  // --- General conversation (name is known) ---
  if (/^(hola|hello|hi|hey|ol[aá]|hallo|guten tag|buenos dias|buenas tardes|buenas noches|oi|ola|bonjour)\b/i.test(n)) {
    return response(c.welcome(venue.name, name));
  }
  if (/\b(reserv|booking|book a table|mesa|tisch|reservierung|reserve)\b/.test(n)) {
    return response(c.reserve(name), { step: 'party_size',
      idempotencyKey: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID()
        : `chatbot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` });
  }
  if (/\b(horario|horarios|hours|opening|offnungszeiten|abre|cierra|abertura)\b/.test(n)) {
    return response(c.hours(venue.openingHours || 'Ask the restaurant for current hours.'));
  }
  if (/\b(ubicacion|direccion|donde|address|location|anfahrt|standort|endereco|localizacao|adresse)\b/.test(n)) {
    return response(c.location(venue.address || 'Ask the restaurant for its address.'));
  }
  if (/\b(vegano|vegana|vegan)\b/.test(n)) {
    return response(c.vegan(formatItems(menuItems.filter(i => i.isVegan))));
  }
  if (/\b(vegetariano|vegetariana|vegetarian|vegetarisch)\b/.test(n)) {
    return response(c.vegetarian(formatItems(menuItems.filter(i => i.isVegetarian || i.isVegan))));
  }
  if (/\b(gluten|celiaco|celiac|glutenfrei|sem glúten|sin gluten)\b/.test(n)) {
    return response(c.glutenFree(formatItems(menuItems.filter(i => i.isGlutenFree))));
  }

  // Menu browsing with best-sellers/featured suggestions
  if (/\b(menu|carta|cardapio|speisekarte|platos|comida|recommend|recomend|empfehl|sugest|show|ver|the|por favor|best|seller|popular|destacad|recomendado)\b/.test(n)) {
    let results = menuItems;
    let extra = '';
    const q = n.replace(/\b(menu|carta|cardapio|speisekarte|platos|comida|recommend|recomend|empfehl|sugest|show|ver|the|el|la|please|por favor|best|seller|popular|destacad|recomendado)\b/g, '').trim();
    if (q && q.length > 1) {
      results = menuItems.filter(i => normalize(`${i.name} ${i.description || ''} ${i.category || ''}`).includes(q));
    } else if (menuItems.some(i => i.isFeatured)) {
      results = menuItems.filter(i => i.isFeatured);
    }
    const items = formatItems(results);
    // Add best-sellers suggestion alongside the menu
    const sellers = menuItems.filter(i => i.isFeatured).slice(0, 5);
    if (sellers.length > 0 && !q) {
      extra = '\n\n' + c.bestSellers(formatItems(sellers));
    }
    return response(items ? c.menu(items) + extra : c.noItems);
  }

  // Proactive best-sellers / recommendations suggestion
  if (/\b(best|seller|popular|destacad|trending|recommendation)\b/.test(n)) {
    const sellers = menuItems.filter(i => i.isFeatured).slice(0, 8);
    if (sellers.length > 0) {
      return response(c.bestSellers(formatItems(sellers)));
    }
    const recs = menuItems.slice(0, 8);
    return response(c.featured(formatItems(recs)));
  }

  return response(c.fallback(name));
}

// --- Helper functions ---

interface VenueConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

/**
 * Get Evolution API config for a venue.
 * Checks per-venue config from the DB, then falls back to env defaults.
 */
function getVenueConfig(venueSlug: string, env: Env): VenueConfig {
  if (env.EVOLUTION_API_URL && env.EVOLUTION_API_KEY && env.EVOLUTION_INSTANCE_NAME) {
    return {
      apiUrl: env.EVOLUTION_API_URL,
      apiKey: env.EVOLUTION_API_KEY,
      instanceName: env.EVOLUTION_INSTANCE_NAME,
    };
  }
  return {
    apiUrl: process.env.EVOLUTION_API_URL || 'http://wppapi.clubemkt.digital',
    apiKey: process.env.EVOLUTION_API_KEY || 'DD451E404240-4C45-AF35-BFCA6A976927',
    instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'cocooo',
  };
}

/**
 * Send a text message via Evolution API.
 */
async function sendWhatsAppMessage(
  config: VenueConfig,
  to: string,
  text: string
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const response = await fetch(
      `${config.apiUrl}/message/sendText/${config.instanceName}`,
      {
        method: 'POST',
        headers: {
          apikey: config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`,
          text,
          delay: 1000,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.response?.message?.[0] || 'Unknown error', data };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Extract the phone number from the WhatsApp JID.
 */
function extractPhone(jid: string): string {
  const raw = jid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
  return `+${raw}`;
}

/**
 * Extract the venue slug from the request URL path.
 * Expected: /api/whatsapp/chatbot-webhook/<venueSlug>
 */
function getVenueSlug(request: Request): string | null {
  const url = new URL(request.url);
  const segs = url.pathname.split('/').filter(Boolean);
  const idx = segs.indexOf('chatbot-webhook');
  if (idx >= 0 && segs[idx + 1]) return segs[idx + 1];
  const q = url.searchParams.get('venue') || url.searchParams.get('slug');
  return q;
}

/**
 * Fetch venue data from the venue API (or KV cache).
 */
async function fetchVenueData(venueSlug: string, env: Env): Promise<ChatbotVenueContext | null> {
  // Try fetching from the venue API
  try {
    const res = await fetch(`https://mimenu.clubemkt.digital/api/venues/${venueSlug}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const v = await res.json() as any;
      return {
        id: v.id || venueSlug,
        name: v.name || 'Jaleo',
        address: v.address,
        phone: v.phone,
        openingHours: v.opening_hours,
      };
    }
  } catch {}
  // Fallback to stub
  return {
    id: venueSlug,
    name: 'Jaleo',
    address: '',
    phone: '',
    openingHours: '',
  };
}

/**
 * Fetch menu items for a venue (stub — would query the menu API).
 */
async function fetchMenuItems(venueSlug: string): Promise<ChatbotMenuItem[]> {
  // In production, this would fetch from the menu API
  // For now return empty — the engine handles empty menus gracefully
  return [];
}

// --- Request handlers ---

function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  return null;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json() as any;

    // Verify Evolution API webhook signature (if configured)
    const authHeader = request.headers.get('authorization');
    if (env.EVOLUTION_API_KEY && authHeader !== `Bearer ${env.EVOLUTION_API_KEY}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract venue slug (multi-tenant routing)
    const venueSlug = getVenueSlug(request) || body.venue_slug || body.data?.venue_slug;
    if (!venueSlug) {
      return new Response(JSON.stringify({ error: 'Venue slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract sender phone
    const data = body.data || {};
    const key = data.key || {};
    const remoteJid = key.remoteJid || data.from || '';
    const senderPhone = extractPhone(remoteJid);

    if (!senderPhone || senderPhone.length < 8) {
      return new Response(JSON.stringify({ error: 'Invalid sender phone' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract message text
    let messageText = '';
    if (data.message?.conversation) {
      messageText = data.message.conversation;
    } else if (data.message?.extendedTextMessage?.text) {
      messageText = data.message.extendedTextMessage.text;
    } else if (data.message?.textEdition) {
      messageText = data.message.textEdition;
    } else if (data.message?.listResponse) {
      messageText = data.message.listResponse.title;
    } else if (data.message?.buttonsResponse) {
      messageText = data.message.buttonsResponse.title;
    } else {
      messageText = data.message?.text || body.text || '';
    }

    if (!messageText || typeof messageText !== 'string') {
      return new Response(JSON.stringify({ error: 'No text message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Session key: venueSlug + senderPhone (multi-tenant isolation)
    const sessionKey = `session:${venueSlug}:${senderPhone}`;

    // Fetch venue data
    const venue = await fetchVenueData(venueSlug, env);
    if (!venue) {
      return new Response(JSON.stringify({ error: 'Venue not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch menu items
    const menuItems = await fetchMenuItems(venueSlug);

    // Load existing session state from KV
    let sessionState: ChatbotSessionState = { language: 'es' };
    if (env.MIMENU_KV) {
      const stored = await env.MIMENU_KV.get(sessionKey);
      if (stored) {
        try { sessionState = JSON.parse(stored); } catch {}
      }
    }

    // Process the message through the chatbot engine
    const response = processMessage(messageText.trim(), sessionState, venue, menuItems, 'whatsapp');

    // Save updated session state
    if (env.MIMENU_KV) {
      await env.MIMENU_KV.put(
        sessionKey,
        JSON.stringify(response.nextState),
        { expirationTtl: 86400 * 7 } // 7 days
      );
    }

    // Get Evolution API config for this venue
    const config = getVenueConfig(venueSlug, env);

    // Send the reply back to the user via WhatsApp
    const sendResult = await sendWhatsAppMessage(config, senderPhone, response.reply);

    if (!sendResult.success) {
      console.error('Failed to send WhatsApp reply:', sendResult.error);
    }

    // Handle reservation creation if the engine requests it
    if (response.actionRequired === 'create_reservation' && response.reservationData) {
      const reservation = response.reservationData;
      console.log('Reservation requested:', JSON.stringify(reservation));
      // In production, POST to the venue's reservation API
    }

    return new Response(JSON.stringify({
      success: true,
      venueSlug,
      senderPhone,
      reply: response.reply,
      messageSent: sendResult.success,
      sendError: sendResult.error,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
