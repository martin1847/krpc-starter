import { RpcError } from '@krpc-starter/api';

/** gRPC/krpc UNAUTHENTICATED status code. */
const UNAUTHENTICATED = 16;

/**
 * True when an error looks like an auth failure. Used to skip retries on 401-style errors.
 *
 * ── Auth seam (intentionally not implemented in this starter) ────────────────────────────────
 * A real app would add an auth layer here:
 *   - an `AuthProvider` holding the current user + login state (from a cookie / secure store);
 *   - a data-layer recovery wrapper: on UNAUTHENTICATED, single-flight a token refresh and replay
 *     the request once; if refresh fails, clear the session and route to a login prompt;
 *   - `withAuth(cfg)` to attach credentials to authenticated calls.
 * Wire it in Providers (web) and app/_layout.tsx (mobile). Left out to keep the starter minimal.
 */
export function isAuthErrorLike(error: unknown): boolean {
  return error instanceof RpcError && error.code === UNAUTHENTICATED;
}
