import { useLocalSearchParams, useRouter } from 'expo-router';
import { CatalogDetailScreen } from '@krpc-starter/app';

// Shell: read the item id from the route, inject navigation, render the shared detail screen.
export default function CatalogDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <CatalogDetailScreen itemId={id ?? ''} onBack={() => router.back()} />;
}
