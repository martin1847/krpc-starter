// dependency-cruiser — architectural boundary gate.
//
// Run: `pnpm depcruise` (= depcruise packages apps). External packages are recorded as edges
// but not recursed into (doNotFollow), so imports of bare HTTP-client libs are still detectable.
// Workspace aliases resolve via the root tsconfig.base.json paths (@krpc-starter/* -> packages/*/src).
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'data-access-only-in-packages-api',
      comment:
        'Only packages/api (the backend-access layer) may talk to the krpc backend. Business code ' +
        '(packages/app, apps/*) must fetch through @krpc-starter/api (helloService / rpcQuery / ' +
        'rpcMutation). Fix: import @krpc-starter/api instead of hand-rolling a client or a bare fetch.',
      severity: 'error',
      from: { path: '^(packages/app|apps)/' },
      to: { path: '(^|/)@krpc-starter/api-client(/|$)' },
    },
    {
      name: 'no-http-client-in-app-or-apps',
      comment:
        'packages/app and apps/* must not import a bare HTTP-client library (axios/ky/got/...). ' +
        'All backend access goes through @krpc-starter/api (which owns the transport). ' +
        'Fix: replace the direct HTTP call with a @krpc-starter/api call.',
      severity: 'error',
      from: { path: '^(packages/app|apps)/' },
      to: { path: '(^|/)(axios|ky|got|superagent|node-fetch|undici|needle|phin|wretch|ofetch|redaxios|cross-fetch|isomorphic-fetch)(/|$)' },
    },
    {
      name: 'core-no-ui-layer-deps',
      comment:
        'packages/core is pure logic (money/format/validation, zero UI). It must not depend on ' +
        'packages/app or apps/*. Fix: push shared logic down into core, or invert the dependency.',
      severity: 'error',
      from: { path: '^packages/core/' },
      to: { path: '^(packages/app|apps)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.base.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
    },
  },
};
