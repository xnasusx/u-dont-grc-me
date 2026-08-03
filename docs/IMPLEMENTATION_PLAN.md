# u dont GRC me Implementation Plan

Last updated: 2026-07-30 10:02 ET
Plan owner: Codex PMO
Source of truth: this GitHub-tracked file
Original draft source: Google Doc `Control-Centric GRC Tool Implementation Plan`

## Operating Rule

Future feature work for `u dont GRC me` must update this file in the same pull request or commit as the implementation. PMO checks should compare new work against this plan before implementation, at the end of each phase, and before final release.

## Product Thesis

`u dont GRC me` is a control-centric GRC platform. Controls are the system of record. Frameworks, assets, evidence, vendors, policies, risks, AI decisions, remediation workflows, and audit packages connect back to controls through explainable graph relationships.

## Current Implementation Status

The repository currently contains a React/Vite product prototype with browser-local persistence for simulated workflows, a local SQLite Governance API with editable test data, and a hosted read-only Governance API backed by DynamoDB. It implements product surfaces, database-backed control edits for local testing, optional local write-token guardrails, tenant-context validation, mutation audit logging, FAIR assumption management/version history in Admin, persisted FAIR simulation runs with approval states for local testing, modal drilldowns, and deterministic demo workflows, but it does not yet include production SSO, full RBAC, live AWS integrations, live AI orchestration, Amazon Neptune, or S3 Object Lock evidence storage.

Primary hosted frontend: https://xnasusx.github.io/u-dont-grc-me/
AWS CloudFront mirror: https://d1oxsqx3ua8bb7.cloudfront.net
Hosted Governance API: https://fvtqz3hs2ohvappyrcya2oats40sodrc.lambda-url.us-east-1.on.aws

## Phase Status

| Phase | Draft-plan goal | Current status | Evidence | Remaining production work |
| --- | --- | --- | --- | --- |
| 0. Discovery and Charter | Lock scope, personas, primary framework, architecture posture | Done for prototype | `README.md`, `PLANS.md`, this file | Formal PRD, threat model, ADR set, stakeholder approvals |
| 1. Control Center Foundation | Graph-backed system of record | Local editable API with write guardrails in place; hosted read API in place | `server/schema.sql`, `server/database.js`, `server/api.js`, `server/lambda.js`, DynamoDB table `u-dont-grc-me-governance`, `src/App.tsx`; browser smoke `output/v0.8-traceability-smoke.png` | Production SSO/RBAC, hosted write workflow, production graph database |
| 1A. Open-Source GRC Integration | Bring proven open-source GRC workflows into the control-centric model | Planned and first slice in progress | GitHub issue, `output/design-open-source-grc-integration.md`, `output/plan-open-source-grc-integration.md` | Program workbench, framework import pipeline, assessments, account reviews, vendor questionnaires, hardening guide backlog |
| 2. Evidence and First Integrations | Continuous evidence collection and immutable proof | Prototype surface done | Evidence simulator, integration cards, immutable metadata fields | Signed webhook API, HMAC validation, S3 Object Lock, live AWS/IAM connectors |
| 3. Framework Mapping and Approvals | Import requirements, propose mappings, human approvals | Prototype done | Framework mapper, approvals queue, coverage matrix | Upload/import pipeline, vector retrieval, mapping evaluation tests |
| 4. FAIR Risk Engine | Quantitative risk scenarios and Monte Carlo | Local FAIR assumption database, version history, persisted run records, and admin approval queue complete for testing | FAIR register, `fair_scenario_parameters`, `fair_scenario_versions`, `fair_simulation_runs`, Admin FAIR database and lineage, 10,000-trial Monte Carlo lab, histogram, five-number summary, expected value, loss exceedance, evidence nutrition labels, calibration, data vetting, SME elicitation, approval gates, browser smoke `output/v0.9-simulation-run-smoke.png` | Hosted simulation service, production approval workflow, SSO/RBAC enforcement, appetite governance, trend analytics |
| 5. TPRM and Policy Workflows | Vendors and documents connected to controls | Prototype done | Vendor risk panel, policy library, document generator | SOC 2 parsing, vendor intake workflow, versioned document approval |
| 6. Remediation and Scale Hardening | Safe playbooks, HITL execution, rollback evidence | Prototype surface done | Remediation queue, RBAC matrix, agent guardrails | Workflow engine, approvals enforcement, rollback capture, monitoring |

