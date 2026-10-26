/**
 * Deterministic, dependency-free customer chatbot for MiMenu.
 * Shared domain logic for the menu widget and the WhatsApp server handler.
 * Reservation replies create a pending request; they never imply availability.
 *
 * Personal concierge features:
 * - Detects the user's language from their message and always responds in that language.
 * - On first interaction, asks for the user's name and stores it in session state.
 * - Uses the stored name throughout the conversation for a personal touch.
 */
export type ChatbotLang = 'es' | 'en' | 'pt' | 'de';
export type ChatSource = 'web' | 'whatsapp';
export type ReservationStep = 'idle' | 'party_size' | 'date' | 'time' | 'name' | 'phone' | 'confirm';

export interface ChatbotVenueContext {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
}
export interface ChatbotMenuItem {
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
export interface ReservationDraft {
  step: ReservationStep;
  partySize?: number;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
  idempotencyKey?: string;
}
export interface LastReservationSummary {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  idempotencyKey: string;
}
export interface ChatbotSessionState {
  language: ChatbotLang;
  userName?: string;
  reservationDraft?: ReservationDraft;
  lastReservation?: LastReservationSummary;
}
export interface ReservationRequest {
  venueId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  source: ChatSource;
  idempotencyKey?: string;
}
export interface ChatbotResponse {
  reply: string;
  detectedLang: ChatbotLang;
  nextState: ChatbotSessionState;
  actionRequired?: 'create_reservation';
  reservationData?: ReservationRequest;
}

type Copy = {
  welcome: (venue: string, name?: string) => string; menu: (items: string) => string; noItems: string;
  hours: (value: string) => string; location: (value: string) => string;
  vegetarian: (items: string) => string; vegan: (items: string) => string; glutenFree: (items: string) => string;
  reserve: (name?: string) => string; askParty: string; askDate: string; askTime: string; askName: string; askPhone: string;
  confirm: (d: Required<Pick<ReservationDraft,'name'|'partySize'|'date'|'time'>>, name?: string) => string;
  submitted: (d: Required<Pick<ReservationDraft,'name'|'partySize'|'date'|'time'>>, name?: string) => string;
  alreadySubmitted: string;
  cancelled: (name?: string) => string; fallback: (name?: string) => string;
  askNameFirst: string;
};

const COPY: Record<ChatbotLang, Copy> = {
  es: {
    welcome: (v, n) => n
      ? `¡Hola ${n}! Bienvenido/a a ${v}. ¿En qué puedo ayudarte?`
      : `¡Hola! Bienvenido/a a ${v}. ¿Cómo te llamas?`,
    askNameFirst: '¡Hola! Para atenderte mejor, ¿cómo te llamas?',
    menu: i => i ? `Algunas opciones del menú:\n${i}` : 'Todavía no hay platos disponibles para mostrar.',
    noItems: 'No encontré platos con ese criterio. Prueba con otro nombre o categoría.',
    hours: v => `Nuestro horario es: ${v}`,
    location: v => `Estamos en: ${v}`,
    vegetarian: i => `Opciones vegetarianas:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
    vegan: i => `Opciones veganas:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
    glutenFree: i => `Opciones sin gluten:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
    reserve: n => n
      ? `Claro ${n}, ¿para cuántas personas es la reserva?`
      : '¿Para cuántas personas?',
    askParty: 'Indícame cuántas personas (de 1 a 50).',
    askDate: '¿Para qué fecha? Indícala, por favor.',
    askTime: '¿A qué hora?',
    askName: '¿A nombre de quién?',
    askPhone: '¿Qué teléfono de contacto podemos usar?',
    confirm: (d, n) => `Muy bien ${n || d.name}. ${d.partySize} personas el ${d.date} a las ${d.time}. ¿Confirmo la reserva?`,
    submitted: (d, n) => `¡Gracias ${n || d.name}! Le envié la solicitud al restaurante para ${d.partySize} personas el ${d.date} a las ${d.time}. Te contactarán pronto para confirmar.`,
    alreadySubmitted: 'Esta solicitud ya fue enviada y está pendiente de confirmación del restaurante.',
    cancelled: n => n
      ? `Entendido ${n}. ¿En qué más puedo ayudarte?`
      : 'Solicitud cancelada. ¿Puedo ayudarte con algo más?',
    fallback: n => n
      ? `Perdón ${n}, no entendí. ¿Quieres que te muestre el menú, horarios, ubicación o una reserva?`
      : 'No entendí la consulta. Puedes preguntar por el menú, horarios, ubicación o una reserva.'
  },
  en: {
    welcome: (v, n) => n
      ? `Hi ${n}! Welcome to ${v}. What can I help you with?`
      : `Hello! Welcome to ${v}. What's your name?`,
    askNameFirst: 'Hello! To serve you better, what\'s your name?',
    menu: i => i ? `A few menu options:\n${i}` : 'There are no menu items available to show yet.',
    noItems: 'I couldn’t find a matching dish. Try another name or category.',
    hours: v => `Our opening hours are: ${v}`,
    location: v => `We are located at: ${v}`,
    vegetarian: i => `Vegetarian options:\n${i || 'Please ask the restaurant about available options.'}`,
    vegan: i => `Vegan options:\n${i || 'Please ask the restaurant about available options.'}`,
    glutenFree: i => `Gluten-free options:\n${i || 'Please ask the restaurant about available options.'}`,
    reserve: n => n
      ? `Sure ${n}, how many guests for the reservation?`
      : 'How many guests?',
    askParty: 'Please give the number of guests (1–50).',
    askDate: 'What date would you like?',
    askTime: 'What time?',
    askName: 'What name should I use?',
    askPhone: 'What phone number can the restaurant use to contact you?',
    confirm: (d, n) => `Great ${n || d.name}. ${d.partySize} guests on ${d.date} at ${d.time}. Shall I confirm the reservation?`,
    submitted: (d, n) => `Thanks ${n || d.name}! I sent your request for ${d.partySize} guests on ${d.date} at ${d.time}. The restaurant will contact you soon to confirm.`,
    alreadySubmitted: 'This request has already been submitted and is pending restaurant confirmation.',
    cancelled: n => n
      ? `Got it ${n}. Anything else I can help with?`
      : 'Request cancelled. Can I help with anything else?',
    fallback: n => n
      ? `Sorry ${n}, I didn’t catch that. Want to hear about the menu, hours, location, or make a reservation?`
      : 'I didn’t understand. Ask about the menu, hours, location, or a reservation.'
  },
  pt: {
    welcome: (v, n) => n
      ? `Oi ${n}! Bem-vindo(a) ao ${v}. Em que posso ajudar?`
      : `Olá! Bem-vindo(a) ao ${v}. Como você se chama?`,
    askNameFirst: 'Olá! Para te atender melhor, como você se chama?',
    menu: i => i ? `Algumas opções do cardápio:\n${i}` : 'Ainda não há itens disponíveis para mostrar.',
    noItems: 'Não encontrei um prato correspondente. Tente outro nome ou categoria.',
    hours: v => `Nosso horário é: ${v}`,
    location: v => `Estamos em: ${v}`,
    vegetarian: i => `Opções vegetarianas:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
    vegan: i => `Opções veganas:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
    glutenFree: i => `Opções sem glúten:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
    reserve: n => n
      ? `Claro ${n}, para quantas pessoas é a reserva?`
      : 'Para quantas pessoas?',
    askParty: 'Informe o número de pessoas (1 a 50).',
    askDate: 'Para qual data?',
    askTime: 'A que horas?',
    askName: 'Em nome de quem?',
    askPhone: 'Qual telefone podemos usar para contato?',
    confirm: (d, n) => `Perfeito ${n || d.name}. ${d.partySize} pessoas em ${d.date} às ${d.time}. Confirmo a reserva?`,
    submitted: (d, n) => `Obrigado ${n || d.name}! Enviei sua solicitação ao restaurante para ${d.partySize} pessoas em ${d.date} às ${d.time}. Eles entrarão em contato em breve para confirmar.`,
    alreadySubmitted: 'Esta solicitação já foi enviada e aguarda confirmação do restaurante.',
    cancelled: n => n
      ? `Certo ${n}. Posso te ajudar com algo mais?`
      : 'Solicitação cancelada. Posso ajudar em algo mais?',
    fallback: n => n
      ? `Desculpe ${n}, não entendi. Quer que eu mostre o cardápio, horários, localização ou faço uma reserva?`
      : 'Não entendi. Pergunte sobre o cardápio, horários, localização ou reserva.'
  },
  de: {
    welcome: (v, n) => n
      ? `Hallo ${n}! Willkommen bei ${v}. Wie kann ich helfen?`
      : `Hallo! Willkommen bei ${v}. Wie darf ich dich nennen?`,
    askNameFirst: 'Hallo! Wie darf ich dich nennen, damit ich dir besser helfen kann?',
    menu: i => i ? `Einige Speisen:\n${i}` : 'Derzeit sind keine Speisen verfügbar.',
    noItems: 'Ich habe kein passendes Gericht gefunden. Versuchen Sie einen anderen Namen oder eine Kategorie.',
    hours: v => `Unsere Öffnungszeiten: ${v}`,
    location: v => `Sie finden uns hier: ${v}`,
    vegetarian: i => `Vegetarische Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
    vegan: i => `Vegane Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
    glutenFree: i => `Glutenfreie Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
    reserve: n => n
      ? `Klar ${n}, für wie viele Personen?`
      : 'Für wie viele Personen?',
    askParty: 'Bitte nennen Sie die Personenzahl (1 bis 50).',
    askDate: 'Für welches Datum?',
    askTime: 'Um wie viel Uhr?',
    askName: 'Auf welchen Namen?',
    askPhone: 'Welche Telefonnummer darf das Restaurant verwenden?',
    confirm: (d, n) => `Super ${n || d.name}. ${d.partySize} Personen am ${d.date} um ${d.time}. Soll ich die Reservierung bestätigen?`,
    submitted: (d, n) => `Danke ${n || d.name}! Ich habe deine Anfrage für ${d.partySize} Personen am ${d.date} um ${d.time} an das Restaurant gesendet. Sie melden sich bald zur Bestätigung.`,
    alreadySubmitted: 'Diese Anfrage wurde bereits gesendet und wartet auf die Bestätigung des Restaurants.',
    cancelled: n => n
      ? `Alles klar ${n}. Kann ich sonst helfen?`
      : 'Anfrage abgebrochen. Kann ich sonst helfen?',
    fallback: n => n
      ? `Entschuldigung ${n}, das habe ich nicht verstanden. Willst du die Speisekarte, Öffnungszeiten, die Adresse oder eine Reservierung?`
      : 'Das habe ich nicht verstanden. Fragen Sie nach Speisekarte, Öffnungszeiten, Anfahrt oder Reservierung.'
  }
};

function normalize(s: string): string { return s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }

/**
 * Detects the user's language by scoring keyword hits across all four languages.
 * Always returns the best-matching language, falling back to the session language.
 */
export function detectLanguage(text: string, fallback: ChatbotLang = 'es'): ChatbotLang {
  const s = normalize(text);
  const tokens = s.split(/\s+/);
  let scores: Record<ChatbotLang, number> = { es: 0, en: 0, pt: 0, de: 0 };

  for (const token of tokens) {
    if (/\b(hola|buenos|buenas|tardes|carta|menu|platos|comida|reservar|gracias|horario|donde|ubicacion|perro|cerveza|churro|tapas|paella|jamon|serrano|queso|ajo|pollo|arroz|tacos|enchilada|guacamole|mole|pavo|chiles|ceviche|tiradito|carpaccio)\b/.test(token)) scores.es += 1;
    if (/\b(hello|hi|hey|good|menu|booking|book|table|hours|thanks|how|what|where|address|location|opening|reservation|appetizer|entree|dessert|drink|beer|wine|beef|chicken|fish|salad|bread|cheese|tomato|onion)\b/.test(token)) scores.en += 1;
    if (/\b(ola|oi|com|para|obrigado|cardapio|prato|bebida|cerveja|carne|peixe|salada|arroz|feijao|frango|porco|vinho|caipirinha|brigadeiro|coxinha|pao|queijo|presunto|batata|mandioca|farofa|feijoada|cuscuz|tapioca|acai|doce|sobremesa|bebidas|suco|cafe)\b/.test(token)) scores.pt += 1;
    if (/\b(hallo|guten|tag|bitte|danke|speisekarte|gericht|essen|trinken|reservierung|tisch|personen|zeit|wo|adresse|offnungszeiten|kellner|bestellung|bezahlen|ruckzahlung)\b/.test(token)) scores.de += 1;
  }

  const best = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a);
  if (best[1] > 0) return best[0] as ChatbotLang;
  return fallback;
}

