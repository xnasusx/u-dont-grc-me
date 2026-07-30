# u dont GRC me

A control-centric GRC product prototype. The app treats controls as the primary source of truth and maps assets, frameworks, evidence, risks, integrations, and AI agent decisions around each control.

## Run locally

```powershell
npm install
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173/.

## Hosted Prototype

AWS S3 static website:

http://u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1.s3-website-us-east-1.amazonaws.com

## Build

```powershell
npm run build
```

## Current Product Slice

- Command Center: executive metrics, global filters, saved dashboard views, chart creation, and Monte Carlo scenario simulation.
- Governance: documentation workspace, control library, owner/status metadata, KPIs/KRIs, requirements, and a control-adjacent graph view.
- Compliance: audit readiness, AI approval queue, evidence review simulator, immutable-reference metadata, and `PROVED_BY` graph edges.
- Risk: risk register, control-linked scenarios, FAIR calculator, and percentile exposure outputs.
- Admin: integrations, agent operations, service accounts, allow-lists, deny-lists, and graph mutation audit events.

## Local persistence

The app currently uses `localStorage` through `src/store.ts` as an API-shaped state layer. This keeps demo actions persistent across refreshes without committing to a backend too early.

Modeled operations:

- `approveMapping`: turns AI-proposed mappings into approved or rejected graph edges.
- `ingestEvidence`: creates an evidence record and a `PROVED_BY` edge from the selected control.
- `connectIntegration`: updates integration state and records the action in the audit ledger.
- `resetWorkspace`: restores the seeded demo state.

## Backend handoff target

The next production step is replacing `src/store.ts` with real service calls:

- Graph database API for controls, nodes, edges, mappings, and control health.
- Evidence API with object-locked storage references and version IDs.
- Agent orchestration API with schema validation, allow-listed mutations, and audit logging.
- FAIR risk service for simulations and risk scenario updates.
