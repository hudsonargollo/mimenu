import { expect, test, type Page, type Route } from '@playwright/test';

type ReservationRow = Record<string, unknown>;
type SessionRow = { venue_id: string; session_key: string; language: string; state: any };

const VENUE_ID = 'venue-moes-taberna-scz';
const CUSTOMER = {
  name: 'Browser E2E Customer',
  phone: '+591 71234567',
  partySize: 4,
  date: '2026-11-30',
  time: '20:30',
};

function makeReservationMock(page: Page, opts: { failuresBeforeSuccess: number; failAfterFirstCommit?: boolean }) {
  const records: ReservationRow[] = [];
  const sessions = new Map<string, SessionRow>();
  let reservationPosts = 0;
  let failLookupOnce = false;

  const route = async (r: Route) => {
    const request = r.request();
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
      'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info, prefer',
    };
    const json = (status: number, body: unknown) => r.fulfill({
      status,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify(body),
    });

    if (request.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });

    if (table === 'chatbot_sessions') {
      if (request.method() === 'GET') {
        const venueId = url.searchParams.get('venue_id')?.replace(/^eq\./, '');
        const sessionKey = url.searchParams.get('session_key')?.replace(/^eq\./, '');
        const saved = [...sessions.values()].find(row => row.venue_id === venueId && row.session_key === sessionKey);
        return json(200, saved ?? null);
      }
      if (request.method() === 'POST' || request.method() === 'PATCH') {
        const payload = request.postDataJSON() as SessionRow;
        const key = `${payload.venue_id}:${payload.session_key}`;
        sessions.set(key, { ...sessions.get(key), ...payload });
        return json(201, sessions.get(key));
      }
    }

    if (table === 'chatbot_reservations') {
      if (request.method() === 'POST') {
        reservationPosts += 1;
        const payload = request.postDataJSON() as ReservationRow;
        const existing = records.find(row => row.venue_id === payload.venue_id && row.idempotency_key === payload.idempotency_key);
        if (!existing) {
          const saved = { ...payload, id: 'browser-reservation-1', created_at: new Date().toISOString() };
          records.push(saved);
          if (opts.failAfterFirstCommit && reservationPosts === 1) {
            return r.abort('failed');
          }
          return json(201, saved);
        }
        // Simulate Postgres' unique constraint for the same venue + idempotency key.
        return json(409, {
          code: '23505',
          details: null,
          hint: null,
          message: 'duplicate key value violates unique constraint',
        });
      }
      if (request.method() === 'GET') {
        if (failLookupOnce) {
          failLookupOnce = false;
          return r.abort('failed');
        }
        const venueId = url.searchParams.get('venue_id')?.replace(/^eq\./, '');
        const key = url.searchParams.get('idempotency_key')?.replace(/^eq\./, '');
        return json(200, records.find(row => row.venue_id === venueId && row.idempotency_key === key) ?? null);
      }
    }

    if (url.pathname.startsWith('/rest/v1/')) return json(200, []);
    return r.continue();
  };

  return {
    install: () => page.route('**/rest/v1/chatbot_*', route),
    records,
    sessions,
    get reservationPosts() { return reservationPosts; },
    failNextLookup: () => { failLookupOnce = true; },
  };
}

async function openChat(page: Page) {
  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(page.getByRole('textbox', { name: /Escribe tu mensaje|Type a message|Digite sua mensagem|Nachricht schreiben/i })).toBeVisible();
}

async function send(page: Page, message: string) {
  const input = page.getByRole('textbox', { name: /Escribe tu mensaje|Type a message|Digite sua mensagem|Nachricht schreiben/i });
  await input.fill(message);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(message, { exact: true }).last()).toBeVisible();
}

async function completeReservationDraft(page: Page) {
  await send(page, 'I want to book a table');
  await expect(page.getByText(/How many guests/)).toBeVisible();
  await send(page, `${CUSTOMER.partySize} personas`);
  await expect(page.getByText(/What date would you like/)).toBeVisible();
  await send(page, CUSTOMER.date);
  await expect(page.getByText(/What time/)).toBeVisible();
  await send(page, CUSTOMER.time);
  await expect(page.getByText(/What name should I use/)).toBeVisible();
  await send(page, CUSTOMER.name);
  await expect(page.getByText(/What phone number can the restaurant use/)).toBeVisible();
  await send(page, CUSTOMER.phone);
  await expect(page.getByText(/Summary: Browser E2E Customer/)).toBeVisible();
  await send(page, 'sí');
}

