import { useRouter } from 'expo-router';
import { CatalogListScreen } from '@krpc-starter/app';

// Shell: inject expo-router navigation, render the shared CatalogListScreen.
export default function CatalogTab() {
  const router = useRouter();
  return <CatalogListScreen onOpenItem={(id) => router.push(`/catalog/${id}`)} />;
}
