import type { GovernanceMapping, GovernanceSnapshot, GrcState } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8787" : "");

export async function loadGovernanceSnapshot(signal?: AbortSignal) {
  if (!API_BASE_URL) return null;
  const response = await fetch(`${API_BASE_URL}/api/governance`, { signal });
  if (!response.ok) throw new Error(`Governance API returned ${response.status}`);
  return (await response.json()) as GovernanceSnapshot;
}

export function buildGovernanceFallback(state: GrcState): GovernanceSnapshot {
  const frameworks = [
    { id: "SOC2", name: "SOC 2", version: "Type II 2026", category: "Assurance", requirement_count: 300 },
    { id: "ISO27001", name: "ISO 27001", version: "2022", category: "Security Management", requirement_count: 260 },
    { id: "NISTCSF", name: "NIST CSF", version: "2.0", category: "Cybersecurity", requirement_count: 220 },
  ];

  const controls = state.controls.map((control) => {
    const mappings: GovernanceMapping[] = control.requirements.map((requirement, index) => ({
      id: `fallback-map-${control.id}-${index}`,
      control_id: control.id,
      requirement_id: requirement,
      coverage_percentage: control.frameworkCoverage,
      mapping_confidence: Math.max(62, control.frameworkCoverage - index * 4),
      state: index === 0 ? "Active" : "Pending Approval",
      rationale: `${control.name} is mapped through seeded prototype data until the Governance API is reachable.`,
      citation: requirement,
      requirement_title: requirement,
      framework_id: requirement.includes("SOC") ? "SOC2" : requirement.includes("ISO") ? "ISO27001" : "NISTCSF",
      framework_name: requirement.includes("SOC") ? "SOC 2" : requirement.includes("ISO") ? "ISO 27001" : "NIST CSF",
    }));
    return {
      id: control.id,
      tenant_id: control.tenantId,
      name: control.name,
      family: control.team,
      description: control.description,
      owner: control.owner,
      team: control.team,
      control_type: control.type === "Preventative" ? "Preventive" : control.type,
      automation_level: control.automation,
      implementation_status: control.status,
      criticality: control.fair.strength > 88 ? "Mission Critical" : "High",
      testing_cadence: control.automation === "Manual" ? "Quarterly" : "Continuous",
      evidence_freshness: control.evidenceFreshness,
      evidence_relevance: Math.min(100, control.evidenceFreshness + 2),
      evidence_completeness: Math.min(100, control.frameworkCoverage + 1),
      mappings,
      mappedFrameworks: Array.from(new Set(mappings.map((mapping) => mapping.framework_name))),
      assets: control.assets.map((asset) => ({
        control_id: control.id,
        id: asset,
        name: asset,
        asset_type: "Seeded asset",
        environment: "Production",
        criticality: "High",
        data_classification: "Internal",
        owner: control.owner,
        scope_status: "In Scope",
        testing_cadence: "Continuous",
      })),
      policies: [],
      evidenceBlueprints: control.evidence.map((evidence, index) => ({
        id: `BP-${evidence}`,
        control_id: control.id,
        name: `${control.name} evidence check ${index + 1}`,
        source_system: control.assets[0] ?? "Manual",
        query_logic: "Seeded fallback evidence query",
        schedule: "Daily",
        status: control.status === "Degraded" ? "Needs Review" as const : "Running" as const,
        last_run_at: control.lastAgentReview,
        freshness_days: Math.max(0, 100 - control.evidenceFreshness),
        pass_rate: control.evidenceFreshness,
        owner_approval_state: "Approved" as const,
      })),
      evidenceItems: [],
      mappingCount: mappings.length,
      blueprintCount: control.evidence.length,
    };
  });

  const mappings = controls.flatMap((control) => control.mappings);
  const avgEvidenceHealth = Math.round(controls.reduce((sum, control) => sum + Math.round((control.evidence_freshness + control.evidence_relevance + control.evidence_completeness) / 3), 0) / Math.max(1, controls.length));
  return {
    stats: {
      controls: controls.length,
      frameworks: frameworks.length,
      requirements: mappings.length,
      mappings: mappings.length,
      activeMappings: mappings.filter((mapping) => mapping.state === "Active").length,
      pendingMappings: mappings.filter((mapping) => mapping.state === "Pending Approval").length,
      gaps: mappings.filter((mapping) => mapping.state === "Gap").length,
      avgEvidenceHealth,
    },
    controls,
    frameworks,
    requirements: [],
    mappings,
    assets: controls.flatMap((control) => control.assets),
    policies: [],
    evidenceBlueprints: controls.flatMap((control) => control.evidenceBlueprints),
    evidenceItems: [],
    relationships: [],
    programWorkbench: {
      projects: [
        {
          id: "PRG-SOC2-2026",
          tenant_id: "tenant-acme-us",
          name: "SOC 2 Type II 2026",
          owner: "grc-platform@company.com",
          frameworks: "SOC 2, ISO 27001",
          scoped_controls: controls.length,
          evidence_ready_percentage: avgEvidenceHealth,
          auditor_collaboration: "Auditor workspace ready for read-only package review",
          status: "In Progress",
        },
      ],
      frameworkImports: [
        {
          id: "IMP-CISO-ISO42001",
          source_tool: "CISO Assistant",
          framework_name: "ISO 42001",
          framework_version: "2023",
          mapped_framework_id: "ISO42001",
          requirement_total: 90,
          candidate_controls: 24,
          validation_state: "Ready",
          next_step: "Preview mapping candidates and route low-confidence edges to approval.",
        },
      ],
      assessmentRuns: [
        {
          id: "ASM-SOC2-EVIDENCE",
          project_id: "PRG-SOC2-2026",
          name: "SOC 2 evidence freeze",
          assessment_type: "External audit",
          framework_id: "SOC2",
          scoped_controls: controls.length,
          findings_open: mappings.filter((mapping) => mapping.state !== "Active").length,
          report_state: "Evidence Collection",
          owner: "audit-readiness@company.com",
        },
      ],
      accountReviews: [
        {
          id: "AR-OKTA-Q3",
          source_system: "Okta Workforce",
          control_id: "CTRL-PAM-001",
          reviewer: "it-ops@company.com",
          accounts_in_scope: 412,
          overdue_count: 7,
          review_cadence: "Quarterly",
          status: "Needs Review",
        },
      ],
      vendorQuestionnaires: [
        {
          id: "VQ-ACME-PAY",
          vendor_name: "Acme Payments",
          control_id: "CTRL-TPRM-002",
          questionnaire_type: "SOC 2 bridge letter and SIG-lite",
          due_date: "2026-08-20",
          response_state: "In Review",
          relied_upon_controls: "CTRL-TPRM-002, CTRL-EVID-007",
          risk_signal: "Bridge letter expires in 21 days.",
        },
      ],
      hardeningGuides: [
        {
          id: "HG-GITHUB-APP",
          platform: "GitHub",
          control_id: "CTRL-PAM-001",
          guide_source: "GRC Engineering hardening backlog",
          hardening_focus: "Review app permissions, branch protection, and admin bypass controls.",
          priority: "P0",
          implementation_state: "In Progress",
          first_party_control: "Repository protection and app governance",
        },
      ],
    },
  };
}
