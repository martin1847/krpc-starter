# AGENTS.md — krpc-starter

Agent entry point for this monorepo. Humans start at [`README.md`](README.md); this file is the map
+ discipline for an AI coding agent. Read it before editing.

## What this is

A whole-stack krpc starter in one repo: a universal RN + Web **`frontend/`** and a contract-first
JDK 21 / Quarkus **`backend/`**, joined by a generated, committed TypeScript client. The backend
`*-api` interface is the whole-stack single source of truth; the frontend consumes a client
generated from it.

## Onboarding checklist (run once, first session in a fresh clone)

1. **krpc skill present & fresh?** The official krpc skill is vendored at `.claude/skills/krpc/`
   (Claude Code loads it automatically; other agents: read its `SKILL.md` first). It bundles the
   full authoring handbook `references/SPEC.md` — the SoT for krpc semantics — plus native-image /
   operations / MCP-bridge references. It is a snapshot of
   <https://github.com/martin1847/krpc/tree/dev/skills/krpc>; refresh when stale (trigger below):
   ```bash
   rm -rf .claude/skills/krpc \
     && git clone --depth 1 -b dev --filter=blob:none --sparse https://github.com/martin1847/krpc /tmp/krpc-up \
     && git -C /tmp/krpc-up sparse-checkout set skills/krpc \
     && cp -R /tmp/krpc-up/skills/krpc .claude/skills/krpc && rm -rf /tmp/krpc-up
   ```
2. **`rpcurl` installed?** The krpc debugging CLI (machine-JSON output, schema introspection,
   validation errors with field names — friendlier than raw curl for both humans and agents).
   Grab your platform binary + SHA256SUMS from
   <https://github.com/martin1847/krpc-crates/releases/latest>, then e.g.
   `rpcurl http://127.0.0.1:50051/bookshelf-server/Bookshelf/listBooks -d '{}'`.
3. **Toolchain sanity**: JDK 21 + Docker (backend), Node 20 + pnpm (frontend). Then
   `docker compose -f backend/docker-compose.yml up -d` → `cd backend && ./gradlew build` →
   `cd frontend && pnpm i && pnpm typecheck`.
4. **Read the gates before touching code**: "Verification recipes" below — every gate has a
   negative probe; run one to see it bite.

**Standing trigger — whenever you bump the krpc version** (`backend/gradle.properties`
`krpcVersion`/`extRpcVersion`): re-run the skill refresh in step 1 in the same change — the
skill/SPEC snapshot must move together with the framework version it documents.

## Repository map

```
krpc-starter/
├── README.md, AGENTS.md, docs/         # human quickstart · this file · governance skeleton
├── .github/workflows/                  # frontend-ci · backend-ci · api-client-freshness · native-ci · secret-scan
├── frontend/                           # pnpm + Turborepo workspace root (pure Node, no JDK)
│   ├── apps/web/                        Next.js + react-native-web (owns web routing + the /backend + /krpc proxies)
│   ├── apps/mobile/                     Expo + expo-router (owns native routing)
│   ├── packages/app/                    cross-platform screens + 8 DS primitives (navigation via props)
│   ├── packages/api/                    the ONLY backend-access layer: transports + RpcResult envelope + Query
│   ├── packages/api-client/             GENERATED krpc client (committed; do not hand-edit — see guardrails)
│   ├── packages/core/                   pure logic (money/format), zero UI, unit-tested
│   └── packages/config/                 shared build/lint presets
└── backend/                            # Gradle root (JDK 21)
    ├── bookshelf-api/                    the CONTRACT: @RpcService interface + @Doc DTOs (whole-stack SoT)
    ├── bookshelf-server/                 the IMPLEMENTATION: RpcResult impl, MyBatis, Flyway V1, @QuarkusTest
    ├── fitness-tests/                    ArchUnit gate: three laws over the *-api bytecode
    ├── ts-gen/                           build-time TS client generator (krpc ext-rpc-gen)
    ├── scripts/gen-ts.sh                 generate + normalize + assemble @krpc-starter/api-client
    └── docker-compose.yml, db/init/      dev-only Postgres (isolated: project bookshelf-starter, host port 5435)
```

## Source of Truth — decision order

When two things disagree, resolve in this order:

1. **The krpc contract** — `backend/bookshelf-api/**` (`*-api` interface + DTOs). The whole-stack
   data shape. Everything downstream (server impl, generated TS client, frontend screens) derives
   from it.
2. **The generated client** — `frontend/packages/api-client/**` is a *projection* of (1), never an
   independent truth. If it disagrees with the contract, regenerate it (never hand-edit).
3. **This file + `README.md`** — repo-level conventions.
4. **`docs/`** — governance skeleton (ADRs, module notes) if/when populated.

## Unified command surface

Frontend (from `frontend/`, pure Node):

