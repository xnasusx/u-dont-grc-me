# u dont GRC me Roadmap
**CONTROL-CENTRIC GRC TOOL**

Implementation Plan for an AI-Native Governance, Risk, and Compliance Platform

| **Field** | **Decision** |
| --- | --- |
| Working name | Project Ollie |
| Document purpose | A consolidated, non-repetitive implementation plan suitable for engineering kickoff and cross-functional review |
| Primary design principle | Controls are the system of record; frameworks, assets, vendors, policies, evidence, risks, AI decisions, and remediation workflows all connect back to controls |
| Initial deployment assumption | AWS-hosted product experience with Amazon Neptune for graph persistence, S3 Object Lock for immutable evidence, and containerized AI orchestration |
| Planning exclusions | No dates or budget assumptions are included |

| **Core Thesis**<br>Traditional GRC platforms often begin with audit checklists, documents, or isolated risk registers. This product should begin with the control graph. Every material answer the tool gives should be explainable by traversing from a control to the assets, evidence, framework requirements, owners, risk scenarios, vendors, and AI decisions connected to it. |
| --- |

# **0. Implementation Tracking**

Last updated: 2026-07-30 10:02 ET

| **Area** | **Current status** | **Evidence** | **Problems / next work** |
| --- | --- | --- | --- |
| Control drilldowns | Complete for local testing | Governance inventory rows open modal drilldowns with mappings, assets, evidence, and FAIR assumptions in `src/App.tsx`; browser smoke screenshot `output/v0.7-edit-drilldown-smoke.png` | Add deeper drilldowns for every admin/workbench card and graph edge editing in the next UI slice |
| Control metadata editing | Complete for local testing | `PATCH /api/controls/:id`, `updateControl`, allowlisted editable fields, tests in `server/database.test.js`, Governance side-panel save UI | Production writes remain blocked until auth, tenant scoping, validation middleware, and audit logging are implemented |
| FAIR admin database | Complete for local testing | `fair_scenario_parameters` table in `server/schema.sql`, seed rows in `server/database.js`, Admin FAIR database editor in `src/App.tsx`, update tests | Add versioned assumption sets, approval history, sensitivity drivers, and hosted write workflow |
| FAIR calculations | Complete with prototype limitations | Risk lab now reads annual event frequency, control strength, loss magnitude reduction, appetite threshold, data quality, source notes, and confidence from the FAIR database when available; saved board runs are recomputed and persisted by the backend | Move simulation to a hosted service before production board use; add idempotency and schema validation |
| Local write guardrails | Complete for local testing | Optional `GRC_WRITE_TOKEN`, tenant/actor request context, allowlisted mutations, and mutation audit log in `server/api.js`, `server/database.js`, and `server/schema.sql` | Replace with production SSO/RBAC and hosted durable audit logging before real data |
| FAIR assumption lineage | Complete for local testing | `fair_scenario_versions` stores versioned assumptions; Admin shows Assumption Version History and Mutation Audit Log; smoke evidence `output/v0.8-traceability-smoke.png` | Add side-by-side assumption diffing and hosted approval enforcement |
| FAIR simulation runs and approvals | Complete for local testing | `fair_simulation_runs` stores backend-computed P10/P50/P90/expected loss, appetite breach probability, sensitivity driver, assumption version link, requested-by metadata, and approval state; Risk save and Admin approve verified in `output/v0.9-simulation-run-smoke.png` | Move approval workflow to hosted authenticated API; add idempotency, run comparison, appetite breach notifications, and trend analytics |
| Pop-up windows | Complete with errors avoided in smoke | Control modal verified by Playwright/Chrome with no runtime page errors | Add keyboard trap/focus return and modals for evidence, mappings, vendors, remediation, integrations, and approvals |
| Roadmap evidence tracking | In progress | This section plus `docs/IMPLEMENTATION_PLAN.md` and `PLANS.md` updates | Continue updating status/evidence with every implementation slice |

# **1. Product Intent and Market Baseline**

The platform should compete in the same expectation space as modern compliance automation, integrated risk management, and third-party risk products, while differentiating through a control-centric graph model and auditable AI workflows. Current market signals show that buyers expect centralized controls and ownership, continuous monitoring, reusable evidence, framework cross-mapping, risk dashboards, remediation workflows, and reporting for executives and auditors.

| **Market expectation** | **Implication for this product** |
| --- | --- |
| Controls, ownership, and evidence in one place | The Control Center must be the first-class workspace. Evidence reuse, owner accountability, and framework mapping should not live in separate modules. |
| Automated continuous control monitoring | The ingestion layer must run as a continuous loop, not a quarterly audit-prep import. |
| Integrated risk and control assurance | Risk, vulnerability, audit findings, regulatory obligations, controls, and assets need a shared data foundation. |
| Unified governance, risk, and operational view | Executive reporting must roll up control health, compliance readiness, operational exposure, and FAIR risk metrics. |
| One control library mapped to many frameworks | Framework import and cross-mapping should be part of the core data model, with human approval for AI-proposed mappings. |
| Third-party risk intelligence and ongoing monitoring | Vendor nodes should connect to controls, assets, data, external assessments, and continuous threat intelligence. |

