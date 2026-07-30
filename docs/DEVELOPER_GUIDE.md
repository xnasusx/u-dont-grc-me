# Developer Guide: u dont GRC me

## Stack

- Vite
- React
- TypeScript
- CSS
- Node HTTP API
- Node built-in SQLite (`node:sqlite`)
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
- `server/database.test.js`: API/database behavior tests.
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

## Build

```powershell
npm run build
npm test
```

## Architecture Notes

The UI is organized around business workflow areas:

- **Command Center**: executive overview, dashboards, charts, Monte Carlo.
- **Governance**: SQLite-backed control inventory, top tabs, graph explorer, framework mapper, evidence health, policies, assets, and documentation.
- **Compliance**: audit readiness, package assembly, evidence, approvals.
- **Risk**: risk register and FAIR.
- **Admin**: integrations, knowledge system, third-party risk, remediation, RBAC, agents, operational ledger.

`src/store.ts` should be replaced with API calls when a backend exists. Keep its function boundaries as the first service contract:

- `approveMapping`
- `ingestEvidence`
- `connectIntegration`
- `resetWorkspace`

## Security Notes

- Do not store real evidence, secrets, regulated data, or customer data in `localStorage`.
- Do not connect live AI agents directly to a graph database. Keep allow-listed mutation APIs between agents and data stores.
- Use environment variables and cloud-native secret storage for future API keys.
