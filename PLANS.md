# u dont GRC me Plan

Last updated: 2026-07-30 02:39 ET
PMO status: GREEN
Current phase: 0.6.1 GitHub Pages API alignment and CRQ source integration
Owner: Codex

## Objective

Transform the existing control-centric GRC prototype into a branded, research-informed product slice named `u dont GRC me`, using the supplied palette and logo, with a reorganized IA around Command Center, Governance, Compliance, Risk, and Admin. Keep the Google Doc implementation plan represented in GitHub as the source of truth, use PMO checks against it for future work, create operational documentation, version-control it in Susan's GitHub account, and deploy a static build to Susan's AWS account if credentials and permissions allow.

## In Scope

- Apply supplied color palette: `#C7848D`, `#F0DEE0`, `#BEB2B4`, `#7A7073`, `#3A3336`.
- Use supplied image as the tool logo.
- Reorganize left navigation into Command Center, Governance, Compliance, Risk, and Admin.
- Build product modules inspired by researched GRC tools and Susan's Google Doc implementation plan: dashboards, metrics, filters, saved views, chart creation, control library, framework mapper, graph explorer, documentation, policy traceability, audit readiness, audit package assembly, evidence, risk register, FAIR calculator, Monte Carlo simulator, third-party risk, remediation, RBAC/trust UX, knowledge query, integrations, AI agent governance, and admin audit ledger.
- Create user/developer docs, changelog, release notes, and deployment notes.
- Run build, browser/UI validation, React quality review, and AI-assisted security review.
- Create GitHub repository, commit, and push source if GitHub auth/permissions allow.
- Deploy to static hosting if credentials and permissions allow.
- Host the Governance read API so GitHub Pages and CloudFront do not rely on seeded browser fallback.

## Out Of Scope

- Production-grade multi-tenant backend, live Neptune graph, real S3 Object Lock evidence pipeline, real FAIR actuarial engine, live integrations, and real AI agent execution.
- Larger paid AWS architecture such as WAF, Neptune, Amplify, managed auth, or production evidence pipelines unless explicitly approved later.
- Handling live regulated/customer data.

## Sources

- User-provided pasted product concept and current React prototype in `C:\Users\susan\Documents\grc tool`.
- User-provided palette image: `C:\Users\susan\AppData\Local\Temp\codex-clipboard-e8d197d3-c4a4-48aa-8402-85ee99b42da4.png`.
- User-provided logo image: `C:\Users\susan\Downloads\Untitled design (2).png`.
- Research references gathered 2026-07-30:
  - Vanta: compliance, risk, proof, trust center, AI agent, issue management.
  - Drata: compliance automation, evidence collection, continuous control monitoring, enterprise GRC, multi-framework support, AI workflows.
  - Eramba: risk management, compliance management, account reviews, audits, assessments, policies, access controls.
  - OneTrust: tech risk and compliance, integrated automation, third-party management, privacy/AI governance.
  - Compyl: centralized compliance platform, workflow automation, one control library, real-time dashboards, automated evidence.
  - OpenGRC: frameworks, control implementations, risk management, compliance management, policy traceability.
  - Archer: regulatory intelligence, obligation/control/policy/evidence lineage, scenario analysis, integrated risk management.
  - Heatmaps-to-Histograms: quantitative risk communication, histograms, loss exceedance, calibration, data vetting, SME elicitation, and FAIR taxonomy resources.
  - NotebookLM URLs provided by Susan: accessed through the signed-in Chrome session and used to enrich FAIR and CRQ implementation requirements.

## Tracking

- Jira: not configured.
- GitHub: to be created after local validation.
- PMO project tracker: this file.
- Implementation plan source of truth: `docs/IMPLEMENTATION_PLAN.md`.

## Human Gates

- GitHub repo creation: user explicitly requested; proceed if authenticated.
- AWS hosting: user explicitly requested; proceed with low-cost static hosting if permissions allow; document created resources and URL.
- Production architecture upgrades or paid managed services beyond static hosting: requires later approval.

## Plan