## Implemented Product Capabilities

- Command Center with global filters, metrics, saved views, chart creation, and Monte Carlo simulator.
- Governance workspace with SQLite-backed control inventory, top tabs, control detail, graph explorer, framework mapper, policy traceability, evidence health, blueprint library, asset scope, and graph data model rules.
- Governance control metadata editing for local testing, including owner, implementation status, testing cadence, and evidence health factors saved through `PATCH /api/controls/:id`.
- Drilldown pop-up windows from Governance inventory, showing mappings, assets, evidence, and FAIR assumptions without losing the current workspace context.
- Local write guardrails for testing: optional `GRC_WRITE_TOKEN`, actor and tenant headers, tenant-scope validation, allowlisted mutation fields, and mutation audit log.
- Compliance workspace with audit readiness, audit package assembly, AI approval queue, evidence validation simulator, and evidence library.
- Risk workspace with control-linked risk register and FAIR scenario lab.
- Admin FAIR database for local testing, backed by SQLite `fair_scenario_parameters`, where dollar ranges, annualized frequency, vulnerability percentage, control strength, loss magnitude reduction, appetite threshold, data quality, confidence, and source notes can be managed.
- Admin FAIR lineage view, backed by SQLite `fair_scenario_versions`, showing assumption version history and mutation audit events after local writes.
- Persisted FAIR simulation runs for local testing, backed by SQLite `fair_simulation_runs`, with backend-computed P10/P50/P90/expected loss, appetite breach probability, sensitivity driver, linked assumption version, requested-by metadata, and Admin approve/reject workflow.
- CRQ workbench with scoped asset/threat/method/effect fields, FAIR-CAM function labels, 10,000-trial Monte Carlo, histogram, five-number summary, expected value, loss exceedance, evidence nutrition labels, calibration anchors, data-vetting checklist, SME chip-and-bin elicitation, and human approval gates inspired by NotebookLM and Heatmaps-to-Histograms resources.
- Admin workspace with integrations, AI knowledge system, third-party risk, remediation playbooks, RBAC matrix, trust UX checks, agent lifecycle metrics, allow-lists, deny-lists, and mutation ledger.
- Documentation set for users, developers, deployment, security, changelog, release notes, and contribution workflow.
- Private GitHub repository, GitHub Pages primary frontend, CloudFront deployment behind a private S3 origin, and hosted Lambda/DynamoDB Governance API.

## External Source Notes

- Heatmaps-to-Histograms downloads were accessible and informed the CRQ workbench: heatmap-to-histogram comparison, Monte Carlo simulations, loss exceedance curves, five-number summaries, calibration, data vetting, SME elicitation, scenario coaching, and FAIR taxonomy concepts.
- NotebookLM notebooks were readable through Susan's signed-in Chrome session on 2026-07-30. The FAIR methodology notebook informed risk scenario schema, control efficacy, FAIR-CAM function labels, variance management, evidence health, and dashboard outputs. The Heatmaps-to-Histograms notebook informed A-T-E scenario fields, six loss forms, evidence nutrition labels, P5/P50/P95 assumptions, 10,000-trial simulations, five-number summaries, loss exceedance statements, data-quality multipliers, and human approval gates.

## Open-Source GRC Integration Wave

Research completed on 2026-07-30 reviewed the user-provided sources:

- GRC Engineering repositories: `gigachad-grc`, `grcengineering.github.io`, `companion`, `how-to-harden`, `nthpartyfinder`, and `cheatsheet`.
- Eramba: community/free GRC, risk, compliance, account reviews, policies, assessments, access controls, activity logs, tagging, forms, API, and notifications.
- OpenGRC: standards, controls, implementations, audits, reports, risk tracking, policy lifecycle, and traceability.
- CISO Assistant Community: broad GRC domains, 150+ framework/library coverage, automatic control mapping, TPRM, privacy, reporting, and framework library tooling.
- Gapps: multi-tenant projects, 10+ frameworks, 2000+ controls, evidence upload, auditor collaboration, risk register, and vendor questionnaires.

### Integration Priorities

