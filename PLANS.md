# u dont GRC me Plan

Last updated: 2026-07-30 00:38 ET
PMO status: YELLOW
Current phase: AWS blocked, source published
Owner: Codex

## Objective

Transform the existing control-centric GRC prototype into a branded, research-informed product slice named `u dont GRC me`, using the supplied palette and logo, with a reorganized IA around Command Center, Governance, Compliance, Risk, and Admin. Create operational documentation, version-control it in Susan's GitHub account, and deploy a static build to Susan's AWS account if credentials and permissions allow.

## In Scope

- Apply supplied color palette: `#C7848D`, `#F0DEE0`, `#BEB2B4`, `#7A7073`, `#3A3336`.
- Use supplied image as the tool logo.
- Reorganize left navigation into Command Center, Governance, Compliance, Risk, and Admin.
- Build product modules inspired by researched GRC tools: dashboards, metrics, filters, saved views, chart creation, control library, documentation, audit readiness, evidence, risk register, FAIR calculator, Monte Carlo simulator, integrations, AI agent governance, and admin audit ledger.
- Create user/developer docs, changelog, release notes, and deployment notes.
- Run build, browser/UI validation, React quality review, and AI-assisted security review.
- Create GitHub repository, commit, and push source if GitHub auth/permissions allow.
- Deploy to AWS static hosting if AWS credentials/permissions allow.

## Out Of Scope

- Production-grade multi-tenant backend, live Neptune graph, real S3 Object Lock evidence pipeline, real FAIR actuarial engine, and real AI agent execution.
- Paid AWS architecture such as full CloudFront/WAF/Amplify unless explicitly approved later.
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

## Tracking

- Jira: not configured.
- GitHub: to be created after local validation.
- PMO source of truth: this file.

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
| Documentation | Add user/dev docs, changelog, release notes, deployment guide | DONE | Codex | `README.md`, `docs/`, `CHANGELOG.md`, `RELEASE_NOTES.md` | Required before publishing |
| Quality | Run build, UI, React/design/security checks | TODO | Codex | command outputs, review notes | PMO validation gate |
| GitHub | Create repo, commit, push | DONE | Codex | `https://github.com/xnasusx/u-dont-grc-me`, commit `72461f7` | Private repo |
| AWS | Deploy static site | BLOCKED | Codex | `docs/DEPLOYMENT.md` | IAM denies S3 and Amplify hosting actions |
| Closure | Final PMO deliverable check | TODO | Codex | final status | Compare against ask |

## Dependencies And Blockers

- AWS permissions may block creating S3 buckets, bucket policies, or public website access.
- 2026-07-30: AWS deployment is blocked by IAM. `<deploy-user>` lacks `s3:CreateBucket`, `s3:ListAllMyBuckets`, and `amplify:ListApps`.
- GitHub repo name availability may require a fallback name.
- No production backend exists yet; local persistence remains a prototype boundary.

## Decisions And Assumptions

- 2026-07-30: Use static AWS hosting for first publish to minimize cost and complexity.
- 2026-07-30: Preserve a control-centric model underneath the reorganized IA.
- 2026-07-30: Treat AI actions as simulated and human-governed until a backend/orchestrator exists.

## Validation History

| Date | Check | Result | Evidence |
| --- | --- | --- | --- |
| 2026-07-30 | GitHub CLI auth | PASS | `gh auth status` authenticated as `MoffPotato` |
| 2026-07-30 | AWS CLI auth | PASS | `aws sts get-caller-identity` returned account `<AWS_ACCOUNT_ID>` |
| 2026-07-30 | TypeScript and production build | PASS | `npm run build` |
| 2026-07-30 | Browser UI validation | PASS | Playwright CLI checked Command Center, Governance, Compliance, Risk, Admin, desktop/mobile, no console errors |
| 2026-07-30 | Security scan | PASS with notes | No credential findings; `.gitignore` hardened for env/key files |
| 2026-07-30 | GitHub publish | PASS | Created and pushed `https://github.com/xnasusx/u-dont-grc-me` |
| 2026-07-30 | AWS hosting | BLOCKED | IAM denies S3 bucket creation/listing and Amplify listing |

## Deliverable Verification

| Ask | Deliverable | Evidence | Status |
| --- | --- | --- | --- |
| Use palette and logo | Applied in UI and assets | `src/styles.css`, `public/u-dont-grc-me-logo.png` | PASS |
| Rename tool | Product renamed | `index.html`, `src/App.tsx`, docs | PASS |
| Reorganize left panel | New IA implemented | Command Center, Governance, Compliance, Risk, Admin | PASS |
| Research GRC tools and build features | Research-informed modules implemented | `src/App.tsx`, docs | PASS |
| Use PMO skill | `PLANS.md` and plan tracking | This file | PASS |
| Secure code and quality skills | Build, browser, security scan, interface fixes | Validation history | PASS |
| GitHub repo | Private repo created and pushed | `https://github.com/xnasusx/u-dont-grc-me` | PASS |
| AWS hosting | Attempted but blocked by IAM | `docs/DEPLOYMENT.md` | BLOCKED |

## Next Step

Grant AWS hosting permissions or provide an existing deploy target, then rerun the static deployment.
