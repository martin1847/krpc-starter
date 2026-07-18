/**
 * Bookshelf backend seam — the generated `@krpc-starter/api-client` BookshelfService wired to a
 * concrete krpc transport.
 *
 * The generated service (contract SoT → ts-gen) delegates every method to an injected `RpcService`
 * (krpc-base). This file provides that transport: it POSTs to the krpc plain-HTTP *agent* gateway
 * (`POST {base}/agent/invoke`, JSON in / JSON out) and maps the `{code,message,data}` body back onto
 * the `RpcResult` envelope. Business code imports `bookshelfService` from `@krpc-starter/api` — never
 * the generated package directly (dependency-cruiser forbids it), and never a transport.
 *
 * Unlike the Hello demo (which calls the public MCP sandbox at demo.krpc.tech), this talks to the
 * LOCAL krpc-service-starter backend — start it first (see README). URL resolution mirrors
 * transport.ts:
 *   - web (has `window`): same-origin `/backend/agent/invoke`, proxied to :8080 (avoids CORS);
 *   - native / SSR (no `window`): the backend host directly (default http://localhost:8080).
 */
import { BookshelfService } from '@krpc-starter/api-client';
import type { MethodConfig, RpcService } from 'krpc-base';
import { RpcError, type RpcResult } from './types';

// `process.env.*` is string-replaced by the bundler at build time; a module-local declare lets the
// type travel with this file so consumers need no @types/node.
declare const process: { env: Record<string, string | undefined> };

/** Local krpc backend (agent HTTP gateway). Override per-environment via env if you self-host. */
export const DEFAULT_BACKEND_HOST = 'http://localhost:8080';

/** Same-origin path the web app hits; the dev/SSR server proxies it to the backend. */
export const WEB_BACKEND_PROXY = '/backend';

/** JSON-RPC / transport failure code for the hard-error path (RpcError thrown, not resolved). */
const SYSTEM_ERROR = -32000;

function envBackendHost(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_HOST ??
    process.env.EXPO_PUBLIC_BACKEND_HOST ??
    DEFAULT_BACKEND_HOST
  );
}

/**
 * Resolve the agent/invoke endpoint URL for the current runtime.
 * Exported so tests can cover both branches.
 */
export function resolveAgentInvokeUrl(): string {
  const hasWindow = typeof window !== 'undefined';
  if (hasWindow) return `${WEB_BACKEND_PROXY}/agent/invoke`;
  return `${envBackendHost()}/agent/invoke`;
}

/**
 * krpc agent-HTTP transport.
 *
 * `method` arrives as the app-relative `Service/method` path the generated client builds
 * (e.g. `Bookshelf/listBooks`); the agent gateway wants `service` + `method` split out. The gateway
 * rides the krpc status on a `code` field in the JSON body (the HTTP status line stays 200), so:
 *   - transport / HTTP failure -> **throw** RpcError (hard/system error);
 *   - a `code != 0` body -> **resolve** a non-OK RpcResult, which the query layer's `unwrap` turns
 *     into the component's error state;
 *   - `code == 0` -> resolve `{ code: 0, data }`.
 */
class AgentHttpRpcService implements RpcService {
  async async<DTO>(method: string, param?: unknown, cfg?: MethodConfig): Promise<RpcResult<DTO>> {
    const slash = method.indexOf('/');
    const service = slash >= 0 ? method.slice(0, slash) : method;
    const call = slash >= 0 ? method.slice(slash + 1) : method;

    let res: Response;
    try {
      res = await fetch(resolveAgentInvokeUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(cfg?.headers ?? {}),
        },
        body: JSON.stringify({ service, method: call, input: param ?? {} }),
      });
    } catch (e) {
      throw new RpcError(SYSTEM_ERROR, `network error calling ${method}: ${(e as Error).message}`);
    }

    if (!res.ok) {
      throw new RpcError(SYSTEM_ERROR, `HTTP ${res.status} calling ${method}`);
    }

    const json = (await res.json()) as { code: number; message?: string; data?: DTO };
    return { code: json.code, message: json.message, data: json.data as DTO };
  }
}

/** Injected Bookshelf service — the generated client + the agent-HTTP transport to the backend. */
export const bookshelfService = new BookshelfService(new AgentHttpRpcService());
