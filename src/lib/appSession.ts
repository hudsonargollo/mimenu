/**
 * Staff session used by Pages Functions for staff-only operations.
 * Minted by /api/auth/session from the shared staff credentials or a
 * waiter account stored in the app's KV namespace.
 */
import type { AppRole } from '../../shared/app-credentials';

const STORAGE_KEY = 'mimenu_app_session';

export interface AppSession {
  token: string;
  email: string;
  role: AppRole;
  name: string;
  tenantSlug: string | null;
  venueName: string | null;
  expiresAt: number;
}

export class AppSessionError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppSessionError';
    this.status = status;
  }
}

export function getAppSession(): AppSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.token || !parsed.expiresAt) return null;

    if (parsed.expiresAt <= Date.now()) {
      clearAppSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearAppSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function requestSession(
  identifier: string,
  password: string
): Promise<AppSession> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.token) {
    throw new AppSessionError(
      response.status,
      data?.error || 'No se pudo iniciar la sesión.'
    );
  }

  const session: AppSession = {
    token: data.token,
    email: data.email,
    role: data.role,
    name: data.name || data.email,
    tenantSlug: data.tenantSlug ?? null,
    venueName: data.venueName ?? null,
    expiresAt: Date.now() + (data.expiresIn || 0) * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

/** fetch() with the admin session attached; clears it on 401/403. */
export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const session = getAppSession();

  if (!session) {
    throw new AppSessionError(
      401,
      'Sesión de administración expirada. Iniciá sesión nuevamente.'
    );
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${session.token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 || response.status === 403) {
    clearAppSession();
    throw new AppSessionError(
      response.status,
      response.status === 401
        ? 'Sesión de administración expirada. Iniciá sesión nuevamente.'
        : 'Tu cuenta no tiene permisos de administrador.'
    );
  }

  return response;
}
