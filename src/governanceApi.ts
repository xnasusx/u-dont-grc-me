import type { FairScenarioParameter, FairSimulationRun, GovernanceControl, GovernanceMapping, GovernanceSnapshot, GrcState, ScfCoverage } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8787" : "");
const API_WRITE_TOKEN = import.meta.env.VITE_GRC_WRITE_TOKEN ?? "";

function writeHeaders() {
  return {
    "content-type": "application/json",
    "x-grc-actor": "Browser Admin",
    ...(API_WRITE_TOKEN ? { authorization: `Bearer ${API_WRITE_TOKEN}` } : {}),
  };
}

/**
 * Fill in collections a snapshot may predate.
 *
 * The hosted DynamoDB snapshot is exported explicitly, so it can lag the schema:
 * it currently has no `fairScenarios`, `fairScenarioVersions`, `fairSimulationRuns`,
 * or `mutationAuditLog`, all of which arrived with the FAIR persistence work. The
 * app reads those arrays directly, so an un-normalised stale snapshot takes the
 * whole page down with a TypeError rather than degrading. Defaulting here keeps
 * every consumer safe regardless of how old the snapshot on the other end is.
 */
function normalizeSnapshot(snapshot: GovernanceSnapshot): GovernanceSnapshot {
  return {
    ...snapshot,
    controls: snapshot.controls ?? [],
    frameworks: snapshot.frameworks ?? [],
    requirements: snapshot.requirements ?? [],
    mappings: snapshot.mappings ?? [],
    assets: snapshot.assets ?? [],
    policies: snapshot.policies ?? [],
    evidenceBlueprints: snapshot.evidenceBlueprints ?? [],
    evidenceItems: snapshot.evidenceItems ?? [],
    relationships: snapshot.relationships ?? [],
    fairScenarios: snapshot.fairScenarios ?? [],
    fairScenarioVersions: snapshot.fairScenarioVersions ?? [],
    fairSimulationRuns: snapshot.fairSimulationRuns ?? [],
    mutationAuditLog: snapshot.mutationAuditLog ?? [],
  };
}

export async function loadGovernanceSnapshot(signal?: AbortSignal) {
  if (!API_BASE_URL) return null;
  const response = await fetch(`${API_BASE_URL}/api/governance`, { signal });
  if (!response.ok) throw new Error(`Governance API returned ${response.status}`);
  return normalizeSnapshot((await response.json()) as GovernanceSnapshot);
}

/**
 * SCF coverage prefers the live API so local database edits show up immediately,
 * and falls back to the static snapshot written by `npm run export:scf-coverage`.
 * The hosted Lambda does not serve this route, so on GitHub Pages the fallback
 * is the normal path rather than an error case.
 */
export async function loadScfCoverage(signal?: AbortSignal) {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scf/coverage`, { signal });
      if (response.ok) return (await response.json()) as ScfCoverage;
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }

  const staticUrl = `${import.meta.env.BASE_URL}scf/coverage.json`;
  const fallback = await fetch(staticUrl, { signal });
  if (!fallback.ok) throw new Error(`SCF coverage snapshot returned ${fallback.status}`);
  return (await fallback.json()) as ScfCoverage;
}

export async function saveGovernanceControl(id: string, updates: Partial<GovernanceControl>) {
  if (!API_BASE_URL) throw new Error("Governance API is not configured for writes.");
  const response = await fetch(`${API_BASE_URL}/api/controls/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: writeHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: `Control update failed with ${response.status}` }));
    throw new Error(payload.error ?? `Control update failed with ${response.status}`);
  }
  return (await response.json()) as GovernanceControl;
}

