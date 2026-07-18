import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveMcpUrl, DEFAULT_KRPC_HOST, WEB_PROXY_PATH } from './transport';

/**
 * URL resolution: web hits a same-origin proxy path (CORS-safe); native/SSR hits the sandbox
 * host directly. The default vitest node environment has no `window` (native/SSR shape).
 */
describe('resolveMcpUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses the same-origin proxy path on web (has window)', () => {
    vi.stubGlobal('window', { location: { host: 'localhost:3000' } });
    expect(resolveMcpUrl()).toBe(WEB_PROXY_PATH);
  });

  it('hits the sandbox host directly when window is absent (native/SSR)', () => {
    expect(resolveMcpUrl()).toBe(`${DEFAULT_KRPC_HOST}/mcp`);
  });

  it('honors NEXT_PUBLIC_KRPC_HOST for the native/SSR branch', () => {
    vi.stubEnv('NEXT_PUBLIC_KRPC_HOST', 'https://krpc.example.com');
    expect(resolveMcpUrl()).toBe('https://krpc.example.com/mcp');
  });
});
