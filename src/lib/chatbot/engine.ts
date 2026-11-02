/**
 * Deterministic, dependency-free customer chatbot for MiMenu.
 * Shared domain logic for the menu widget and the WhatsApp server handler.
 * Reservation replies create a pending request; they never imply availability.
 *
 * Concierge rules:
 * - The reply language sticks to the session language unless the message carries
 *   strong evidence for another one.
 * - A reservation intent expressed before the guest's name is remembered and
 *   resumed once the name arrives.
 * - Questions asked mid-reservation are answered without losing the draft.
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
  currency?: string | null;
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
export type PendingIntent = 'reservation';
export interface ChatbotSessionState {
  language: ChatbotLang;
  userName?: string;
  reservationDraft?: ReservationDraft;
  lastReservation?: LastReservationSummary;
  pendingIntent?: PendingIntent;
  pendingPartySize?: number;
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
  /** Set when the reply came from a superadmin-curated answer. */
  learnedId?: string;
}

/** A superadmin-approved answer that overrides the fallback for matching questions. */
export interface LearnedAnswer {
  id: string;
  lang: ChatbotLang;
  triggers: string[];
  reply: string;
}

type ReservationData = Required<Pick<ReservationDraft, 'name' | 'partySize' | 'date' | 'time'>>;

type Copy = {
  welcome: (venue: string, name?: string) => string;
  askNameFirst: string;
  askNameForReservation: (partySize?: number) => string;
  menu: (items: string) => string;
  noItems: string;
  hours: (value: string) => string;
  hoursUnknown: string;
  location: (value: string) => string;
  locationUnknown: string;
  vegetarian: (items: string) => string;
  vegan: (items: string) => string;
  glutenFree: (items: string) => string;
  bestSellers: (items: string) => string;
  featured: (items: string) => string;
  reserve: (name?: string) => string;
  askParty: string;
  partyAck: (partySize: number) => string;
  askDate: string;
  askTime: string;
  askName: string;
  askPhone: string;
  declinePhone: string;
  confirm: (d: ReservationData, name: string | undefined, hasPhone: boolean) => string;
  submitted: (d: ReservationData, name: string | undefined, hasPhone: boolean) => string;
  alreadySubmitted: string;
  cancelled: (name?: string) => string;
  fallback: (name?: string) => string;
  statusNone: (name?: string) => string;
  statusPending: (r: LastReservationSummary, name?: string) => string;
  statusDraft: (d: ReservationDraft, name?: string) => string;
  priceItem: (name: string, price: string) => string;
  priceUnavailable: (name: string, price: string) => string;
  priceNotFound: string;
};

