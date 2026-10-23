import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuChatbot } from '@/components/chatbot/MenuChatbot';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/lib/mimenuContext', () => ({
  useMimenu: () => ({
    venue: {
      id: 'venue-e2e-1',
      name: 'Bistro Central',
      address: 'Calle Mayor 12',
      phone: '+591 71234567',
      openingHours: '12:00 - 23:00',
    },
    categories: [
      {
        id: 'cat-1',
        name: 'Platos Principales',
        items: [
          {
            id: 'item-1',
            name: 'Paella Valenciana',
            description: 'Arroz con mariscos y azafrán',
            price: 25,
            is_available: true,
            is_featured: true,
            dietary: ['Sin Gluten'],
          },
        ],
      },
    ],
  }),
}));

vi.mock('@/integrations/supabase/client', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      from: fromMock,
    },
  };
});

describe('Customer Menu Chatbot E2E - Reservation Confirmation with Simulated Transport Failure & Retry', () => {
  let createdReservations: any[] = [];
  let insertAttempt = 0;
  let simulateTransportFailure = false;
  let persistedSessions: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    createdReservations = [];
    insertAttempt = 0;
    simulateTransportFailure = false;
    persistedSessions = [];

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'chatbot_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation((col1: string, val1: string) => ({
              eq: vi.fn().mockImplementation((col2: string, val2: string) => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: persistedSessions.find((row) => row[col1] === val1 && row[col2] === val2) || null,
                  error: null,
                }),
              })),
            })),
          }),
          upsert: vi.fn().mockImplementation(async (row: any) => {
            const existingIndex = persistedSessions.findIndex(
              (saved) => saved.venue_id === row.venue_id && saved.session_key === row.session_key
            );
            if (existingIndex >= 0) persistedSessions[existingIndex] = row;
            else persistedSessions.push(row);
            return { data: row, error: null };
          }),
        };
      }

      if (table === 'chatbot_reservations') {
        return {
          insert: vi.fn().mockImplementation((payload: any) => {
            insertAttempt++;

            // Check unique constraint violation on venue_id + idempotency_key
            const existing = createdReservations.find(
              (r) => r.venue_id === payload.venue_id && r.idempotency_key === payload.idempotency_key
            );

            if (existing) {
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: {
                      code: '23505',
                      message: 'duplicate key value violates unique constraint',
                    },
                  }),
                }),
              };
            }

            // Simulate transport drop or database timeout right after/during the first write
            if (simulateTransportFailure && insertAttempt === 1) {
              createdReservations.push({
                ...payload,
                id: 'res-db-recorded-001',
                created_at: new Date().toISOString(),
              });
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockRejectedValue(new Error('Failed to fetch: Network request failed')),
                }),
              };
            }

            const record = {
              ...payload,
              id: 'res-db-recorded-001',
              created_at: new Date().toISOString(),
            };
            createdReservations.push(record);

            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: record,
                  error: null,
                }),
              }),
            };
          }),

          select: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation((col1: string, val1: string) => ({
              eq: vi.fn().mockImplementation((col2: string, val2: string) => ({
                maybeSingle: vi.fn().mockImplementation(async () => {
                  const match = createdReservations.find(
                    (r) =>
                      (col1 === 'venue_id' ? r.venue_id === val1 : true) &&
                      (col2 === 'idempotency_key' ? r.idempotency_key === val2 : true)
                  );
                  return { data: match || null, error: null };
                }),
              })),
            })),
          })),
        };
      }

      return {};
    });
  });

  it('completes reservation flow, survives transport failure on confirmation, and retries idempotently with only 1 DB row created', async () => {
    simulateTransportFailure = true;

    const firstMenu = render(<MenuChatbot />);

    // Open chat widget
    const toggleButton = screen.getByRole('button', { name: /Open chat|Abrir chat/i });
    fireEvent.click(toggleButton);

    const input = screen.getByPlaceholderText(/Escribe tu mensaje…|Type a message…/i);
    const sendBtn = screen.getByRole('button', { name: /Send message/i });

    const sendUserMessage = async (msg: string) => {
      fireEvent.change(input, { target: { value: msg } });
      fireEvent.click(sendBtn);
      await waitFor(() => expect(screen.getByText(msg)).toBeDefined());
    };

    // Step 1: Initiate reservation
    await sendUserMessage('quiero reservar una mesa');
    await waitFor(() => expect(screen.getByText(/¿Para cuántas personas sería la reserva?/i)).toBeDefined());

    // Step 2: Party size
    await sendUserMessage('4 personas');
    await waitFor(() => expect(screen.getByText(/¿Para qué fecha te gustaría la reserva?/i)).toBeDefined());

    // Step 3: Date
    await sendUserMessage('2026-10-30');
    await waitFor(() => expect(screen.getByText(/¿A qué hora?/i)).toBeDefined());

    // Step 4: Time
    await sendUserMessage('20:30');
    await waitFor(() => expect(screen.getByText(/¿A nombre de quién registramos la solicitud?/i)).toBeDefined());

    // Step 5: Name
    await sendUserMessage('Hudson Argollo');
    await waitFor(() => expect(screen.getByText(/¿A qué número de teléfono te contactamos?/i)).toBeDefined());

    // Step 6: Phone
    await sendUserMessage('+591 71234567');
    await waitFor(() => expect(screen.getByText(/¿Confirmas estos datos para enviar la solicitud?/i)).toBeDefined());

    // Step 7: Confirmation with transport failure
    await sendUserMessage('sí, confirmar');

    // Widget shows the graceful clarification that connection failed and retrying is safe
    await waitFor(() => {
      expect(
        screen.getByText(/No pude confirmar si tu solicitud quedó registrada|No pude guardar la solicitud/i)
      ).toBeDefined();
      expect(screen.getByText(/vuelve a enviar la misma confirmación|responde [“\"]?sí[”\"]? para volver a intentarlo/i)).toBeDefined();
    });

    expect(createdReservations).toHaveLength(1);
    expect(insertAttempt).toBe(1);

    // The failed response must retain the same confirmation draft and idempotency key for safe retry.
    const savedSessionAfterFailure = persistedSessions.find(
      (row) => row.venue_id === 'venue-e2e-1'
    );
    expect(savedSessionAfterFailure?.state?.reservationDraft?.step).toBe('confirm');
    const retryKey = savedSessionAfterFailure?.state?.reservationDraft?.idempotencyKey;
    expect(retryKey).toBeDefined();

    // Reload the customer menu. The widget loads its saved session before the customer retries.
    firstMenu.unmount();
    render(<MenuChatbot />);
    const reloadToggle = screen.getByRole('button', { name: /Open chat|Abrir chat/i });
    fireEvent.click(reloadToggle);
    await waitFor(() => {
      const savedSession = persistedSessions.find((row) => row.venue_id === 'venue-e2e-1');
      expect(savedSession?.state?.reservationDraft?.step).toBe('confirm');
      expect(savedSession?.state?.reservationDraft?.idempotencyKey).toBe(retryKey);
      expect(savedSession?.state?.reservationDraft).toMatchObject({
        partySize: 4,
        date: '2026-10-30',
        time: '20:30',
        name: 'Hudson Argollo',
        phone: '+591 71234567',
      });
    });

    const reloadedInput = screen.getByPlaceholderText(/Escribe tu mensaje…|Type a message…/i);
    const reloadedSendBtn = screen.getByRole('button', { name: /Send message/i });
    const retryAfterReload = async (msg: string) => {
      fireEvent.change(reloadedInput, { target: { value: msg } });
      fireEvent.click(reloadedSendBtn);
      await waitFor(() => expect(screen.getByText(msg)).toBeDefined());
    };

    // Step 8: Retry the same confirmation after reload and connection recovery.
    simulateTransportFailure = false;
    await retryAfterReload('sí, confirmar');

    // Widget should complete and confirm or acknowledge receipt
    await waitFor(() => {
      expect(
        screen.getByText(/pendiente de confirmación|Esta solicitud ya fue enviada/i)
      ).toBeDefined();
    });

    // VERIFICATION: Only ONE database reservation record exists
    expect(createdReservations).toHaveLength(1);
    expect(insertAttempt).toBe(2);
    expect(createdReservations[0].customer_name).toBe('Hudson Argollo');
    expect(createdReservations[0].party_size).toBe(4);
    expect(createdReservations[0].status).toBe('pending');
    expect(createdReservations[0].idempotency_key).toBe(retryKey);
    expect(createdReservations[0].customer_phone).toBe('+591 71234567');
    expect(createdReservations[0].reservation_date).toBe('2026-10-30');
    expect(createdReservations[0].reservation_time).toBe('20:30');
    expect(createdReservations[0].status).toBe('pending');
  });

  it.each([
    {
      lang: 'es' as const,
      selectValue: 'es',
      startMsg: 'quiero reservar una mesa',
      partyMsg: '2 personas',
      dateMsg: '2026-11-05',
      timeMsg: '19:30',
      nameMsg: 'Elena Gomez',
      phoneMsg: '+591 70001122',
      confirmMsg: 'sí, confirmar',
      expectedFailurePattern: /No pude confirmar si tu solicitud quedó registrada|No pude guardar la solicitud/i,
      expectedGuidancePattern: /vuelve a enviar la misma confirmación|responde [“"]?sí[”"]? para volver a intentarlo/i,
      retryConfirmation: 'sí, confirmar',
      expectedSuccessPattern: /pendiente de confirmación|Esta solicitud ya fue enviada/i,
    },
    {
      lang: 'en' as const,
      selectValue: 'en',
      startMsg: 'I want to reserve a table',
      partyMsg: '2 people',
      dateMsg: '2026-11-05',
      timeMsg: '19:30',
      nameMsg: 'John Miller',
      phoneMsg: '+1 4155552671',
      confirmMsg: 'yes, confirm',
      expectedFailurePattern: /I could not confirm whether your request was recorded|I could not save the request/i,
      expectedGuidancePattern: /Send the same confirmation again|reply [“"]?yes[”"]? to retry/i,
      retryConfirmation: 'yes, confirm',
      expectedSuccessPattern: /pending restaurant confirmation|This request has already been submitted/i,
    },
    {
      lang: 'pt' as const,
      selectValue: 'pt',
      startMsg: 'quero reservar uma mesa',
      partyMsg: '2 pessoas',
      dateMsg: '2026-11-05',
      timeMsg: '19:30',
      nameMsg: 'Mariana Silva',
      phoneMsg: '+55 11987654321',
      confirmMsg: 'sim, confirmar',
      expectedFailurePattern: /Não consegui confirmar se sua solicitação foi registrada|Não consegui salvar a solicitação/i,
      expectedGuidancePattern: /Envie a mesma confirmação novamente|responda [“"]?sim[”"]? para tentar novamente/i,
      retryConfirmation: 'sim, confirmar',
      expectedSuccessPattern: /aguarda confirmação do restaurante|Esta solicitação já foi enviada/i,
    },
    {
      lang: 'de' as const,
      selectValue: 'de',
      startMsg: 'ich möchte einen Tisch reservieren',
      partyMsg: '2 Personen',
      dateMsg: '2026-11-05',
      timeMsg: '19:30',
      nameMsg: 'Klaus Weber',
      phoneMsg: '+49 1701234567',
      confirmMsg: 'ja, bestätigen',
      expectedFailurePattern: /Ich konnte nicht bestätigen, ob Ihre Anfrage gespeichert wurde|Die Anfrage konnte nicht gespeichert werden/i,
      expectedGuidancePattern: /Senden Sie dieselbe Bestätigung erneut|antworten Sie mit [„"]?ja[“"]?, um es erneut zu versuchen/i,
      retryConfirmation: 'ja',
      expectedSuccessPattern: /wartet auf die Bestätigung des Restaurants|Diese Anfrage wurde bereits gesendet/i,
    },
  ])(
    'verifies post-failure guidance and idempotent retry in $lang after reloading the customer menu',
    async ({
      selectValue,
      startMsg,
      partyMsg,
      dateMsg,
      timeMsg,
      nameMsg,
      phoneMsg,
      confirmMsg,
      expectedFailurePattern,
      expectedGuidancePattern,
      retryConfirmation,
      expectedSuccessPattern,
    }) => {
      simulateTransportFailure = true;

      const firstMenu = render(<MenuChatbot />);

      // Open chat widget
      const toggleButton = screen.getByRole('button', { name: /Open chat|Abrir chat/i });
      fireEvent.click(toggleButton);

      // Select language
      const langSelector = screen.getByLabelText(/Chat language/i);
      fireEvent.change(langSelector, { target: { value: selectValue } });

      const input = screen.getByRole('textbox');
      const sendBtn = screen.getByRole('button', { name: /Send message/i });

      const sendUserMessage = async (msg: string) => {
        fireEvent.change(input, { target: { value: msg } });
        fireEvent.click(sendBtn);
        await waitFor(() => expect(screen.getByText(msg)).toBeDefined());
      };

      await sendUserMessage(startMsg);
      await sendUserMessage(partyMsg);
      await sendUserMessage(dateMsg);
      await sendUserMessage(timeMsg);
      await sendUserMessage(nameMsg);
      await sendUserMessage(phoneMsg);

      // Confirm with simulated transport failure
      await sendUserMessage(confirmMsg);

      // Verify clear post-failure guidance in the chosen language
      await waitFor(() => {
        expect(screen.getByText(expectedFailurePattern)).toBeDefined();
        expect(screen.getByText(expectedGuidancePattern)).toBeDefined();
      });

      expect(createdReservations).toHaveLength(1);
      expect(insertAttempt).toBe(1);

      const savedSessionAfterFailure = persistedSessions.find(
        (row) => row.venue_id === 'venue-e2e-1'
      );
      expect(savedSessionAfterFailure?.state?.reservationDraft?.step).toBe('confirm');
      const retryKey = savedSessionAfterFailure?.state?.reservationDraft?.idempotencyKey;
      expect(retryKey).toBeDefined();

      // Reload the customer menu
      firstMenu.unmount();
      render(<MenuChatbot />);
      const reloadToggle = screen.getByRole('button', { name: /Open chat|Abrir chat/i });
      fireEvent.click(reloadToggle);

      await waitFor(() => {
        const savedSession = persistedSessions.find((row) => row.venue_id === 'venue-e2e-1');
        expect(savedSession?.state?.reservationDraft?.step).toBe('confirm');
        expect(savedSession?.state?.reservationDraft?.idempotencyKey).toBe(retryKey);
        expect(savedSession?.language).toBe(selectValue);
      });

      // Confirm retry guidance is intact and the customer can complete safely
      const reloadedInput = screen.getByRole('textbox');
      const reloadedSendBtn = screen.getByRole('button', { name: /Send message/i });
      const retryAfterReload = async (msg: string) => {
        fireEvent.change(reloadedInput, { target: { value: msg } });
        fireEvent.click(reloadedSendBtn);
        await waitFor(() => expect(screen.getByText(msg)).toBeDefined());
      };

      simulateTransportFailure = false;
      await retryAfterReload(retryConfirmation);

      await waitFor(() => {
        expect(screen.getByText(expectedSuccessPattern)).toBeDefined();
      });

      expect(createdReservations).toHaveLength(1);
      expect(insertAttempt).toBe(2);
      expect(createdReservations[0].idempotency_key).toBe(retryKey);
      expect(createdReservations[0].status).toBe('pending');
    }
  );

});
