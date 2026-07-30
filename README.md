# u dont GRC me

A control-centric GRC product prototype. The app treats controls as the primary source of truth and maps assets, frameworks, evidence, risks, integrations, and AI agent decisions around each control.

## Run locally

```powershell
npm install
npm run dev:full
```

Open http://127.0.0.1:5173/.

The full local mode starts:

- React/Vite UI on http://127.0.0.1:5173
- SQLite-backed API on http://127.0.0.1:8787

For static UI-only work, run `npm run dev -- --port 5173`.

## Hosted Prototype

AWS CloudFront:

https://d1oxsqx3ua8bb7.cloudfront.net

CloudFront origin bucket is intentionally private/blocked:

http://u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1.s3-website-us-east-1.amazonaws.com

## Build

```powershell
npm run build
```

## Current Product Slice

- Command Center: executive metrics, global filters, saved dashboard views, chart creation, and Monte Carlo scenario simulation.
- Governance: SQLite-backed control inventory, module tabs, control detail, framework mapping matrix, evidence health, blueprint library, policy traceability, asset scope, graph data model rules, and control-adjacent graph view.
- Compliance: audit readiness, audit package assembly, AI approval queue, evidence review simulator, immutable-reference metadata, and `PROVED_BY` graph edges.
- Risk: risk register, control-linked scenarios, FAIR calculator, and percentile exposure outputs.
- Admin: integrations, knowledge system, third-party risk, remediation playbooks, RBAC/trust controls, agent operations, service accounts, allow-lists, deny-lists, and graph mutation audit events.

## Implementation Plan

The GitHub source of truth for the implementation plan is `docs/IMPLEMENTATION_PLAN.md`. Future feature work should update that file and pass a PMO check against it before release.

## Local persistence

The app now has two local state paths:

- Governance inventory and mappings can load from the SQLite-backed API in `server/`.
- Other prototype actions still use `localStorage` through `src/store.ts` as an API-shaped state layer.

Modeled operations:

- `approveMapping`: turns AI-proposed mappings into approved or rejected graph edges.
- `ingestEvidence`: creates an evidence record and a `PROVED_BY` edge from the selected control.
- `connectIntegration`: updates integration state and records the action in the audit ledger.
- `resetWorkspace`: restores the seeded demo state.

## Backend handoff target

The local backend uses Node's built-in SQLite driver:

- `server/schema.sql`: relational data model for controls, frameworks, requirements, mappings, assets, policies, evidence blueprints, evidence items, and graph relationships.
- `server/database.js`: initialization, seed data, parameterized reads/writes.
- `server/api.js`: local HTTP API with `/api/health`, `/api/governance`, `/api/controls/:id`, and `POST /api/controls`.

The next production step is replacing remaining `src/store.ts` operations with service calls and hosting the API:

- Graph database API for controls, nodes, edges, mappings, and control health.
- Evidence API with object-locked storage references and version IDs.
- Agent orchestration API with schema validation, allow-listed mutations, and audit logging.
- FAIR risk service for simulations and risk scenario updates.