const COPY: Record<ChatbotLang, Copy> = {
  es: {
    welcome: (v, n) => n
      ? `¡Hola ${n}! Bienvenido/a a ${v}. ¿En qué puedo ayudarte?`
      : `¡Hola! Bienvenido/a a ${v}. ¿Cómo te llamas?`,
    askNameFirst: '¡Hola! Para atenderte mejor, ¿cómo te llamas?',
    askNameForReservation: party => party
      ? `¡Claro! Para ${party} personas, ¿a nombre de quién hago la reserva?`
      : '¡Claro! ¿A nombre de quién hago la reserva?',
    menu: i => i ? `Algunas opciones del menú:\n${i}` : 'Todavía no hay platos disponibles para mostrar.',
    noItems: 'No encontré platos con ese criterio. Prueba con otro nombre o categoría.',
    hours: v => `Nuestro horario es: ${v}`,
    hoursUnknown: 'Todavía no tengo cargado el horario. El restaurante te lo confirma al recibir la reserva.',
    location: v => `Estamos en: ${v}`,
    locationUnknown: 'Todavía no tengo cargada la dirección. Puedes pedírsela al restaurante al confirmar la reserva.',
    vegetarian: i => `Opciones vegetarianas:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
    vegan: i => `Opciones veganas:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
    glutenFree: i => `Opciones sin gluten:\n${i || 'Consulta con el restaurante sobre opciones disponibles.'}`,
    bestSellers: i => i ? `Nuestros platos más pedidos:\n${i}` : 'Aún no hay platos destacados.',
    featured: i => i ? `Platos recomendados:\n${i}` : 'Aún no hay recomendaciones.',
    reserve: n => n ? `Claro ${n}, ¿para cuántas personas es la reserva?` : '¿Para cuántas personas es la reserva?',
    askParty: 'Indícame cuántas personas (de 1 a 50).',
    partyAck: count => `Perfecto, ${count} ${count === 1 ? 'persona' : 'personas'}.`,
    askDate: '¿Para qué fecha?',
    askTime: '¿A qué hora? (por ejemplo, 20:30)',
    askName: '¿A nombre de quién?',
    askPhone: '¿Qué teléfono de contacto podemos usar? Si no tienes, responde “no tengo”.',
    declinePhone: 'Entendido, seguimos sin teléfono.',
    confirm: (d, n, hasPhone) =>
      `Muy bien ${n || d.name}: ${d.partySize} personas el ${d.date} a las ${d.time}.${hasPhone ? '' : ' Sin teléfono de contacto, el restaurante no podrá avisarte de cambios.'} ¿Confirmo la reserva?`,
    submitted: (d, n, hasPhone) =>
      `¡Gracias ${n || d.name}! Envié la solicitud al restaurante para ${d.partySize} personas el ${d.date} a las ${d.time}.${hasPhone ? ' Te contactarán pronto para confirmar.' : ''}`,
    alreadySubmitted: 'Esta solicitud ya fue enviada y está pendiente de confirmación del restaurante.',
    cancelled: n => n ? `Listo ${n}, cancelamos la reserva. ¿En qué más puedo ayudarte?` : 'Listo, cancelamos la reserva. ¿Puedo ayudarte con algo más?',
    fallback: n => n
      ? `Perdón ${n}, no entendí. Puedo mostrarte el menú, horarios, ubicación o tomar una reserva.`
      : 'No entendí. Puedo mostrarte el menú, horarios, ubicación o tomar una reserva.',
    statusNone: n => n
      ? `Todavía no tengo una reserva a tu nombre, ${n}. ¿Quieres que la hagamos ahora?`
      : 'Todavía no tengo una reserva a tu nombre. ¿Quieres que la hagamos ahora?',
    statusPending: (r, n) =>
      `${n ? `${n}, tu` : 'Tu'} solicitud está registrada: ${r.partySize} personas el ${r.reservationDate} a las ${r.reservationTime}, a nombre de ${r.customerName}. El restaurante todavía no confirmó ni asignó mesa; te avisarán en cuanto la revise.`,
    statusDraft: (d, n) =>
      `${n ? `${n}, tu` : 'Tu'} reserva sigue en curso${d.partySize ? ` para ${d.partySize} personas` : ''}${d.date ? ` el ${d.date}` : ''}${d.time ? ` a las ${d.time}` : ''}.`,
    priceItem: (name, price) => `${name} cuesta ${price}.`,
    priceUnavailable: (name, price) => `${name} no está disponible ahora (${price}).`,
    priceNotFound: 'No encontré ese plato en la carta. ¿Quieres que te muestre el menú?'
  },
  en: {
    welcome: (v, n) => n
      ? `Hi ${n}! Welcome to ${v}. What can I help you with?`
      : `Hello! Welcome to ${v}. What's your name?`,
    askNameFirst: 'Hello! To serve you better, what is your name?',
    askNameForReservation: party => party
      ? `Sure! For ${party} guests, what name should I put on the reservation?`
      : 'Sure! What name should I put on the reservation?',
    menu: i => i ? `A few menu options:\n${i}` : 'There are no menu items available to show yet.',
    noItems: 'I couldn’t find a matching dish. Try another name or category.',
    hours: v => `Our opening hours are: ${v}`,
    hoursUnknown: 'I don’t have the opening hours loaded yet. The restaurant will confirm them with your request.',
    location: v => `We are located at: ${v}`,
    locationUnknown: 'I don’t have the address loaded yet. You can ask the restaurant when they confirm your request.',
    vegetarian: i => `Vegetarian options:\n${i || 'Please ask the restaurant about available options.'}`,
    vegan: i => `Vegan options:\n${i || 'Please ask the restaurant about available options.'}`,
    glutenFree: i => `Gluten-free options:\n${i || 'Please ask the restaurant about available options.'}`,
    bestSellers: i => i ? `Our most popular dishes:\n${i}` : 'No featured dishes available yet.',
    featured: i => i ? `Staff recommendations:\n${i}` : 'No recommendations available yet.',
    reserve: n => n ? `Sure ${n}, how many guests for the reservation?` : 'How many guests for the reservation?',
    askParty: 'Please give the number of guests (1–50).',
    partyAck: count => `Perfect, ${count} ${count === 1 ? 'guest' : 'guests'}.`,
    askDate: 'What date would you like?',
    askTime: 'What time? (for example, 8:30 PM)',
    askName: 'What name should I use?',
    askPhone: 'What phone number can the restaurant use to contact you? If you prefer, reply “no phone”.',
    declinePhone: 'Understood, we will continue without a phone number.',
    confirm: (d, n, hasPhone) =>
      `Great ${n || d.name}: ${d.partySize} guests on ${d.date} at ${d.time}.${hasPhone ? '' : ' Without a phone number the restaurant cannot notify you of changes.'} Shall I confirm the reservation?`,
    submitted: (d, n, hasPhone) =>
      `Thanks ${n || d.name}! I sent your request for ${d.partySize} guests on ${d.date} at ${d.time}.${hasPhone ? ' The restaurant will contact you soon to confirm.' : ''}`,
    alreadySubmitted: 'This request has already been submitted and is pending restaurant confirmation.',
    cancelled: n => n ? `Done ${n}, the reservation is cancelled. Anything else I can help with?` : 'Done, the reservation is cancelled. Can I help with anything else?',
    fallback: n => n
      ? `Sorry ${n}, I didn’t catch that. I can show the menu, hours, location, or take a reservation.`
      : 'I didn’t understand. I can show the menu, hours, location, or take a reservation.',
    statusNone: n => n
      ? `I don’t have a reservation under your name yet, ${n}. Would you like to make one now?`
      : 'I don’t have a reservation under your name yet. Would you like to make one now?',
    statusPending: (r, n) =>
      `${n ? `${n}, your` : 'Your'} request is registered: ${r.partySize} guests on ${r.reservationDate} at ${r.reservationTime}, under ${r.customerName}. The restaurant has not confirmed or assigned a table yet; they will notify you once they review it.`,
    statusDraft: (d, n) =>
      `${n ? `${n}, your` : 'Your'} reservation is still in progress${d.partySize ? ` for ${d.partySize} guests` : ''}${d.date ? ` on ${d.date}` : ''}${d.time ? ` at ${d.time}` : ''}.`,
    priceItem: (name, price) => `${name} costs ${price}.`,
    priceUnavailable: (name, price) => `${name} is not available right now (${price}).`,
    priceNotFound: 'I couldn’t find that dish on the menu. Want me to show the menu?'
  },
  pt: {
    welcome: (v, n) => n
      ? `Oi ${n}! Bem-vindo(a) ao ${v}. Em que posso ajudar?`
      : `Olá! Bem-vindo(a) ao ${v}. Como você se chama?`,
    askNameFirst: 'Olá! Para te atender melhor, como você se chama?',
    askNameForReservation: party => party
      ? `Claro! Para ${party} pessoas, em nome de quem faço a reserva?`
      : 'Claro! Em nome de quem faço a reserva?',
    menu: i => i ? `Algumas opções do cardápio:\n${i}` : 'Ainda não há itens disponíveis para mostrar.',
    noItems: 'Não encontrei um prato correspondente. Tente outro nome ou categoria.',
    hours: v => `Nosso horário é: ${v}`,
    hoursUnknown: 'Ainda não tenho o horário carregado. O restaurante confirma com você ao receber a solicitação.',
    location: v => `Estamos em: ${v}`,
    locationUnknown: 'Ainda não tenho o endereço carregado. Você pode pedir ao restaurante ao confirmar a reserva.',
    vegetarian: i => `Opções vegetarianas:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
    vegan: i => `Opções veganas:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
    glutenFree: i => `Opções sem glúten:\n${i || 'Consulte o restaurante sobre as opções disponíveis.'}`,
    bestSellers: i => i ? `Nossos pratos mais pedidos:\n${i}` : 'Ainda não há pratos destacados.',
    featured: i => i ? `Recomendações da casa:\n${i}` : 'Ainda não há recomendações.',
    reserve: n => n ? `Claro ${n}, para quantas pessoas é a reserva?` : 'Para quantas pessoas é a reserva?',
    askParty: 'Informe o número de pessoas (1 a 50).',
    partyAck: count => `Perfeito, ${count} ${count === 1 ? 'pessoa' : 'pessoas'}.`,
    askDate: 'Para qual data?',
    askTime: 'A que horas? (por exemplo, 20:30)',
    askName: 'Em nome de quem?',
    askPhone: 'Qual telefone podemos usar para contato? Se não tiver, responda “não tenho”.',
    declinePhone: 'Entendido, seguimos sem telefone.',
    confirm: (d, n, hasPhone) =>
      `Perfeito ${n || d.name}: ${d.partySize} pessoas em ${d.date} às ${d.time}.${hasPhone ? '' : ' Sem telefone, o restaurante não poderá avisar sobre mudanças.'} Confirmo a reserva?`,
    submitted: (d, n, hasPhone) =>
      `Obrigado ${n || d.name}! Enviei sua solicitação para ${d.partySize} pessoas em ${d.date} às ${d.time}.${hasPhone ? ' Eles entrarão em contato em breve para confirmar.' : ''}`,
    alreadySubmitted: 'Esta solicitação já foi enviada e aguarda confirmação do restaurante.',
    cancelled: n => n ? `Certo ${n}, reserva cancelada. Posso ajudar em algo mais?` : 'Certo, reserva cancelada. Posso ajudar em algo mais?',
    fallback: n => n
      ? `Desculpe ${n}, não entendi. Posso mostrar o cardápio, horários, localização ou fazer uma reserva.`
      : 'Não entendi. Posso mostrar o cardápio, horários, localização ou fazer uma reserva.',
    statusNone: n => n
      ? `Ainda não tenho uma reserva no seu nome, ${n}. Quer fazer uma agora?`
      : 'Ainda não tenho uma reserva no seu nome. Quer fazer uma agora?',
    statusPending: (r, n) =>
      `${n ? `${n}, sua` : 'Sua'} solicitação está registrada: ${r.partySize} pessoas em ${r.reservationDate} às ${r.reservationTime}, em nome de ${r.customerName}. O restaurante ainda não confirmou nem atribuiu mesa; vão avisar assim que revisarem.`,
    statusDraft: (d, n) =>
      `${n ? `${n}, sua` : 'Sua'} reserva está em andamento${d.partySize ? ` para ${d.partySize} pessoas` : ''}${d.date ? ` em ${d.date}` : ''}${d.time ? ` às ${d.time}` : ''}.`,
    priceItem: (name, price) => `${name} custa ${price}.`,
    priceUnavailable: (name, price) => `${name} não está disponível agora (${price}).`,
    priceNotFound: 'Não encontrei esse prato no cardápio. Quer ver o cardápio?'
  },
  de: {
    welcome: (v, n) => n
      ? `Hallo ${n}! Willkommen bei ${v}. Wie kann ich helfen?`
      : `Hallo! Willkommen bei ${v}. Wie darf ich dich nennen?`,
    askNameFirst: 'Hallo! Wie darf ich dich nennen, damit ich dir besser helfen kann?',
    askNameForReservation: party => party
      ? `Gerne! Für ${party} Personen, auf welchen Namen soll die Reservierung laufen?`
      : 'Gerne! Auf welchen Namen soll die Reservierung laufen?',
    menu: i => i ? `Einige Speisen:\n${i}` : 'Derzeit sind keine Speisen verfügbar.',
    noItems: 'Ich habe kein passendes Gericht gefunden. Versuchen Sie einen anderen Namen oder eine Kategorie.',
    hours: v => `Unsere Öffnungszeiten: ${v}`,
    hoursUnknown: 'Die Öffnungszeiten sind noch nicht hinterlegt. Das Restaurant bestätigt sie mit Ihrer Anfrage.',
    location: v => `Sie finden uns hier: ${v}`,
    locationUnknown: 'Die Adresse ist noch nicht hinterlegt. Sie können das Restaurant bei der Bestätigung danach fragen.',
    vegetarian: i => `Vegetarische Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
    vegan: i => `Vegane Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
    glutenFree: i => `Glutenfreie Gerichte:\n${i || 'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
    bestSellers: i => i ? `Unsere beliebtesten Gerichte:\n${i}` : 'Noch keine beliebten Gerichte verfügbar.',
    featured: i => i ? `Empfohlene Gerichte:\n${i}` : 'Keine Empfehlungen verfügbar.',
    reserve: n => n ? `Klar ${n}, für wie viele Personen ist die Reservierung?` : 'Für wie viele Personen ist die Reservierung?',
    askParty: 'Bitte nennen Sie die Personenzahl (1 bis 50).',
    partyAck: count => `Perfekt, ${count} ${count === 1 ? 'Person' : 'Personen'}.`,
    askDate: 'Für welches Datum?',
    askTime: 'Um wie viel Uhr? (zum Beispiel 20:30)',
    askName: 'Auf welchen Namen?',
    askPhone: 'Welche Telefonnummer darf das Restaurant verwenden? Falls nicht vorhanden: „keine Nummer“.',
    declinePhone: 'Verstanden, wir machen ohne Telefonnummer weiter.',
    confirm: (d, n, hasPhone) =>
      `Super ${n || d.name}: ${d.partySize} Personen am ${d.date} um ${d.time}.${hasPhone ? '' : ' Ohne Telefonnummer kann das Restaurant Sie nicht über Änderungen informieren.'} Soll ich die Reservierung bestätigen?`,
    submitted: (d, n, hasPhone) =>
      `Danke ${n || d.name}! Ich habe die Anfrage für ${d.partySize} Personen am ${d.date} um ${d.time} gesendet.${hasPhone ? ' Sie melden sich bald zur Bestätigung.' : ''}`,
    alreadySubmitted: 'Diese Anfrage wurde bereits gesendet und wartet auf die Bestätigung des Restaurants.',
    cancelled: n => n ? `Alles klar ${n}, die Reservierung ist storniert. Kann ich sonst helfen?` : 'Alles klar, die Reservierung ist storniert. Kann ich sonst helfen?',
    fallback: n => n
      ? `Entschuldigung ${n}, das habe ich nicht verstanden. Ich kann die Speisekarte, Öffnungszeiten, den Standort zeigen oder eine Reservierung aufnehmen.`
      : 'Das habe ich nicht verstanden. Ich kann die Speisekarte, Öffnungszeiten, den Standort zeigen oder eine Reservierung aufnehmen.',
    statusNone: n => n
      ? `Ich habe noch keine Reservierung auf deinen Namen, ${n}. Sollen wir eine machen?`
      : 'Ich habe noch keine Reservierung auf deinen Namen. Sollen wir eine machen?',
    statusPending: (r, n) =>
      `${n ? `${n}, deine` : 'Deine'} Anfrage ist registriert: ${r.partySize} Personen am ${r.reservationDate} um ${r.reservationTime}, auf den Namen ${r.customerName}. Das Restaurant hat noch nicht bestätigt oder einen Tisch zugewiesen; Sie werden informiert, sobald sie es geprüft haben.`,
    statusDraft: (d, n) =>
      `${n ? `${n}, deine` : 'Deine'} Reservierung läuft noch${d.partySize ? ` für ${d.partySize} Personen` : ''}${d.date ? ` am ${d.date}` : ''}${d.time ? ` um ${d.time}` : ''}.`,
    priceItem: (name, price) => `${name} kostet ${price}.`,
    priceUnavailable: (name, price) => `${name} ist derzeit nicht verfügbar (${price}).`,
    priceNotFound: 'Ich habe dieses Gericht nicht auf der Speisekarte gefunden. Soll ich die Speisekarte zeigen?'
  }
};

const LANGS: ChatbotLang[] = ['es', 'en', 'pt', 'de'];

const LANG_HINTS: Record<ChatbotLang, Array<[RegExp, number]>> = {
  es: [
    [/\b(hola|buenas|buenos dias|buenas tardes|buenas noches|gracias|por favor)\b/, 2],
    [/\b(reserva|reservas|reservar|reservacion|mesa|mesas)\b/, 2],
    [/\b(personas|comensales|somos)\b/, 1],
    [/\b(plato|platos|carta|comida)\b/, 1],
    [/\b(cuanto|cuanta|precio|precios|cuesta|vale)\b/, 1],
    [/\b(donde|ubicacion|direccion|horario|horarios|manana|hoy|abre|cierra)\b/, 1],
    [/\b(quiero|quisiera|gustaria|necesito|podrias|puedes)\b/, 1],
    [/\b(nada|dale|listo|bueno|perfecto)\b/, 1]
  ],
  en: [
    [/\b(hello|hi|hey|good morning|good evening|thanks|thank you|please)\b/, 2],
    [/\b(reservation|booking|book|reserve|table for|my table|my reservation)\b/, 2],
    [/\b(guests|people|party of|adults)\b/, 1],
    [/\b(dish|dishes|appetizer|entree|dessert|what do you have)\b/, 1],
    [/\b(price|how much|cost|costs)\b/, 2],
    [/\b(where|location|address|opening|hours)\b/, 1],
    [/\b(want|need|would like|can i|could i|my|i am|i'm)\b/, 1],
    [/\b(nothing|okay|ok|sure|great)\b/, 1]
  ],
  pt: [
    [/\b(ola|oi|obrigado|obrigada|por favor)\b/, 2],
    [/\b(reserva|reservar|reservacao|mesa|mesas)\b/, 2],
    [/\b(pessoas|comensais)\b/, 1],
    [/\b(prato|pratos|cardapio|comida)\b/, 1],
    [/\b(quanto|preco|precos|custa)\b/, 1],
    [/\b(onde|endereco|horario|amanha|hoje|abre|fecha)\b/, 1],
    [/\b(quero|gostaria|preciso|voce)\b/, 1]
  ],
  de: [
    [/\b(hallo|guten tag|danke|bitte)\b/, 2],
    [/\b(reservierung|reservieren|tisch|tische)\b/, 2],
    [/\b(personen|gaste)\b/, 1],
    [/\b(gericht|gerichte|speisekarte|essen)\b/, 1],
    [/\b(wie viel|preis|kostet)\b/, 1],
    [/\b(wo|adresse|offnungszeiten|heute|morgen)\b/, 1],
    [/\b(mochte|brauche|konnen)\b/, 1]
  ]
};

function normalize(s: string): string {
  return s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase())
    .join(' ');
}

/**
 * Detects the user's language from weighted markers, but keeps the session
 * language unless the new message is clearly written in another one.
 */
export function detectLanguage(text: string, current: ChatbotLang = 'es'): ChatbotLang {
  const n = normalize(text);
  const scores: Record<ChatbotLang, number> = { es: 0, en: 0, pt: 0, de: 0 };
  for (const lang of LANGS) {
    for (const [pattern, weight] of LANG_HINTS[lang]) {
      if (pattern.test(n)) scores[lang] += weight;
    }
  }
  // The session language carries extra weight: switching requires strong markers.
  scores[current] += 2;

  let best: ChatbotLang = current;
  for (const lang of LANGS) {
    if (scores[lang] > scores[best]) best = lang;
  }

  return best === current ? current : scores[best] >= scores[current] + 3 ? best : current;
}

const DATE_LOCALES: Record<ChatbotLang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR', de: 'de-DE' };

function formatDateLabel(value: string, lang: ChatbotLang): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
}

function formatItems(items: ChatbotMenuItem[], currency?: string | null): string {
  return items
    .filter(i => i.isAvailable !== false)
    .slice(0, 12)
    .map(i => `• ${i.name} — ${money(i.price, currency)}${i.description ? ` (${i.description})` : ''}`)
    .join('\n');
}

function money(price: number, currency?: string | null): string {
  const amount = Number(price).toFixed(2);
  return currency ? `${currency} ${amount}` : amount;
}

const affirmative = /^(si|yes|sim|ja|confirmar|confirm|confirmo|ok|okay|dale|vale|claro|sure|please|gerne|bitte|certo|perfeito|perfecto|super|absolutely|por supuesto|of course|de acuerdo)\b/i;
const negative = /^(no|nope|nao|nein|nel|mejor no|no gracias|no thanks|cancel\w*|abbrechen)\b/i;
const cancelRequest = /^(cancel\w*|cancelar|olvidalo|olvidar|dejalo|mejor no|no quiero|para nada|stop|abbrechen|sair)\b/i;
const phoneDecline = /\b(no tengo|no tengo numero|sin telefono|no phone|don't have|dont have|no numero|ninguno|ninguna|none|keine nummer|sem telefone)\b/;
const bareNo = /^(no|nope|nao|nein|nel)\s*[.!]*$/i;

const NAME_STOPWORDS = new Set([
  'hola', 'hello', 'hi', 'hey', 'ola', 'oi', 'hallo', 'gracias', 'thanks', 'thank', 'nada', 'no', 'si', 'yes', 'ok',
  'okay', 'menu', 'carta', 'reserva', 'reservar', 'reservation', 'booking', 'mesa', 'table', 'precio', 'cuanto',
  'what', 'whats', 'how', 'much', 'the', 'my', 'name', 'please', 'por', 'favor', 'quiero', 'quisiera', 'tengo',
  'persona', 'personas', 'guests', 'people', 'para', 'for', 'book', 'reserve', 'buenas', 'buenos', 'necesito',
  'gustaria', 'hacer', 'una', 'uno', 'un', 'de', 'del', 'mi', 'es', 'son', 'estoy', 'quisera', 'gostaria', 'queria',
  'mochte', 'möchte', 'hätte', 'bitte'
]);

const DISH_STOPWORDS = new Set(['the', 'con', 'with', 'and', 'del', 'las', 'los', 'para', 'por', 'una', 'uno', 'a', 'de', 'la', 'el']);

function sanitizeName(raw: string): string | null {
  const cleaned = raw.replace(/[^A-Za-zÀ-ÿ\s'.-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  const words = cleaned.split(' ').filter(w => !NAME_STOPWORDS.has(normalize(w)));
  if (words.length === 0) return null;
  const candidate = words.slice(0, 3).join(' ').slice(0, 40);
  if (candidate.length < 2) return null;
  return titleCase(candidate);
}

function extractName(text: string): string | null {
  const n = normalize(text);
  const patterns = [
    /\b(?:me llamo|my name is|chamo|ich bin|je m'appelle|me chamo|yo soy|i am|soy)\s+(.+)/i
  ];
  for (const pattern of patterns) {
    const match = n.match(pattern);
    if (match && match[1]) {
      const candidate = sanitizeName(match[1]);
      if (candidate) return candidate;
    }
  }
  return null;
}

function isLikelyName(text: string): boolean {
  const n = normalize(text);
  if (/\d/.test(n)) return false;
  if (/[?¿!¡]/.test(text)) return false;
  const words = n.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 3) return false;
  if (words.some(word => NAME_STOPWORDS.has(word))) return false;
  return Boolean(sanitizeName(text));
}

function resolveName(text: string): string | null {
  return extractName(text) ?? (isLikelyName(text) ? sanitizeName(text) : null);
}

/**
 * Reads a party size from free text: "para 3", "table for 4", "3 personas", "x2".
 */
function extractPartySize(text: string): number | undefined {
  const n = normalize(text);
  const patterns = [
    /\b(?:para|for|somos|seremos|we are|party of|mesa para|table for)\s*(?:ser|somos)?\s*(\d{1,2})\b/,
    /\b(\d{1,2})\s*(?:personas|people|guests|adultos|pax|comensales|pessoas|personen|gaste)\b/,
    /\bx\s?(\d{1,2})\b/,
    /^\s*(\d{1,2})\s*$/
  ];
  for (const pattern of patterns) {
    const match = n.match(pattern);
    if (match) {
      const count = Number(match[1]);
      if (count >= 1 && count <= 50) return count;
    }
  }
  return undefined;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const WEEKDAYS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  sonntag: 0, montag: 1, dienstag: 2, mittwoch: 3, donnerstag: 4, freitag: 5, samstag: 6
};

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  janeiro: 1, fevereiro: 2, marco: 3, maio: 5, junho: 6, julho: 7, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  januar: 1, februar: 2, marz: 3, mai: 5, juni: 6, juli: 7, oktober: 10, dezember: 12
};

function parseDate(text: string): string | null {
  const n = normalize(text);
  const now = new Date();

  if (/\b(pasado manana|day after tomorrow)\b/.test(n)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return toIso(d);
  }
  if (/\b(hoy|today|hoje|heute)\b/.test(n)) return toIso(now);
  if (/\b(manana|tomorrow|amanha|morgen)\b/.test(n)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return toIso(d);
  }

  for (const [word, day] of Object.entries(WEEKDAYS)) {
    if (new RegExp(`\\b${word}\\b`).test(n)) {
      const d = new Date(now);
      const delta = (day - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + delta);
      return toIso(d);
    }
  }

  const numeric = n.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    let year = numeric[3] ? Number(numeric[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const candidate = new Date(year, month - 1, day);
      if (candidate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
        candidate.setFullYear(year + 1);
      }
      return toIso(candidate);
    }
  }

  const monthFirst = n.match(/\b(\d{1,2})\s*(?:de\s*)?([a-z]+)\b/);
  if (monthFirst) {
    const month = MONTHS[monthFirst[2]];
    if (month) {
      const day = Number(monthFirst[1]);
      const candidate = new Date(now.getFullYear(), month - 1, day);
      if (candidate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
        candidate.setFullYear(now.getFullYear() + 1);
      }
      return toIso(candidate);
    }
  }
  const monthLast = n.match(/\b([a-z]+)\s+(\d{1,2})\b/);
  if (monthLast) {
    const month = MONTHS[monthLast[1]];
    if (month) {
      const day = Number(monthLast[2]);
      const candidate = new Date(now.getFullYear(), month - 1, day);
      if (candidate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
        candidate.setFullYear(now.getFullYear() + 1);
      }
      return toIso(candidate);
    }
  }

  return null;
}

/**
 * Normalizes a time to HH:MM. Bare hours 1–11 are read as evening times,
 * which is the common case for restaurant reservations.
 */
function parseTime(text: string): string | null {
  const n = normalize(text);

  const colon = n.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\s*(am|pm)?\b/);
  if (colon) {
    let hour = Number(colon[1]);
    const minutes = colon[2];
    const meridiem = colon[3];
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return `${pad(hour)}:${minutes}`;
  }

  const meridiemOnly = n.match(/\b(1[0-2]|0?[1-9])\s*(am|pm)\b/);
  if (meridiemOnly) {
    let hour = Number(meridiemOnly[1]);
    if (meridiemOnly[2] === 'pm' && hour < 12) hour += 12;
    if (meridiemOnly[2] === 'am' && hour === 12) hour = 0;
    return `${pad(hour)}:00`;
  }

  const prefixed = n.match(/\b(?:a las|at|um)\s*(\d{1,2})\b/);
  const bare = n.match(/^\s*(\d{1,2})\s*(?:h|hs|horas|uhr)?\s*$/);
  const hourText = prefixed?.[1] ?? bare?.[1];
  if (hourText) {
    let hour = Number(hourText);
    if (hour >= 1 && hour <= 11) hour += 12;
    if (hour === 24) hour = 0;
    if (hour >= 0 && hour <= 23) return `${pad(hour)}:00`;
  }

  return null;
}

/** Reads a time that accompanies a date in the same message ("el viernes a las 21"). */
function parseEmbeddedTime(text: string): string | null {
  const cleaned = normalize(text).replace(/\b\d{1,2}[/.-]\d{1,2}(?:[/.-]\d{2,4})?\b/g, ' ');
  if (!/:|\b(a las|at|um|am|pm|hs?|horas|uhr)\b/.test(cleaned)) return null;
  return parseTime(cleaned);
}

/** Moves a draft to the next unanswered field once the party size is known. */
function withInlineDate(text: string, draft: ReservationDraft): ReservationDraft {
  const date = parseDate(text);
  if (!date) return { ...draft, step: 'date' };
  const time = parseEmbeddedTime(text);
  return time ? { ...draft, date, time, step: 'phone' } : { ...draft, date, step: 'time' };
}

function stepPromptFor(step: ReservationStep, c: Copy): string {
  if (step === 'phone') return c.askPhone;
  if (step === 'time') return c.askTime;
  return c.askDate;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMenuItem(text: string, items: ChatbotMenuItem[]): ChatbotMenuItem | null {
  const n = normalize(text);
  let best: ChatbotMenuItem | null = null;
  let bestScore = 0;

  for (const item of items) {
    const name = normalize(item.name);
    if (!name) continue;
    if (n.includes(name)) return item;

    const tokens = name.split(/\s+/).filter(word => word.length >= 4 && !DISH_STOPWORDS.has(word));
    if (tokens.length === 0) continue;
    const hits = tokens.filter(token => new RegExp(`\\b${escapeRegExp(token)}`).test(n)).length;
    if (hits === 0) continue;
    const ratio = hits / tokens.length;
    const threshold = tokens.length >= 2 ? 0.5 : 1;
    if (ratio >= threshold && hits > bestScore) {
      best = item;
      bestScore = hits;
    }
  }

  return best;
}

/**
 * Picks the curated answer whose trigger phrases appear in the message.
 * Longer triggers win, so "aceptan perros" beats a bare "perros".
 */
function matchLearned(normalized: string, answers: LearnedAnswer[], lang: ChatbotLang): LearnedAnswer | null {
  let best: LearnedAnswer | null = null;
  let bestScore = 0;

  for (const answer of answers) {
    if (answer.lang !== lang || !answer.reply) continue;
    let score = 0;
    for (const trigger of answer.triggers || []) {
      const value = normalize(trigger);
      if (value.length < 3) continue;
      if (new RegExp(`\\b${escapeRegExp(value)}`).test(normalized)) {
        score += value.split(/\s+/).length + 1;
      }
    }
    if (score > bestScore) {
      best = answer;
      bestScore = score;
    }
  }

  return best;
}

const INTENT_PATTERNS = {
  status: /\b(mi mesa|mi reserva|mi reservacion|my table|my reservation|reservation status|estado de (?:mi|la) reserva|ya (?:hice|reserve|reservé)|ya tengo reserva|donde esta mi mesa|is my reservation|qual (?:e )?minha mesa|meu pedido|reservierung status)\b/,
  price: /\b(cuanto (?:cuesta|sale|vale|es)|cuanto|cuesta|precio|precios|how much|price|cost|costs|quanto (?:custa|e)|preco|precos|preis|kostet|wie viel)\b/,
  hours: /\b(horario|horarios|hours|opening|abre|cierra|offnungszeiten|abertura|a que hora)\b/,
  location: /\b(ubicacion|direccion|donde (?:estan|queda|estas)|address|location|anfahrt|standort|endereco|localizacao|adresse|wie komme ich)\b/,
  vegetarian: /\b(vegetariano|vegetariana|vegetarian|vegetarisch|sin carne)\b/,
  vegan: /\b(vegano|vegana|vegan|veganes|vegane|veganos)\b/,
  glutenFree: /\b(sin gluten|gluten free|glutenfrei|celiaco|celiac|sem gluten)\b/,
  menu: /\b(menu|carta|cardapio|speisekarte|platos|comida|what do you have|recomiend\w*|recommend\w*|empfehl\w*|sugest\w*|destacad\w*|mas pedido|best seller\w*|popular\w*)\b/,
  bestSellers: /\b(best|seller|popular|destacad|trending|recommendation|mejores|recomiendas|recomendar|lo mas pedido|mas pedido)\b/,
  reservation: /\b(reservar|reserva|reservas|reservacion|reservation|booking|book|reserve|reservierung|reservieren|tisch|mesa para|mesa de|quiero una mesa|need a table|want a table|table for)\b/,
  greeting: /^(hola|hello|hi|hey|ola|oi|hallo|buenas|buenos dias|buenas tardes|buenas noches|guten tag|bonjour)\b/
} as const;

type Intent = keyof typeof INTENT_PATTERNS;

const INTENT_ORDER: Intent[] = [
  'status', 'price', 'hours', 'location', 'vegetarian', 'vegan', 'glutenFree', 'menu', 'bestSellers', 'reservation', 'greeting'
];

const ANSWER_ORDER: Intent[] = ['status', 'price', 'hours', 'location', 'vegetarian', 'vegan', 'glutenFree', 'menu', 'bestSellers'];

function detectIntent(normalized: string): Intent | 'none' {
  for (const intent of INTENT_ORDER) {
    if (INTENT_PATTERNS[intent].test(normalized)) return intent;
  }
  return 'none';
}

interface AnswerContext {
  lang: ChatbotLang;
  copy: Copy;
  venue: ChatbotVenueContext;
  menu: ChatbotMenuItem[];
  name?: string;
  draft: ReservationDraft;
  lastReservation?: LastReservationSummary;
}

function answerIntent(intent: Intent, text: string, ctx: AnswerContext): string | null {
  const { copy: c, venue, menu, name, lang, draft, lastReservation } = ctx;

  switch (intent) {
    case 'status': {
      if (lastReservation) {
        return c.statusPending({
          ...lastReservation,
          reservationDate: formatDateLabel(lastReservation.reservationDate, lang)
        }, name);
      }
      if (draft.step !== 'idle') {
        return c.statusDraft({
          ...draft,
          date: draft.date ? formatDateLabel(draft.date, lang) : undefined
        }, name);
      }
      return c.statusNone(name);
    }
    case 'price': {
      const item = findMenuItem(text, menu);
      if (!item) return c.priceNotFound;
      if (item.isAvailable === false) return c.priceUnavailable(item.name, money(item.price, venue.currency));
      return c.priceItem(item.name, money(item.price, venue.currency));
    }
    case 'hours':
      return venue.openingHours ? c.hours(venue.openingHours) : c.hoursUnknown;
    case 'location':
      return venue.address ? c.location(venue.address) : c.locationUnknown;
    case 'vegetarian':
      return c.vegetarian(formatItems(menu.filter(i => i.isVegetarian || i.isVegan), venue.currency));
    case 'vegan':
      return c.vegan(formatItems(menu.filter(i => i.isVegan), venue.currency));
    case 'glutenFree':
      return c.glutenFree(formatItems(menu.filter(i => i.isGlutenFree), venue.currency));
    case 'menu': {
      const featured = menu.filter(i => i.isFeatured);
      const items = formatItems(featured.length ? featured : menu, venue.currency);
      return items ? c.menu(items) : c.noItems;
    }
    case 'bestSellers': {
      const featured = menu.filter(i => i.isFeatured);
      if (featured.length) return c.bestSellers(formatItems(featured.slice(0, 8), venue.currency));
      return c.featured(formatItems(menu.slice(0, 8), venue.currency));
    }
    case 'greeting':
      return c.welcome(venue.name, name);
    default:
      return null;
  }
}

/** Answers every question contained in a message (max two, to stay readable). */
function composeAnswers(text: string, normalized: string, ctx: AnswerContext): string | null {
  const replies: string[] = [];
  for (const intent of ANSWER_ORDER) {
    if (!INTENT_PATTERNS[intent].test(normalized)) continue;
    if (intent === 'menu' && INTENT_PATTERNS.price.test(normalized)) continue;
    const reply = answerIntent(intent, text, ctx);
    if (reply && !replies.includes(reply)) replies.push(reply);
    if (replies.length >= 2) break;
  }
  if (replies.length === 0) return null;
  return replies.join('\n\n');
}

function newIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `chatbot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Draft copy for the confirmation prompts, with the date written out. */
function spokenDraft(draft: ReservationDraft, lang: ChatbotLang): ReservationData & ReservationDraft {
  return {
    ...draft,
    date: draft.date ? formatDateLabel(draft.date, lang) : draft.date
  } as ReservationData & ReservationDraft;
}

export function processChatbotMessage(
  message: string,
  state: ChatbotSessionState,
  venue: ChatbotVenueContext,
  menuItems: ChatbotMenuItem[] = [],
  source: ChatSource = 'web',
  learnedAnswers: LearnedAnswer[] = []
): ChatbotResponse {
  const text = message.trim();
  const n = normalize(text);
  const lang = detectLanguage(text, state.language || 'es');
  const c = COPY[lang];
  const name = state.userName;
  const menu = menuItems;
  let draft: ReservationDraft = { step: 'idle', ...(state.reservationDraft || {}) };

  const respond = (
    reply: string,
    options: { draft?: ReservationDraft; state?: Partial<ChatbotSessionState>; extra?: Partial<ChatbotResponse> } = {}
  ): ChatbotResponse => {
    const finalDraft = options.draft ?? draft;
    return {
      reply,
      detectedLang: lang,
      nextState: {
        ...state,
        language: lang,
        reservationDraft: finalDraft,
        ...(options.state || {})
      },
      ...(options.extra || {})
    };
  };

  const ctx: AnswerContext = {
    lang,
    copy: c,
    venue,
    menu,
    name,
    draft,
    lastReservation: state.lastReservation
  };

  const sideAnswer = (value: string, normalized: string) => {
    const builtin = composeAnswers(value, normalized, { ...ctx, draft });
    if (builtin) return { text: builtin };
    const learned = matchLearned(normalized, learnedAnswers, lang);
    return learned ? { text: learned.reply, learnedId: learned.id } : null;
  };

  if (!text) return respond(name ? c.fallback(name) : c.askNameFirst);

  // --- Name gate: remember a reservation request expressed before the name ---
  if (!name) {
    const resolved = resolveName(text);
    if (resolved) {
      const pending = state.pendingIntent === 'reservation' ? state.pendingPartySize : undefined;
      if (state.pendingIntent === 'reservation') {
        const startedDraft: ReservationDraft = pending
          ? { step: 'date', name: resolved, partySize: pending, idempotencyKey: newIdempotencyKey() }
          : { step: 'party_size', name: resolved, idempotencyKey: newIdempotencyKey() };
        return respond(
          pending ? `${c.partyAck(pending)} ${c.askDate}` : c.reserve(resolved),
          { draft: startedDraft, state: { userName: resolved, pendingIntent: undefined, pendingPartySize: undefined } }
        );
      }
      return respond(c.welcome(venue.name, resolved), {
        state: { userName: resolved, pendingIntent: undefined, pendingPartySize: undefined }
      });
    }

    const intent = detectIntent(n);
    if (intent === 'reservation') {
      const party = extractPartySize(text);
      return respond(c.askNameForReservation(party), {
        state: { pendingIntent: 'reservation', pendingPartySize: party }
      });
    }
    if (intent !== 'none' && intent !== 'greeting') {
      const answer = answerIntent(intent, text, ctx);
      // Any other question replaces a pending reservation request.
      if (answer) {
        return respond(`${answer}\n\n${c.askNameFirst}`, {
          state: { pendingIntent: undefined, pendingPartySize: undefined }
        });
      }
    }
    const learned = matchLearned(n, learnedAnswers, lang);
    if (learned) return respond(`${learned.reply}\n\n${c.askNameFirst}`, { extra: { learnedId: learned.id } });
    return respond(c.askNameFirst);
  }

  // --- Reservation in progress ---
  if (draft.step !== 'idle') {
    if (cancelRequest.test(n)) {
      return respond(c.cancelled(name), { draft: { step: 'idle' } });
    }

    if (draft.step === 'party_size') {
      const party = extractPartySize(text);
      if (party) {
        draft = withInlineDate(text, { ...draft, partySize: party });
        return respond(`${c.partyAck(party)} ${stepPromptFor(draft.step, c)}`, { draft });
      }
      const side = sideAnswer(text, n);
      if (side) return respond(`${side.text}\n\n${c.askParty}`, { draft, extra: side.learnedId ? { learnedId: side.learnedId } : undefined });
      return respond(c.askParty, { draft });
    }

    if (draft.step === 'date') {
      const parsed = parseDate(text);
      const question = /[?¿]/.test(text) || /\b(que|cuanto|cuando|donde|como|cual|what|when|where|how|price|horario|hours)\b/.test(n);
      if (parsed) {
        draft = { ...draft, date: parsed, step: 'time' };
        return respond(c.askTime, { draft });
      }
      if (!question && text.length <= 40) {
        draft = { ...draft, date: text, step: 'time' };
        return respond(c.askTime, { draft });
      }
      const side = sideAnswer(text, n);
      if (side) return respond(`${side.text}\n\n${c.askDate}`, { draft, extra: side.learnedId ? { learnedId: side.learnedId } : undefined });
      return respond(c.askDate, { draft });
    }

    if (draft.step === 'time') {
      const time = parseTime(text);
      if (time) {
        draft = { ...draft, time, step: 'phone' };
        return respond(c.askPhone, { draft });
      }
      const side = sideAnswer(text, n);
      if (side) return respond(`${side.text}\n\n${c.askTime}`, { draft, extra: side.learnedId ? { learnedId: side.learnedId } : undefined });
      return respond(c.askTime, { draft });
    }

    if (draft.step === 'name') {
      const resolved = resolveName(text);
      if (resolved) {
        draft = { ...draft, name: resolved, step: 'phone' };
        return respond(c.askPhone, { draft });
      }
      return respond(c.askName, { draft });
    }

    if (draft.step === 'phone') {
      const digits = text.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 18) {
        draft = { ...draft, phone: text, step: 'confirm', idempotencyKey: draft.idempotencyKey || newIdempotencyKey() };
        return respond(c.confirm(spokenDraft(draft, lang), name, true), { draft });
      }
      if (phoneDecline.test(n) || bareNo.test(n)) {
        draft = { ...draft, phone: '', step: 'confirm', idempotencyKey: draft.idempotencyKey || newIdempotencyKey() };
        return respond(`${c.declinePhone} ${c.confirm(spokenDraft(draft, lang), name, false)}`, { draft });
      }
      const side = sideAnswer(text, n);
      if (side) return respond(`${side.text}\n\n${c.askPhone}`, { draft, extra: side.learnedId ? { learnedId: side.learnedId } : undefined });
      return respond(c.askPhone, { draft });
    }

    if (draft.step === 'confirm') {
      if (!draft.idempotencyKey) {
        draft = { ...draft, idempotencyKey: newIdempotencyKey() };
      }
      if (affirmative.test(n)) {
        const data: ReservationRequest = {
          venueId: venue.id,
          customerName: draft.name!,
          customerPhone: draft.phone ?? '',
          partySize: draft.partySize!,
          reservationDate: draft.date!,
          reservationTime: draft.time!,
          source,
          idempotencyKey: draft.idempotencyKey
        };
        return respond(
          c.submitted(spokenDraft(draft, lang), name, Boolean(draft.phone)),
          { draft: { step: 'idle' }, extra: { actionRequired: 'create_reservation', reservationData: data } }
        );
      }
      if (negative.test(n)) {
        return respond(c.cancelled(name), { draft: { step: 'idle' } });
      }
      const side = sideAnswer(text, n);
      if (side) {
        return respond(`${side.text}\n\n${c.confirm(spokenDraft(draft, lang), name, Boolean(draft.phone))}`, {
          draft,
          extra: side.learnedId ? { learnedId: side.learnedId } : undefined
        });
      }
      return respond(c.confirm(spokenDraft(draft, lang), name, Boolean(draft.phone)), { draft });
    }
  }

  if (state.lastReservation && affirmative.test(n)) {
    return respond(c.alreadySubmitted);
  }

  // --- Idle conversation ---
  const intent = detectIntent(n);

  if (intent === 'reservation') {
    const party = extractPartySize(text);
    if (!party) {
      return respond(c.reserve(name), {
        draft: { step: 'party_size', name, idempotencyKey: newIdempotencyKey() }
      });
    }
    const started = withInlineDate(text, {
      step: 'date',
      name,
      partySize: party,
      idempotencyKey: newIdempotencyKey()
    });
    return respond(`${c.partyAck(party)} ${stepPromptFor(started.step, c)}`, { draft: started });
  }

  const answer = composeAnswers(text, n, ctx);
  if (answer) return respond(answer);

  const learned = matchLearned(n, learnedAnswers, lang);
  if (learned) return respond(learned.reply, { extra: { learnedId: learned.id } });

  if (intent === 'greeting') return respond(c.welcome(venue.name, name));

  return respond(c.fallback(name));
}
