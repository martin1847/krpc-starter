import { useQuery } from '@tanstack/react-query';
import { rpcQuery, helloService, HelloReq, type HelloData } from '@krpc-starter/api';

/**
 * HelloService.hello — the canonical krpc read.
 *
 * Keyed by `name` so results are cached per name. `enabled` gates the call on a non-empty name.
 * The query goes through `rpcQuery` -> `unwrap`, so a non-OK envelope becomes the query's error.
 */
export function useHello(name: string) {
  return useQuery({
    ...rpcQuery<HelloData>(['Hello/hello', name], (cfg) => helloService.hello(new HelloReq(name), cfg)),
    enabled: name.trim().length > 0,
  });
}
