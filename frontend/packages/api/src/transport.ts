/**
 * krpc MCP transport (JSON-RPC over HTTP).
 *
 * This starter talks to the krpc **MCP / agent HTTP surface** at `POST /mcp` (JSON-RPC 2.0),
 * not gRPC-web. A krpc service published to that surface exposes each method as an MCP tool
 * named `<Service>_<method>` (e.g. `Hello_hello`); calling the tool runs the underlying krpc
 * call and returns the unwrapped `data` as `structuredContent`.
 *
 * URL resolution has two branches, mirroring how a cross-platform app splits web vs native:
 *   - **web** (has `window`): call a **same-origin** path (`/krpc/mcp`) so the browser is not
 *     blocked by CORS. The dev/SSR server proxies it to the sandbox (see apps/web/next.config.mjs
 *     `rewrites`). The sandbox does not send CORS headers, so a direct browser fetch would fail.
 *   - **native / SSR** (no `window`): no CORS restriction — call the sandbox host directly.
 *
 * `process.env.*` is string-replaced by the bundler at build time; a module-local `declare`
 * lets these types travel with this file so consumers need no @types/node.
 */
declare const process: { env: Record<string, string | undefined> };

/** Public krpc sandbox (HelloService). Override per-environment via env if you self-host. */
export const DEFAULT_KRPC_HOST = 'https://demo.krpc.tech';

/** Same-origin path the web app hits; the dev/SSR server proxies it to the sandbox. */
export const WEB_PROXY_PATH = '/krpc/mcp';

function envHost(): string {
  return (
    process.env.NEXT_PUBLIC_KRPC_HOST ??
    process.env.EXPO_PUBLIC_KRPC_HOST ??
    DEFAULT_KRPC_HOST
  );
}

/**
 * Resolve the MCP endpoint URL for the current runtime.
 * Exported so tests can cover both branches.
 */
export function resolveMcpUrl(): string {
  const hasWindow = typeof window !== 'undefined';
  if (hasWindow) return WEB_PROXY_PATH;
  return `${envHost()}/mcp`;
}
