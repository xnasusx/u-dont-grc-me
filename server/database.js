import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "schema.sql");

const controls = [
  ["CTRL-PAM-001", "tenant-acme-us", "Privileged Access Management", "Identity and Access", "Administrative access to production systems is brokered through a managed vault, requires MFA, and records every privileged session.", "sec-ops@company.com", "Security Operations", "Preventive", "Agentic", "Implemented", "Mission Critical", "Continuous", 96, 96, 93],
  ["CTRL-IAM-002", "tenant-acme-us", "Identity Lifecycle Review", "Identity and Access", "Joiner, mover, and leaver access is reviewed against HR source-of-truth and deprovisioning evidence.", "it-ops@company.com", "IT Operations", "Detective", "Fully Automated", "Implemented", "High", "Daily", 91, 94, 89],
  ["CTRL-VULN-004", "tenant-acme-us", "Critical Vulnerability Remediation", "Vulnerability Management", "Critical vulnerabilities on internet-facing production assets are remediated or formally risk accepted within SLA.", "platform-risk@company.com", "Platform Engineering", "Corrective", "Partially Automated", "Degraded", "High", "Daily", 71, 86, 74],
  ["CTRL-EVID-007", "tenant-acme-us", "Immutable Evidence Retention", "Audit Evidence", "Control evidence is written to object-locked storage with version identifiers, hash validation, retention policy, and graph edge traceability.", "grc-platform@company.com", "GRC Platform", "Preventive", "Fully Automated", "Implemented", "High", "Continuous", 94, 98, 95],
  ["CTRL-TPRM-002", "tenant-acme-us", "Tier 1 Vendor Security Review", "Third-Party Risk", "Tier 1 vendors are assessed before onboarding and annually thereafter using SOC 2, security questionnaire, breach history, and data processing scope.", "vendor-risk@company.com", "Third-Party Risk", "Detective", "Partially Automated", "In Progress", "High", "Quarterly", 58, 83, 69],
  ["CTRL-LOG-003", "tenant-acme-us", "Centralized Security Logging", "Detection and Response", "Security-relevant system, identity, and cloud logs are centralized, retained, monitored, and available for investigation.", "detection@company.com", "Detection Engineering", "Detective", "Fully Automated", "Implemented", "High", "Continuous", 90, 95, 92],
  ["CTRL-BCP-006", "tenant-acme-us", "Business Continuity Exercise", "Resilience", "Critical services have documented recovery procedures and tested continuity exercises with tracked remediation.", "resilience@company.com", "Business Resilience", "Corrective", "Manual", "In Progress", "Medium", "Annual", 63, 78, 66],
  ["CTRL-ENC-008", "tenant-acme-us", "Encryption at Rest", "Data Protection", "Sensitive data stores use approved encryption at rest with managed keys and monitored configuration drift.", "cloud-sec@company.com", "Cloud Security", "Preventive", "Fully Automated", "Implemented", "High", "Continuous", 97, 95, 94],
  ["CTRL-CHANGE-009", "tenant-acme-us", "Production Change Management", "Change Management", "Production changes require approval, linked tickets, testing evidence, and emergency change review.", "platform-ops@company.com", "Platform Operations", "Directive", "Partially Automated", "Implemented", "Medium", "Weekly", 88, 91, 87],
  ["CTRL-ENDPOINT-010", "tenant-acme-us", "Endpoint Protection Coverage", "Endpoint Security", "Managed endpoints run approved protection, report health, and automatically create remediation tasks for stale agents.", "endpoint@company.com", "Security Operations", "Detective", "Fully Automated", "Degraded", "High", "Daily", 74, 92, 81],
  ["CTRL-TRAIN-011", "tenant-acme-us", "Security Awareness Training", "People Controls", "Employees and privileged users complete security awareness training within policy-defined windows.", "people-sec@company.com", "People Security", "Directive", "Fully Automated", "Implemented", "Medium", "Monthly", 89, 87, 90],
  ["CTRL-BRANCH-012", "tenant-acme-us", "Protected Production Branches", "Secure SDLC", "Production repositories enforce branch protection, required reviews, and restricted admin bypass.", "appsec@company.com", "Application Security", "Preventive", "Fully Automated", "Implemented", "High", "Daily", 93, 95, 92],
];

const frameworks = [
  ["SOC2", "SOC 2", "Type II 2026", "Assurance", 300],
  ["ISO27001", "ISO 27001", "2022", "Security Management", 260],
  ["NISTCSF", "NIST CSF", "2.0", "Cybersecurity", 220],
  ["HIPAA", "HIPAA", "Security Rule", "Healthcare", 160],
  ["PCIDSS", "PCI DSS", "4.0", "Payments", 180],
  ["GDPR", "GDPR", "EU", "Privacy", 120],
  ["ISO42001", "ISO 42001", "2023", "AI Governance", 90],
];

const requirements = [
  ["REQ-SOC2-CC6.1", "SOC2", "CC6.1", "Logical Access", "Logical access security", "The entity implements logical access security software, infrastructure, and architectures over protected information assets."],
  ["REQ-SOC2-CC6.2", "SOC2", "CC6.2", "Access Removal", "Prior access is removed", "Prior access is removed when employees or contractors no longer require access."],
  ["REQ-SOC2-CC7.2", "SOC2", "CC7.2", "Monitoring", "Security monitoring", "The entity monitors system components and detects anomalies that could indicate malicious acts."],
  ["REQ-SOC2-CC8.1", "SOC2", "CC8.1", "Change Management", "Changes are authorized", "Changes to infrastructure, data, software, and procedures are authorized, tested, approved, and documented."],
  ["REQ-ISO-A.5.16", "ISO27001", "A.5.16", "Identity Management", "Identity management", "The full lifecycle of identities is managed."],
  ["REQ-ISO-A.8.8", "ISO27001", "A.8.8", "Technical Vulnerabilities", "Management of technical vulnerabilities", "Information about technical vulnerabilities is obtained, evaluated, and addressed."],
  ["REQ-ISO-A.8.24", "ISO27001", "A.8.24", "Cryptography", "Use of cryptography", "Rules for effective use of cryptography, including key management, are defined and implemented."],
  ["REQ-NIST-PR.AA-01", "NISTCSF", "PR.AA-01", "Identity Management", "Identities are managed", "Identities and credentials for authorized users, services, and hardware are managed."],
  ["REQ-NIST-GV.SC-06", "NISTCSF", "GV.SC-06", "Supply Chain", "Supplier risk response", "Suppliers and third-party partners are known, prioritized, and managed based on cyber risk."],
  ["REQ-NIST-DE.CM-03", "NISTCSF", "DE.CM-03", "Continuous Monitoring", "Personnel activity monitoring", "Personnel activity and technology usage are monitored to find potentially adverse events."],
  ["REQ-HIPAA-164.312A", "HIPAA", "164.312(a)", "Access Control", "Unique user identification", "Access controls uniquely identify and track user activity."],
  ["REQ-PCI-3.5.1", "PCIDSS", "3.5.1", "Cryptography", "Encryption key management", "Cryptographic keys used to protect stored account data are secured."],
];

