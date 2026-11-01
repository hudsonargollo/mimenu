# Cloudflare Deployment Guide

MiMenu is a static Vite SPA deployed to Cloudflare Pages with Pages Functions
for server-side endpoints. All data lives in the browser (`localStorage`) and in
the `MIMENU_KV` namespace — there is no external database.

## Prerequisites

- Node.js 20+
- A Cloudflare account with the `mimenu` Pages project
- Wrangler authenticated (`npx wrangler login`) or `CLOUDFLARE_API_TOKEN`

## Project configuration

| Item | Value |
| --- | --- |
| Pages project | `mimenu` |
| Build command | `npm run build` |
| Output directory | `dist` |
| KV binding | `MIMENU_KV` (`bfb8ba5a9b72487db588779f42883151`) |
| Production URL | https://mimenu.clubemkt.digital |

Bindings and compatibility settings live in `wrangler.toml`. Secrets are set in
the Cloudflare dashboard (Pages → `mimenu` → Settings → Environment variables):

- `APP_SESSION_SECRET` — HMAC key for signed admin/staff sessions
- `RESEND_API_KEY` — transactional email
- `AR_WORKER_URL`, `AR_WORKER_TOKEN`, `MESHY_API_KEY` — WebAR pipeline

## Deploy

```bash
npm ci
npm run test:run
npm run build
npx wrangler pages deploy dist --project-name=mimenu --branch=main
```

Or use `npm run deploy:full` (`scripts/deploy-production.sh`) for the guided
flow.

## Post-deploy verification

```bash
curl -s https://mimenu.clubemkt.digital/api/health
```

Expected flags: `hasKV: true`, `hasSessionSecret: true`, `hasResendKey: true`.

Then smoke-test in a browser:

1. `/` landing renders
2. `/loja/jaleo` menu loads from local data
3. `/admin/login` issues a session (`/api/auth/session`)
4. `/admin/meseros` lists waiters from KV
5. Password reset sends an email through Resend

## Worker deployment

The AR worker (`worker.ts`) is deployed separately and needs `dist/_redirects`
removed first because Wrangler rejects that file for Workers:

```bash
mv dist/_redirects /tmp/_redirects.bak
npx wrangler deploy worker.ts
mv /tmp/_redirects.bak dist/_redirects
```

## Rollback

```bash
npx wrangler pages deployment list --project-name=mimenu
npx wrangler pages deployment rollback <deployment-id> --project-name=mimenu
```
