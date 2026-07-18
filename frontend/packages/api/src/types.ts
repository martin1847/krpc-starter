/**
 * krpc envelope + error model (kept as paradigm code).
 *
 * Every krpc service method returns an `RpcResult<T>` envelope: `{ code, message, data }`,
 * where `code === 0` means success and `data` is the payload. Business "soft" errors arrive
 * as a resolved envelope with a non-zero `code`; transport / system failures reject instead.
 *
 * In a real app these types (and the request/response DTOs) come from the *generated* client
 * (`@krpc-starter/api-client`, produced by the krpc TS generator). This starter hand-rolls a
 * tiny subset so it installs with zero krpc runtime dependencies — see README.
 */

/** The krpc result envelope. `code === 0` is success. */
export interface RpcResult<T> {
  code: number;
  message?: string;
  data: T;
}

/** Success predicate for an envelope. */
export function isOk<T>(r: RpcResult<T>): boolean {
  return r.code === 0;
}

/** Error thrown for both soft (non-OK envelope) and hard (transport/system) failures. */
export class RpcError extends Error {
  readonly code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
  }
}

/** Per-call config passed through to the transport (headers, cancellation). */
export interface MethodConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ── HelloService contract (demo.krpc.tech / HelloService.hello) ─────────────────────────────
// Mirrors the generated request DTO shape: a small class you construct and pass to the method.

/** Request DTO for HelloService.hello. */
export class HelloReq {
  constructor(public name: string) {}
}

/** Unwrapped response payload for HelloService.hello. */
export interface HelloData {
  message: string;
  timestamp: number;
}