const mappings = [
  ["MAP-001", "CTRL-PAM-001", "REQ-SOC2-CC6.1", 94, 96, "Active", "PAM, MFA, and session recording strongly satisfy logical access requirements."],
  ["MAP-002", "CTRL-PAM-001", "REQ-ISO-A.5.16", 86, 88, "Pending Approval", "Human privileged access is covered; service identities need an explicit subcontrol."],
  ["MAP-003", "CTRL-PAM-001", "REQ-NIST-PR.AA-01", 92, 94, "Active", "Identity and credentials are governed through vaulting and MFA."],
  ["MAP-004", "CTRL-IAM-002", "REQ-SOC2-CC6.2", 91, 93, "Active", "Lifecycle reviews remove access when business need ends."],
  ["MAP-005", "CTRL-IAM-002", "REQ-HIPAA-164.312A", 83, 84, "Active", "Unique workforce identities are linked to access review evidence."],
  ["MAP-006", "CTRL-VULN-004", "REQ-ISO-A.8.8", 78, 82, "Pending Approval", "Remediation workflow covers vulnerabilities but needs EOL replacement criteria."],
  ["MAP-007", "CTRL-VULN-004", "REQ-SOC2-CC7.2", 70, 76, "Gap", "Security findings are monitored, but SLA misses are currently degraded."],
  ["MAP-008", "CTRL-EVID-007", "REQ-SOC2-CC7.2", 88, 90, "Active", "Immutable evidence proves monitoring outcomes and decision traceability."],
  ["MAP-009", "CTRL-TPRM-002", "REQ-NIST-GV.SC-06", 66, 79, "Pending Approval", "Vendor assessment exists; continuous monitoring is not complete."],
  ["MAP-010", "CTRL-LOG-003", "REQ-NIST-DE.CM-03", 90, 91, "Active", "Central logs support monitoring of user and system activity."],
  ["MAP-011", "CTRL-ENC-008", "REQ-ISO-A.8.24", 94, 95, "Active", "Encryption and key controls are continuously checked."],
  ["MAP-012", "CTRL-ENC-008", "REQ-PCI-3.5.1", 88, 86, "Active", "Key management coverage is strong but needs PCI-specific custodian evidence."],
  ["MAP-013", "CTRL-CHANGE-009", "REQ-SOC2-CC8.1", 89, 92, "Active", "Change approvals and linked tickets satisfy change management."],
  ["MAP-014", "CTRL-ENDPOINT-010", "REQ-SOC2-CC7.2", 74, 81, "Gap", "Endpoint posture is stale on a subset of devices."],
  ["MAP-015", "CTRL-TRAIN-011", "REQ-SOC2-CC6.1", 76, 78, "Active", "Training supports access responsibilities for privileged users."],
  ["MAP-016", "CTRL-BRANCH-012", "REQ-SOC2-CC8.1", 93, 94, "Active", "Branch protections enforce review before production change."],
];

const assets = [
  ["AST-AWS-IAM", "AWS IAM", "Cloud IAM", "Production", "Mission Critical", "Confidential", "cloud-sec@company.com"],
  ["AST-OKTA", "Okta Workforce", "Identity", "Production", "High", "Restricted", "it-ops@company.com"],
  ["AST-SECURITY-HUB", "AWS Security Hub", "Cloud Security", "Production", "High", "Internal", "platform-risk@company.com"],
  ["AST-S3-EVIDENCE", "S3 Evidence Vault", "Evidence Store", "Production", "High", "Restricted", "grc-platform@company.com"],
  ["AST-JIRA", "Jira", "Workflow", "Production", "Medium", "Internal", "platform-ops@company.com"],
  ["AST-CROWDSTRIKE", "CrowdStrike", "Endpoint Security", "Production", "High", "Internal", "endpoint@company.com"],
  ["AST-GITHUB", "GitHub", "Source Control", "Production", "High", "Confidential", "appsec@company.com"],
];

const controlAssets = [
  ["CTRL-PAM-001", "AST-AWS-IAM", "In Scope", "Continuous"],
  ["CTRL-PAM-001", "AST-OKTA", "In Scope", "Continuous"],
  ["CTRL-IAM-002", "AST-OKTA", "In Scope", "Daily"],
  ["CTRL-VULN-004", "AST-SECURITY-HUB", "In Scope", "Daily"],
  ["CTRL-EVID-007", "AST-S3-EVIDENCE", "In Scope", "Continuous"],
  ["CTRL-CHANGE-009", "AST-JIRA", "In Scope", "Weekly"],
  ["CTRL-ENDPOINT-010", "AST-CROWDSTRIKE", "In Scope", "Daily"],
  ["CTRL-BRANCH-012", "AST-GITHUB", "In Scope", "Daily"],
];

const policies = [
  ["POL-PAM-STD", "Privileged Access Management Standard", "Standard", "sec-ops@company.com", "In Review", "v0.3 draft"],
  ["POL-IAM-SOP", "Access Review SOP", "SOP", "it-ops@company.com", "Approved", "v1.1"],
  ["POL-EVID-SOP", "Immutable Evidence Handling SOP", "SOP", "grc-platform@company.com", "Approved", "v1.0"],
  ["POL-VULN-STD", "Vulnerability Management Standard", "Standard", "platform-risk@company.com", "Approved", "v2.0"],
  ["POL-CHANGE", "Production Change Policy", "Policy", "platform-ops@company.com", "Approved", "v3.2"],
];

const controlPolicies = [
  ["CTRL-PAM-001", "POL-PAM-STD", "Sections 2.1-2.5"],
  ["CTRL-IAM-002", "POL-IAM-SOP", "Quarterly review workflow"],
  ["CTRL-EVID-007", "POL-EVID-SOP", "Evidence retention rules"],
  ["CTRL-VULN-004", "POL-VULN-STD", "Critical SLA table"],
  ["CTRL-CHANGE-009", "POL-CHANGE", "Emergency change exception"],
];

const blueprints = [
  ["BP-PAM-MFA", "CTRL-PAM-001", "Admin MFA enforcement", "Okta", "okta.admins.where(mfa_enrolled = true)", "Hourly", "Running", "2026-07-30T04:58:00Z", 0, 99, "Approved"],
  ["BP-PAM-AWS", "CTRL-PAM-001", "Privileged AWS console session review", "AWS CloudTrail", "cloudtrail.events.where(role = 'admin' and mfa = true)", "Hourly", "Running", "2026-07-30T04:44:00Z", 0, 97, "Approved"],
  ["BP-VULN-SLA", "CTRL-VULN-004", "Critical finding SLA monitor", "AWS Security Hub", "securityhub.findings.where(severity = 'CRITICAL' and status != 'RESOLVED')", "Daily", "Needs Review", "2026-07-29T22:09:00Z", 1, 68, "Approved"],
  ["BP-EVID-WORM", "CTRL-EVID-007", "Object lock version proof", "AWS S3", "s3.objects.where(object_lock = 'COMPLIANCE' and version_id exists)", "Daily", "Running", "2026-07-30T04:50:00Z", 0, 100, "Approved"],
  ["BP-ENDPOINT", "CTRL-ENDPOINT-010", "Endpoint posture coverage", "CrowdStrike", "crowdstrike.devices.where(agent_health = 'healthy')", "Daily", "Needs Review", "2026-06-19T18:00:00Z", 41, 74, "Pending"],
  ["BP-GITHUB-BRANCH", "CTRL-BRANCH-012", "Production branch protection", "GitHub", "github.repos.where(branch = 'main' and protection.required_reviews >= 1)", "Daily", "Running", "2026-07-30T04:11:00Z", 0, 98, "Approved"],
];