Design target: build a serious enterprise tool, not a dashboard demo. The product must provide fast time-to-value, but its underlying architecture must also withstand auditor review, legal scrutiny, AI governance review, data-isolation testing, and operational failure modes.

# **2. Business Charter and Scope**

## **2.1 Product Mission**

Create an AI-native, control-centric GRC platform that continuously measures control health, maps controls to frameworks and enterprise entities, quantifies control-driven risk, and turns evidence collection, audit response, and remediation into governed workflows.

## **2.2 Success Outcomes**

- Reduce manual audit preparation by using automated evidence collection, evidence reuse, and control-to-framework cross-mapping.

- Give control owners a clear, action-oriented workflow for evidence requests, degraded controls, and remediation tasks.

- Give GRC analysts one place to understand whether a control is implemented, where it operates, what evidence proves it, which framework requirements it satisfies, and what risk exposure it affects.

- Give executives quantitative risk views, including FAIR-based loss ranges, top risk scenarios, and material control failures.

- Give auditors immutable evidence, AI decision lineage, and human approval records tied directly to the relevant controls.

## **2.3 Initial Scope Boundary**

| **Area** | **In Scope for MVP** | **Deferred** |
| --- | --- | --- |
| Control Center | Manual control creation, owner assignment, implementation status, KPIs/KRIs, control health history | Complex control inheritance and advanced enterprise taxonomy tooling |
| Frameworks | One primary framework, recommended NIST CSF 2.0, plus internal control library | Full multi-framework import library on day one |
| Assets | AWS cloud resources, central IAM assets, critical applications, and Tier 1 vendors | On-prem legacy systems and long-tail asset classes |
| Evidence | API evidence from first integrations plus manual upload and immutable storage | Broad connector marketplace and OCR-heavy evidence normalization |
| AI | Evidence validation, framework mapping recommendations, KMS read-only query assistant, FAIR narrative assistant | Fully autonomous remediation on mission-critical systems |
| Risk | FAIR scenario model, Monte Carlo microservice, percentile outputs, risk appetite alerts | Enterprise stress testing and capital planning integrations |

## **2.4 Non-Goals**

- Do not build a generic document repository. Documents matter only when connected to controls, evidence, policies, audits, vendors, assets, or risks.

- Do not allow AI agents to directly mutate the production graph. All writes must pass through middleware validation and guardrails.

- Do not treat FAIR as a simple high/medium/low score. The risk engine should preserve uncertainty, ranges, and scenario context.

- Do not make the graph visualization the only user interface. Executives, control owners, and analysts need role-specific workflows.

# **3. Target Architecture**

The platform should be built around a property graph persisted in Amazon Neptune. The graph model is appropriate because the product's value comes from traversing many-to-many relationships: controls to assets, controls to requirements, controls to evidence, controls to risks, controls to owners, controls to policies, and controls to vendor dependencies.

## **3.1 Logical Layers**

| **Layer** | **Responsibilities** | **Primary Services / Components** |
| --- | --- | --- |
| Product UI | Role-specific experiences for dashboards, control detail, graph exploration, approval queues, evidence review, policies, vendor risk, and settings | React on AWS, Cognito or enterprise SSO, Cytoscape.js or similar graph visualization |
| API Gateway and Middleware | RBAC enforcement, tenant scoping, schema validation, idempotency, HMAC webhook verification, AI action allow-lists, graph query construction | AWS API Gateway or ALB, containerized service, validation library, policy engine |
| Control Graph | System of record for controls and relationships | Amazon Neptune using property graph semantics with Gremlin or openCypher |
| Evidence Store | Immutable raw evidence, policy artifacts, audit packages, AI context logs, and versioned attachments | Amazon S3 with Object Lock, versioning, KMS encryption, retention policies |
| AI Orchestration | Specialized agents for evidence validation, mapping, risk, KMS, vendor assessment, policy drafting, and remediation recommendations | Containerized orchestrator, model endpoint, structured output, telemetry harness |
| Vector and RAG Index | Semantic retrieval of potentially relevant controls, policies, evidence, and framework requirements | Vector index keyed by graph identifiers; graph remains source of truth |
| Risk Engine | FAIR scenario parameterization, Monte Carlo simulation, percentile reporting, appetite thresholds | Python microservice with numpy/scipy or equivalent statistical stack |
| Workflow Integrations | Tickets, notifications, stakeholder tasks, source system sync, legacy import | Jira, ServiceNow, Slack/Teams, AWS Security Hub, Okta/Entra, vulnerability scanners |

## **3.2 Architecture Flow**

**1. **Source systems emit telemetry or documents through signed webhooks, APIs, scheduled jobs, or manual upload.

