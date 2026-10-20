export const NATIVE_AUTH_CALLBACK = 'fc27israel://auth/callback';

export function isNativeAuthReturn(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'fc27israel:' && (
      (parsed.hostname === 'auth' && parsed.pathname === '/callback') ||
      (!parsed.hostname && parsed.pathname === '/auth/callback')
    );
  } catch { return false; }
}

export function authReturnParams(url: string): Record<string, string> {
  const parsed = new URL(url);
  return Object.fromEntries(new URLSearchParams(`${parsed.search.slice(1)}&${parsed.hash.slice(1)}`));
}
