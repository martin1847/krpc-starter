'use client';

import { useRouter } from 'next/navigation';
import { HomeScreen } from '@krpc-starter/app';

// Shell: inject web routing, render the shared HomeScreen (@krpc-starter/app).
export default function Page() {
  const router = useRouter();
  return <HomeScreen onOpenCatalog={() => router.push('/catalog')} />;
}