**2. **The middleware validates the payload envelope, enforces tenant and RBAC context, stores the raw evidence in S3, and routes only validated context to the proper agent.

**3. **The agent returns structured JSON, not free-form prose. The middleware validates that JSON against schema and allow-list rules.

**4. **Accepted decisions become graph updates, pending approval items, evidence edges, risk updates, tickets, or notifications.

**5. **Every AI decision receives a cognitive audit log, hash, model/version metadata, and graph relationship to the agent that produced it.

## **3.3 Deployment Boundary**

The UI and graph store should remain AWS-native for operational simplicity. If model orchestration runs in another cloud, engineers must use workload identity federation and short-lived credentials. Do not store long-lived AWS access keys in AI containers.

# **4. Control-Centric Graph Data Model**

The Control node is the product's nucleus. Every other major entity should either connect directly to a control or connect through a path that explains control impact. This enables the product to answer practical questions such as: what proves this control, what assets does it protect, what requirements does it satisfy, who owns it, what vendors does it rely on, and what risk exposure changes if it fails?

## **4.1 Core Node Types**

| **Node** | **Purpose** | **Required Properties** |
| --- | --- | --- |
| Control | Canonical internal control record | tenant_id, control_id, name, description, owner_id, implementation_status, control_type, automation_level, criticality, kpi_kri, fair_parameters |
| Requirement | External framework or regulatory requirement | tenant_id, requirement_id, framework, version, citation_id, text, jurisdiction, effective_date, status |
| Asset | System, service, cloud resource, data store, IAM platform, container, application, or process | tenant_id, asset_id, asset_type, name, environment, criticality, data_classification, owner_id |
| Evidence | Raw or processed proof of control operation | tenant_id, evidence_id, evidence_type, collection_method, source_system, s3_uri, s3_version_id, collected_at, valid_until, hash |
| RiskScenario | FAIR scenario or enterprise risk record | tenant_id, scenario_id, name, scope, loss_event, asset_id, lef_parameters, lm_parameters, ale_p10, ale_p50, ale_p90 |
| Vendor | Third party or service provider | tenant_id, vendor_id, name, criticality_tier, data_access, business_owner, assessment_status, external_rating |
| PolicyDocument | Policy, SOP, standard, procedure, or generated draft | tenant_id, document_id, title, document_type, owner_id, status, s3_uri, approved_version |
| UserTeam | Human owner, approver, team, or escalation group | tenant_id, principal_id, name, email, roles, assigned_controls |
| Agent | AI agent identity and runtime version | tenant_id, agent_id, agent_name, model_provider, model_version, service_account, permissions_boundary, lifecycle_status |
| AuditLog | Immutable record of human and AI decisions | tenant_id, audit_id, actor_id, action, context_hash, output_hash, timestamp, accepted_by_middleware |

## **4.2 Relationship Vocabulary**

| **Edge** | **From** | **To** | **Meaning / Key Properties** |
| --- | --- | --- | --- |
| IMPLEMENTED_ON | Control | Asset | The control operates in a specific technical or process context. Properties: asset_context, testing_cadence, inheritance, scope_status. |
| SATISFIES | Control | Requirement | The control maps to a framework requirement. Properties: coverage_percentage, ai_mapping_confidence, state, approved_by, approved_at. |
| PROVED_BY | Control | Evidence | Evidence supports control operation. Properties: valid_until, telemetry_source, evidence_scope, context_hash, state. |
| MITIGATES | Control | RiskScenario | The control reduces frequency or magnitude for a defined scenario. Properties: lef_effect, lm_effect, confidence, assumption_set_id. |
| OWNED_BY | Control | UserTeam | Accountability and escalation. Properties: role, escalation_path, last_notified. |
| RELATED_TO | Control | Control | Control dependency, prerequisite, overlap, compensating relationship, or conflict. Properties: relationship_type, rationale. |
| GOVERNS | PolicyDocument | Control | Document defines or supports the control. Properties: policy_section, effective_version. |
| RELIED_UPON_FOR | Vendor | Control | Third-party dependency supports a control. Properties: dependency_type, assessment_status. |
| PROCESSES_DATA_FOR | Vendor | Asset | Vendor processes data for a business asset. Properties: data_type, region, processing_role. |
| EVALUATED_BY | Control | Agent | AI agent produced a decision or recommendation. Properties: model_version, prompt_version, context_hash, verdict. |

## **4.3 Control Node JSON Schema Skeleton**

