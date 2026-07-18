import { describe, expect, it } from 'vitest';
import { unwrap } from './query';
import { RpcError, type RpcResult } from './types';

describe('unwrap', () => {
  it('returns data for an OK envelope (code 0)', async () => {
    const r: RpcResult<{ message: string }> = { code: 0, data: { message: 'hi' } };
    await expect(unwrap(Promise.resolve(r))).resolves.toEqual({ message: 'hi' });
  });

  it('throws RpcError for a non-OK envelope', async () => {
    const r: RpcResult<null> = { code: 40401, message: 'not found', data: null };
    await expect(unwrap(Promise.resolve(r))).rejects.toBeInstanceOf(RpcError);
    await expect(unwrap(Promise.resolve(r))).rejects.toMatchObject({ code: 40401, message: 'not found' });
  });
});
