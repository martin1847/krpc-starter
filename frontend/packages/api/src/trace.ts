import type { MethodConfig } from './types';

/**
 * W3C traceparent: `version-traceid(16B)-spanid(8B)-flags` (e.g. `00-<32hex>-<16hex>-01`).
 *
 * The header is forwarded with each call so the krpc backend's OpenTelemetry pipeline can
 * continue the same trace end-to-end.
 *
 * NOTE — hello-world simplification: this generates a fresh, valid *root* traceparent per call
 * just to demonstrate the propagation seam. A real app should let a frontend OpenTelemetry SDK
 * generate trace/span ids so they line up with the client-side span tree and sampling.
 */
function hex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  let s = '';
  for (const b of a) s += b.toString(16).padStart(2, '0');
  return s;
}

export function newTraceparent(): string {
  return `00-${hex(16)}-${hex(8)}-01`;
}

/** Merge a fresh traceparent into a MethodConfig. */
export function tracedConfig(extra?: MethodConfig): MethodConfig {
  return {
    ...extra,
    headers: { ...(extra?.headers ?? {}), traceparent: newTraceparent() },
  };
}
