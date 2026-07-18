import { queryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { isOk, RpcError, type MethodConfig, type RpcResult } from './types';
import { tracedConfig } from './trace';

/**
 * TanStack Query bindings for the krpc envelope.
 *
 * Error split:
 *   - business soft error (non-OK envelope): `unwrap` throws RpcError -> query `error` state;
 *   - transport / system error: the transport already rejects with RpcError -> query `error` state.
 *
 * Every call is given a fresh W3C traceparent (see trace.ts).
 */

/** RpcResult -> data; a non-OK envelope throws RpcError. */
export async function unwrap<T>(p: Promise<RpcResult<T>>): Promise<T> {
  const r = await p;
  if (!isOk(r)) throw new RpcError(r.code, r.message ?? `rpc error ${r.code}`);
  return r.data;
}

/** Read: a queryKey + a thunk that receives a MethodConfig and returns an RpcResult promise. */
export function rpcQuery<Res>(key: readonly unknown[], call: (m: MethodConfig) => Promise<RpcResult<Res>>) {
  return queryOptions({
    queryKey: key,
    queryFn: () => unwrap(call(tracedConfig())),
  });
}

/** Write: a `(req, MethodConfig) -> RpcResult` call, turned into useMutation options. */
export function rpcMutation<Req, Res>(
  call: (req: Req, m: MethodConfig) => Promise<RpcResult<Res>>,
): UseMutationOptions<Res, Error, Req> {
  return {
    mutationFn: (req: Req) => unwrap(call(req, tracedConfig())),
  };
}
