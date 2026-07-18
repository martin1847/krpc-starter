# @krpc-starter/config

Home for shared build / lint configuration. Suggested contents as the project grows:

- app/library variants of `tsconfig.base.json`
- an `eslint` preset (e.g. with `@tanstack/eslint-plugin-query` rules)
- a `prettier` config

Each app/package then references these via `extends`.
