'use client';

import { useParams, useRouter } from 'next/navigation';
import { CatalogDetailScreen } from '@krpc-starter/app';

// Shell: read the item id from the route, inject navigation, render the shared detail screen.
export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  return <CatalogDetailScreen itemId={params.id} onBack={() => router.back()} />;
}