| Phase | Task | Status | Owner | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| Research | Compare GRC platform capabilities | DONE | Codex | Search citations in final response | Used official/product pages where possible |
| Planning | Create PMO plan artifact | DONE | Codex | `PLANS.md` | This file |
| Brand/IA | Apply palette, logo, and product name | DONE | Codex | `src/styles.css`, `public/u-dont-grc-me-logo.png`, `index.html` | Used supplied assets |
| Product UI | Build Command Center | DONE | Codex | `src/App.tsx` | Metrics, filters, dashboards, saved views, chart creator, Monte Carlo |
| Product UI | Build Governance module | DONE | Codex | `src/App.tsx` | Documentation and control library |
| Product UI | Build Compliance module | DONE | Codex | `src/App.tsx` | Audit readiness, evidence, framework coverage |
| Product UI | Build Risk module | DONE | Codex | `src/App.tsx` | Risk register and FAIR calculator |
| Product UI | Build Admin module | DONE | Codex | `src/App.tsx` | Agents, integrations, audit ledger, settings |
| Product UI | Reconcile Google Doc implementation plan gaps | DONE | Codex | `src/App.tsx`, `src/data.ts`, `src/types.ts` | Added framework mapper, audit package, knowledge system, TPRM, remediation, RBAC/trust UX |
| Backend | Add local control inventory database | DONE | Codex | `server/schema.sql`, `server/database.js`, `server/api.js` | SQLite-backed Governance API with first-class mappings |
| Product UI | Rebuild Governance as tabbed module | DONE | Codex | `src/App.tsx`, `src/governanceApi.ts`, `src/styles.css` | Inventory, Mappings, Evidence Health, Policies, Assets, Graph |
| Documentation | Create GitHub implementation plan source of truth | DONE | Codex | `docs/IMPLEMENTATION_PLAN.md` | Future PMO checks must compare against this file |
| Documentation | Add user/dev docs, changelog, release notes, deployment guide | DONE | Codex | `README.md`, `docs/`, `CHANGELOG.md`, `RELEASE_NOTES.md` | Required before publishing |
| Quality | Run build, UI, React/design/security checks | DONE | Codex | command outputs, review notes | PMO validation gate |
| GitHub | Create repo, commit, push, release | DONE | Codex | `https://github.com/xnasusx/u-dont-grc-me`, release `v0.2.0` | Private repo |
| AWS | Deploy static site | DONE | Codex | `https://d1oxsqx3ua8bb7.cloudfront.net` | CloudFront + OAC, private S3 origin |
| Closure | Final PMO deliverable check | DONE | Codex | validation history and final status | Compared implementation against ask and source-of-truth plan |
| Research | Review open-source GRC references | DONE | Codex | `docs/IMPLEMENTATION_PLAN.md`, web research | Reviewed GRC Engineering, Eramba, OpenGRC, CISO Assistant, and Gapps |
| Planning | Add open-source GRC integration roadmap | DONE | Codex | `docs/IMPLEMENTATION_PLAN.md`, GitHub issue #1 | First build slice is Program Workbench |
| Backend | Add Program Workbench API data | DONE | Codex | `server/schema.sql`, `server/database.js`, tests | Projects, imports, assessments, account reviews, questionnaires, hardening guides |
| Product UI | Add Governance Program Workbench tab | DONE | Codex | `src/App.tsx`, `src/types.ts`, fallback data | Dense operational view, no fake live integrations |
| Quality | Run build/tests/review | DONE | Codex | `npm run build`, `npm test`, browser smoke | Spartan order applied manually |
| Backend | Host Governance read API | DONE | Codex | `server/lambda.js`, DynamoDB `u-dont-grc-me-governance`, Lambda Function URL | CloudFront can load Governance data from hosted API |
| Product UI | Wire CloudFront to hosted API | DONE | Codex | `VITE_API_BASE_URL`, CloudFront deployment | Static fallback no longer used on canonical CloudFront build |
| Product UI | Add CRQ workbench | DONE | Codex | `src/App.tsx`, `src/utils.ts`, `src/styles.css` | Histogram, loss exceedance, calibration, data vetting, SME elicitation |
| Brand/IA | Remove black logo background | DONE | Codex | `src/styles.css` | Transparent garden logo rendering |
| Product UI | Wire GitHub Pages to hosted API | DONE | Codex | `.github/workflows/pages.yml`, Lambda CORS | Pages build uses hosted Governance API |
| Product UI | Integrate NotebookLM CRQ and FAIR requirements | DONE | Codex | `src/App.tsx`, `src/utils.ts`, `docs/IMPLEMENTATION_PLAN.md` | A-T-E scenario, FAIR-CAM, evidence nutrition label, 10,000 trials, five-number summary, approval gates |
| Brand/IA | Replace logo with transparent-background PNG | DONE | Codex | `public/u-dont-grc-me-logo.png` | Black image background removed |

