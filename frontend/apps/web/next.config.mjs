import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

// Pin the tracing root to this worktree so Next doesn't infer $HOME (silences the
// multi-lockfile warning in a monorepo).
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// react-native-web StyleSheet must be a single module instance across the whole build, or SSR
// style extraction (app/_components/rnw-style-registry) sees an empty sheet and the first paint
// flashes unstyled (FOUC). Pin both `react-native` and `react-native-web` bare specifiers to the
// same ESM entry's absolute path to force one module identity (web build only; mobile uses Metro).
const require = createRequire(import.meta.url);
const rnwPkg = require.resolve('react-native-web/package.json');
const rnwEsmEntry = resolve(dirname(rnwPkg), 'dist/index.js');

// Public krpc sandbox (HelloService). The browser can't call it cross-origin (no CORS headers on
// the sandbox), so the web app calls the same-origin path /krpc/* which is proxied here.
const KRPC_HOST = process.env.NEXT_PUBLIC_KRPC_HOST ?? 'https://demo.krpc.tech';

// Local krpc-service-starter backend (agent HTTP gateway on :8080). Same story: the browser calls
// the same-origin path /backend/* (proxied here) so it is not blocked by CORS. See packages/api/
// bookshelf.ts. Start the backend first (docker compose up + quarkusDev) — see README.
const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST ?? 'http://localhost:8080';

const nextConfig = {
  // Cross-origin RNW assets: add crossorigin to <script>/<link>.
  crossOrigin: 'anonymous',
  images: { unoptimized: true },
  outputFileTracingRoot: workspaceRoot,
  // Hide the dev indicator overlay (it can cover the bottom tab bar).
  devIndicators: false,
  // Cross-platform: @krpc-starter/* ship raw TS and need transpiling; so do the NativeWind stack
  // (nativewind + css-interop) and react-native-web / react-native (aliased to RNW).
  transpilePackages: [
    '@krpc-starter/api',
    '@krpc-starter/api-client',
    '@krpc-starter/app',
    '@krpc-starter/core',
    'nativewind',
    'react-native-css-interop',
    'react-native-web',
    'react-native',
  ],
  async rewrites() {
    // Same-origin proxies -> avoid browser CORS. See packages/api/{transport,bookshelf}.ts.
    return [
      { source: '/krpc/:path*', destination: `${KRPC_HOST}/:path*` }, // demo sandbox (Hello)
      { source: '/backend/:path*', destination: `${BACKEND_HOST}/:path*` }, // local backend (Bookshelf)
    ];
  },
  webpack: (config) => {
    // react-native -> react-native-web on the web; both bare specifiers point at the same ESM
    // absolute path so the whole build shares one RNW/StyleSheet singleton (FOUC fix, see above).
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'react-native$': rnwEsmEntry,
      'react-native-web$': rnwEsmEntry,
    };
    // Prefer .web.* platform files (mobile uses .native.* / bare).
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

export default nextConfig;