| Command | What it gates |
| --- | --- |
| `pnpm typecheck` | tsc across every package/app |
| `pnpm lint` | eslint |
| `pnpm test` | vitest (`packages/core`, `packages/api`) |
| `pnpm depcruise` | architectural boundaries (only `packages/api` may reach the backend) |
| `pnpm ds:check` | design-token drift (runtime `theme.ts` ↔ tailwind tokens) |
| `pnpm dev:web` / `pnpm dev:mobile` | run the web / native app |

Backend (from `backend/`, JDK 21 + Docker):

| Command | What it gates |
| --- | --- |
| `docker compose up -d` | dev Postgres (host :5435) |
| `./gradlew build` | compile + @QuarkusTest + ArchUnit fitness laws + observability import guard |
| `./gradlew :bookshelf-server:quarkusDev` | run the server (gRPC :50051 + agent/MCP HTTP :8080) |
| `bash scripts/gen-ts.sh ../frontend/packages/api-client` | regenerate the committed TS client |
| `./gradlew japicmp` | API-compat gate (standalone; wire into CI post-graduation — see README) |

## Verification recipes (with negative probes)

Every gate here is *live* — prove it by making it fail, then reverting:

- **api-client freshness.** `cd backend && bash scripts/gen-ts.sh ../frontend/packages/api-client`
  then `git diff --exit-code -- frontend/packages/api-client` → clean. Negative probe: change one
  character in a `frontend/packages/api-client/src/*.ts` file → `git diff` is non-empty (gate red) →
  `git checkout` it → clean again. (The generator normalizes out timestamps + validation decorators
  so a clean regenerate is deterministic.)
- **ArchUnit fitness laws (backend).** `./gradlew :fitness-tests:test` is green. Negative probe:
  change `Integer priceCents` → `double price` in `BookDetail` → R1 (boxed) + R2 (no float money)
  go red → revert.
- **Dependency boundaries (frontend).** `pnpm depcruise` is green. Negative probe: import
  `@krpc-starter/api-client` (or a bare `fetch`/`axios`) from a screen in `packages/app` → the
  `data-access-only-in-packages-api` rule fails → revert.
- **DS drift.** `pnpm ds:check` is green; change a hex in `packages/app/src/features/theme.ts`
  without the tailwind token → red.
- **Secrets.** `gitleaks git --config .gitleaks.toml .` over full history → clean.

## Generated-artifact guardrails

- **`frontend/packages/api-client/` is generated. Never hand-edit it.** To change the client, edit
  the contract (`backend/bookshelf-api/**`) and rerun `gen-ts.sh`. The freshness CI gate will fail a
  hand-edit or a stale client.
- The generator output is **deterministic** by design: `gen-ts.sh` strips the per-run timestamp
  headers and the class-validator validation decorators (a TS client needs neither — the field shape
  is the contract; validation is the server's job). If you change what the generator emits, keep it
  deterministic or the freshness gate flaps.
- **Contract changes are the high-risk axis.** Editing a `*-api` interface / DTO changes the
  whole-stack shape at once (server impl + generated client + every consuming screen). After such a
  change: regenerate the client, rebuild the backend, and re-run the frontend typecheck — all three.
- The frontend backend-access boundary is enforced: business code (screens, apps) imports
  `@krpc-starter/api` only, never `@krpc-starter/api-client` or a raw HTTP client. `packages/api`
  owns the transports (`bookshelf.ts` → local backend agent gateway; `rpc.ts`/`transport.ts` → the
  Hello MCP demo).

## The five krpc rules (that bite first)

Applied in context in `BookshelfService` / `BookshelfServiceImpl` javadoc. The tool-agnostic
handbook is the krpc `SPEC.md`; this is the trigger list.

1. **Method signature** — every method is `RpcResult<Dto> m(OneDto)` or `m()`: the return type is
   always `RpcResult<…>` and there is at most one parameter. Break either and krpc *silently drops*
   the method (no startup error). Merge multiple inputs into one request DTO.
2. **RpcResult envelope** — `code` 0 = OK, `>0` = business error (never negative); `data` is present
   only when `code==0`. Build with `RpcResult.ok(data)` / `RpcResult.error(code,msg)`.
3. **Soft vs hard errors** — business failures *return* `RpcResult.error(...)` (see `getBook`: bad id
   → INVALID_ARGUMENT, missing → NOT_FOUND). Only system/validation/unexpected errors *throw*.
4. **Boxed DTO fields** — scalar DTO fields are boxed (`Integer`/`Long`/`Boolean`), never primitives:
   JSON is serialized NON_NULL, so a primitive can't distinguish "absent" from its zero value. Money
   is integer minor units — `Integer priceCents`, never a float (ArchUnit R2 enforces it).
5. **@UnsafeWeb** — TYPE-level `@UnsafeWeb` makes a service browser/frontend-reachable over the HTTP
   gateway; without it it stays server-to-server. Method-level `@UnsafeWeb.AgentTool` marks the MCP
   tool subset (here `getBook` + `listBooks`, not `countBooks`) exposed at `POST /mcp` when the
   server runs with `KRPC_MCP=true`.
