/**
 * @krpc-starter/api — the single backend-access layer.
 *
 * Business code imports data-fetching helpers only from here; it never fetches directly or
 * constructs a transport. This starter consumes the krpc MCP/HTTP surface at demo.krpc.tech
 * (HelloService). Swap `helloService` for your generated client + krpc transport for a real app.
 */

// Injected service instance(s).
export { helloService } from './rpc';

// Bookshelf: the generated client (contract SoT via ts-gen) + agent-HTTP transport to the local
// krpc-service-starter backend. This is the "real backend" path; helloService is the zero-backend
// demo. Business code consumes `bookshelfService` + the DTO types from here — never @krpc-starter/
// api-client directly (dependency-cruiser forbids it).
export { bookshelfService, resolveAgentInvokeUrl, DEFAULT_BACKEND_HOST, WEB_BACKEND_PROXY } from './bookshelf';
export type { BookDetail, BookListResult, BookCountResult, GetBookReq, ListBooksReq } from '@krpc-starter/api-client';

// TanStack Query bindings + envelope unwrap.
export { rpcQuery, rpcMutation, unwrap } from './query';

// W3C traceparent seam.
export { newTraceparent, tracedConfig } from './trace';

// Transport helpers (URL resolution) — exported for tests / advanced overrides.
export { resolveMcpUrl, DEFAULT_KRPC_HOST, WEB_PROXY_PATH } from './transport';

// krpc envelope + error model + HelloService DTOs.
export { isOk, RpcError, HelloReq } from './types';
export type { RpcResult, MethodConfig, HelloData } from './types';