async function assertStoredDetails(mock: ReturnType<typeof makeReservationMock>, key: string) {
  expect(mock.records).toHaveLength(1);
  expect(mock.records[0]).toMatchObject({
    venue_id: VENUE_ID,
    customer_name: CUSTOMER.name,
    customer_phone: CUSTOMER.phone,
    party_size: CUSTOMER.partySize,
    reservation_date: CUSTOMER.date,
    reservation_time: CUSTOMER.time,
    status: 'pending',
    idempotency_key: key,
  });
  const session = [...mock.sessions.values()].find(row => row.venue_id === VENUE_ID);
  expect(session?.state?.reservationDraft).toMatchObject({
    step: 'confirm',
    name: CUSTOMER.name,
    phone: CUSTOMER.phone,
    partySize: CUSTOMER.partySize,
    date: CUSTOMER.date,
    time: CUSTOMER.time,
    idempotencyKey: key,
  });
}

test('full browser reload restores reservation details and idempotency key before language-switch retry', async ({ page }) => {
  const mock = makeReservationMock(page, { failuresBeforeSuccess: 1, failAfterFirstCommit: true });
  await mock.install();
  await page.goto('/menu');
  await openChat(page);
  await page.getByLabel('Chat language').selectOption('en');
  await completeReservationDraft(page);
  await expect(page.getByText(/I could not save the request|I could not confirm whether your request was recorded/)).toBeVisible();

  const beforeReload = [...mock.sessions.values()].find(row => row.venue_id === VENUE_ID);
  const originalKey = beforeReload?.state?.reservationDraft?.idempotencyKey;
  expect(originalKey).toBeTruthy();
  expect(beforeReload?.state?.reservationDraft).toMatchObject({
    step: 'confirm', name: CUSTOMER.name, phone: CUSTOMER.phone,
    partySize: CUSTOMER.partySize, date: CUSTOMER.date, time: CUSTOMER.time,
  });

  // This is a genuine browser document reload: JS state is destroyed and rebuilt from persisted storage/session data.
  await page.reload();
  await openChat(page);
  await expect(page.getByLabel('Chat language')).toHaveValue('en');
  const language = page.getByLabel('Chat language');
  await language.selectOption('es');
  await expect.poll(() => [...mock.sessions.values()].find(row => row.venue_id === VENUE_ID)?.language).toBe('es');
  await assertStoredDetails(mock, originalKey);

  await send(page, 'sí');
  await expect(page.getByText(/Gracias, Browser E2E Customer\. Envié tu solicitud para 4 personas, 2026-11-30 a las 20:30\./)).toBeVisible();
  await expect.poll(() => mock.records).toHaveLength(1);
  expect(mock.reservationPosts).toBe(2);
  expect(mock.records[0].idempotency_key).toBe(originalKey);
  expect([...mock.sessions.values()].find(row => row.venue_id === VENUE_ID)?.state?.lastReservation?.idempotencyKey).toBe(originalKey);
});

test('a second transport failure after reload keeps the same key and a third attempt succeeds once', async ({ page }) => {
  const mock = makeReservationMock(page, { failuresBeforeSuccess: 2, failAfterFirstCommit: true });
  await mock.install();
  await page.goto('/menu');
  await openChat(page);
  await page.getByLabel('Chat language').selectOption('en');
  await completeReservationDraft(page);
  await expect(page.getByText(/I could not save the request|I could not confirm whether your request was recorded/)).toBeVisible();

  const savedBeforeReload = [...mock.sessions.values()].find(row => row.venue_id === VENUE_ID);
  const originalKey = savedBeforeReload?.state?.reservationDraft?.idempotencyKey;
  expect(originalKey).toBeTruthy();

  await page.reload();
  await openChat(page);
  await expect(page.getByLabel('Chat language')).toHaveValue('en');
  await assertStoredDetails(mock, originalKey);

  // Second try: the write is already present, but the response and duplicate lookup both lose transport.
  mock.failNextLookup();
  await send(page, 'sí');
  await expect(page.getByText(/I could not save the request|I could not confirm whether your request was recorded/).last()).toBeVisible();
  expect(mock.records).toHaveLength(1);
  await assertStoredDetails(mock, originalKey);

  // Third try: same confirmation/key resolves the existing row after the unique-key conflict.
  await send(page, 'sí');
  await expect(page.getByText(/Thanks, Browser E2E Customer\. I sent your request for 4 guests on 2026-11-30 at 20:30\./)).toBeVisible();
  await expect.poll(() => mock.records).toHaveLength(1);
  expect(mock.reservationPosts).toBe(3);
  expect(mock.records[0].idempotency_key).toBe(originalKey);
  expect(mock.records[0]).toMatchObject({ customer_name: CUSTOMER.name, party_size: CUSTOMER.partySize, reservation_date: CUSTOMER.date, reservation_time: CUSTOMER.time });
});
