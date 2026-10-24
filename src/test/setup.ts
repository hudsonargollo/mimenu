import '@testing-library/jest-dom'

// jsdom in this environment exposes window but not window.localStorage
// (Node 26 + jsdom). Real browsers always have it; provide it so the app's
// unguarded localStorage reads do not mask the real error under test.
if (typeof window !== 'undefined' && typeof window.localStorage === 'undefined') {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k: string) => (store.has(k) ? store.get(k) : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    },
    configurable: true,
    writable: true,
  });
}

// Mock environment variables for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_MERCADOPAGO_ACCESS_TOKEN: 'test_access_token',
    VITE_MERCADOPAGO_PUBLIC_KEY: 'test_public_key',
  },
  writable: true,
})

// Mock timers for tests
vi.useFakeTimers()

// Mock fetch globally
global.fetch = vi.fn()

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
})
// jsdom does not implement matchMedia; several UI libs call it during render.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
    configurable: true,
    writable: true,
  });
}
