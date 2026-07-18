/**
 * @krpc-starter/app — the cross-platform feature layer.
 *
 * Screens are built from React Native primitives + NativeWind classNames: web renders them via
 * react-native-web, mobile uses them directly. Navigation is injected via props (the platform
 * shell owns routing), so this layer depends on neither next nor expo-router. Pure logic lives in
 * @krpc-starter/core; data fetching goes through @krpc-starter/api.
 */

// Hello demo (live krpc call).
export { useHello } from './features/hello/hooks';
export { HomeScreen } from './features/hello/HomeScreen';
export type { HomeScreenProps } from './features/hello/HomeScreen';

// List / detail template (live: the generated Bookshelf krpc client → local backend).
export { useBooks, useBook } from './features/catalog/hooks';
export { CatalogListScreen } from './features/catalog/CatalogListScreen';
export type { CatalogListScreenProps } from './features/catalog/CatalogListScreen';
export { CatalogDetailScreen } from './features/catalog/CatalogDetailScreen';
export type { CatalogDetailScreenProps } from './features/catalog/CatalogDetailScreen';

// Shared icons + runtime colors (platform shells reuse these for tab bars etc.).
export * from './features/_components/icons';
export { colors } from './features/theme';

// Design-system primitives.
export * from './ui';