const evidenceItems = [
  ["EV-PAM-LOGIN-774", "BP-PAM-AWS", "CTRL-PAM-001", "Privileged console login with MFA", "AWS CloudTrail", "Implemented", "2026-07-29T21:44:00Z", "2026-10-27", "sha256:8fd9d1b1c0a49e27", "s3://evidence/prod/pam/cloudtrail-774.json?versionId=4f9a"],
  ["EV-OKTA-MFA-112", "BP-PAM-MFA", "CTRL-PAM-001", "Okta admin MFA coverage", "Okta", "Implemented", "2026-07-30T04:58:00Z", "2026-10-28", "sha256:b9a4a145a811f0d0", "s3://evidence/prod/okta/mfa-112.json?versionId=8d2c"],
  ["EV-SHUB-FINDING-991", "BP-VULN-SLA", "CTRL-VULN-004", "Critical public workload finding", "AWS Security Hub", "Degraded", "2026-07-29T22:09:00Z", "2026-08-05", "sha256:a044c9258bbf120e", "s3://evidence/prod/vuln/securityhub-991.json?versionId=9ac2"],
  ["EV-S3-WORM-812", "BP-EVID-WORM", "CTRL-EVID-007", "Object locked evidence sample", "AWS S3", "Implemented", "2026-07-30T04:50:00Z", "2027-07-30", "sha256:5537e77fb201eb1d", "s3://evidence/prod/worm/sample-812.json?versionId=1ac7"],
  ["EV-CS-POSTURE-331", "BP-ENDPOINT", "CTRL-ENDPOINT-010", "Endpoint posture export", "CrowdStrike", "Degraded", "2026-06-19T18:00:00Z", "2026-07-20", "sha256:f1f7b7e2c9a1dd31", "s3://evidence/prod/endpoint/posture-331.json?versionId=6ca1"],
];

const relationships = [
  ["REL-001", "CTRL-PAM-001", "AST-AWS-IAM", "Asset", "IMPLEMENTED_ON", "Active", 99, "AWS IAM roles require MFA and session recording for privileged access."],
  ["REL-002", "CTRL-PAM-001", "REQ-NIST-PR.AA-01", "Requirement", "SATISFIES", "Active", 94, "PAM and SSO controls satisfy identity and credential management."],
  ["REL-003", "CTRL-PAM-001", "EV-PAM-LOGIN-774", "Evidence", "PROVED_BY", "Active", 96, "CloudTrail event shows successful MFA for privileged console session."],
  ["REL-004", "CTRL-VULN-004", "REQ-ISO-A.8.8", "Requirement", "SATISFIES", "Pending Approval", 82, "Vulnerability remediation covers most technical vulnerability obligations."],
  ["REL-005", "CTRL-ENDPOINT-010", "EV-CS-POSTURE-331", "Evidence", "PROVED_BY", "Active", 74, "CrowdStrike evidence is stale and requires refresh."],
  ["REL-006", "CTRL-CHANGE-009", "POL-CHANGE", "Policy", "GOVERNS", "Active", 90, "Production Change Policy defines approval and exception handling."],
];

const programProjects = [
  ["PRG-SOC2-2026", "tenant-acme-us", "SOC 2 Type II 2026", "grc-platform@company.com", "SOC 2, ISO 27001", 42, 83, "Auditor workspace ready for read-only package review", "In Progress"],
  ["PRG-TPRM-REFRESH", "tenant-acme-us", "Tier 1 Vendor Refresh", "vendor-risk@company.com", "NIST CSF, GDPR", 18, 61, "Questionnaires staged; two vendors blocked", "Blocked"],
  ["PRG-AI-GOV", "tenant-acme-us", "AI Governance Pilot", "privacy-risk@company.com", "ISO 42001, NIST AI RMF", 12, 48, "Internal readiness review before external audit", "Planning"],
];

const frameworkImports = [
  ["IMP-CISO-ISO42001", "CISO Assistant", "ISO 42001", "2023", "ISO42001", 90, 24, "Ready", "Preview mapping candidates and route low-confidence edges to approval."],
  ["IMP-OPENGRC-NISTCSF", "OpenGRC", "NIST CSF", "2.0", "NISTCSF", 220, 36, "Imported", "Compare imported requirements against active control mappings."],
  ["IMP-GAPPS-CMMC", "Gapps", "CMMC", "2.0", null, 320, 18, "Needs Review", "Create framework shell, normalize domains, and dedupe common controls."],
  ["IMP-ERAMBA-GDPR", "Eramba", "GDPR privacy controls", "EU", "GDPR", 120, 14, "Ready", "Map data privacy obligations to policies, vendors, and assets."],
  ["IMP-GRCENG-HARDENING", "GRC Engineering", "Integration hardening guides", "2026", null, 116, 21, "Needs Review", "Convert guide steps into first-party SaaS control implementation tasks."],
];

const assessmentRuns = [
  ["ASM-SOC2-EVIDENCE", "PRG-SOC2-2026", "SOC 2 evidence freeze", "External audit", "SOC2", 42, 6, "Evidence Collection", "audit-readiness@company.com"],
  ["ASM-VENDOR-Q3", "PRG-TPRM-REFRESH", "Quarterly Tier 1 reassessment", "Vendor assessment", "NISTCSF", 18, 4, "Review", "vendor-risk@company.com"],
  ["ASM-AI-GOV-GAP", "PRG-AI-GOV", "AI governance gap assessment", "Internal assessment", "ISO42001", 12, 9, "Planning", "privacy-risk@company.com"],
];

const accountReviews = [
  ["AR-OKTA-Q3", "Okta Workforce", "CTRL-IAM-002", "it-ops@company.com", 412, 7, "Quarterly", "Needs Review"],
  ["AR-AWS-ADMINS", "AWS IAM", "CTRL-PAM-001", "sec-ops@company.com", 28, 0, "Monthly", "Running"],
  ["AR-GITHUB-MAINTAINERS", "GitHub", "CTRL-BRANCH-012", "appsec@company.com", 63, 3, "Monthly", "Needs Review"],
];