function formatItems(items: ChatbotMenuItem[]): string {
  return items.filter(i => i.isAvailable !== false).slice(0, 12).map(i => `• ${i.name} — ${Number(i.price).toFixed(2)}${i.description ? ` (${i.description})` : ''}`).join('\n');
}

const affirmative = /^(si|yes|sim|ja|confirmar|confirm|ok|okay|dale|vale|claro|sure|please|gerne|bitte|certo|perfeito|super|absolutely|por supuesto|of course)\b/i;
const negative = /^(no|nao|nein|cancel|cancelar|abbrechen|stop|nie|nicht|never|pass)\b/i;

/**
 * Extracts a person's name from a free-text message.
 * Handles patterns like "my name is X", "me llamo X", "chamo X", etc.
 */
function extractName(text: string): string | null {
  const n = normalize(text);
  const patterns = [
    /\b(me llamo|my name is|chamo|ich bin|je m'appelle|me chamo)\s+(.+)/i,
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

/**
 * Checks if a short message is likely just a person's name (no question keywords).
 */
function isLikelyName(text: string): boolean {
  const n = normalize(text);
  if (/\b(menu|carta|cardapio|horario|hours|ubicacion|address|location|reservar|reserve|booking|mesa|table|vegano|vegan|vegetariano|vegetarian|gluten|price|precio|quanto|costo|cost)\b/.test(n)) return false;
  const words = n.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 1 && words.length <= 4) {
    if (/^(que|como|cual|donde|por|para|cuantos|cuantas|cuando|porque|por que|me|puedes|puedo|quiero|sirve|tiene|hay|existe)\b/.test(n)) return false;
    return true;
  }
  return false;
}

export function processChatbotMessage(
  message: string,
  state: ChatbotSessionState,
  venue: ChatbotVenueContext,
  menuItems: ChatbotMenuItem[] = [],
  source: ChatSource = 'web'
): ChatbotResponse {
  const text = message.trim();
  const n = normalize(text);
  const lang = detectLanguage(text, state.language || 'es');
  const c = COPY[lang];
  const name = state.userName;

  let draft: ReservationDraft = { step: 'idle', ...(state.reservationDraft || {}) };
  let nextState: ChatbotSessionState = { ...state, language: lang };

  const response = (reply: string, nextDraft: ReservationDraft = draft, extra: Partial<ChatbotResponse> = {}): ChatbotResponse => ({
    reply,
    detectedLang: lang,
    nextState: { ...nextState, language: lang, reservationDraft: nextDraft },
    ...extra
  });

  // --- First: if we don't have a user name yet, ask for it ---
  if (!name) {
    const extracted = extractName(text);
    if (extracted) {
      nextState = { ...state, language: lang, userName: extracted };
      return response(c.welcome(venue.name, extracted), draft, {});
    }
    // If the user's message looks like a bare name, treat it as one
    if (isLikelyName(text)) {
      const guessedName = text.split(/\s+/).filter(w => w.length > 1 && !/[0-9]/.test(w)).slice(0, 3).join(' ');
      if (guessedName.length >= 2) {
        nextState = { ...state, language: lang, userName: guessedName };
        return response(c.welcome(venue.name, guessedName), draft, {});
      }
    }
    // No name yet — ask for it before proceeding
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
    const m = n.match(/\d{1,2}/); const count = m ? Number(m[0]) : 0;
    if (count < 1 || count > 50) return response(c.askParty, draft);
    draft = { ...draft, partySize: count, step: 'date' };
    return response(c.askDate, draft);
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
    draft = { ...draft, phone: text, step: 'confirm', idempotencyKey: draft.idempotencyKey || (globalThis.crypto?.randomUUID?.() ?? `chatbot-${Date.now()}-${Math.random().toString(36).slice(2)}`) };
    return response(c.confirm({ name: draft.name!, partySize: draft.partySize!, date: draft.date!, time: draft.time! }, name), draft);
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
        idempotencyKey: draft.idempotencyKey
      };
      return response(c.submitted({ name: draft.name!, partySize: draft.partySize!, date: draft.date!, time: draft.time! }, name), { step: 'idle' }, { actionRequired: 'create_reservation', reservationData: data });
    }
    if (negative.test(n)) return response(c.cancelled(name), { step: 'idle' });
    return response(c.confirm({ name: draft.name!, partySize: draft.partySize!, date: draft.date!, time: draft.time! }, name), draft);
  }

  // --- General conversation (name is known) ---

  if (/^(hola|hello|hi|hey|ol[aá]|hallo|guten tag|buenos dias|buenas tardes|buenas noches|oi|ola|bonjour)\b/i.test(n)) {
    return response(c.welcome(venue.name, name));
  }

  if (/\b(reserv|booking|book a table|mesa|tisch|reservierung|reserve)\b/.test(n)) {
    return response(c.reserve(name), { step: 'party_size', idempotencyKey: globalThis.crypto?.randomUUID?.() ?? `chatbot-${Date.now()}-${Math.random().toString(36).slice(2)}` });
  }

  if (/\b(horario|horarios|hours|opening|offnungszeiten|abre|cierra|öffnungszeiten|abertura)\b/.test(n)) {
    return response(c.hours(venue.openingHours || 'Ask the restaurant for current hours.'));
  }

  if (/\b(ubicacion|direccion|donde|address|location|anfahrt|standort|endereco|localizacao|adresse|wie komme ich)\b/.test(n)) {
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

  if (/\b(menu|carta|cardapio|speisekarte|platos|comida|recommend|recomend|empfehl|sugest|show|ver|the|por favor)\b/.test(n)) {
    let results = menuItems;
    const q = n.replace(/\b(menu|carta|cardapio|speisekarte|platos|comida|recommend|recomend|empfehl|sugest|show|ver|the|el|la|please|por favor)\b/g, '').trim();
    if (q && q.length > 1) {
      results = menuItems.filter(i => normalize(`${i.name} ${i.description || ''} ${i.category || ''}`).includes(q));
    } else if (menuItems.some(i => i.isFeatured)) {
      results = menuItems.filter(i => i.isFeatured);
    }
    const items = formatItems(results);
    return response(items ? c.menu(items) : c.noItems);
  }

  return response(c.fallback(name));
}
