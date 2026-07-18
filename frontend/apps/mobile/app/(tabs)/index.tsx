import { useRouter } from 'expo-router';
import { HomeScreen } from '@krpc-starter/app';

// Shell: inject expo-router navigation, render the shared HomeScreen.
export default function HomeTab() {
  const router = useRouter();
  return <HomeScreen onOpenCatalog={() => router.push('/catalog')} />;
}