const vendorQuestionnaires = [
  ["VQ-ACME-PAY", "Acme Payments", "CTRL-TPRM-002", "SOC 2 bridge letter and SIG-lite", "2026-08-20", "In Review", "CTRL-TPRM-002, CTRL-EVID-007", "Bridge letter expires in 21 days."],
  ["VQ-CLOUD-ID", "Cloud Identity Labs", "CTRL-PAM-001", "Identity provider annual review", "2026-09-03", "Complete", "CTRL-PAM-001, CTRL-IAM-002", "No material exceptions in latest assessment."],
  ["VQ-SCAN-CO", "ScanCo VM", "CTRL-VULN-004", "Vulnerability data processing review", "2026-08-11", "Blocked", "CTRL-VULN-004", "API scope missing container registry findings."],
];

const hardeningGuides = [
  ["HG-SALESFORCE-OAUTH", "Salesforce", "CTRL-TPRM-002", "GRC Engineering how-to-harden", "Restrict OAuth token abuse through IP allow-listing and app scope review.", "P0", "Backlog", "First-party SaaS integration restrictions"],
  ["HG-GITHUB-APP", "GitHub", "CTRL-BRANCH-012", "GRC Engineering hardening backlog", "Review GitHub App permissions, branch protection, and admin bypass controls.", "P0", "In Progress", "Repository protection and app governance"],
  ["HG-OKTA-ADMIN", "Okta", "CTRL-PAM-001", "GRC Engineering hardening backlog", "Reduce privileged identity blast radius through admin role hygiene.", "P1", "Ready", "Privileged identity hardening"],
  ["HG-NTH-PARTY", "Vendor Trust Portal", "CTRL-TPRM-002", "GRC Engineering nth-party discovery", "Track subprocessor and fourth-party signals against Tier 1 vendor records.", "P1", "Backlog", "Nth-party dependency visibility"],
];

const fairScenarioParameters = [
  ["CTRL-PAM-001", "Unauthorized admin access to production", 100000, 480000, 1400000, 0.12, 0.45, 0.9, 22, 91, 18, 1000000, 86, "High", "Internal privileged session logs, MFA exception counts, and admin access review outcomes."],
  ["CTRL-IAM-002", "Dormant workforce identity misused", 60000, 240000, 780000, 0.08, 0.28, 0.7, 18, 88, 16, 650000, 82, "High", "HR JML records, Okta deprovisioning timestamps, and quarterly access-review exceptions."],
  ["CTRL-VULN-004", "Exploit of public workload", 500000, 1700000, 5200000, 0.3, 1.15, 2.4, 46, 63, 9, 2500000, 69, "Medium", "Security Hub critical findings, SLA misses, internet exposure, and external exploit activity analogs."],
  ["CTRL-EVID-007", "Evidence tampering undermines audit attestation", 80000, 260000, 840000, 0.06, 0.22, 0.55, 16, 89, 31, 750000, 84, "High", "S3 Object Lock configuration checks, evidence hash verification, and audit package retrieval tests."],
  ["CTRL-TPRM-002", "Vendor breach exposes customer data", 250000, 950000, 3100000, 0.18, 0.75, 1.7, 39, 72, 14, 1800000, 63, "Medium", "Vendor assessment age, bridge-letter status, external rating movement, and data processing scope."],
  ["CTRL-ENDPOINT-010", "Endpoint security gap enables malware spread", 180000, 820000, 2600000, 0.24, 0.9, 1.8, 41, 74, 12, 1500000, 66, "Medium", "Endpoint health exports, stale agent counts, and incident response containment assumptions."],
];

export function createDatabase(dbPath = join(__dirname, "..", "data", "grc.db")) {
  return new DatabaseSync(dbPath);
}

export function initializeDatabase(db) {
  db.exec(readFileSync(schemaPath, "utf8"));
}

function insertMany(db, sql, rows) {
  const statement = db.prepare(sql);
  for (const row of rows) statement.run(...row);
}

function idSuffix() {
  return Math.floor(Math.random() * 900000) + 100000;
}

function actorFromContext(context = {}) {
  return context.actor ?? "local-api";
}

function auditContext(context = {}) {
  return {
    actor: actorFromContext(context),
    authMode: context.authMode ?? "internal",
    tenantId: context.tenantId ?? "tenant-acme-us",
  };
}

function appendMutationAudit(db, context, { action, targetType, targetId, outcome, reason }) {
  const audit = auditContext(context);
  db.prepare(`
    INSERT INTO mutation_audit_log (id, tenant_id, actor, auth_mode, action, target_type, target_id, outcome, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`MUT-${idSuffix()}`, audit.tenantId, audit.actor, audit.authMode, action, targetType, targetId, outcome, reason);
}

function assertTenantScope(entity, context, label) {
  if (!context?.tenantId || !entity?.tenant_id) return;
  if (entity.tenant_id !== context.tenantId) {
    const error = new Error(`${label} is outside the active tenant scope`);
    error.statusCode = 403;
    throw error;
  }
}

function nextFairVersionNumber(db, controlId) {
  const row = db.prepare("SELECT COALESCE(MAX(version_number), 0) + 1 AS next FROM fair_scenario_versions WHERE control_id = ?").get(controlId);
  return row.next;
}

/**
 * `versionId` lets the seed pass a deterministic id. Runtime edits leave it
 * undefined and get a random one, but seeded baselines must be reproducible:
 * server/governance-seed-snapshot.json is a committed artifact, and a random id
 * per export churns the file on every run and changes record identity in the
 * hosted DynamoDB snapshot for no reason.
 */
function insertFairScenarioVersion(db, scenario, context = {}, reason = "Seeded baseline", versionId = null) {
  db.prepare(`
    INSERT INTO fair_scenario_versions (
      version_id, control_id, version_number, scenario_name, probable_loss_min, probable_loss_most_likely,
      probable_loss_max, annual_event_frequency_min, annual_event_frequency_most_likely,
      annual_event_frequency_max, vulnerability_percentage, control_strength_percentage,
      loss_magnitude_reduction_percentage, appetite_threshold, confidence_percentage, data_quality,
      source_notes, changed_by, change_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    versionId ?? `FAIR-V-${idSuffix()}`,
    scenario.control_id,
    nextFairVersionNumber(db, scenario.control_id),
    scenario.scenario_name,
    scenario.probable_loss_min,
    scenario.probable_loss_most_likely,
    scenario.probable_loss_max,
    scenario.annual_event_frequency_min,
    scenario.annual_event_frequency_most_likely,
    scenario.annual_event_frequency_max,
    scenario.vulnerability_percentage,
    scenario.control_strength_percentage,
    scenario.loss_magnitude_reduction_percentage,
    scenario.appetite_threshold,
    scenario.confidence_percentage,
    scenario.data_quality,
    scenario.source_notes,
    actorFromContext(context),
    reason,
  );
}

function percentile(samples, rank) {
  return Math.round(samples[Math.floor(samples.length * rank)] ?? 0);
}

function runFairSimulation({ baseLoss, controlStrength, volatility, annualFrequency, lossMagnitudeReduction, appetiteThreshold }) {
  const samples = [];
  let seed = Math.round(baseLoss / 1000 + controlStrength * 17 + volatility * 31);
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const trialCount = 10000;
  for (let i = 0; i < trialCount; i += 1) {
    const frequency = annualFrequency * (0.55 + random() * volatility);
    const magnitude = baseLoss * (0.55 + random() * 1.9) * (1 - lossMagnitudeReduction / 100);
    const controlEffect = Math.max(0.12, 1 - controlStrength / 120);
    samples.push(frequency * magnitude * controlEffect);
  }

  samples.sort((a, b) => a - b);
  const expectedLoss = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
  const breachCount = samples.filter((sample) => sample > appetiteThreshold).length;
  const p90 = percentile(samples, 0.9);
  const sensitivityDriver = p90 > appetiteThreshold && controlStrength < 75
    ? "Control strength"
    : volatility > 1.35
      ? "Data uncertainty"
      : annualFrequency > 0.75
        ? "Event frequency"
        : lossMagnitudeReduction < 20
          ? "Loss magnitude"
          : "Residual tail exposure";

  return {
    trialCount,
    p10: percentile(samples, 0.1),
    p50: percentile(samples, 0.5),
    p90,
    expectedLoss: Math.round(expectedLoss),
    appetiteBreachProbability: Math.round((breachCount / samples.length) * 1000) / 10,
    sensitivityDriver,
  };
}

function numericInput(input, field, fallback) {
  const value = input[field] ?? fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    const error = new Error(`${field} must be a finite number`);
    error.statusCode = 400;
    throw error;
  }
  return numeric;
}

