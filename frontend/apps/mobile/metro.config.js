/**
 * Metro base (NativeWind on Expo).
 * 1. withNativeWind -> css-interop transformer + global.css (className works on both platforms).
 * 2. Monorepo: watch the repo root and resolve deps from both app and root node_modules (pnpm).
 * 3. Single-instance de-dupe: pnpm's isolated layout can give packages/app and apps/mobile their
 *    own copies of react / react-query / react-native, breaking shared React context
 *    (QueryClientProvider) with "No QueryClient set". Redirect these bare imports to the mobile copy.
 */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;
config.resolver.unstable_enablePackageExports = true;

const SINGLETONS = ['react', 'react-dom', 'react-native', '@tanstack/react-query'];

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const name of SINGLETONS) {
    if (moduleName === name || moduleName.startsWith(`${name}/`)) {
      return context.resolveRequest(
        { ...context, originModulePath: path.join(projectRoot, 'noop.js') },
        moduleName,
        platform,
      );
    }
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
