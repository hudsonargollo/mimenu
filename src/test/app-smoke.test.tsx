import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

/**
 * Repro for the site-wide crash: mount the real App in jsdom and surface the
 * actual error message (the production stack is minified and useless).
 */
describe('App smoke', () => {
  it('mounts without throwing', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(' '));
    });

    let threw: unknown = null;
    try {
      // App mounts its own BrowserRouter — wrapping it again would throw
      // React Router's "nested Router" error, which is not the bug we want.
      render(<App />);
    } catch (e) {
      threw = e;
    }

    spy.mockRestore();

    if (threw) {
      const err = threw as Error;
      console.error('\n=== MOUNT THREW ===');
      console.error('name:', err.name);
      console.error('message:', err.message);
      console.error('stack:\n', err.stack);
      console.error('=== console.error during mount ===');
      errors.forEach((e) => console.error(e.slice(0, 500)));
    }

    expect(threw).toBeNull();
  });
});