| { "$schema": "https://json-schema.org/draft/2020-12/schema", "title": "ControlNode", "type": "object", "required": ["tenant_id", "control_id", "name", "owner_id", "implementation_status"], "properties": { "tenant_id": {"type": "string"}, "node_type": {"const": "Control"}, "control_id": {"type": "string"}, "name": {"type": "string"}, "description": {"type": "string"}, "control_type": {"enum": ["Preventive", "Detective", "Corrective", "Directive"]}, "automation_level": {"enum": ["Manual", "Partially Automated", "Fully Automated", "Agentic"]}, "owner_id": {"type": "string"}, "implementation_status": {"enum": ["Not Started", "In Progress", "Implemented", "Degraded", "Failed", "Retired"]}, "criticality": {"enum": ["Low", "Medium", "High", "Mission Critical"]}, "kpi_kri": {"type": "object"}, "fair_parameters": {"type": "object"}, "ai_metadata": {"type": "object"} } } |
| --- |

## **4.4 Data Model Rules**

- Every node and edge must carry tenant_id. The middleware must inject tenant filters into every query, including AI-generated read-only queries.

- A control can be implemented differently per asset; store that difference on the IMPLEMENTED_ON edge instead of duplicating controls for every context.

- AI-generated mappings and high-risk changes begin as PENDING_APPROVAL, not ACTIVE.

- Evidence edges must store exact S3 object version identifiers so auditors retrieve the exact artifact reviewed at decision time.

- Never store full evidence bodies in the vector index. Store graph identifiers and minimal metadata; retrieve authoritative content from S3 and Neptune.

# **5. Product Modules and Functional Requirements**

| **Module** | **Requirements** | **Key Views** |
| --- | --- | --- |
| Control Center | Create, edit, assign, test, monitor, and report on controls; show connected requirements, assets, policies, evidence, risks, vendors, and AI decisions. | Control list, control detail, relationship graph, owner workflow, status history, KPI/KRI cards. |
| Framework Mapper | Import framework requirements, run semantic matching, propose SATISFIES edges, route low-confidence mappings for review, track coverage and gaps. | Framework upload, mapping queue, requirement detail, coverage matrix, approval history. |
| Evidence Pipeline | Collect, store, dedupe, validate, and reuse evidence across controls, frameworks, audits, and vendors. | Evidence library, evidence request workflow, source system trace, validity dates, audit package export. |
| FAIR Risk Engine | Translate control health into frequency and magnitude assumptions, run Monte Carlo simulations, and show percentile loss outputs. | Scenario builder, assumption editor, simulation results, risk appetite alerts, executive dashboard. |
| AI Knowledge System | Let users query the graph in natural language while enforcing read-only constraints and source-grounded answers. | Conversational query, generated query preview for analysts, cited graph paths, answer confidence. |
| Third-Party Risk | Represent vendors as graph nodes, extract vendor evidence from assessments, connect vendor posture to internal controls and assets. | Vendor profile, assessment intake, dependency graph, monitoring alerts, vendor risk rollup. |
| Policy and Document Generator | Draft policies, SOPs, standards, and audit narratives from control graph context, with analyst review before publication. | Template picker, graph scope selector, rich-text draft editor, approval workflow, versioning. |
| Remediation Engine | Recommend or trigger pre-approved remediation playbooks based on control failure, asset criticality, and policy guardrails. | Remediation queue, playbook registry, approval gate, rollback status, post-remediation evidence. |
| Administration | Manage tenants, roles, integrations, guardrails, retention, agent lifecycle, risk appetite settings, and model versions. | Settings, integration marketplace, RBAC console, tenant configuration, agent registry. |

## **5.1 Cross-Module Global Filters**

The UI should preserve context across modules. If a user filters the Control Center to AWS production assets and NIST CSF Protect outcomes, then framework coverage, evidence, risk, and approvals views should inherit that scope unless the user clears it. Global filters should include tenant, framework, business unit, asset type, environment, vendor tier, owner, status, criticality, data classification, and date window.

## **5.2 Time-to-Value Requirements**

- Day 0 onboarding should connect at least one cloud source and one identity source, run discovery, create initial Asset nodes, and populate a starter Control Center.

- The first dashboard should show quick wins: controls automatically validated, controls missing evidence, top degraded assets, and framework requirements with likely coverage.

- Role-specific onboarding should guide system admins through integrations, analysts through mapping approvals, and control owners through evidence tasks.

# **6. AI Agent Workflows**

Agents are product capabilities with identities, permissions, lifecycle states, audit logs, and failure modes. They should be treated like governed digital actors, not generic background jobs.

| **Agent** | **Trigger** | **Allowed Outputs** | **Human Gate** |
| --- | --- | --- | --- |
| Evidence Validation Agent | Validated telemetry, manual upload, scheduled control test | Implemented/Degraded/Failed recommendation, PROVED_BY edge proposal, missing evidence summary | Required for Tier 1 control failure reversal or low-confidence evidence |
| Framework Mapping Agent | Framework upload or requirement update | Proposed SATISFIES edges with coverage and confidence, gap summary | Required for all new mappings below high-confidence threshold and for regulated frameworks |
| FAIR Risk Agent | Control degraded/failed, asset criticality change, scenario edit, vendor status change | Updated LEF/LM assumptions, Monte Carlo results, risk narrative, appetite alert | Required before changing board-facing risk acceptance state |
| Knowledge System Agent | Natural language question | Read-only answer with graph path, cited nodes/edges, confidence, query trace | No writes allowed |
| Third-Party Assessment Agent | Vendor documentation upload or external risk feed event | Vendor gap findings, relied-upon control impact, assessment summary | Required for vendor tier changes and control degradation based only on unstructured docs |
| Policy Drafting Agent | User selects document type and graph scope | Draft policy/SOP/standard mapped to controls and requirements | Publication requires human approval |
| Remediation Recommendation Agent | Config drift, vulnerability, or failed control | Pre-approved playbook recommendation or pending execution request | Required for production or mission-critical assets |

