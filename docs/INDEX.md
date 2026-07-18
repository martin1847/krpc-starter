# docs/ — governance index

A lightweight, AI-native governance skeleton. The starter ships this as a **demonstration of the
structure**, mostly empty — fill it in as your project accretes real decisions and constraints.

## Start here

- **[`../README.md`](../README.md)** — human 5-minute quickstart, platform support, graduation path.
- **[`../AGENTS.md`](../AGENTS.md)** — agent entry point: repo map, contract-is-SoT decision order,
  unified command surface, verification recipes (with gate negative-probes), generated-artifact
  guardrails, the five krpc rules.

## Source of Truth order

1. The krpc **contract** — `backend/bookshelf-api/**` (whole-stack data shape).
2. The **generated client** — `frontend/packages/api-client/**` (a projection of the contract).
3. `AGENTS.md` + `README.md` (repo conventions).
4. `docs/` (this tree) — decisions + module notes.

## Structure (populate as needed)

```
docs/
├── INDEX.md              # this file — the map
├── decisions/            # ADRs (Nygard 4-state: proposed / accepted / deprecated / superseded)
│   └── ADR-0001-*.md     #   e.g. "single monorepo, split at graduation"
└── modules/              # per-area notes (frontend backend-access layer, backend contract, ...)
```

## Conventions

- **ADRs** record *why* a structural decision was made; add one when a choice would otherwise be
  re-litigated (repo split, auth model, client publishing).
- Governance docs are **snapshots, not logs** — rewrite in place; history lives in git.
- Keep the contract-is-SoT invariant: any doc describing the data shape defers to
  `backend/bookshelf-api/**`.
