# Developer Guide: u dont GRC me

## Stack

- Vite
- React
- TypeScript
- CSS
- Node HTTP API
- Node built-in SQLite (`node:sqlite`)
- AWS Lambda Function URL
- DynamoDB hosted Governance snapshot
- Local storage state layer in `src/store.ts`

## Key Files

- `src/App.tsx`: UI modules, navigation, and workflows.
- `src/data.ts`: seeded product data.
- `src/store.ts`: API-shaped local persistence and graph mutation operations.
- `src/governanceApi.ts`: Governance API client with static fallback.
- `src/types.ts`: domain model.
- `src/utils.ts`: formatting, health scoring, and Monte Carlo helper.
- `src/styles.css`: visual system and responsive layout.
- `server/schema.sql`: SQLite schema for the control inventory foundation.
- `server/database.js`: database initialization, seeding, reads, and parameterized writes.
- `server/api.js`: local Governance API.
- `server/lambda.js`: hosted read-only Governance API.
- `server/governance-seed-snapshot.json`: generated hosted seed snapshot.
- `server/database.test.js`: API/database behavior tests.
- `server/lambda.test.js`: hosted API route tests.
- `scripts/export-governance-snapshot.js`: exports the local SQLite snapshot for hosted seed data.
- `scripts/package-lambda.ps1`: builds the Lambda deployment zip.
- `infra/`: IAM trust and scoped Lambda policy documents.
- `docs/IMPLEMENTATION_PLAN.md`: GitHub source of truth for PMO scope, phase status, and pending production work.

## Run

```powershell
npm install
npm run dev:full
```

Static UI only:

```powershell
npm run dev -- --port 5173
```

API only:

```powershell
npm run api
```

Package hosted API:

```powershell
npm run package:lambda
```

## Build

```powershell
npm run build
npm test
```

## Architecture Notes

The UI is organized around business workflow areas:

- **Command Center**: executive overview, dashboards, charts, Monte Carlo.
- **Governance**: local SQLite and hosted DynamoDB/Lambda-backed control inventory, top tabs, graph explorer, framework mapper, evidence health, policies, assets, and documentation.
- **Compliance**: audit readiness, package assembly, evidence, approvals.
- **Risk**: risk register, FAIR, Monte Carlo histogram, loss exceedance, data vetting, calibration, and SME elicitation.
- **Admin**: integrations, knowledge system, third-party risk, remediation, RBAC, agents, operational ledger.

`src/store.ts` should be replaced with API calls when a backend exists. Keep its function boundaries as the first service contract:

- `approveMapping`
- `ingestEvidence`
- `connectIntegration`
- `resetWorkspace`

The hosted Lambda currently exposes read-only routes:

- `GET /api/health`
- `GET /api/governance`

`POST /api/controls` returns `405` in hosted mode until auth, tenant scoping, validation, and mutation audit logging are implemented.

## Security Notes

- Do not store real evidence, secrets, regulated data, or customer data in `localStorage`.
- Do not connect live AI agents directly to a graph database. Keep allow-listed mutation APIs between agents and data stores.
- Use environment variables and cloud-native secret storage for future API keys.