## **6.1 Evidence Validation Workflow**

**1. **Retrieve the Control_Context from Neptune, including control requirements, asset-specific edge context, owner, current status, and evidence validity rules.

**2. **Retrieve and normalize the Telemetry_Payload from the validated webhook or manual evidence intake.

**3. **Prompt the Evidence Validation Agent using structured output and deterministic instructions.

**4. **Validate the agent output against JSON schema, confidence thresholds, and allowed actions.

**5. **Write the raw evidence to S3 with Object Lock and versioning, create or update the Evidence node, and create a PROVED_BY edge only if validation passes.

**6. **If evidence is missing or failing, notify the control owner, create a task, and trigger the FAIR Risk Agent when material.

## **6.2 Framework Mapping Workflow**

**1. **Ingest framework requirements as Requirement nodes with framework, version, citation, requirement text, and jurisdiction metadata.

**2. **Embed the requirement text and retrieve top candidate Control IDs from the vector index.

**3. **Hydrate only those candidate controls from Neptune and pass them to the Framework Mapping Agent.

**4. **Create proposed SATISFIES edges in PENDING_APPROVAL with coverage, confidence, and reasoning.

**5. **Route proposals to the Pending Approvals Queue with a side-by-side requirement/control review surface.

**6. **On approval, activate the edge and update framework coverage. On rejection, preserve the rejection rationale for future prompt and retrieval tuning.

## **6.3 Prompt Contract Pattern**

| System prompt pattern: ROLE: Define the agent's narrow professional role. INSTRUCTIONS: Define the exact input objects and what comparison or analysis is allowed. STEPS: Force a repeatable sequence: parse context, parse payload, evaluate, produce output. EXPECTATIONS: Forbid hallucinated controls, unsupported assumptions, compensating controls not provided in context, and free-form prose outside JSON. OUTPUT: Require strict JSON with IDs, verdict, confidence, reasoning, missing evidence, proposed action, and state. |
| --- |

# **7. FAIR Risk and Quantitative Control Health**

Risk should be modeled as scenario-specific, probabilistic, and control-sensitive. The platform should not convert FAIR into a hidden score. It should expose assumptions, ranges, distributions, confidence, and the controls that influence loss event frequency or loss magnitude.

## **7.1 FAIR Data Model**

| **FAIR Concept** | **Platform Representation** | **Data Sources** |
| --- | --- | --- |
| Loss Event Frequency | Scenario property derived from threat frequency and susceptibility/resistance strength | Threat intel, SIEM, vulnerability scanners, historical incidents, control performance |
| Loss Magnitude | Range distribution across primary and secondary loss categories | Finance inputs, incident response cost models, legal/regulatory estimates, downtime estimates, customer/reputation assumptions |
| Control Effect | MITIGATES edge properties that describe how a control changes frequency or magnitude | Control owner input, historical effectiveness, AI-assisted scenario analysis, analyst approval |
| Uncertainty | Min/most-likely/max or distribution parameters | Subject matter estimates, telemetry ranges, sensitivity analysis |
| Output | ALE percentiles and narrative explanation | Monte Carlo simulation microservice |

## **7.2 Monte Carlo Simulation Requirements**

- Support at least 10,000 simulation iterations per scenario, configurable by tenant and scenario materiality.

- Return P10, P50, P90, expected value, probability of exceeding appetite, and sensitivity drivers.

- Store the exact assumption set used for each run so results are reproducible.

- Trigger re-runs when material control health, vendor status, vulnerability state, asset criticality, or threat telemetry changes.

- Use the AI agent for scenario narrative, assumption translation, and stakeholder explanation, not as the mathematical simulation engine.

## **7.3 Risk Dashboard Requirements**

The executive view should show top scenarios by P90 exposure, control failures with material effects, trend in aggregate control health, risk appetite breaches, and the graph path from scenario to control to evidence. Analyst views should expose assumptions and allow controlled edits with approval history.

# **8. API, Evidence, and Integration Architecture**

## **8.1 Common Telemetry Envelope**

| { "event_id": "uuid", "timestamp": "2026-07-30T12:00:00Z", "tenant_id": "tenant_123", "source_system": "AWS_SecurityHub", "event_type": "Config_Drift", "signature_version": "v1", "payload": {} } |
| --- |

