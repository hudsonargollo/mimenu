# API Documentation

## Overview

MiMenu runs on Cloudflare Pages Functions (`functions/api/**`). Handlers are
stateless; all persistence uses the `MIMENU_KV` namespace. Menu, order and
customer data live in the browser (`localStorage` via
`src/lib/mimenuContext.tsx`), so no database is required.

## Base URL

- Production: `https://mimenu.clubemkt.digital/api`
- Pages preview: `https://<deployment>.mimenu-1y0.pages.dev/api`
- Local: `http://127.0.0.1:8788/api` (`wrangler pages dev dist`)

## Authentication

- `POST /api/auth/session` issues a signed session token (HMAC-SHA256 with
  `APP_SESSION_SECRET`) after the caller proves credentials.
- Protected routes expect `Authorization: Bearer <token>` (or the
  `mimenu_session` cookie) and validate it in `functions/lib/app-session.ts`.
- Admin-only routes additionally require `role === 'admin'`.
- AR routes accept `x-ar-worker-token` when called by the AR worker.

Client helper: `adminFetch` in `src/lib/appSession.ts`.

## Configuration

| Name | Kind | Purpose |
| --- | --- | --- |
| `MIMENU_KV` | KV binding | Waiters, AR tasks, sessions, cached data |
| `APP_SESSION_SECRET` | secret | Session signing |
| `RESEND_API_KEY` | secret | Transactional email |
| `AR_WORKER_URL` | secret/vars | AR worker base URL |
| `AR_WORKER_TOKEN` | secret | Shared AR worker token |
| `MESHY_API_KEY` | secret | 3D model generation |

## Endpoints

### Session

**`POST /api/auth/session`**

```json
{ "username": "admin", "password": "…", "role": "admin" }
```

Response: `{ "token": "<signed>", "expires_at": 1730000000 }`.

### Waiters (KV)

All waiter routes require an admin session.

| Route | Method | Body | Notes |
| --- | --- | --- | --- |
| `/api/waiters/list-waiters` | POST | `{}` | Returns `{ waiters: [{ id, email, full_name }] }` |
| `/api/waiters/create-waiter` | POST | `{ full_name, email, password }` | Password stored as PBKDF2 hash |
| `/api/waiters/update-waiter-profile` | POST | `{ id, full_name?, email? }` | |
| `/api/waiters/delete-waiter` | POST | `{ id }` | |
| `/api/waiters/send-password-reset` | POST | `{ id }` | Emails a temporary password via Resend, rolls back on failure |

Storage: single KV key `waiters:all` (`functions/lib/waiter-store.ts`).

### Email (Resend)

| Route | Method | Body |
| --- | --- | --- |
| `/api/email/order-confirmation` | POST | `{ to, customerName, orderNumber, items, total, venueName }` |
| `/api/email/upgrade-request` | POST | `{ plan, venue, contact }` |

Missing `RESEND_API_KEY` returns `503` with `{ success: false, error }`.

### WebAR / 3D pipeline

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/ar/menu-items` | GET | List items with AR status for a venue |
| `/api/ar/menu-item/[menuItemId]` | GET | Single item AR record |
| `/api/ar/generate` | POST | Submit a Meshy generation job |
| `/api/ar/manual` | POST | Attach a hand-uploaded model |
| `/api/ar/status/[taskId]` | GET | Poll job status |
| `/api/ar/queue` | GET | Worker queue (token auth) |
| `/api/ar/report` | POST | Worker completion callback |

KV helpers: `functions/lib/kv-ar.ts`. See `docs/AR_PIPELINE.md`.

### Utility

- `GET /api/health` — KV/session/email/AR readiness flags
- `GET /api/test` — minimal environment smoke test
- `POST /api/tts` — text-to-speech proxy

## Error format

```json
{ "success": false, "error": "Message", "code": "OPTIONAL_CODE" }
```

| Status | Meaning |
| --- | --- |
| 400 | Invalid payload |
| 401 / 403 | Missing or invalid session |
| 404 | Unknown resource |
| 429 | Rate limited (`functions/lib/rate-limit.ts`) |
| 500 / 503 | Upstream or configuration failure |

`functions/_middleware.js` logs unhandled errors and applies CORS headers.