## Dependencies And Blockers

- AWS permissions may block creating S3 buckets, bucket policies, or public website access.
- 2026-07-30: AWS permissions were updated and S3 static hosting succeeded.
- 2026-07-30: Upgraded hosting to CloudFront with Origin Access Control and restored private S3 bucket access.
- GitHub repo name availability may require a fallback name.
- Hosted Governance read API exists; authenticated production writes remain blocked.
- NotebookLM notebook contents are available through Susan's signed-in Chrome session for this workspace; exported source files are still better for long-term reproducible citation.

## Decisions And Assumptions

- 2026-07-30: Use static AWS hosting for first publish to minimize cost and complexity.
- 2026-07-30: Preserve a control-centric model underneath the reorganized IA.
- 2026-07-30: Treat AI actions as simulated and human-governed until a backend/orchestrator exists.
- 2026-07-30: Keep the current CloudFront default domain rather than buying or configuring `udontgrcme.net`.
- 2026-07-30: Treat `docs/IMPLEMENTATION_PLAN.md` as the GitHub source of truth for future implementation scope.
- 2026-07-30: Removed mistakenly created `udontgrcme` public S3 website bucket. Canonical hosted URL remains the CloudFront URL.
- 2026-07-30: Use Node built-in SQLite for the local backend foundation to avoid native package risk; CloudFront remains static fallback until an API is hosted.
- 2026-07-30: Use Lambda Function URL plus DynamoDB for the hosted Governance read API to keep cost and operational overhead low.
- 2026-07-30: Keep hosted `POST /api/controls` disabled until authentication, authorization, validation, and audit logging are implemented.
- 2026-07-30: Treat GitHub Pages as the primary frontend URL and CloudFront as an AWS mirror unless Susan changes hosting direction.
- 2026-07-30: Use NotebookLM Chrome access for research synthesis, while documenting exact implemented learnings in the GitHub source-of-truth plan.

## Validation History

