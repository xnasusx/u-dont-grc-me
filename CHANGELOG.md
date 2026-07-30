# Changelog

## 0.6.0 - 2026-07-30

- Added hosted Governance API on AWS Lambda Function URL backed by DynamoDB.
- Added Lambda packaging, seed snapshot export, scoped IAM policy files, and hosted API tests.
- Built the CloudFront frontend with `VITE_API_BASE_URL` so Governance loads from the hosted API instead of seeded browser fallback.
- Kept hosted mutations disabled until authentication and audit-safe write workflows are added.
- Removed the black CSS background behind the garden logo so the transparent PNG renders correctly.
- Expanded Risk with a CRQ workbench inspired by Heatmaps-to-Histograms: Monte Carlo histogram, loss exceedance view, data vetting, calibration anchors, and SME chip-and-bin elicitation.

## 0.4.0 - 2026-07-30

- Added a SQLite-backed local API for Governance control inventory and mappings.
- Added relational schema for controls, frameworks, requirements, mappings, assets, policies, evidence blueprints, evidence items, and graph relationships.
- Expanded seeded control inventory to 12 controls, 7 frameworks, and 16 mappings.
- Rebuilt Governance as a module page with top tabs: Control Inventory, Mappings, Evidence Health, Policies, Assets, and Graph.
- Added API/database tests and a `dev:full` script to run the API plus Vite UI together.
- Added static fallback so CloudFront remains usable until an API is hosted.

## 0.3.0 - 2026-07-30

- Added GitHub-tracked implementation plan source of truth in `docs/IMPLEMENTATION_PLAN.md`.
- Added Governance framework mapper, coverage matrix, policy traceability, and control graph data model rules.
- Added Compliance audit package assembly workflow.
- Added Admin knowledge system, third-party risk, remediation playbooks, RBAC matrix, and trust UX checks.
- Expanded seeded data model for requirements, vendors, policies, remediation, RBAC, and graph-grounded knowledge answers.
- Updated README and guides to align with the Google Doc implementation plan.

## 0.2.0 - 2026-07-30

- Renamed the product to `u dont GRC me`.
- Applied supplied color palette and product logo.
- Reorganized navigation into Command Center, Governance, Compliance, Risk, and Admin.
- Added saved dashboard views and chart creation affordance.
- Moved Monte Carlo simulation into Command Center and Risk workflows.
- Added audit readiness summary.
- Added risk register.
- Added Admin summary, integrations, AI agent controls, and mutation ledger.
- Added user and developer documentation.

## 0.1.0 - 2026-07-30

- Created initial React/Vite prototype.
- Added control-centered dashboard, graph view, approval queue, evidence simulator, FAIR lab, integrations, agents, and docs editor.
- Added local persistence layer.
