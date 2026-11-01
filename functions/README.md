# Cloudflare Pages Functions

Server-side handlers for the MiMenu Pages project. They run on the Cloudflare
edge and read/write the `MIMENU_KV` namespace; there is no external database.

## Layout

```
functions/
├── _middleware.js          # CORS, error logging, security headers
├── api/
│   ├── auth/session.ts     # POST — issues signed HMAC app sessions
│   ├── waiters/            # KV-backed waiter roster (list/create/update/delete/reset)
│   ├── email/              # Resend transactional email (order confirmation, upgrade request)
│   ├── ar/                 # WebAR / AI 3D pipeline (Meshy + worker queue)
│   ├── tts.ts              # Text-to-speech proxy
│   ├── health.js           # Environment/KV readiness probe
│   └── test.js             # Minimal environment smoke test
└── lib/                    # app-session, waiter-store, kv-ar, email, rate-limit, plans
```

## Required configuration

Secrets are set on the Pages project (`mimenu`) in the Cloudflare dashboard:

| Secret | Purpose |
| --- | --- |
| `APP_SESSION_SECRET` | HMAC key for signed admin/staff sessions |
| `RESEND_API_KEY` | Transactional email |
| `AR_WORKER_TOKEN` | Shared secret with the AR worker |
| `AR_WORKER_URL` | AR worker base URL |
| `MESHY_API_KEY` | 3D generation |

Bindings (`wrangler.toml`): `MIMENU_KV`.

## Authentication

`functions/lib/app-session.ts` validates the `mimenu_session` cookie issued by
`POST /api/auth/session`. Admin-only routes call `requireAdmin()`, which also
checks `role === 'admin'`. Client code uses `src/lib/appSession.ts`
(`adminFetch`) to attach the token.

Waiter records live in KV under `waiters:all` (PBKDF2-hashed passwords) and are
managed via `functions/lib/waiter-store.ts`.

## Local development

```bash
npm run build
npx wrangler pages dev dist
```

Environment variables for local runs go in `.env` (see `.env.example`).

## API reference

See [`api/README.md`](api/README.md).