| Date | Check | Result | Evidence |
| --- | --- | --- | --- |
| 2026-07-30 | GitHub CLI auth | PASS | `gh auth status` authenticated as `MoffPotato` |
| 2026-07-30 | AWS CLI auth | PASS | `aws sts get-caller-identity` returned account `<AWS_ACCOUNT_ID>` |
| 2026-07-30 | TypeScript and production build | PASS | `npm run build` |
| 2026-07-30 | Browser UI validation | PASS | Playwright CLI checked Command Center, Governance, Compliance, Risk, Admin, desktop/mobile, no console errors |
| 2026-07-30 | Security scan | PASS with notes | No credential findings; `.gitignore` hardened for env/key files |
| 2026-07-30 | GitHub publish | PASS | Created and pushed `https://github.com/xnasusx/u-dont-grc-me` |
| 2026-07-30 | GitHub release | PASS | `https://github.com/xnasusx/u-dont-grc-me/releases/tag/v0.2.0` |
| 2026-07-30 | AWS hosting | PASS | CloudFront distribution `E2HL6YY0F2B5OW`; direct S3 endpoint returns `403` |
| 2026-07-30 | Google Doc plan review | PASS | Draft plan reviewed and reconciled into `docs/IMPLEMENTATION_PLAN.md` |
| 2026-07-30 | 0.3.0 TypeScript and production build | PASS | `npm run build` |
| 2026-07-30 | 0.3.0 browser smoke | PASS | Playwright checked Command Center, Governance, Compliance, Risk, Admin on desktop/mobile; screenshots in `output/` |
| 2026-07-30 | 0.3.0 security scan | PASS with notes | No live-format secret findings; documentation-only matches and package dependency names |
| 2026-07-30 | 0.3.0 AWS deployment | PASS | S3 sync completed, CloudFront invalidation `I2SW86NIG9MQG7IPUO1Q5G1IVD` completed, live HTML serves bundle `index-CuUwbFWI.js` |
| 2026-07-30 | AWS URL correction | PASS | Mistaken public S3 website bucket `udontgrcme` removed; CloudFront URL remains live |
| 2026-07-30 | 0.4.0 database tests | PASS | `npm test` checks snapshot, control lookup, create validation, and persisted insert |
| 2026-07-30 | 0.4.0 TypeScript and production build | PASS | `npm run build` |
| 2026-07-30 | 0.4.0 Governance API smoke | PASS | `/api/governance` returned 12 controls, 7 frameworks, 16 mappings, 87% avg evidence health |
| 2026-07-30 | 0.4.0 Governance browser smoke | PASS | Playwright verified SQLite API source and all Governance tabs |
| 2026-07-30 | 0.4.0 security scan | PASS with notes | No live-format secret findings; docs/demo metric names only, with `data/`, `.env*`, `*.pem`, and `*.key` ignored |
| 2026-07-30 | 0.4.0 AWS deployment | PASS | S3 sync completed, CloudFront invalidation `I9X15NK625B9Z804RKTNS4S50I` completed, live HTML serves bundle `index-Bs9nnESE.js` |
| 2026-07-30 | 0.4.0 GitHub release | PASS | `https://github.com/xnasusx/u-dont-grc-me/releases/tag/v0.4.0` |
| 2026-07-30 | 0.5.0 Program Workbench tests | PASS | `npm test` returned 9 passing tests, including program workbench API coverage |
| 2026-07-30 | 0.5.0 TypeScript and production build | PASS | `npm run build` passed after renaming stale generated `dist/lambda` artifact |
| 2026-07-30 | 0.5.0 Program Workbench browser smoke | PASS | Playwright verified Governance > Program Workbench with API data and saved `output/program-workbench-smoke.png` |
| 2026-07-30 | 0.6.0 hosted API tests | PASS | `npm test` returned 9 passing tests, including Lambda route coverage |
| 2026-07-30 | 0.6.0 hosted API smoke | PASS | Lambda Function URL `/api/health` returned `runtime=lambda`, `/api/governance` returned 12 controls, 7 frameworks, 16 mappings |
| 2026-07-30 | 0.6.0 hosted API CORS | PASS | Function URL returns a single `Access-Control-Allow-Origin` scoped to `https://d1oxsqx3ua8bb7.cloudfront.net` |
| 2026-07-30 | 0.6.0 DynamoDB persistence | PASS | Table `u-dont-grc-me-governance` contains `TENANT#tenant-acme-us` / `SNAPSHOT#governance` |
| 2026-07-30 | 0.6.0 TypeScript and production build | PASS | `VITE_API_BASE_URL=... npm run build` produced bundle `index-CIpw5eTm.js` |
| 2026-07-30 | 0.6.0 AWS deployment | PASS | S3 sync completed, CloudFront invalidation `I28ELX5E0XYX00XYZD94VWNBDH` completed, live HTML serves bundle `index-CIpw5eTm.js` |
| 2026-07-30 | 0.6.0 security scan | PASS with notes | No live-format secrets; documentation/dependency/demo hardening text only, generated and local package folders ignored |
| 2026-07-30 | 0.6.0 GitHub release | PASS | `https://github.com/xnasusx/u-dont-grc-me/releases/tag/v0.6.0` |
| 2026-07-30 | 0.6.1 NotebookLM research check | PASS | Chrome-accessed FAIR and Heatmaps-to-Histograms notebooks; implemented CRQ/Fair requirements in `src/App.tsx` and `src/utils.ts` |
| 2026-07-30 | 0.6.1 hosted API CORS | PASS | Lambda Function URL returns `Access-Control-Allow-Origin: https://xnasusx.github.io` |
| 2026-07-30 | 0.6.1 hosted API smoke | PASS | `/api/governance` returned 12 controls, 7 frameworks, 87% average evidence health |
| 2026-07-30 | 0.6.1 database and Lambda tests | PASS | `npm test` returned 9 passing tests |
| 2026-07-30 | 0.6.1 GitHub Pages build | PASS | `GITHUB_PAGES=true VITE_API_BASE_URL=... npm run build` produced bundle `index-DVSq6y5o.js` |
| 2026-07-30 | 0.6.1 browser smoke | PASS | Chrome verified local app, transparent logo asset, Risk CRQ sections, 10,000 trials, five-number summary, evidence nutrition label, and approval controls |
| 2026-07-30 | 0.6.1 security scan | PASS with notes | No live-format secrets; documentation/dependency/demo matches only |

