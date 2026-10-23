/**
 * Deterministic, dependency-free customer chatbot for MiMenu.
 * Shared domain logic for the menu widget and the WhatsApp server handler.
 * Reservation replies create a pending request; they never imply availability.
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
}
export interface ChatbotSessionState {
  language: ChatbotLang;
  reservationDraft?: ReservationDraft;
}
export interface ReservationRequest {
  venueId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  source: ChatSource;
}
export interface ChatbotResponse {
  reply: string;
  detectedLang: ChatbotLang;
  nextState: ChatbotSessionState;
  actionRequired?: 'create_reservation';
  reservationData?: ReservationRequest;
}

type Copy = {
  welcome: (venue: string) => string; menu: (items: string) => string; noItems: string;
  hours: (value: string) => string; location: (value: string) => string;
  vegetarian: (items: string) => string; vegan: (items: string) => string; glutenFree: (items: string) => string;
  reserve: string; askParty: string; askDate: string; askTime: string; askName: string; askPhone: string;
  confirm: (d: Required<Pick<ReservationDraft,'name'|'partySize'|'date'|'time'>>) => string;
  submitted: (d: Required<Pick<ReservationDraft,'name'|'partySize'|'date'|'time'>>) => string;
  cancelled: string; fallback: string;
};
const COPY: Record<ChatbotLang, Copy> = {
 es: {
  welcome:v=>`¡Hola! Bienvenido/a a ${v}. ¿En qué te ayudo? Puedes preguntar por el menú, horarios, ubicación o escribir “reservar”.`,
  menu:i=>i?`Algunas opciones del menú:\n${i}`:'Todavía no hay platos disponibles para mostrar.', noItems:'No encontré platos con ese criterio. Prueba con otro nombre o categoría.',
  hours:v=>`Nuestro horario es: ${v}`, location:v=>`Estamos en: ${v}`,
  vegetarian:i=>`Opciones vegetarianas:\n${i||'Consulta con el restaurante sobre opciones disponibles.'}`, vegan:i=>`Opciones veganas:\n${i||'Consulta con el restaurante sobre opciones disponibles.'}`, glutenFree:i=>`Opciones sin gluten:\n${i||'Consulta con el restaurante sobre opciones disponibles.'}`,
  reserve:'Te ayudo con una solicitud de reserva. ¿Para cuántas personas?', askParty:'Indícame cuántas personas (de 1 a 50).', askDate:'¿Para qué fecha? Indícala, por favor.', askTime:'¿A qué hora?', askName:'¿A nombre de quién?', askPhone:'¿Qué teléfono de contacto podemos usar?',
  confirm:d=>`Resumen: ${d.name}, ${d.partySize} personas, ${d.date} a las ${d.time}. ¿Envío esta solicitud al restaurante? Responde sí para enviarla o no para cancelar.`,
  submitted:d=>`Gracias, ${d.name}. Envié tu solicitud para ${d.partySize} personas, ${d.date} a las ${d.time}. Está pendiente de confirmación del restaurante; aún no es una reserva confirmada.`,
  cancelled:'Solicitud cancelada. ¿Puedo ayudarte con algo más?', fallback:'No entendí la consulta. Puedes preguntar por el menú, horarios, ubicación o una reserva.'
 },
 en: {
  welcome:v=>`Hello! Welcome to ${v}. How can I help? Ask about the menu, hours, location, or type “reserve”.`,
  menu:i=>i?`A few menu options:\n${i}`:'There are no menu items available to show yet.', noItems:'I couldn’t find a matching dish. Try another name or category.',
  hours:v=>`Our opening hours are: ${v}`, location:v=>`We are located at: ${v}`,
  vegetarian:i=>`Vegetarian options:\n${i||'Please ask the restaurant about available options.'}`, vegan:i=>`Vegan options:\n${i||'Please ask the restaurant about available options.'}`, glutenFree:i=>`Gluten-free options:\n${i||'Please ask the restaurant about available options.'}`,
  reserve:'I can send a reservation request. How many guests?', askParty:'Please give the number of guests (1–50).', askDate:'What date would you like?', askTime:'What time?', askName:'What name should I use?', askPhone:'What phone number can the restaurant use to contact you?',
  confirm:d=>`Summary: ${d.name}, ${d.partySize} guests, ${d.date} at ${d.time}. Send this request to the restaurant? Reply yes to send or no to cancel.`,
  submitted:d=>`Thanks, ${d.name}. I sent your request for ${d.partySize} guests on ${d.date} at ${d.time}. It is pending restaurant confirmation and is not yet a confirmed booking.`,
  cancelled:'Request cancelled. Can I help with anything else?', fallback:'I didn’t understand. Ask about the menu, hours, location, or a reservation.'
 },
 pt: {
  welcome:v=>`Olá! Bem-vindo(a) ao ${v}. Como posso ajudar? Pergunte sobre o cardápio, horários, localização ou digite “reservar”.`,
  menu:i=>i?`Algumas opções do cardápio:\n${i}`:'Ainda não há itens disponíveis para mostrar.', noItems:'Não encontrei um prato correspondente. Tente outro nome ou categoria.',
  hours:v=>`Nosso horário é: ${v}`, location:v=>`Estamos em: ${v}`,
  vegetarian:i=>`Opções vegetarianas:\n${i||'Consulte o restaurante sobre as opções disponíveis.'}`, vegan:i=>`Opções veganas:\n${i||'Consulte o restaurante sobre as opções disponíveis.'}`, glutenFree:i=>`Opções sem glúten:\n${i||'Consulte o restaurante sobre as opções disponíveis.'}`,
  reserve:'Posso enviar uma solicitação de reserva. Para quantas pessoas?', askParty:'Informe o número de pessoas (1 a 50).', askDate:'Para qual data?', askTime:'A que horas?', askName:'Em nome de quem?', askPhone:'Qual telefone podemos usar para contato?',
  confirm:d=>`Resumo: ${d.name}, ${d.partySize} pessoas, ${d.date} às ${d.time}. Envio a solicitação ao restaurante? Responda sim para enviar ou não para cancelar.`,
  submitted:d=>`Obrigado, ${d.name}. Enviei sua solicitação para ${d.partySize} pessoas, ${d.date} às ${d.time}. Ela aguarda confirmação do restaurante; ainda não é uma reserva confirmada.`,
  cancelled:'Solicitação cancelada. Posso ajudar em algo mais?', fallback:'Não entendi. Pergunte sobre o cardápio, horários, localização ou reserva.'
 },
 de: {
  welcome:v=>`Hallo! Willkommen bei ${v}. Wie kann ich helfen? Fragen Sie nach der Speisekarte, Öffnungszeiten, Anfahrt oder schreiben Sie „reservieren“.`,
  menu:i=>i?`Einige Speisen:\n${i}`:'Derzeit sind keine Speisen verfügbar.', noItems:'Ich habe kein passendes Gericht gefunden. Versuchen Sie einen anderen Namen oder eine Kategorie.',
  hours:v=>`Unsere Öffnungszeiten: ${v}`, location:v=>`Sie finden uns hier: ${v}`,
  vegetarian:i=>`Vegetarische Gerichte:\n${i||'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`, vegan:i=>`Vegane Gerichte:\n${i||'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`, glutenFree:i=>`Glutenfreie Gerichte:\n${i||'Bitte fragen Sie das Restaurant nach verfügbaren Optionen.'}`,
  reserve:'Ich kann eine Reservierungsanfrage senden. Für wie viele Personen?', askParty:'Bitte nennen Sie die Personenzahl (1 bis 50).', askDate:'Für welches Datum?', askTime:'Um wie viel Uhr?', askName:'Auf welchen Namen?', askPhone:'Welche Telefonnummer darf das Restaurant verwenden?',
  confirm:d=>`Zusammenfassung: ${d.name}, ${d.partySize} Personen, ${d.date} um ${d.time}. Anfrage an das Restaurant senden? Antworten Sie mit Ja zum Senden oder Nein zum Abbrechen.`,
  submitted:d=>`Danke, ${d.name}. Ihre Anfrage für ${d.partySize} Personen am ${d.date} um ${d.time} wurde gesendet. Sie wartet auf die Bestätigung des Restaurants und ist noch keine bestätigte Reservierung.`,
  cancelled:'Anfrage abgebrochen. Kann ich sonst helfen?', fallback:'Das habe ich nicht verstanden. Fragen Sie nach Speisekarte, Öffnungszeiten, Anfahrt oder Reservierung.'
 }
};

function normalize(s:string):string { return s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
export function detectLanguage(text:string, fallback:ChatbotLang='es'):ChatbotLang {
 const s=normalize(text);
 if (/\b(hallo|guten tag|speisekarte|offnungszeiten|danke|bitte|reservieren)\b/.test(s)) return 'de';
 if (/\b(ola|bom dia|boa tarde|cardapio|obrigado|obrigada|reservar|cardapio)\b/.test(s)) return 'pt';
 if (/\b(hello|hi|hey|good morning|menu|booking|book a table|hours|thanks)\b/.test(s)) return 'en';
 if (/\b(hola|buenos dias|buenas tardes|menu|carta|reservar|gracias|horario)\b/.test(s)) return 'es';
 return fallback;
}
function formatItems(items:ChatbotMenuItem[]):string {
 return items.filter(i=>i.isAvailable!==false).slice(0,6).map(i=>`• ${i.name} — ${Number(i.price).toFixed(2)}${i.description?` (${i.description})`:''}`).join('\n');
}
const affirmative=/^(si|yes|sim|ja|confirmar|confirm|ok|okay|dale|vale)$/i;
const negative=/^(no|nao|nein|cancelar|cancel|abbrechen|stop)$/i;

export function processChatbotMessage(message:string, state:ChatbotSessionState, venue:ChatbotVenueContext, menuItems:ChatbotMenuItem[]=[], source:ChatSource='web'):ChatbotResponse {
 const text=message.trim(); const n=normalize(text); const lang=detectLanguage(text,state.language||'es'); const c=COPY[lang];
 let draft:ReservationDraft={step:'idle',...(state.reservationDraft||{})};
 const response=(reply:string,next:ReservationDraft=draft,extra:Partial<ChatbotResponse>={}):ChatbotResponse=>({reply,detectedLang:lang,nextState:{language:lang,reservationDraft:next},...extra});
 if (!text) return response(c.fallback);
 if (draft.step!=='idle' && /^(cancel|cancelar|stop|abbrechen|sair)$/i.test(n)) return response(c.cancelled,{step:'idle'});
 if (draft.step==='party_size') {
  const m=n.match(/\d{1,2}/); const count=m?Number(m[0]):0;
  if(count<1||count>50) return response(c.askParty,draft);
  draft={...draft,partySize:count,step:'date'}; return response(c.askDate,draft);
 }
 if (draft.step==='date') { if(text.length>80) return response(c.askDate,draft); draft={...draft,date:text,step:'time'}; return response(c.askTime,draft); }
 if (draft.step==='time') { if(text.length>40) return response(c.askTime,draft); draft={...draft,time:text,step:'name'}; return response(c.askName,draft); }
 if (draft.step==='name') { if(text.length<2||text.length>100) return response(c.askName,draft); draft={...draft,name:text,step:'phone'}; return response(c.askPhone,draft); }
 if (draft.step==='phone') { const digits=text.replace(/\D/g,''); if(digits.length<7||digits.length>18) return response(c.askPhone,draft); draft={...draft,phone:text,step:'confirm'}; return response(c.confirm({name:draft.name!,partySize:draft.partySize!,date:draft.date!,time:draft.time!}),draft); }
 if (draft.step==='confirm') {
  if(affirmative.test(n)) {
   const data:ReservationRequest={venueId:venue.id,customerName:draft.name!,customerPhone:draft.phone!,partySize:draft.partySize!,reservationDate:draft.date!,reservationTime:draft.time!,source};
   return response(c.submitted({name:draft.name!,partySize:draft.partySize!,date:draft.date!,time:draft.time!}),{step:'idle'},{actionRequired:'create_reservation',reservationData:data});
  }
  if(negative.test(n)) return response(c.cancelled,{step:'idle'});
  return response(c.confirm({name:draft.name!,partySize:draft.partySize!,date:draft.date!,time:draft.time!}),draft);
 }
 if (/^(hola|hello|hi|hey|ol[aá]|hallo|guten tag|buenos dias|buenas tardes)\b/i.test(n)) return response(c.welcome(venue.name));
 if (/\b(reserv|booking|book a table|mesa|tisch|reservierung)\b/.test(n)) return response(c.reserve,{step:'party_size'});
 if (/\b(horario|horarios|hours|opening|offnungszeiten|abre|cierra)\b/.test(n)) return response(c.hours(venue.openingHours||'Ask the restaurant for current hours.'));
 if (/\b(ubicacion|direccion|donde|address|location|anfahrt|standort|endereco|localizacao)\b/.test(n)) return response(c.location(venue.address||'Ask the restaurant for its address.'));
 if (/\b(vegano|vegana|vegan)\b/.test(n)) return response(c.vegan(formatItems(menuItems.filter(i=>i.isVegan))));
 if (/\b(vegetariano|vegetariana|vegetarian|vegetarisch)\b/.test(n)) return response(c.vegetarian(formatItems(menuItems.filter(i=>i.isVegetarian||i.isVegan))));
 if (/\b(gluten|celiaco|celiac|glutenfrei)\b/.test(n)) return response(c.glutenFree(formatItems(menuItems.filter(i=>i.isGlutenFree))));
 if (/\b(menu|carta|cardapio|speisekarte|platos|comida|recommend|recomend|empfehl|sugest)\b/.test(n)) {
  let results=menuItems;
  const q=n.replace(/\b(menu|carta|cardapio|speisekarte|platos|comida|recommend|recomend|empfehl|sugest|show|ver|the|el|la|please|por favor)\b/g,'').trim();
  if(q && q.length>1) results=menuItems.filter(i=>normalize(`${i.name} ${i.description||''} ${i.category||''}`).includes(q));
  else if(menuItems.some(i=>i.isFeatured)) results=menuItems.filter(i=>i.isFeatured);
  const items=formatItems(results);
  return response(items?c.menu(items):c.noItems);
 }
 return response(c.fallback);
}