Every integration should normalize into a common envelope before agent evaluation. The API must verify HMAC signatures, reject stale timestamps, enforce idempotency on event_id, validate payload schema, and store the raw event before producing graph mutations.

## **8.2 Integration Prioritization**

| **Priority** | **Integration Category** | **Why It Comes First** | **Initial Targets** |
| --- | --- | --- | --- |
| 1 | Cloud posture and asset discovery | Creates the asset graph and high-volume evidence baseline | AWS Security Hub, AWS Config, CloudTrail, IAM Access Analyzer |
| 2 | Identity and access management | Access controls are heavily audited and tie to many frameworks | Okta or Microsoft Entra ID, AWS IAM logs |
| 3 | Vulnerability and threat telemetry | Feeds control degradation and FAIR frequency/susceptibility assumptions | Inspector, Qualys/Tenable/Rapid7, SIEM/XDR |
| 4 | Workflow systems | Pushes remediation into existing operational habits | Jira, ServiceNow, Slack/Teams notifications |
| 5 | Third-party risk and legacy imports | Bootstraps vendor and risk context without manual re-entry | OneTrust export, ProcessUnity/CyberGRX-style risk feeds, vendor document upload |
| 6 | Document repositories and policy systems | Links policies, SOPs, and standards to controls | SharePoint/Drive/Confluence or existing document store |

## **8.3 Immutable Evidence Pipeline**

- Write every raw webhook, upload, AI context log, and final decision artifact to an S3 bucket with versioning enabled.

- Apply Object Lock retention policies to evidence and AI decision logs according to legal and audit requirements.

- Store the bucket, key, version ID, content hash, collected_at, valid_until, and retention mode on the Evidence node or related edge.

- When a user clicks evidence in the UI, retrieve the exact object version referenced by the graph edge.

- If evidence must be annotated later, create a new object version or annotation artifact; do not mutate the original locked evidence.

# **9. User Experience and RBAC**

## **9.1 Role-Specific Views**

| **Persona** | **Primary Jobs** | **Default Landing View** |
| --- | --- | --- |
| System Admin | Configure tenants, integrations, RBAC, retention, guardrails, and agent lifecycle | Admin health and integration status |
| Compliance Analyst | Manage controls, approve mappings, prepare audits, review evidence, tune frameworks | Control Center and pending approvals |
| Control Owner | Respond to evidence requests, fix degraded controls, confirm remediation | Assigned control tasks and daily digest |
| Third-Party Risk Analyst | Manage vendor intake, review vendor evidence, assess vendor control dependencies | Vendor risk queue |
| Executive / Board | Understand material exposure, control health, risk trends, and compliance readiness | Global FAIR and control health dashboard |
| Auditor | Review evidence, control mappings, audit trails, and immutable proof packages | Audit package and evidence trail |

## **9.2 Required UI Views**

- Global Risk Dashboard: FAIR P10/P50/P90 exposure, appetite breaches, control health rollup, top scenarios, and material control failures.

- Control Detail: metadata, owner, implementation status, KPIs/KRIs, sub-graph, evidence, requirements, assets, policies, risk scenarios, vendors, AI history.

- Graph Explorer: interactive subgraph with filters, path explanations, and edge detail side panels.

- Pending Approvals Queue: AI-proposed mappings, evidence verdicts, remediation requests, confidence, diff viewer, approve/reject with rationale.

- Evidence Library: search, validity status, source system, linked controls, immutable object version, audit package inclusion.

- Framework Coverage: requirement list, mapped controls, coverage percentage, gaps, version changes, approval history.

- Integration Marketplace: OAuth/API connection flows, health checks, last sync, permission scopes, connector logs.

- Settings: tenant scoping, risk appetite, FAIR defaults, workflow templates, notification rules, retention, model versions.

## **9.3 RBAC Matrix**

| **Action** | **Admin** | **Analyst** | **Owner** | **TPRM** | **Executive** | **Auditor** |
| --- | --- | --- | --- | --- | --- | --- |
| View global FAIR metrics | Yes | Yes | No | No | Yes | Scoped |
| View control graph | Yes | Yes | Assigned | Assigned vendor | Read-only | Scoped read-only |
| Edit control metadata | Yes | Yes | Assigned fields | No | No | No |
| Approve AI mappings | Yes | Yes | No | Vendor scope only | No | No |
| Upload manual evidence | Yes | Yes | Assigned | Vendor scope | No | No |
| Manage vendors | Yes | Yes | No | Yes | Read-only | Scoped read-only |
| Trigger Monte Carlo | Yes | Yes | No | No | No | No |
| Modify guardrails/settings | Yes | No | No | No | No | No |

## **9.4 Trust UX**

Every AI-assisted decision should show confidence, evidence source, raw context, graph path, generated reasoning, middleware validation result, and human approval state. For high-risk actions, the UI should introduce deliberate friction: typed confirmation, second approver, or change-window enforcement.

