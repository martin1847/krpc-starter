'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { isAuthErrorLike } from '../lib/errors';

/**
 * App providers (web). A single TanStack QueryClient with sensible defaults.
 * A native app mirrors this in apps/mobile/app/_layout.tsx.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 60s fresh window: quick revisits hit cache; then refetch in bg.
            retry: (failureCount, error) => !isAuthErrorLike(error) && failureCount < 2,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