function percentageInput(input, field, fallback) {
  const value = Math.round(numericInput(input, field, fallback));
  if (value < 0 || value > 100) {
    const error = new Error(`${field} must be between 0 and 100`);
    error.statusCode = 400;
    throw error;
  }
  return value;
}

function seedProgramWorkbench(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM program_projects").get().count;
  seedFairScenarioParameters(db);
  if (count > 0) return;

  insertMany(db, "INSERT INTO program_projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", programProjects);
  insertMany(db, "INSERT INTO framework_imports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", frameworkImports);
  insertMany(db, "INSERT INTO assessment_runs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", assessmentRuns);
  insertMany(db, "INSERT INTO account_reviews VALUES (?, ?, ?, ?, ?, ?, ?, ?)", accountReviews);
  insertMany(db, "INSERT INTO vendor_questionnaires VALUES (?, ?, ?, ?, ?, ?, ?, ?)", vendorQuestionnaires);
  insertMany(db, "INSERT INTO hardening_guides VALUES (?, ?, ?, ?, ?, ?, ?, ?)", hardeningGuides);
}

function seedFairScenarioParameters(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM fair_scenario_parameters").get().count;
  if (count > 0) {
    seedFairScenarioVersions(db);
    return;
  }
  insertMany(db, "INSERT INTO fair_scenario_parameters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", fairScenarioParameters);
  seedFairScenarioVersions(db);
}

function seedFairScenarioVersions(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM fair_scenario_versions").get().count;
  if (count > 0) return;
  const scenarios = getFairSettings(db);
  for (const scenario of scenarios) {
    insertFairScenarioVersion(
      db,
      scenario,
      { actor: "System Seed", authMode: "seed", tenantId: "tenant-acme-us" },
      "Seeded baseline",
      `FAIR-V-SEED-${scenario.control_id}`,
    );
  }
}

/**
 * Load the SCF reference catalog produced by `npm run sync:scf`.
 *
 * The catalog is optional: a clone that has not run the sync yet still boots,
 * just without SCF coverage. Rows are replaced wholesale on every call so a
 * re-synced catalog lands without a migration.
 */