# **10. Security, Privacy, Guardrails, and Operations**

## **10.1 AI Write Guardrails**

| **Guardrail** | **Requirement** |
| --- | --- |
| No direct DB access | Agents cannot connect to Neptune. They return structured JSON to middleware only. |
| Agent-specific identities | Each agent has a service account and mapped IAM role with least-privilege permissions. |
| Action allow-list | Middleware permits only approved actions per agent, such as CREATE_EDGE:PROVED_BY for Evidence Agent. |
| Global deny-list | DELETE_NODE:CONTROL, unbounded updates, schema-altering mutations, and tenant changes are rejected. |
| Schema validation | Every AI output must validate before query construction. |
| Traversal limits | Middleware-generated queries must target explicit IDs and enforce maximum hop counts. |
| Human-in-the-loop | High-risk writes and low-confidence mappings remain PENDING_APPROVAL. |
| Immutable audit | Prompt, context, output, action verdict, and hash are stored in a locked evidence log. |

## **10.2 Data Isolation and Residency**

- Every data object must include tenant_id and business-unit scope where applicable.

- Middleware must inject tenant_id into every query and reject user-supplied tenant overrides.

- Evidence buckets should be partitioned by tenant and environment, with KMS keys and bucket policies scoped accordingly.

- Data residency must be configurable for regulated customers; model processing regions need explicit approval.

- PII, secrets, and sensitive evidence should be redacted or tokenized before AI context injection unless explicitly required.

## **10.3 Agent Lifecycle Monitoring**

- Track tokens, latency, tool-call rate, graph traversal depth, rejection rate, approval rate, and hallucination/schema-failure rate by agent and model version.

- Implement circuit breakers for recursive query generation, abnormal read volume, repeated schema failures, or unauthorized action attempts.

- Maintain Agent nodes with lifecycle_status values such as ACTIVE, CANARY, DEPRECATED, RETIRED, and DISABLED.

- When a model version is retired or found defective, query EVALUATED_BY edges to identify affected controls and route them for re-review.

## **10.4 BCP/DR and Operational Readiness**

| **Area** | **Requirement** |
| --- | --- |
| Recovery objectives | Define RPO and RTO for Neptune, evidence store, orchestration hub, and UI before production. |
| Fallback mode | If KMS Text-to-Graph fails repeatedly, degrade to guided search and open a support ticket with failed prompts attached. |
| Control-owner enablement | Provide daily digest and direct task links instead of forcing owners to live inside the dashboard. |
| SLA model | Tier 1 control failure should page appropriate owners quickly; Tier 3 remediation may be ticket-based or automated. |
| Day 2 runbook | Document support ownership, connector failures, evidence sync failures, model rollback, and graph repair procedures. |

# **11. Delivery Plan and Acceptance Criteria**

## **11.1 Phased Delivery**

| **Phase** | **Goal** | **Primary Deliverables** | **Exit Criteria** |
| --- | --- | --- | --- |
| 0. Discovery and Charter | Lock product assumptions, scope, personas, primary framework, and security posture | Charter, PRD, architecture decision records, threat model, data classification | Stakeholders approve scope and non-goals |
| 1. Control Center Foundation | Create the graph-backed system of record | Control/Asset/Requirement/Evidence schemas, UI CRUD, owner assignment, basic graph view | Users can create controls and connect them to assets and requirements |
| 2. Evidence and First Integrations | Prove controls continuously | Telemetry envelope, AWS integration, IAM integration, S3 immutable evidence, Evidence Agent | Evidence validates a control and creates a PROVED_BY edge with raw artifact |
| 3. Framework Mapping and Approvals | Reduce duplicate compliance work | Framework import, vector retrieval, Mapping Agent, approval queue, coverage dashboard | Analysts approve/reject proposed mappings and coverage updates accurately |
| 4. FAIR Risk Engine | Translate control health into business exposure | Scenario model, Monte Carlo service, risk dashboard, appetite alerts | A degraded control updates scenario exposure with reproducible assumptions |
| 5. TPRM and Policy Workflows | Connect vendors and documentation to controls | Vendor graph, assessment agent, policy generator, document versioning | Vendor evidence and policies map to controls with review history |
| 6. Remediation and Scale Hardening | Close the loop safely | Playbook registry, remediation recommendations, HITL execution, rollback evidence, agent monitoring | Approved playbooks remediate low-risk drift and preserve audit trail |

## **11.2 Product Backlog**

