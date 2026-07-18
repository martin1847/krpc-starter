import { afterEach, describe, expect, it, vi } from 'vitest';
import { bookshelfService, resolveAgentInvokeUrl, DEFAULT_BACKEND_HOST, WEB_BACKEND_PROXY } from './bookshelf';

/**
 * URL resolution: web hits a same-origin proxy path (CORS-safe); native/SSR hits the backend host
 * directly. The default vitest node environment has no `window` (native/SSR shape).
 */
describe('resolveAgentInvokeUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses the same-origin proxy path on web (has window)', () => {
    vi.stubGlobal('window', { location: { host: 'localhost:3000' } });
    expect(resolveAgentInvokeUrl()).toBe(`${WEB_BACKEND_PROXY}/agent/invoke`);
  });

  it('hits the backend host directly when window is absent (native/SSR)', () => {
    expect(resolveAgentInvokeUrl()).toBe(`${DEFAULT_BACKEND_HOST}/agent/invoke`);
  });

  it('honors NEXT_PUBLIC_BACKEND_HOST for the native/SSR branch', () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_HOST', 'http://backend.example.com:8080');
    expect(resolveAgentInvokeUrl()).toBe('http://backend.example.com:8080/agent/invoke');
  });
});

/**
 * The generated BookshelfService delegates to the injected transport, which splits the
 * `Service/method` path and POSTs the krpc agent-invoke envelope, then maps `{code,data}` back.
 */
describe('bookshelfService (agent-HTTP transport)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('POSTs the app-relative {service,method,input} envelope and maps an OK body', async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ code: 0, data: { list: [] } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await bookshelfService.listBooks({});

    expect(result).toEqual({ code: 0, message: undefined, data: { list: [] } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]![1]!;
    expect(JSON.parse(init.body as string)).toEqual({
      service: 'Bookshelf',
      method: 'listBooks',
      input: {},
    });
  });

  it('resolves a non-OK body as a non-OK envelope (soft error)', async () => {
    vi.stubGlobal('fetch', async () =>
      new Response(JSON.stringify({ code: 5, message: 'not found' }), { status: 200 }),
    );
    const result = await bookshelfService.getBook({ bookId: 'nope' });
    expect(result.code).toBe(5);
    expect(result.message).toBe('not found');
  });
});
