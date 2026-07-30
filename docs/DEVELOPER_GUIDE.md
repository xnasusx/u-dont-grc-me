# Developer Guide: u dont GRC me

## Stack

- Vite
- React
- TypeScript
- CSS
- Local storage state layer in `src/store.ts`

## Key Files

- `src/App.tsx`: UI modules, navigation, and workflows.
- `src/data.ts`: seeded product data.
- `src/store.ts`: API-shaped local persistence and graph mutation operations.
- `src/types.ts`: domain model.
- `src/utils.ts`: formatting, health scoring, and Monte Carlo helper.
- `src/styles.css`: visual system and responsive layout.

## Run

```powershell
npm install
npm run dev -- --port 5173
```

## Build

```powershell
npm run build
```

## Architecture Notes

The UI is organized around business workflow areas:

- **Command Center**: executive overview, dashboards, charts, Monte Carlo.
- **Governance**: controls and documentation.
- **Compliance**: audit readiness, evidence, approvals.
- **Risk**: risk register and FAIR.
- **Admin**: integrations, agents, operational ledger.

`src/store.ts` should be replaced with API calls when a backend exists. Keep its function boundaries as the first service contract:

- `approveMapping`
- `ingestEvidence`
- `connectIntegration`
- `resetWorkspace`

## Security Notes

- Do not store real evidence, secrets, regulated data, or customer data in `localStorage`.
- Do not connect live AI agents directly to a graph database. Keep allow-listed mutation APIs between agents and data stores.
- Use environment variables and cloud-native secret storage for future API keys.