## Deliverable Verification

| Ask | Deliverable | Evidence | Status |
| --- | --- | --- | --- |
| Use palette and logo | Applied in UI and assets | `src/styles.css`, `public/u-dont-grc-me-logo.png` | PASS |
| Rename tool | Product renamed | `index.html`, `src/App.tsx`, docs | PASS |
| Reorganize left panel | New IA implemented | Command Center, Governance, Compliance, Risk, Admin | PASS |
| Research GRC tools and build features | Research-informed modules implemented | `src/App.tsx`, docs | PASS |
| Use PMO skill | `PLANS.md` and plan tracking | This file | PASS |
| Secure code and quality skills | Build, browser, security scan, interface fixes | Validation history | PASS |
| GitHub repo | Private repo created, pushed, and released | `https://github.com/xnasusx/u-dont-grc-me/releases/tag/v0.2.0` | PASS |
| AWS hosting | CloudFront static website deployed over private S3 origin | `https://d1oxsqx3ua8bb7.cloudfront.net` | PASS |
| Build proper database for control inventory | Local SQLite schema, API, seed data, tests | `server/schema.sql`, `server/database.js`, `server/api.js`, `server/database.test.js` | PASS |
| Fix CloudFront seeded fallback | Hosted Lambda/DynamoDB Governance API wired into CloudFront build | `server/lambda.js`, `u-dont-grc-me-governance`, `VITE_API_BASE_URL` build | PASS |
| Transparent garden logo | Removed black CSS background from logo image | `src/styles.css` | PASS |
| Enhance from CRQ tools | Added Heatmaps-to-Histograms-inspired CRQ workbench | `src/App.tsx`, `src/utils.ts`, `src/styles.css` | PASS |
| Use NotebookLM notebooks | Chrome-accessible notebook summaries integrated into FAIR/CRQ workbench | `src/App.tsx`, `src/utils.ts`, `docs/IMPLEMENTATION_PLAN.md` | PASS |
| Make GitHub Pages use hosted backend | Pages workflow builds with hosted API and Lambda CORS allows Pages origin | `.github/workflows/pages.yml`, Lambda Function URL CORS | PASS |
| Review Google Doc implementation plan | Gaps identified and tracked | `docs/IMPLEMENTATION_PLAN.md` | PASS |
| Build missing plan functionality into tool | Framework mapper, audit package, knowledge system, TPRM, remediation, RBAC/trust UX implemented as prototype surfaces | `src/App.tsx`, `src/data.ts`, `src/types.ts` | PASS |
| Keep future source of truth on GitHub | Added implementation plan and PMO protocol | `docs/IMPLEMENTATION_PLAN.md`, this file | PASS |

## Next Step

Add authenticated hosted write workflows, tenant isolation, and audit logging before storing real GRC data or evidence outside the prototype.
