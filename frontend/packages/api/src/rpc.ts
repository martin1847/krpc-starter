import { RpcError, type HelloData, type HelloReq, type MethodConfig, type RpcResult } from './types';
import { resolveMcpUrl } from './transport';

/**
 * Minimal MCP JSON-RPC client. Business code never uses this directly — it uses the injected
 * service instances below (`helloService`) via @krpc-starter/api's query wrappers.
 */

/** JSON-RPC / transport failure codes for the hard-error path (RpcError thrown, not resolved). */
const SYSTEM_ERROR = -32000;

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: {
    isError?: boolean;
    structuredContent?: unknown;
    content?: Array<{ type: string; text?: string }>;
  };
  error?: { code: number; message: string };
}

let nextId = 1;

/**
 * Call an MCP tool (`<Service>_<method>`) and map it back onto the krpc `RpcResult` envelope.
 *
 * Error split (mirrors real krpc consumption):
 *   - transport / HTTP / JSON-RPC protocol failure -> **throw** RpcError (hard/system error);
 *   - tool reported `isError` (a business soft error) -> **resolve** a non-OK RpcResult, so the
 *     query layer's `unwrap` throws RpcError into the component's error state;
 *   - success -> resolve `{ code: 0, data: structuredContent }`.
 */
async function mcpToolCall<T>(
  tool: string,
  args: Record<string, unknown>,
  cfg?: MethodConfig,
): Promise<RpcResult<T>> {
  const body = {
    jsonrpc: '2.0' as const,
    id: nextId++,
    method: 'tools/call',
    params: { name: tool, arguments: args },
  };

  let res: Response;
  try {
    res = await fetch(resolveMcpUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(cfg?.headers ?? {}),
      },
      body: JSON.stringify(body),
      signal: cfg?.signal,
    });
  } catch (e) {
    throw new RpcError(SYSTEM_ERROR, `network error calling ${tool}: ${(e as Error).message}`);
  }

  if (!res.ok) {
    throw new RpcError(SYSTEM_ERROR, `HTTP ${res.status} calling ${tool}`);
  }

  const json = (await res.json()) as JsonRpcResponse;

  // JSON-RPC protocol error -> hard error.
  if (json.error) {
    throw new RpcError(json.error.code, json.error.message);
  }

  const result = json.result;
  if (!result) {
    throw new RpcError(SYSTEM_ERROR, `empty result from ${tool}`);
  }

  // Tool-reported error -> soft error surfaced as a non-OK envelope.
  if (result.isError) {
    const text = result.content?.find((c) => c.type === 'text')?.text ?? 'tool error';
    return { code: -1, message: text, data: undefined as T };
  }

  return { code: 0, data: result.structuredContent as T };
}

/**
 * Injected service instance. In a real app you'd construct the *generated* service class with
 * a krpc transport; here the HelloService method maps onto its MCP tool.
 */
export const helloService = {
  hello(req: HelloReq, cfg?: MethodConfig): Promise<RpcResult<HelloData>> {
    return mcpToolCall<HelloData>('Hello_hello', { name: req.name }, cfg);
  },
};
