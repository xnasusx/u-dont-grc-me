# Release Notes

## Version 0.3.0

This release reconciles the Google Doc implementation plan with the product prototype and makes the GitHub plan the source of truth.

### Highlights

- Added the tracked implementation plan at `docs/IMPLEMENTATION_PLAN.md`.
- Expanded Governance with framework coverage, mapping gaps, policy traceability, and graph rules.
- Expanded Compliance with audit package assembly and export readiness.
- Expanded Admin with read-only knowledge answers, vendor risk, remediation playbooks, RBAC, and trust UX controls.

### Still Pending

- Production backend, authentication, real integrations, Neptune, S3 Object Lock evidence storage, and live AI orchestration remain future implementation work.

## Version 0.2.0

`u dont GRC me` now has a product structure that better matches how GRC teams work day to day.

### Highlights

- A new branded UI using the supplied palette and logo.
- A simplified left navigation: Command Center, Governance, Compliance, Risk, and Admin.
- Command Center now includes metrics, saved views, chart creation, and Monte Carlo simulation.
- Compliance now emphasizes audit readiness, evidence review, and human approval of AI-proposed changes.
- Risk now includes a register plus FAIR-style calculator.
- Admin now rolls up integrations, agent governance, and operational audit logs.
- Static AWS hosting is live behind CloudFront with Origin Access Control.

### Hosted URL

https://d1oxsqx3ua8bb7.cloudfront.net

### Known Limitations

- Data is still local to the browser.
- No production backend, authentication, cloud evidence storage, or live AI orchestration exists yet.
- AWS deployment, if enabled, is static hosting only for this release.
