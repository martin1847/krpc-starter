# krpc-starter

> Working name — pick your own when you fork this.

A **whole-stack starter for [krpc](https://krpc.tech)**: a universal React Native + Web frontend and
a contract-first krpc backend, in one monorepo, connected by a **generated, committed TypeScript
client**. It shows the engineering pattern around a krpc service end to end — the *contract* is the
single source of truth, and the frontend consumes a client generated from it.

- **`frontend/`** — a universal RN + Web app (iOS / Android / mobile web). One codebase renders on
  native (Expo) and web (Next.js + react-native-web), sharing screens, a design system, and a single
  backend-access layer. pnpm + Turborepo.
- **`backend/`** — a JDK 21 / Quarkus krpc service. One example domain, `bookshelf`, walks the full
  workflow: **contract (SoT) → implementation → generated TS client → fitness gates → native**.

The two halves meet at the krpc contract: the backend's `*-api` Java interface is the whole-stack
source of truth, and `backend/scripts/gen-ts.sh` generates the TypeScript client the frontend's
List/Detail screens consume. A CI gate keeps the committed client in lock-step with the contract.

---

## Quickstart (about five minutes)

Prerequisites: **JDK 21**, **Docker**, **Node ≥ 20**, **pnpm ≥ 9** (`corepack enable` or
`npm i -g pnpm`).

### 1. Start the backend

```bash
cd backend

# Dev Postgres — isolated: project `bookshelf-starter`, host port 5435 (never collides with
# another local Postgres). Tables are Flyway's job at app startup.
docker compose up -d

# Run the server in dev mode (gRPC :50051 + plain-HTTP agent/MCP gateway :8080). The %dev profile
# reads a throwaway dev DB password from application.properties — no env needed locally.
./gradlew :bookshelf-server:quarkusDev
```

Sanity-check the agent HTTP gateway (the path the frontend calls):

```bash
curl -X POST http://127.0.0.1:8080/agent/invoke -H 'Content-Type: application/json' \
  -d '{"service":"Bookshelf","method":"listBooks","input":{}}'
# → {"code":0,"data":{"list":[ ...four seeded books... ]}}
```

### 2. Start the frontend

```bash
cd frontend
pnpm install

# Web (Next.js + react-native-web) — http://localhost:3000
pnpm dev:web

# Native (Expo) — press i / a for iOS / Android, or scan the QR with Expo Go
pnpm dev:mobile
```

Open **http://localhost:3000**:

- The **Catalog** tab (`/catalog`) is the list/detail template. It calls the **local backend**
  through the generated Bookshelf client and renders the four seeded books; tap one for the detail
  screen. The web app reaches the backend via a same-origin proxy (`/backend/*` →
  `localhost:8080`, see `frontend/apps/web/next.config.mjs`) to avoid browser CORS.
- The **Home** tab is a **zero-backend** demo: it calls `HelloService.hello` on the public krpc
  sandbox `demo.krpc.tech`, so it works even if you skip step 1.

> If the Catalog screen shows *"Could not load books… Is the backend running?"*, the backend from
> step 1 isn't up (or Postgres isn't healthy yet).

---

## The whole-stack contract seam

The backend `*-api` interface (`backend/bookshelf-api/…/BookshelfService.java`) is the **single
source of truth** for the data shape. From it:

- **`backend/scripts/gen-ts.sh`** runs krpc's generator (`ext-rpc-gen`) over the contract and
  assembles the `@krpc-starter/api-client` TS package.
- That package is **committed** at `frontend/packages/api-client/` and imported by the frontend's
  backend-access layer (`frontend/packages/api`), which injects a krpc HTTP transport.
- A CI gate (`api-client-freshness`) **regenerates and diffs** it on every PR — if the contract
  changes and the client isn't regenerated (or someone hand-edits the generated client), the build
  fails. The generator output is deterministic (timestamps + validation decorators are normalized
  out), so a clean regenerate is a no-op diff.