export async function saveFairScenario(controlId: string, updates: Partial<FairScenarioParameter>) {
  if (!API_BASE_URL) throw new Error("Governance API is not configured for FAIR writes.");
  const response = await fetch(`${API_BASE_URL}/api/fair-settings/${encodeURIComponent(controlId)}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: `FAIR update failed with ${response.status}` }));
    throw new Error(payload.error ?? `FAIR update failed with ${response.status}`);
  }
  return (await response.json()) as FairScenarioParameter;
}

export async function createFairSimulationRun(controlId: string, payload: Partial<FairSimulationRun>) {
  if (!API_BASE_URL) throw new Error("Governance API is not configured for FAIR simulation writes.");
  const response = await fetch(`${API_BASE_URL}/api/fair-simulation-runs/${encodeURIComponent(controlId)}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: `FAIR simulation save failed with ${response.status}` }));
    throw new Error(errorPayload.error ?? `FAIR simulation save failed with ${response.status}`);
  }
  return (await response.json()) as FairSimulationRun;
}

export async function decideFairSimulationRun(runId: string, decision: "Approved" | "Rejected", reason: string) {
  if (!API_BASE_URL) throw new Error("Governance API is not configured for FAIR simulation decisions.");
  const response = await fetch(`${API_BASE_URL}/api/fair-simulation-runs/${encodeURIComponent(runId)}/decision`, {
    method: "PATCH",
    headers: writeHeaders(),
    body: JSON.stringify({ decision, reason }),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: `FAIR simulation decision failed with ${response.status}` }));
    throw new Error(errorPayload.error ?? `FAIR simulation decision failed with ${response.status}`);
  }
  return (await response.json()) as FairSimulationRun;
}

export function buildGovernanceFallback(state: GrcState): GovernanceSnapshot {
  const frameworks = [
    { id: "SOC2", name: "SOC 2", version: "Type II 2026", category: "Assurance", requirement_count: 300 },
    { id: "ISO27001", name: "ISO 27001", version: "2022", category: "Security Management", requirement_count: 260 },
    { id: "NISTCSF", name: "NIST CSF", version: "2.0", category: "Cybersecurity", requirement_count: 220 },
  ];

  const fairScenarios: FairScenarioParameter[] = state.controls.map((control) => ({
    control_id: control.id,
    scenario_name: control.riskScenarios[0] ?? `${control.name} risk scenario`,
    probable_loss_min: control.fair.aleP10,
    probable_loss_most_likely: control.fair.aleP50,
    probable_loss_max: control.fair.aleP90,
    annual_event_frequency_min: 0.1,
    annual_event_frequency_most_likely: 0.5,
    annual_event_frequency_max: 1.4,
    vulnerability_percentage: Math.max(5, 100 - control.fair.strength),
    control_strength_percentage: control.fair.strength,
    loss_magnitude_reduction_percentage: Math.round(control.fair.plmReduction * 100),
    appetite_threshold: Math.round(control.fair.aleP90 * 0.62),
    confidence_percentage: 68,
    data_quality: "Medium",
    source_notes: "Seeded browser fallback. Start the local API to edit persisted FAIR settings.",
    updated_at: control.lastAgentReview,
  }));

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
      fairScenario: fairScenarios.find((scenario) => scenario.control_id === control.id) ?? null,
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
    fairScenarios,
    fairScenarioVersions: fairScenarios.map((scenario, index) => ({
      version_id: `fallback-fair-v-${index + 1}`,
      control_id: scenario.control_id,
      version_number: 1,
      scenario_name: scenario.scenario_name,
      probable_loss_min: scenario.probable_loss_min,
      probable_loss_most_likely: scenario.probable_loss_most_likely,
      probable_loss_max: scenario.probable_loss_max,
      annual_event_frequency_min: scenario.annual_event_frequency_min,
      annual_event_frequency_most_likely: scenario.annual_event_frequency_most_likely,
      annual_event_frequency_max: scenario.annual_event_frequency_max,
      vulnerability_percentage: scenario.vulnerability_percentage,
      control_strength_percentage: scenario.control_strength_percentage,
      loss_magnitude_reduction_percentage: scenario.loss_magnitude_reduction_percentage,
      appetite_threshold: scenario.appetite_threshold,
      confidence_percentage: scenario.confidence_percentage,
      data_quality: scenario.data_quality,
      source_notes: scenario.source_notes,
      changed_by: "Seeded fallback",
      change_reason: "Browser fallback baseline",
      created_at: scenario.updated_at,
    })),
    fairSimulationRuns: [],
    mutationAuditLog: [],
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