| **Epic** | **Representative User Stories** |
| --- | --- |
| Control Center | As an analyst, I can create a control with owner, status, automation level, KPI/KRI, and framework relevance. As a control owner, I can see only controls assigned to me. |
| Graph Relationships | As an analyst, I can connect a control to assets, requirements, evidence, vendors, policies, and risk scenarios. As an auditor, I can inspect the full evidence path. |
| Evidence Automation | As a system, I can ingest AWS/IAM telemetry, validate it, store immutable raw evidence, and update the control graph. |
| AI Approvals | As an analyst, I can review AI proposals side by side with source context, confidence, and reasoning, then approve or reject with rationale. |
| FAIR Risk | As a risk manager, I can define a scenario, attach controls, run Monte Carlo simulation, and see how degraded controls affect P10/P50/P90 loss. |
| Knowledge Query | As an executive, I can ask what controls are failing for a critical asset and receive a read-only answer tied to graph paths. |
| Vendor Risk | As a TPRM analyst, I can upload a SOC 2 report, extract control coverage, and see internal controls that rely on the vendor. |
| Operations | As an admin, I can monitor agent behavior, disable an agent, rotate credentials, inspect connector health, and export audit logs. |

## **11.3 Testing Strategy**

- Unit and contract tests for JSON schemas, webhook validation, idempotency, tenant scoping, and graph query construction.

- Graph integrity tests for required node properties, allowed edge types, orphaned nodes, tenant leaks, and invalid relationship states.

- AI evaluation tests with golden datasets for evidence validation, mapping precision/recall, prompt injection resistance, and refusal behavior.

- Adversarial red-team tests that attempt prompt injection, unauthorized graph mutation, tenant data leakage, fake evidence, replay attacks, and overbroad remediation.

- Parallel-run UAT against the current risk register and evidence process before production cutover.

- Operational chaos tests for connector outages, model failure, vector index staleness, S3 write failures, and Neptune failover.

## **11.4 Definition of Done**

A feature is not done when it renders in the UI. It is done when it enforces tenant isolation, writes complete audit records, has schema and RBAC tests, exposes error states to users, preserves immutable evidence where applicable, and can be explained through the control graph.

# **12. Open Decisions**

- Primary framework for MVP: NIST CSF 2.0 is recommended, but final selection should match the first target customer or internal compliance need.

- Model provider and hosting boundary: confirm whether orchestration is AWS-only or cross-cloud, because identity federation and residency requirements depend on that decision.

- Commercial SaaS versus internal enterprise tool: multi-tenancy, pricing, customer onboarding, trust center, and marketplace depth depend on the answer.

- Risk appetite governance: determine who can set financial thresholds and who can approve acceptance of material risk.

- Evidence retention period: align S3 Object Lock settings with legal, audit, and customer obligations before production.

- Automated remediation policy: define asset tiers and control categories where autonomous playbooks are allowed.

# **13. Source-Informed Reference Notes**

| **Reference** | **How It Informed the Plan** | **URL** |
| --- | --- | --- |
| Drata controls and evidence | Control ownership, cross-framework mapping, centralized/reusable evidence, and continuous visibility are baseline buyer expectations. |  |
| Vanta automated compliance | Continuous monitoring, automated evidence, alerts, remediation support, and stakeholder collaboration are common compliance automation expectations. |  |
| Archer IT and Security Risk Management | Enterprise GRC buyers expect controls, vulnerabilities, audit findings, obligations, reporting, policy management, continuous controls monitoring, and asset context. |  |
| OneTrust GRC overview | Scalable GRC commonly includes automated risk assessments, policy management, compliance tracking, and unified governance/risk/operational data. |  |
| Compyl framework/evidence positioning | One control library, many framework mappings, evidence reuse, automated evidence, and real-time program views should be considered product table stakes. |  |
| ProcessUnity / CyberGRX risk exchange | Third-party risk is strengthened by reusable assessments, external risk intelligence, and updated vendor posture views. |  |
| NIST CSF 2.0 | The framework supports flexible outcomes, profiles, tiers, governance, supply chain emphasis, and continuous cybersecurity risk management. |  |
| FAIR Standard v3.0 | FAIR frames risk as probable frequency and magnitude of future loss, derived from Loss Event Frequency and Loss Magnitude. |  |
| Amazon Neptune data model | Neptune supports graph relationships and properties, suitable for explicit control-to-entity relationship traversal. |  |
| Amazon S3 Object Lock | Object Lock supports WORM-style retention to help prevent evidence objects from deletion or overwrite for fixed periods or indefinitely. |  |

# **14. Glossary**

| **Term** | **Definition** |
| --- | --- |
| Control Center | The control-backed system of record and primary workspace for the platform. |
| Control graph | The graph representation of controls and all connected entities, including assets, evidence, requirements, vendors, risk scenarios, policies, users, and agents. |
| PROVED_BY | The graph edge linking a control to evidence that supports its operating effectiveness. |
| SATISFIES | The graph edge linking an internal control to an external framework requirement. |
| PENDING_APPROVAL | State for AI-proposed or high-risk graph changes awaiting human review. |
| Cognitive audit log | The exact prompt, context, model version, output, validation result, and hash for an AI decision. |
| GraphRAG / Text-to-Graph | A natural language query workflow that uses graph schema and graph traversals rather than loose document search alone. |
| FAIR | Factor Analysis of Information Risk, used here for quantitative scenario-based cyber risk analysis. |