Regenerate the client after editing a contract:

```bash
cd backend && bash scripts/gen-ts.sh ../frontend/packages/api-client   # then commit the result
```

---

## Checks

Frontend (pure Node, no JDK):

```bash
cd frontend
pnpm typecheck   # tsc across every package/app
pnpm lint        # eslint
pnpm test        # vitest (packages/core, packages/api)
pnpm depcruise   # architectural boundaries (only packages/api may reach the backend)
pnpm ds:check    # design-token drift gate
```

Backend (JDK 21 + Docker):

```bash
cd backend
docker compose up -d
./gradlew build  # compile + @QuarkusTest against Postgres + the ArchUnit fitness laws + import guard
```

---

## Platform support

| Target | Supported | How |
| --- | --- | --- |
| iOS / Android | ✅ | Expo (`frontend/apps/mobile`) |
| Mobile / desktop web | ✅ | Next.js + react-native-web (`frontend/apps/web`) |
| WeChat in-app browser (H5) | ✅ | It's just mobile web — the `apps/web` build runs inside WeChat's WebView |
| **WeChat Mini-Program** | ❌ | **Not supported.** Mini-Programs run in a different runtime (no DOM, no react-native-web), so this stack does not target them. If you need a Mini-Program, use a framework built for it such as [Taro](https://taro.jd.com/) as a separate target. |

---

## Graduation path — growing out of the starter

This monorepo is deliberately a single repo so the whole stack is learnable in one clone. As a real
product grows, the seams here are where you split:

1. **Split the repos.** Move `frontend/` and `backend/` into their own git repos. Each is already a
   self-contained root (its own toolchain, CI, `.gitignore` roots). When you do, the backend's
   **`japicmp` API-compatibility gate** (shipped as a standalone `./gradlew japicmp` task) becomes
   wire-able into CI — its git-worktree baseline mechanism assumes the gradle root *is* the git root,
   which holds once the backend stands alone.
2. **Publish `@krpc-starter/api-client` to a registry.** In the monorepo the client is a committed
   workspace package + a freshness gate. Once the repos split, publish it from the backend's CI
   (`scripts/gen-ts.sh` already writes a `publishConfig`; set `NPM_REGISTRY`) and have the frontend
   depend on a versioned release instead of the workspace copy. The contract version
   (`gradle.properties: apiClientVersion`) becomes the client's published version.
3. **Add auth + a gateway.** The frontend auth seam is documented in
   `frontend/apps/web/lib/errors.ts`; the backend puts auth + rate-limiting in front of the krpc
   gateway (see the `@UnsafeWeb` notes). Neither is implemented here — the starter is a public,
   read-only demo.
4. **Wire deployment.** `backend/.github/workflows` ship a native-image build with the registry-push
   stage left as a commented placeholder; fill in your registry + a secret.

---

## Versions

| Component | Version |
| --- | --- |
| Node | ≥ 20 |
| pnpm | ≥ 9 |
| JDK | 21 |
| Quarkus | 3.33.2 |
| krpc | 1.1.1 |
| ext-rpc | 1.0.5 |
| ext-mybatis | 1.0.2 |

Backend artifacts resolve from Maven Central; the frontend from the npm registry. `com.example`
(backend package) and the `@krpc-starter` npm scope are placeholders — rename them for your project.

---

## For AI agents

Working in this repo with an AI coding agent? Start at **[`AGENTS.md`](AGENTS.md)** — repository map,
the contract-is-SoT decision order, the unified command surface, verification recipes (including the
gate negative-probes), generated-artifact guardrails, and the five krpc rules that bite first.

The official **krpc skill comes pre-installed** at [`.claude/skills/krpc/`](.claude/skills/krpc/SKILL.md)
(Claude Code picks it up automatically; it bundles the full krpc `SPEC.md` handbook). Upstream:
<https://github.com/martin1847/krpc/tree/dev/skills/krpc>.

## License

Add your license of choice (e.g. MIT) before publishing.