export function seedScfCatalog(db, catalogPath = join(__dirname, "..", "data", "scf", "catalog.json")) {
  let catalog;
  try {
    catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch {
    return { controls: 0, edges: 0 };
  }

  const controlRows = (catalog.controls ?? []).map((control) => [
    control.id,
    control.title ?? "",
    control.description ?? "",
    control.familyCode ?? "",
    control.familyName ?? "",
    Number(control.weight) || 0,
    control.cadence ?? "",
    control.nistCsfFunction ?? "",
  ]);

  const knownFrameworks = new Set(
    all(db, "SELECT id FROM frameworks").map((row) => row.id),
  );
  const knownControls = new Set(controlRows.map((row) => row[0]));

  const edgeRows = [];
  for (const framework of catalog.frameworks ?? []) {
    // Skip crosswalks for frameworks this workspace does not model; the foreign
    // key would reject them anyway.
    if (!knownFrameworks.has(framework.frameworkId)) continue;
    for (const citation of framework.citations ?? []) {
      for (const scfControlId of citation.scfControlIds ?? []) {
        if (!knownControls.has(scfControlId)) continue;
        edgeRows.push([
          framework.frameworkId,
          citation.citation,
          scfControlId,
          citation.crosswalkId ?? (framework.crosswalkIds ?? []).join(","),
        ]);
      }
    }
  }

  db.exec("DELETE FROM scf_framework_map");
  db.exec("DELETE FROM scf_controls");
  insertMany(db, "INSERT INTO scf_controls VALUES (?, ?, ?, ?, ?, ?, ?, ?)", controlRows);
  insertMany(db, "INSERT OR IGNORE INTO scf_framework_map VALUES (?, ?, ?, ?)", edgeRows);

  return { controls: controlRows.length, edges: edgeRows.length };
}

export function seedDatabase(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM controls").get().count;
  if (count > 0) {
    seedProgramWorkbench(db);
    seedScfCatalog(db);
    return;
  }

  insertMany(db, "INSERT INTO controls VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", controls);
  insertMany(db, "INSERT INTO frameworks VALUES (?, ?, ?, ?, ?)", frameworks);
  insertMany(db, "INSERT INTO requirements VALUES (?, ?, ?, ?, ?, ?)", requirements);
  insertMany(db, "INSERT INTO control_requirement_mappings VALUES (?, ?, ?, ?, ?, ?, ?)", mappings);
  insertMany(db, "INSERT INTO assets VALUES (?, ?, ?, ?, ?, ?, ?)", assets);
  insertMany(db, "INSERT INTO control_assets VALUES (?, ?, ?, ?)", controlAssets);
  insertMany(db, "INSERT INTO policies VALUES (?, ?, ?, ?, ?, ?)", policies);
  insertMany(db, "INSERT INTO control_policies VALUES (?, ?, ?)", controlPolicies);
  insertMany(db, "INSERT INTO evidence_blueprints VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", blueprints);
  insertMany(db, "INSERT INTO evidence_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", evidenceItems);
  insertMany(db, "INSERT INTO control_relationships VALUES (?, ?, ?, ?, ?, ?, ?, ?)", relationships);
  seedProgramWorkbench(db);
  seedScfCatalog(db);
}

function all(db, sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function getGovernanceSnapshot(db) {
  const controlRows = all(db, "SELECT * FROM controls ORDER BY family, name");
  const mappingRows = all(db, `
    SELECT m.*, r.citation, r.title AS requirement_title, r.framework_id, f.name AS framework_name
    FROM control_requirement_mappings m
    JOIN requirements r ON r.id = m.requirement_id
    JOIN frameworks f ON f.id = r.framework_id
    ORDER BY f.name, r.citation, m.control_id
  `);
  const requirementRows = all(db, `
    SELECT r.*, f.name AS framework_name, f.version AS framework_version
    FROM requirements r
    JOIN frameworks f ON f.id = r.framework_id
    ORDER BY f.name, r.citation
  `);
  const assetRows = all(db, `
    SELECT ca.control_id, a.*, ca.scope_status, ca.testing_cadence
    FROM control_assets ca
    JOIN assets a ON a.id = ca.asset_id
    ORDER BY a.name
  `);
  const policyRows = all(db, `
    SELECT cp.control_id, p.*, cp.section_reference
    FROM control_policies cp
    JOIN policies p ON p.id = cp.policy_id
    ORDER BY p.title
  `);
  const blueprintRows = all(db, "SELECT * FROM evidence_blueprints ORDER BY source_system, name");
  const evidenceRows = all(db, "SELECT * FROM evidence_items ORDER BY collected_at DESC");
  const fairRows = getFairSettings(db);

  const controlsWithRelations = controlRows.map((control) => {
    const mappingsForControl = mappingRows.filter((mapping) => mapping.control_id === control.id);
    const blueprintsForControl = blueprintRows.filter((blueprint) => blueprint.control_id === control.id);
    return {
      ...control,
      mappings: mappingsForControl,
      mappedFrameworks: Array.from(new Set(mappingsForControl.map((mapping) => mapping.framework_name))),
      assets: assetRows.filter((asset) => asset.control_id === control.id),
      policies: policyRows.filter((policy) => policy.control_id === control.id),
      evidenceBlueprints: blueprintsForControl,
      evidenceItems: evidenceRows.filter((item) => item.control_id === control.id),
      fairScenario: fairRows.find((scenario) => scenario.control_id === control.id) ?? null,
      mappingCount: mappingsForControl.length,
      blueprintCount: blueprintsForControl.length,
    };
  });

  const activeMappings = mappingRows.filter((mapping) => mapping.state === "Active");
  const pendingMappings = mappingRows.filter((mapping) => mapping.state === "Pending Approval");
  const gaps = mappingRows.filter((mapping) => mapping.state === "Gap");
  const avg = (values) => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length));

  return {
    stats: {
      controls: controlRows.length,
      frameworks: frameworks.length,
      requirements: requirementRows.length,
      mappings: mappingRows.length,
      activeMappings: activeMappings.length,
      pendingMappings: pendingMappings.length,
      gaps: gaps.length,
      avgEvidenceHealth: avg(controlRows.map((control) => Math.round((control.evidence_freshness + control.evidence_relevance + control.evidence_completeness) / 3))),
    },
    controls: controlsWithRelations,
    frameworks: all(db, "SELECT * FROM frameworks ORDER BY name"),
    requirements: requirementRows,
    mappings: mappingRows,
    assets: assetRows,
    policies: policyRows,
    evidenceBlueprints: blueprintRows,
    evidenceItems: evidenceRows,
    relationships: all(db, "SELECT * FROM control_relationships ORDER BY relationship_type, from_control_id"),
    fairScenarios: fairRows,
    fairScenarioVersions: getFairScenarioVersions(db),
    fairSimulationRuns: getFairSimulationRuns(db),
    mutationAuditLog: getMutationAuditLog(db),
    programWorkbench: getProgramWorkbench(db),
  };
}

/**
 * Compare our own control coverage against what SCF says a citation requires.
 *
 * Citation styles differ between our seed data and SCF's crosswalks, so each
 * requirement is resolved in two passes:
 *   1. exact match after dropping the ISO "A." Annex prefix (A.8.8 -> 8.8)
 *   2. prefix match for regulations we cite more coarsely than SCF does
 *      (164.312(a) -> 164.312(a)(1), 164.312(a)(2)(i), ...)
 * A requirement that resolves exactly never falls through to the prefix pass,
 * so 8.8 cannot silently absorb 8.8.1.
 */
export function getScfCoverage(db) {
  const rows = all(db, `
    WITH normalized AS (
      SELECT
        r.id AS requirement_id,
        r.framework_id,
        r.citation,
        r.title AS requirement_title,
        f.name AS framework_name,
        CASE WHEN r.citation LIKE 'A.%' THEN SUBSTR(r.citation, 3) ELSE r.citation END AS lookup
      FROM requirements r
      JOIN frameworks f ON f.id = r.framework_id
    ),
    exact AS (
      SELECT n.requirement_id, m.scf_control_id, 'exact' AS match_type
      FROM normalized n
      JOIN scf_framework_map m
        ON m.framework_id = n.framework_id AND m.citation = n.lookup
    ),
    prefixed AS (
      SELECT n.requirement_id, m.scf_control_id, 'prefix' AS match_type
      FROM normalized n
      JOIN scf_framework_map m
        ON m.framework_id = n.framework_id AND m.citation LIKE n.lookup || '%'
      WHERE n.requirement_id NOT IN (SELECT requirement_id FROM exact)
    ),
    resolved AS (
      SELECT * FROM exact UNION ALL SELECT * FROM prefixed
    )
    SELECT
      n.requirement_id,
      n.framework_id,
      n.framework_name,
      n.citation,
      n.requirement_title,
      COALESCE(res.match_type, 'none') AS match_type,
      res.scf_control_id,
      s.title AS scf_title,
      s.family_name AS scf_family_name,
      s.weight AS scf_weight,
      (
        SELECT COUNT(*) FROM control_requirement_mappings crm
        WHERE crm.requirement_id = n.requirement_id AND crm.state = 'Active'
      ) AS active_mapping_count
    FROM normalized n
    LEFT JOIN resolved res ON res.requirement_id = n.requirement_id
    LEFT JOIN scf_controls s ON s.id = res.scf_control_id
    ORDER BY n.framework_name, n.citation, res.scf_control_id
  `);

  const byRequirement = new Map();
  for (const row of rows) {
    let entry = byRequirement.get(row.requirement_id);
    if (!entry) {
      entry = {
        requirementId: row.requirement_id,
        frameworkId: row.framework_id,
        frameworkName: row.framework_name,
        citation: row.citation,
        requirementTitle: row.requirement_title,
        matchType: row.match_type,
        activeMappingCount: row.active_mapping_count,
        scfControls: [],
      };
      byRequirement.set(row.requirement_id, entry);
    }
    if (row.scf_control_id) {
      entry.scfControls.push({
        id: row.scf_control_id,
        title: row.scf_title,
        familyName: row.scf_family_name,
        weight: row.scf_weight,
      });
    }
  }

  const requirements = [...byRequirement.values()];
  const catalog = db.prepare("SELECT COUNT(*) AS count FROM scf_controls").get();

  return {
    attribution:
      "Secure Controls Framework (SCF) content licensed CC BY-ND by the Secure Controls Framework Council. Titles and descriptions are reproduced verbatim from GRCEngClub/scf-api.",
    catalogControlCount: catalog.count,
    requirements,
    summary: {
      requirements: requirements.length,
      resolved: requirements.filter((entry) => entry.matchType !== "none").length,
      unresolved: requirements.filter((entry) => entry.matchType === "none").length,
      suggestedControls: requirements.reduce((sum, entry) => sum + entry.scfControls.length, 0),
    },
  };
}

