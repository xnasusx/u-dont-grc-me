# Release Notes

## Version 0.6.1

This release aligns the hosted frontend with Susan's GitHub Pages URL and folds the NotebookLM CRQ/FAIR research into the product.

### Highlights

- GitHub Pages is now documented as the primary frontend: https://xnasusx.github.io/u-dont-grc-me/
- The Pages workflow builds with the hosted Governance API URL, so it no longer needs seeded Governance fallback.
- Lambda Function URL CORS now allows the GitHub Pages origin.
- The garden logo asset now has a transparent background.
- Risk now includes richer CRQ mechanics: A-T-E scenario scope, FAIR-CAM labels, 10,000-trial simulation, five-number summary, expected value, six loss forms, evidence nutrition labels, and human approval gates.

### Still Pending

- Public hosted writes remain disabled until authentication, tenant isolation, authorization, validation, and mutation audit logging are implemented.
- The CRQ simulator is still a deterministic prototype, not a production FAIR analysis service.

## Version 0.6.0

This release removes the CloudFront seeded-data limitation for Governance by adding a hosted AWS API.

### Highlights

- CloudFront now calls a hosted Lambda Function URL for Governance data.
- DynamoDB stores the Governance snapshot used by the hosted API.
- Public hosted writes are disabled until authenticated mutation workflows are implemented.
- The garden logo no longer renders with a black CSS background.
- Risk now includes a CRQ workbench with histogram, loss exceedance, calibration, data-vetting, and SME elicitation views inspired by Heatmaps-to-Histograms materials.

### Hosted API

- Function URL: https://fvtqz3hs2ohvappyrcya2oats40sodrc.lambda-url.us-east-1.on.aws
- DynamoDB table: `u-dont-grc-me-governance`
- Lambda function: `u-dont-grc-me-governance-api`

### Still Pending

- Authentication, tenant isolation, write authorization, mutation audit logging, and real evidence storage must be added before real GRC data is stored.
- NotebookLM notebook URLs were later checked through Susan's signed-in Chrome session in 0.6.1 and incorporated into the CRQ/Fair workbench.

## Version 0.4.1

This release adds a GitHub Pages static mirror while preserving the existing AWS CloudFront deployment.

### Highlights

- Added a GitHub Actions workflow that builds and deploys `dist/` to GitHub Pages.
- Made the Vite base path conditional so Pages uses `/u-dont-grc-me/` and AWS keeps `/`.
- Updated public asset paths so the favicon and logo load correctly from both hosts.

### Hosted URLs

- AWS CloudFront: https://d1oxsqx3ua8bb7.cloudfront.net
- GitHub Pages mirror: https://xnasusx.github.io/u-dont-grc-me/

### Deployment Note

The workflow requests GitHub Pages enablement automatically. If GitHub blocks first-run enablement, set Pages to `Source: GitHub Actions` in the repository settings.

## Version 0.4.0

This release starts the real control-inventory foundation.

### Highlights

- Governance now has a top-tab module layout.
- Control inventory is backed by a local SQLite database and API in development.
- Controls map to framework requirements through first-class mapping rows instead of only seeded arrays.
- Evidence health, blueprint automation, policies, assets, and graph relationships now hang off the selected control record.

### Hosted URL

The CloudFront URL remains the active hosted static prototype:

https://d1oxsqx3ua8bb7.cloudfront.net

### Backend Note

The SQLite API is local for now. The CloudFront deployment still uses the seeded fallback until an API is deployed behind AWS.

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
