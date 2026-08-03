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

To package the hosted API Lambda:

```powershell
npm run package:lambda
```

## Hosted Prototype

Primary frontend on GitHub Pages:

https://xnasusx.github.io/u-dont-grc-me/

AWS CloudFront mirror:

https://d1oxsqx3ua8bb7.cloudfront.net

CloudFront origin bucket is intentionally private/blocked:

http://u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1.s3-website-us-east-1.amazonaws.com

Hosted Governance API:

https://fvtqz3hs2ohvappyrcya2oats40sodrc.lambda-url.us-east-1.on.aws

The hosted API is backed by DynamoDB for the Governance snapshot and is read-only from the public app until authenticated mutation workflows are added.

## Build

```powershell
npm run build
```

GitHub Pages builds set `GITHUB_PAGES=true` and `VITE_API_BASE_URL` so Vite emits assets under `/u-dont-grc-me/` and loads Governance data from the hosted Lambda/DynamoDB API. The default build stays rooted at `/` for CloudFront/S3.

## Current Product Slice

- Command Center: executive metrics, global filters, saved dashboard views, chart creation, and Monte Carlo scenario simulation.
- Governance: API-backed control inventory, module tabs, control detail, framework mapping matrix, evidence health, blueprint library, policy traceability, asset scope, graph data model rules, and control-adjacent graph view.
- Compliance: audit readiness, audit package assembly, AI approval queue, evidence review simulator, immutable-reference metadata, and `PROVED_BY` graph edges.
- Risk: risk register, control-linked FAIR scenarios, 10,000-trial Monte Carlo calculator, histogram, five-number summary, expected value, loss exceedance view, evidence nutrition labels, calibration anchors, data-vetting checklist, SME elicitation, and human approval controls.
- Admin: integrations, knowledge system, third-party risk, nth-party discovery, remediation playbooks, SaaS hardening library, RBAC/trust controls, agent operations, service accounts, allow-lists, deny-lists, and graph mutation audit events.

## Upstream open source content

Two MIT-licensed GRC Engineering projects feed the Admin views. Both are synced by
script into generated modules that are committed, so the hosted build needs no network
access at runtime. See `THIRD-PARTY-NOTICES.md` for attribution.

### SaaS Hardening Library (how-to-harden)

```powershell
npm run sync:hardening
```

Pulls [how-to-harden](https://github.com/grcengineering/how-to-harden) at a pinned commit
and generates `src/hardeningData.ts` (121 platforms, 1,334 controls). Two upstream tiers
are joined and labelled distinctly in the UI:

- **Control packs** (`packs/<vendor>/controls/*.yaml`) - full definitions with SOC 2 /
  NIST 800-53 / ISO 27001 / PCI DSS citations, machine-readable audit checks, and
  API/Terraform remediation. Upstream currently ships these for GitHub and Okta only.
- **Guide sections** (`docs/_guides/*.md`) - heading, profile level, and framework
  citations for the remaining platforms.

Artifact availability per control (terraform / api / cli / siem / db / sdk / config) is
derived from the upstream pack tree, so a control with a Terraform pack can be treated as
`Fully Automated` rather than `Manual`. Pack bodies are not vendored.

The generated module is ~1.7MB, so it is dynamically imported and code-split out of the
initial bundle; it loads only when the Admin view renders.

Bump `REF` in `scripts/sync-hardening-packs.mjs` (or set `HOW_TO_HARDEN_REF`) to track a
newer upstream commit.

### Nth-Party Discovery (nthpartyfinder)

```powershell
npm run sync:nthparty
```

Ingests [nthpartyfinder](https://github.com/grcengineering/nthpartyfinder) scan output into
`src/nthPartyData.ts`, surfacing 3rd/4th/Nth-party vendor relationships discovered from
public DNS, certificate transparency, trust-center subprocessor pages, and web traffic.

List authorized domains in `data/nth-party/targets.json`:

```json
{ "targets": [{ "domain": "example.com", "depth": 1, "timeoutSeconds": 1800 }] }
```

If the `nthpartyfinder` binary is on PATH (`brew install nthpartyfinder`,
`cargo install nthpartyfinder`, or the Docker image) the script scans each target and
writes `data/nth-party/<domain>.scan.json`. Otherwise it ingests whatever `*.scan.json`
files are already there, so scans run elsewhere can simply be committed. The panel shows
an empty state until a scan lands.

Only scan domains you are authorized to assess.

## Implementation Plan

The GitHub source of truth for the implementation plan is `docs/IMPLEMENTATION_PLAN.md`. Future feature work should update that file and pass a PMO check against it before release.

## Local persistence

The app now has local and hosted state paths:

- Governance inventory and mappings load from the hosted Lambda/DynamoDB API on CloudFront and from the SQLite-backed API in local `dev:full` mode.
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
- `server/lambda.js`: hosted read-only Lambda API for `/api/health` and `/api/governance`.
- `server/governance-seed-snapshot.json`: generated seed snapshot stored in DynamoDB on first hosted read.
- `scripts/package-lambda.ps1`: reproducible Lambda package build.

The next production step is replacing remaining `src/store.ts` operations with authenticated service calls:

- Graph database API for controls, nodes, edges, mappings, and control health.
- Evidence API with object-locked storage references and version IDs.
- Agent orchestration API with schema validation, allow-listed mutations, and audit logging.
- FAIR risk service for simulations and risk scenario updates.
