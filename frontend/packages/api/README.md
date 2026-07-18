# @krpc-starter/api — the backend-access layer

Everything that talks to the backend lives here. Business code (screens, feature hooks) imports
data helpers **only from `@krpc-starter/api`** — it never calls `fetch` directly and never builds
a transport itself. That single seam is what the dependency-cruiser gate enforces.

## What this starter does

It consumes the public krpc sandbox **`https://demo.krpc.tech`** — specifically the
`HelloService.hello` method — over the krpc **MCP / agent HTTP surface** (`POST /mcp`, JSON-RPC 2.0).
A krpc method published to that surface is exposed as an MCP tool named `<Service>_<method>`
(here, `Hello_hello`). Calling the tool runs the underlying krpc call and returns the unwrapped
payload as `structuredContent`.

```
screens / feature hooks
        │  useQuery / useMutation
        ▼
query.ts     rpcQuery / rpcMutation  (unwrap: a non-OK envelope throws RpcError)
        │
rpc.ts       helloService.hello(req, cfg)  ->  MCP tools/call Hello_hello
        │      each call carries a fresh W3C traceparent (trace.ts)
        ▼  JSON-RPC over HTTP
transport.ts   resolveMcpUrl(): web -> /krpc/mcp (same-origin proxy), native -> demo.krpc.tech/mcp
        ▼
demo.krpc.tech (krpc HelloService)
```

### The RpcResult envelope (paradigm)

Every krpc method returns an envelope `{ code, message, data }` where `code === 0` is success.
`types.ts` keeps this model:

- `isOk(r)` — success predicate.
- `unwrap(promise)` — returns `data`, or throws `RpcError` for a non-OK envelope.
- `RpcError` — thrown for both soft errors (non-OK envelope) and hard errors (transport/JSON-RPC).

### Web vs native transport

- **web** (browser): calls the same-origin path `/krpc/mcp`, which the Next dev/SSR server
  proxies to the sandbox (see `apps/web/next.config.mjs` `rewrites`). The sandbox sends no CORS
  headers, so a direct browser `fetch` would be blocked — the proxy avoids that.
- **native / SSR**: no CORS restriction, so it calls `https://demo.krpc.tech/mcp` directly.

Override the host with `NEXT_PUBLIC_KRPC_HOST` / `EXPO_PUBLIC_KRPC_HOST` if you self-host the sandbox.

## Using a generated client instead (real apps)

This starter hand-rolls a tiny MCP client so it installs with **zero krpc runtime dependencies**.
In a real project you would instead:

1. Define your service on the backend (`@RpcService` returning `RpcResult<…>`).
2. Generate a typed TypeScript client from the contract with the **krpc TS generator**
   (`krpc ts-gen` — see the krpc docs). That yields an `@your-scope/api-client` package with
   request DTOs and class-based service stubs.
3. Construct each service with a krpc transport (`krpc-web` for gRPC-web in the browser, `krpc-js`
   for pure gRPC on Node) and inject it — replacing the `helloService` object in `rpc.ts`.
4. Keep `query.ts` / `types.ts` (the envelope + Query bindings) as-is; only the transport changes.

The generated client is where the contract lives — never hand-write DTOs or a bare `fetch` to
work around a missing field; extend the backend contract and regenerate.

## Adding a method

1. Add the method to your backend service and regenerate the client (or, in this starter, add a
   thin wrapper in `rpc.ts` that maps to the right MCP tool).
2. Add a feature hook in `packages/app/src/features/<domain>/` that calls it through `rpcQuery` /
   `rpcMutation`, following `features/hello/hooks.ts`.