export function getScfControl(db, id) {
  return db.prepare("SELECT * FROM scf_controls WHERE id = ?").get(id) ?? null;
}

export function getProgramWorkbench(db) {
  return {
    projects: all(db, "SELECT * FROM program_projects ORDER BY status, name"),
    frameworkImports: all(db, "SELECT * FROM framework_imports ORDER BY validation_state, framework_name"),
    assessmentRuns: all(db, "SELECT * FROM assessment_runs ORDER BY report_state, name"),
    accountReviews: all(db, "SELECT * FROM account_reviews ORDER BY overdue_count DESC, source_system"),
    vendorQuestionnaires: all(db, "SELECT * FROM vendor_questionnaires ORDER BY due_date, vendor_name"),
    hardeningGuides: all(db, "SELECT * FROM hardening_guides ORDER BY priority, platform"),
  };
}

export function getControl(db, id) {
  const snapshot = getGovernanceSnapshot(db);
  return snapshot.controls.find((control) => control.id === id) ?? null;
}

export function updateControl(db, id, input, context = {}) {
  const existing = getControl(db, id);
  if (!existing) {
    appendMutationAudit(db, context, {
      action: "UPDATE_CONTROL",
      targetType: "Control",
      targetId: id,
      outcome: "Blocked",
      reason: "Control not found",
    });
    const error = new Error("Control not found");
    error.statusCode = 404;
    throw error;
  }
  assertTenantScope(existing, context, "Control");

  const allowedFields = [
    "name",
    "family",
    "description",
    "owner",
    "team",
    "control_type",
    "automation_level",
    "implementation_status",
    "criticality",
    "testing_cadence",
    "evidence_freshness",
    "evidence_relevance",
    "evidence_completeness",
  ];
  const entries = Object.entries(input).filter(([field]) => allowedFields.includes(field));
  if (!entries.length) {
    appendMutationAudit(db, context, {
      action: "UPDATE_CONTROL",
      targetType: "Control",
      targetId: id,
      outcome: "Blocked",
      reason: "No editable control fields supplied",
    });
    const error = new Error("No editable control fields supplied");
    error.statusCode = 400;
    throw error;
  }

  const setClause = entries.map(([field]) => `${field} = ?`).join(", ");
  db.prepare(`UPDATE controls SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...entries.map(([, value]) => value), id);
  appendMutationAudit(db, context, {
    action: "UPDATE_CONTROL",
    targetType: "Control",
    targetId: id,
    outcome: "Allowed",
    reason: `Updated fields: ${entries.map(([field]) => field).join(", ")}`,
  });
  return getControl(db, id);
}

export function getFairSettings(db) {
  return all(db, "SELECT * FROM fair_scenario_parameters ORDER BY scenario_name");
}

export function getFairScenarioVersions(db, controlId = null) {
  const params = controlId ? [controlId] : [];
  const where = controlId ? "WHERE control_id = ?" : "";
  return all(db, `SELECT * FROM fair_scenario_versions ${where} ORDER BY created_at DESC, version_number DESC, rowid DESC`, params);
}

export function getMutationAuditLog(db) {
  return all(db, "SELECT * FROM mutation_audit_log ORDER BY created_at DESC, rowid DESC LIMIT 25");
}

export function getFairSimulationRuns(db, controlId = null) {
  const params = controlId ? [controlId] : [];
  const where = controlId ? "WHERE control_id = ?" : "";
  return all(db, `SELECT * FROM fair_simulation_runs ${where} ORDER BY created_at DESC, rowid DESC LIMIT 25`, params);
}

export function createFairSimulationRun(db, controlId, input = {}, context = {}) {
  const control = db.prepare("SELECT * FROM controls WHERE id = ?").get(controlId);
  if (!control) {
    appendMutationAudit(db, context, {
      action: "CREATE_FAIR_SIMULATION_RUN",
      targetType: "FairSimulationRun",
      targetId: controlId,
      outcome: "Blocked",
      reason: "Control not found",
    });
    const error = new Error("Control not found");
    error.statusCode = 404;
    throw error;
  }
  assertTenantScope(control, context, "Control");

  const scenario = db.prepare("SELECT * FROM fair_scenario_parameters WHERE control_id = ?").get(controlId);
  if (!scenario) {
    appendMutationAudit(db, context, {
      action: "CREATE_FAIR_SIMULATION_RUN",
      targetType: "FairSimulationRun",
      targetId: controlId,
      outcome: "Blocked",
      reason: "FAIR scenario not found",
    });
    const error = new Error("FAIR scenario not found");
    error.statusCode = 404;
    throw error;
  }

  const latestVersion = db.prepare("SELECT version_id FROM fair_scenario_versions WHERE control_id = ? ORDER BY version_number DESC LIMIT 1").get(controlId);
  const approvalStates = ["Draft", "Pending Approval", "Approved", "Rejected"];
  const approvalState = approvalStates.includes(input.approval_state) ? input.approval_state : "Pending Approval";
  const runLabel = String(input.run_label ?? `${scenario.scenario_name} board run`).trim();
  if (!runLabel) {
    const error = new Error("run_label is required");
    error.statusCode = 400;
    throw error;
  }

  const baseLoss = Math.round(numericInput(input, "base_loss", scenario.probable_loss_most_likely));
  const controlStrength = percentageInput(input, "control_strength_percentage", scenario.control_strength_percentage);
  const annualFrequency = numericInput(input, "annual_event_frequency", scenario.annual_event_frequency_most_likely);
  const lossMagnitudeReduction = percentageInput(input, "loss_magnitude_reduction_percentage", scenario.loss_magnitude_reduction_percentage);
  const volatility = numericInput(input, "volatility", 1.15);
  const appetiteThreshold = Math.round(numericInput(input, "appetite_threshold", scenario.appetite_threshold));
  if (baseLoss < 0 || annualFrequency < 0 || volatility < 0 || appetiteThreshold < 0) {
    const error = new Error("FAIR simulation inputs must be non-negative");
    error.statusCode = 400;
    throw error;
  }

  const simulation = runFairSimulation({
    baseLoss,
    controlStrength,
    volatility,
    annualFrequency,
    lossMagnitudeReduction,
    appetiteThreshold,
  });
  const runId = `FAIR-RUN-${idSuffix()}`;
  const actor = actorFromContext(context);

  db.prepare(`
    INSERT INTO fair_simulation_runs (
      run_id, control_id, assumption_version_id, tenant_id, run_label, base_loss,
      control_strength_percentage, annual_event_frequency, loss_magnitude_reduction_percentage,
      volatility, trial_count, p10, p50, p90, expected_loss, appetite_threshold,
      appetite_breach_probability, sensitivity_driver, approval_state, requested_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    runId,
    controlId,
    latestVersion?.version_id ?? null,
    control.tenant_id,
    runLabel,
    baseLoss,
    controlStrength,
    annualFrequency,
    lossMagnitudeReduction,
    volatility,
    simulation.trialCount,
    simulation.p10,
    simulation.p50,
    simulation.p90,
    simulation.expectedLoss,
    appetiteThreshold,
    simulation.appetiteBreachProbability,
    simulation.sensitivityDriver,
    approvalState,
    actor,
  );

  appendMutationAudit(db, context, {
    action: "CREATE_FAIR_SIMULATION_RUN",
    targetType: "FairSimulationRun",
    targetId: runId,
    outcome: "Allowed",
    reason: `Saved ${runLabel} with ${approvalState} state`,
  });
  return db.prepare("SELECT * FROM fair_simulation_runs WHERE run_id = ?").get(runId);
}

export function decideFairSimulationRun(db, runId, input = {}, context = {}) {
  const existing = db.prepare("SELECT * FROM fair_simulation_runs WHERE run_id = ?").get(runId);
  if (!existing) {
    appendMutationAudit(db, context, {
      action: "DECIDE_FAIR_SIMULATION_RUN",
      targetType: "FairSimulationRun",
      targetId: runId,
      outcome: "Blocked",
      reason: "FAIR simulation run not found",
    });
    const error = new Error("FAIR simulation run not found");
    error.statusCode = 404;
    throw error;
  }
  assertTenantScope(existing, context, "FAIR simulation run");

  const approvalState = input.approval_state ?? input.decision;
  if (!["Approved", "Rejected"].includes(approvalState)) {
    appendMutationAudit(db, context, {
      action: "DECIDE_FAIR_SIMULATION_RUN",
      targetType: "FairSimulationRun",
      targetId: runId,
      outcome: "Blocked",
      reason: "Decision must be Approved or Rejected",
    });
    const error = new Error("Decision must be Approved or Rejected");
    error.statusCode = 400;
    throw error;
  }

  const decisionReason = String(input.decision_reason ?? input.reason ?? `${approvalState} by ${actorFromContext(context)}`).trim();
  db.prepare(`
    UPDATE fair_simulation_runs
    SET approval_state = ?, approved_by = ?, decision_reason = ?, decided_at = CURRENT_TIMESTAMP
    WHERE run_id = ?
  `).run(approvalState, actorFromContext(context), decisionReason, runId);

  appendMutationAudit(db, context, {
    action: "DECIDE_FAIR_SIMULATION_RUN",
    targetType: "FairSimulationRun",
    targetId: runId,
    outcome: "Allowed",
    reason: `${approvalState}: ${decisionReason}`,
  });
  return db.prepare("SELECT * FROM fair_simulation_runs WHERE run_id = ?").get(runId);
}

export function updateFairSetting(db, controlId, input, context = {}) {
  const existing = db.prepare("SELECT control_id FROM fair_scenario_parameters WHERE control_id = ?").get(controlId);
  if (!existing) {
    appendMutationAudit(db, context, {
      action: "UPDATE_FAIR_SETTING",
      targetType: "FairScenario",
      targetId: controlId,
      outcome: "Blocked",
      reason: "FAIR scenario not found",
    });
    const error = new Error("FAIR scenario not found");
    error.statusCode = 404;
    throw error;
  }
  const control = db.prepare("SELECT * FROM controls WHERE id = ?").get(controlId);
  assertTenantScope(control, context, "FAIR scenario");

  const allowedFields = [
    "scenario_name",
    "probable_loss_min",
    "probable_loss_most_likely",
    "probable_loss_max",
    "annual_event_frequency_min",
    "annual_event_frequency_most_likely",
    "annual_event_frequency_max",
    "vulnerability_percentage",
    "control_strength_percentage",
    "loss_magnitude_reduction_percentage",
    "appetite_threshold",
    "confidence_percentage",
    "data_quality",
    "source_notes",
  ];
  const entries = Object.entries(input).filter(([field]) => allowedFields.includes(field));
  if (!entries.length) {
    appendMutationAudit(db, context, {
      action: "UPDATE_FAIR_SETTING",
      targetType: "FairScenario",
      targetId: controlId,
      outcome: "Blocked",
      reason: "No editable FAIR fields supplied",
    });
    const error = new Error("No editable FAIR fields supplied");
    error.statusCode = 400;
    throw error;
  }

  const setClause = entries.map(([field]) => `${field} = ?`).join(", ");
  db.prepare(`UPDATE fair_scenario_parameters SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE control_id = ?`).run(...entries.map(([, value]) => value), controlId);
  const updated = db.prepare("SELECT * FROM fair_scenario_parameters WHERE control_id = ?").get(controlId);
  insertFairScenarioVersion(db, updated, context, input.change_reason ?? "Admin updated FAIR assumptions");
  appendMutationAudit(db, context, {
    action: "UPDATE_FAIR_SETTING",
    targetType: "FairScenario",
    targetId: controlId,
    outcome: "Allowed",
    reason: `Updated fields: ${entries.map(([field]) => field).join(", ")}`,
  });
  return updated;
}

export function createControl(db, input, context = {}) {
  const required = ["id", "tenant_id", "name", "family", "description", "owner", "team", "control_type", "automation_level", "implementation_status", "criticality", "testing_cadence"];
  const missing = required.filter((field) => !input[field]);
  if (missing.length) {
    appendMutationAudit(db, context, {
      action: "CREATE_CONTROL",
      targetType: "Control",
      targetId: input.id ?? "unknown",
      outcome: "Blocked",
      reason: `Missing required fields: ${missing.join(", ")}`,
    });
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
  assertTenantScope(input, context, "Control");

  const statement = db.prepare(`
    INSERT INTO controls (
      id, tenant_id, name, family, description, owner, team, control_type, automation_level,
      implementation_status, criticality, testing_cadence, evidence_freshness, evidence_relevance,
      evidence_completeness
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  statement.run(
    input.id,
    input.tenant_id,
    input.name,
    input.family,
    input.description,
    input.owner,
    input.team,
    input.control_type,
    input.automation_level,
    input.implementation_status,
    input.criticality,
    input.testing_cadence,
    input.evidence_freshness ?? 0,
    input.evidence_relevance ?? 0,
    input.evidence_completeness ?? 0,
  );
  appendMutationAudit(db, context, {
    action: "CREATE_CONTROL",
    targetType: "Control",
    targetId: input.id,
    outcome: "Allowed",
    reason: "Created control metadata record",
  });
  return getControl(db, input.id);
}
