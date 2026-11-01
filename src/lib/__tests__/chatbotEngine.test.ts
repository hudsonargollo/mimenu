import { describe, it, expect } from 'vitest';
import {
  processChatbotMessage,
  detectLanguage,
  type ChatbotMenuItem,
  type ChatbotSessionState,
  type ChatbotVenueContext,
} from '../chatbot/engine';

const venue: ChatbotVenueContext = {
  id: 'jaleo',
  name: 'Jaleo',
  address: 'Av. Principal 123',
  phone: '+591 70000000',
  openingHours: 'Lun–Dom 12:00–23:00',
  currency: 'Bs.',
};

const menu: ChatbotMenuItem[] = [
  {
    id: 'calamares',
    name: 'Calamares a la Romana',
    price: 45,
    category: 'Entradas',
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: 'paella',
    name: 'Paella Valenciana',
    price: 90,
    category: 'Principales',
    isAvailable: true,
  },
];

/** Replays a customer turn and returns the reply plus the persisted session. */
function turn(
  message: string,
  state: ChatbotSessionState,
  items: ChatbotMenuItem[] = menu
) {
  const result = processChatbotMessage(message, state, venue, items, 'web');
  return { reply: result.reply, state: result.nextState, result };
}

describe('concierge language', () => {
  it('keeps Spanish when the guest writes Spanish', () => {
    expect(detectLanguage('me gustaria una reserva para 3', 'es')).toBe('es');
    expect(detectLanguage('no tengo', 'es')).toBe('es');
    expect(detectLanguage('nada, whats my table and how much is the calamar la romana', 'es')).toBe('es');
  });

  it('switches when the guest clearly writes another language', () => {
    expect(detectLanguage('hello, I would like a reservation for 4', 'es')).toBe('en');
    expect(detectLanguage('hallo, ich mochte einen tisch reservieren', 'es')).toBe('de');
  });
});

describe('concierge reservation flow', () => {
  it('remembers the reservation asked for before the name and skips the party question', () => {
    const first = turn('hola, me gustaria hacer una reserva', {
      language: 'es',
      reservationDraft: { step: 'idle' },
    });
    expect(first.reply).toContain('nombre');
    expect(first.state.pendingIntent).toBe('reservation');
    expect(first.state.userName).toBeUndefined();

    const second = turn('hudson', first.state);
    expect(second.state.userName).toBe('Hudson');
    expect(second.state.pendingIntent).toBeUndefined();
    expect(second.state.reservationDraft?.step).toBe('party_size');
    expect(second.reply).toContain('cuántas personas');
  });

  it('accepts the party size inline with the request', () => {
    const first = turn('me gustaria una reserva para 3', {
      language: 'es',
      userName: 'Hudson',
      reservationDraft: { step: 'idle' },
    });
    expect(first.state.reservationDraft).toMatchObject({ step: 'date', partySize: 3 });
    expect(first.reply).toContain('3 personas');
    expect(first.reply).toContain('fecha');
  });

  it('runs the full flow, treats a declined phone as optional, and asks for no repeat', () => {
    let state: ChatbotSessionState = {
      language: 'es',
      userName: 'Hudson',
      reservationDraft: { step: 'party_size' },
    };

    state = turn('3', state).state;
    expect(state.reservationDraft).toMatchObject({ step: 'date', partySize: 3 });

    const date = turn('manana', state);
    state = date.state;
    expect(state.reservationDraft?.step).toBe('time');
    expect(state.reservationDraft?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    state = turn('3', state).state;
    expect(state.reservationDraft).toMatchObject({ step: 'phone', time: '15:00' });

    const declined = turn('no tengo', state);
    state = declined.state;
    expect(declined.reply).toContain('sin teléfono');
    expect(declined.reply).toContain('¿Confirmo la reserva?');
    expect(state.reservationDraft?.step).toBe('confirm');
    expect(state.reservationDraft?.phone).toBe('');

    const confirmed = turn('si', state);
    expect(confirmed.result.actionRequired).toBe('create_reservation');
    expect(confirmed.result.reservationData).toMatchObject({
      partySize: 3,
      customerPhone: '',
    });
    expect(confirmed.result.reservationData?.idempotencyKey).toBeTruthy();
    expect(confirmed.state.reservationDraft?.step).toBe('idle');
  });

  it('does not start a new reservation when the guest asks about the table they already booked', () => {
    const submitted = turn('si', {
      language: 'es',
      userName: 'Hudson',
      reservationDraft: {
        step: 'confirm',
        partySize: 3,
        date: '2026-11-02',
        time: '15:00',
        name: 'Hudson',
        phone: '',
        idempotencyKey: 'test-key',
      },
    });
    expect(submitted.result.actionRequired).toBe('create_reservation');

    const state: ChatbotSessionState = {
      ...submitted.state,
      lastReservation: {
        id: 'res-1',
        customerName: 'Hudson',
        customerPhone: '',
        partySize: 3,
        reservationDate: '2026-11-02',
        reservationTime: '15:00',
        idempotencyKey: 'test-key',
      },
    };

    const answer = turn('nada, whats my table and how much is the calamar la romana', state);
    expect(answer.state.reservationDraft?.step).toBe('idle');
    expect(answer.reply).toMatch(/registrada|solicitud/i);
    expect(answer.reply).toMatch(/Calamares a la Romana/);
    expect(answer.reply).toMatch(/45\.00/);
  });

  it('answers a price question mid-flow without losing the step', () => {
    const state: ChatbotSessionState = {
      language: 'es',
      userName: 'Hudson',
      reservationDraft: { step: 'party_size', name: 'Hudson' },
    };
    const answer = turn('cuanto cuesta la paella?', state);
    expect(answer.reply).toContain('Paella Valenciana');
    expect(answer.reply).toContain('90.00');
    expect(answer.reply).toContain('cuántas personas');
    expect(answer.state.reservationDraft?.step).toBe('party_size');
  });

  it('cancels only on an explicit request', () => {
    const state: ChatbotSessionState = {
      language: 'es',
      userName: 'Hudson',
      reservationDraft: { step: 'time' },
    };
    expect(turn('no tengo', state).state.reservationDraft?.step).toBe('time');
    expect(turn('cancelar', state).state.reservationDraft?.step).toBe('idle');
  });

  it('does not take an intent as the guest name', () => {
    const state: ChatbotSessionState = { language: 'es', reservationDraft: { step: 'idle' } };
    const result = turn('cuanto cuesta la paella', state);
    expect(result.state.userName).toBeUndefined();
    expect(result.reply).toContain('Paella Valenciana');
  });
});