| Priority | Capability | Source pattern | `u dont GRC me` implementation path |
| --- | --- | --- | --- |
| P0 | Program/project containers | Gapps multi-tenancy and projects | Add `program_projects` to group frameworks, controls, owners, and evidence progress by tenant/program |
| P0 | Framework library intake | CISO Assistant libraries and OpenGRC imports | Add `framework_imports` queue with validation, mapping state, and candidate controls |
| P0 | Assessment execution | Eramba/OpenGRC audits and assessments | Add `assessment_runs` tied to frameworks and control scope |
| P1 | Account review operations | Eramba account reviews | Add `account_reviews` with source systems, overdue counts, and mapped controls |
| P1 | Vendor questionnaires | Gapps questionnaires and CISO TPRM | Add `vendor_questionnaires` tied to vendor risk and relied-upon controls |
| P1 | Integration hardening backlog | GRC Engineering hardening/nth-party guidance | Add `hardening_guides` to track first-party controls for SaaS and integration risk |
| P2 | Import parser | CISO Assistant library tools | Build import preview and schema validation before framework writes |
| P2 | Auditor collaboration package | Gapps and OpenGRC audit reports | Add package review workflow with auditor-visible gaps and evidence locks |
| P2 | Custom views/tagging | Eramba data views and tagging | Add saved filters/tags against controls, assessments, vendors, and imports |

### First Build Slice

The first implementation slice is a Governance `Program Workbench` backed by SQLite and included in `/api/governance`. It will make the roadmap visible in the product while preserving the current prototype boundary: no live imports, no live account review connectors, and no real vendor questionnaire sending until authenticated services exist.

## Not Yet Done

- Production authentication, SSO, tenant isolation, and authorization middleware.
- Hosted authenticated write API and Amazon Neptune-backed property graph with Gremlin or openCypher API.
- S3 Object Lock bucket configured as the real evidence store with legal retention policy.
- API Gateway or service middleware for schema validation, idempotency, HMAC webhook verification, tenant scoping, and AI action allow-lists.
- Live integrations for AWS Security Hub, AWS Config, CloudTrail, IAM Access Analyzer, Okta or Entra ID, vulnerability scanners, workflow tools, and vendor portals.
- Real AI orchestration service with structured outputs, prompt/version metadata, evaluation harness, and immutable cognitive audit logs.
- Vector/RAG index keyed by graph identifiers.
- Production FAIR microservice with hosted simulation execution, formal SSO/RBAC approval workflow, appetite breach alerts, trend analytics, and audit-ready assumption/run lineage.
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

Market scan on 2026-07-30 supports prioritizing production-safe write workflows, continuous controls monitoring, reusable evidence, vendor risk automation, AI-assisted workflow governance, and transparent FAIR/CRQ assumptions before adding cosmetic dashboard breadth.

| Priority | Item | Why |
| --- | --- | --- |
| P0 | Add authenticated hosted write workflows for Governance | Local write guardrails now exist; production needs SSO/RBAC, durable authorization policies, hosted mutation audit logs, and tenant isolation before hosted writes are safe |
| P0 | Add backend contract tests and API schema definitions | Needed before real integrations or authenticated evidence writes |
| P0 | Design tenant/RBAC middleware and data isolation tests | Prevents unsafe architecture drift |
| P1 | Add graph schema and migration plan for Neptune | Converts SQLite/API-shaped prototype state into the intended system of record |
| P1 | Add hosted FAIR approval workflow and trend analytics | Local persisted runs now exist; production needs SSO/RBAC decisions, appetite breach notifications, run comparison, and trend reporting |
| P1 | Implement signed telemetry envelope endpoint | Enables AWS/IAM evidence ingestion |
| P1 | Add evidence object metadata service | Required for immutable audit packages |
| P1 | Add vendor risk intake and continuous reassessment workflow | Current market direction emphasizes TPRM automation, evidence collection, and vendor posture signals |
| P2 | Add AI agent evaluation harness and prompt-injection tests | AI GRC features are becoming table stakes, but trust depends on measurable guardrails |
| P2 | Build framework import workflow | Turns framework mapper from seeded data into real workflow |
| P2 | Add vendor assessment intake and document parsing queue | Expands TPRM beyond static demo data |
