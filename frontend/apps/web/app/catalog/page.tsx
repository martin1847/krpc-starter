'use client';

import { useRouter } from 'next/navigation';
import { CatalogListScreen } from '@krpc-starter/app';

// Shell: inject web routing, render the shared CatalogListScreen.
export default function Page() {
  const router = useRouter();
  return <CatalogListScreen onOpenItem={(id) => router.push(`/catalog/${id}`)} />;
}
