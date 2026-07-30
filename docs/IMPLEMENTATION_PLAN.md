# u dont GRC me Implementation Plan

Last updated: 2026-07-30
Plan owner: Codex PMO
Source of truth: this GitHub-tracked file
Original draft source: Google Doc `Control-Centric GRC Tool Implementation Plan`

## Operating Rule

Future feature work for `u dont GRC me` must update this file in the same pull request or commit as the implementation. PMO checks should compare new work against this plan before implementation, at the end of each phase, and before final release.

## Product Thesis

`u dont GRC me` is a control-centric GRC platform. Controls are the system of record. Frameworks, assets, evidence, vendors, policies, risks, AI decisions, remediation workflows, and audit packages connect back to controls through explainable graph relationships.

## Current Implementation Status

The repository currently contains a static React/Vite product prototype with browser-local persistence. It implements product surfaces and deterministic demo workflows, but it does not yet include a production backend, real tenant isolation, live AWS integrations, live AI orchestration, Amazon Neptune, or S3 Object Lock evidence storage.

Hosted prototype: https://d1oxsqx3ua8bb7.cloudfront.net

## Phase Status

| Phase | Draft-plan goal | Current status | Evidence | Remaining production work |
| --- | --- | --- | --- | --- |
| 0. Discovery and Charter | Lock scope, personas, primary framework, architecture posture | Done for prototype | `README.md`, `PLANS.md`, this file | Formal PRD, threat model, ADR set, stakeholder approvals |
| 1. Control Center Foundation | Graph-backed system of record | Prototype done | `src/App.tsx`, `src/data.ts`, `src/types.ts` | Real graph API, CRUD, tenant filters, persisted control graph |
| 2. Evidence and First Integrations | Continuous evidence collection and immutable proof | Prototype surface done | Evidence simulator, integration cards, immutable metadata fields | Signed webhook API, HMAC validation, S3 Object Lock, live AWS/IAM connectors |
| 3. Framework Mapping and Approvals | Import requirements, propose mappings, human approvals | Prototype done | Framework mapper, approvals queue, coverage matrix | Upload/import pipeline, vector retrieval, mapping evaluation tests |
| 4. FAIR Risk Engine | Quantitative risk scenarios and Monte Carlo | Prototype done | FAIR register and Monte Carlo lab | Backend simulation service, reproducible assumption storage, appetite governance |
| 5. TPRM and Policy Workflows | Vendors and documents connected to controls | Prototype done | Vendor risk panel, policy library, document generator | SOC 2 parsing, vendor intake workflow, versioned document approval |
| 6. Remediation and Scale Hardening | Safe playbooks, HITL execution, rollback evidence | Prototype surface done | Remediation queue, RBAC matrix, agent guardrails | Workflow engine, approvals enforcement, rollback capture, monitoring |

## Implemented Product Capabilities

- Command Center with global filters, metrics, saved views, chart creation, and Monte Carlo simulator.
- Governance workspace with control library, control detail, graph explorer, framework mapper, policy traceability, and graph data model rules.
- Compliance workspace with audit readiness, audit package assembly, AI approval queue, evidence validation simulator, and evidence library.
- Risk workspace with control-linked risk register and FAIR scenario lab.
- Admin workspace with integrations, AI knowledge system, third-party risk, remediation playbooks, RBAC matrix, trust UX checks, agent lifecycle metrics, allow-lists, deny-lists, and mutation ledger.
- Documentation set for users, developers, deployment, security, changelog, release notes, and contribution workflow.
- Private GitHub repository and CloudFront deployment behind a private S3 origin.

## Not Yet Done

- Production authentication, SSO, tenant isolation, and authorization middleware.
- Amazon Neptune-backed property graph with Gremlin or openCypher API.
- S3 Object Lock bucket configured as the real evidence store with legal retention policy.
- API Gateway or service middleware for schema validation, idempotency, HMAC webhook verification, tenant scoping, and AI action allow-lists.
- Live integrations for AWS Security Hub, AWS Config, CloudTrail, IAM Access Analyzer, Okta or Entra ID, vulnerability scanners, workflow tools, and vendor portals.
- Real AI orchestration service with structured outputs, prompt/version metadata, evaluation harness, and immutable cognitive audit logs.
- Vector/RAG index keyed by graph identifiers.
- Production FAIR microservice with 10,000-plus iteration runs, sensitivity drivers, assumption-set persistence, and appetite breach alerts.
- Full test suite for schemas, graph integrity, tenant leaks, prompt injection, replay attacks, fake evidence, and operational failure modes.
- Day 2 runbooks for connector failures, evidence sync failures, model rollback, graph repair, support ownership, BCP/DR, RPO, and RTO.

## Acceptance Criteria

A feature is done only when it:

- Connects back to one or more controls.
- Preserves tenant and role boundaries in its data model and eventual API contract.
- Records human and AI decisions in an auditable way.
- Shows user-visible error, pending, blocked, or approval states where relevant.
- Has documentation updated in this file and any affected user/developer docs.
- Has build and browser validation evidence before release.

## PMO Checkpoints

- Before work starts: identify affected phase, tasks, deliverables, risks, and acceptance criteria in this file.
- After each phase: mark done, pending, or blocked with evidence.
- Before release: compare `src/`, `docs/`, `README.md`, `CHANGELOG.md`, `RELEASE_NOTES.md`, deployment state, and GitHub status against this file.
- After release: update validation history in `PLANS.md` and keep this file aligned with the next backlog.

## Next Recommended Backlog

| Priority | Item | Why |
| --- | --- | --- |
| P0 | Add backend contract tests and API schema definitions | Needed before real integrations or evidence writes |
| P0 | Design tenant/RBAC middleware and data isolation tests | Prevents unsafe architecture drift |
| P1 | Add graph schema and migration plan for Neptune | Converts prototype state into the intended system of record |
| P1 | Implement signed telemetry envelope endpoint | Enables AWS/IAM evidence ingestion |
| P1 | Add evidence object metadata service | Required for immutable audit packages |
| P2 | Build framework import workflow | Turns framework mapper from seeded data into real workflow |
| P2 | Add vendor assessment intake and document parsing queue | Expands TPRM beyond static demo data |
| P2 | Add AI evaluation fixtures and prompt-injection tests | Required for governed AI workflows |
