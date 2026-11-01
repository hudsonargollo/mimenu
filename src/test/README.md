# Tests

Vitest + Testing Library suites for MiMenu.

## Running

```bash
npm run test        # watch mode
npm run test:run    # single run
npm run test:ui     # Vitest UI
```

Playwright browser tests live in `tests/browser` and run with `npm run test:e2e:browser`.

## Setup

`src/test/setup.ts` polyfills `localStorage` and `matchMedia` for jsdom, mocks
`fetch`, and installs fake timers. No network or database is used by the suites:
application data is read from `localStorage` (`src/lib/mimenuContext.tsx`) and
server routes are stubbed per test.

## Test files

- `mimenu.test.ts` — KV store keys, AI copilot engine, plan helpers
- `payment-status-logic.test.ts` — payment status derivation
- `integration-payment-workflow.test.ts` — payment webhook state transitions
- `e2e-waiter-payment-workflow.test.ts` — waiter order/payment lifecycle
- `app-smoke.test.tsx` — app shell renders
- `commission-*.test.tsx` — commission UI
- `src/pages/staff/__tests__/Cashier.test.tsx`, `src/components/__tests__/*` — page/component coverage

Helpers live in `src/test/utils`; `validate-*.ts` scripts are manual responsive checks.
