export type ControlStatus = "Implemented" | "Degraded" | "Failed" | "In Progress";
export type ControlType = "Preventative" | "Detective" | "Corrective";
export type AutomationLevel = "Manual" | "Partially Automated" | "Fully Automated" | "Agentic";
export type NodeKind = "Control" | "Asset" | "Requirement" | "Evidence" | "Risk" | "Vendor" | "Policy" | "Agent";
export type EdgeLabel =
  | "SATISFIES"
  | "IMPLEMENTED_ON"
  | "PROVED_BY"
  | "MITIGATES"
  | "OWNED_BY"
  | "RELATED_TO"
  | "GOVERNS"
  | "RELIED_UPON_FOR"
  | "PROCESSES_DATA_FOR"
  | "EVALUATED_BY";

export interface FairMetrics {
  strength: number;
  lefReduction: number;
  plmReduction: number;
  aleP10: number;
  aleP50: number;
  aleP90: number;
}

export interface Indicator {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  intent: "good" | "warn" | "bad";
}

export interface Control {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  owner: string;
  team: string;
  type: ControlType;
  automation: AutomationLevel;
  status: ControlStatus;
  frameworkCoverage: number;
  evidenceFreshness: number;
  assets: string[];
  requirements: string[];
  evidence: string[];
  riskScenarios: string[];
  indicators: Indicator[];
  fair: FairMetrics;
  lastAgentReview: string;
}

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  subtitle: string;
  status?: ControlStatus | "Pending" | "Active" | "Connected";
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: EdgeLabel;
  state: "Active" | "Pending Approval" | "Rejected";
  confidence?: number;
  narrative?: string;
}

export interface Approval {
  id: string;
  controlId: string;
  requirementId: string;
  action: string;
  confidence: number;
  coverage: number;
  submittedAt: string;
  state: "Pending" | "Approved" | "Rejected";
  requirementContext: string;
  controlContext: string;
  matchingEvidence: string[];
  reasoning: string;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  status: "Healthy" | "Watching" | "Paused";
  serviceAccount: string;
  modelVersion: string;
  allowedActions: string[];
  deniedActions: string[];
  steps: string[];
  metrics: {
    toolCalls: number;
    avgTraversalDepth: number;
    failedValidations: number;
    tokensToday: number;
  };
}

export interface EvidenceItem {
  id: string;
  controlId: string;
  name: string;
  type: "System Log" | "Access Review" | "API Telemetry" | "Policy Doc";
  method: "Manual" | "API Hook" | "Agent";
  source: string;
  collectedAt: string;
  validUntil: string;
  s3VersionUri: string;
  hash: string;
  verdict: ControlStatus;
  reasoning: string;
}

export interface FrameworkRequirement {
  id: string;
  framework: "NIST CSF 2.0" | "ISO 27001" | "SOC 2";
  functionArea: string;
  text: string;
  mappedControls: string[];
  coverage: number;
  gap: string;
  approvalState: "Active" | "Pending" | "Gap";
}

export interface Integration {
  id: string;
  name: string;
  category: "Identity" | "Cloud" | "Workflow" | "Vulnerability" | "Vendor";
  status: "Connected" | "Available" | "Needs Attention";
  mappedControls: number;
  quickWin: string;
}

export interface Vendor {
  id: string;
  name: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  dataAccess: string;
  businessOwner: string;
  assessmentStatus: "Current" | "Due Soon" | "Blocked";
  externalRating: string;
  reliedUponControls: string[];
  riskSignal: string;
}

export interface PolicyArtifact {
  id: string;
  title: string;
  type: "Policy" | "Standard" | "SOP" | "Audit Narrative";
  owner: string;
  status: "Draft" | "In Review" | "Approved";
  approvedVersion: string;
  mappedControls: string[];
  lastUpdated: string;
}

export interface RemediationItem {
  id: string;
  playbook: string;
  trigger: string;
  controlId: string;
  asset: string;
  riskTier: "Low" | "Medium" | "High" | "Mission Critical";
  approvalGate: string;
  status: "Recommended" | "Awaiting Approval" | "Running" | "Complete";
}

export interface RbacGrant {
  role: "Admin" | "Analyst" | "Owner" | "TPRM" | "Executive" | "Auditor";
  globalFair: string;
  graphAccess: string;
  evidence: string;
  approvals: string;
  guardrails: string;
}

export interface KnowledgeAnswer {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  graphPath: string[];
  queryPreview: string;
}

export interface GovernanceMapping {
  id: string;
  control_id: string;
  requirement_id: string;
  coverage_percentage: number;
  mapping_confidence: number;
  state: "Active" | "Pending Approval" | "Gap" | "Rejected";
  rationale: string;
  citation: string;
  requirement_title: string;
  framework_id: string;
  framework_name: string;
}

export interface GovernanceAsset {
  control_id: string;
  id: string;
  name: string;
  asset_type: string;
  environment: string;
  criticality: string;
  data_classification: string;
  owner: string;
  scope_status: string;
  testing_cadence: string;
}

export interface GovernancePolicy {
  control_id: string;
  id: string;
  title: string;
  document_type: string;
  owner: string;
  status: string;
  approved_version: string;
  section_reference: string;
}

export interface EvidenceBlueprint {
  id: string;
  control_id: string;
  name: string;
  source_system: string;
  query_logic: string;
  schedule: string;
  status: "Running" | "Needs Review" | "Draft" | "Paused";
  last_run_at: string | null;
  freshness_days: number;
  pass_rate: number;
  owner_approval_state: "Approved" | "Pending" | "Rejected";
}

export interface GovernanceEvidenceItem {
  id: string;
  blueprint_id: string;
  control_id: string;
  name: string;
  source_system: string;
  verdict: string;
  collected_at: string;
  valid_until: string;
  hash: string;
  storage_uri: string;
}

export interface GovernanceControl {
  id: string;
  tenant_id: string;
  name: string;
  family: string;
  description: string;
  owner: string;
  team: string;
  control_type: string;
  automation_level: string;
  implementation_status: string;
  criticality: string;
  testing_cadence: string;
  evidence_freshness: number;
  evidence_relevance: number;
  evidence_completeness: number;
  mappings: GovernanceMapping[];
  mappedFrameworks: string[];
  assets: GovernanceAsset[];
  policies: GovernancePolicy[];
  evidenceBlueprints: EvidenceBlueprint[];
  evidenceItems: GovernanceEvidenceItem[];
  fairScenario: FairScenarioParameter | null;
  mappingCount: number;
  blueprintCount: number;
}

export interface GovernanceFramework {
  id: string;
  name: string;
  version: string;
  category: string;
  requirement_count: number;
}

export interface GovernanceRequirement {
  id: string;
  framework_id: string;
  citation: string;
  function_area: string;
  title: string;
  requirement_text: string;
  framework_name: string;
  framework_version: string;
}

export interface GovernanceRelationship {
  id: string;
  from_control_id: string;
  to_entity_id: string;
  to_entity_type: string;
  relationship_type: string;
  state: string;
  confidence: number | null;
  narrative: string;
}

export interface ProgramProject {
  id: string;
  tenant_id: string;
  name: string;
  owner: string;
  frameworks: string;
  scoped_controls: number;
  evidence_ready_percentage: number;
  auditor_collaboration: string;
  status: "Planning" | "In Progress" | "Ready" | "Blocked";
}

export interface FrameworkImport {
  id: string;
  source_tool: string;
  framework_name: string;
  framework_version: string;
  mapped_framework_id: string | null;
  requirement_total: number;
  candidate_controls: number;
  validation_state: "Ready" | "Needs Review" | "Blocked" | "Imported";
  next_step: string;
}

export interface AssessmentRun {
  id: string;
  project_id: string;
  name: string;
  assessment_type: string;
  framework_id: string | null;
  scoped_controls: number;
  findings_open: number;
  report_state: "Planning" | "Evidence Collection" | "Review" | "Ready";
  owner: string;
}

export interface AccountReview {
  id: string;
  source_system: string;
  control_id: string;
  reviewer: string;
  accounts_in_scope: number;
  overdue_count: number;
  review_cadence: string;
  status: "Running" | "Needs Review" | "Ready" | "Blocked";
}

export interface VendorQuestionnaire {
  id: string;
  vendor_name: string;
  control_id: string;
  questionnaire_type: string;
  due_date: string;
  response_state: "Draft" | "Sent" | "In Review" | "Blocked" | "Complete";
  relied_upon_controls: string;
  risk_signal: string;
}

export interface HardeningGuide {
  id: string;
  platform: string;
  control_id: string;
  guide_source: string;
  hardening_focus: string;
  priority: "P0" | "P1" | "P2";
  implementation_state: "Backlog" | "In Progress" | "Ready" | "Blocked";
  first_party_control: string;
}

export interface ProgramWorkbench {
  projects: ProgramProject[];
  frameworkImports: FrameworkImport[];
  assessmentRuns: AssessmentRun[];
  accountReviews: AccountReview[];
  vendorQuestionnaires: VendorQuestionnaire[];
  hardeningGuides: HardeningGuide[];
}

export interface FairScenarioParameter {
  control_id: string;
  scenario_name: string;
  probable_loss_min: number;
  probable_loss_most_likely: number;
  probable_loss_max: number;
  annual_event_frequency_min: number;
  annual_event_frequency_most_likely: number;
  annual_event_frequency_max: number;
  vulnerability_percentage: number;
  control_strength_percentage: number;
  loss_magnitude_reduction_percentage: number;
  appetite_threshold: number;
  confidence_percentage: number;
  data_quality: "High" | "Medium" | "Low";
  source_notes: string;
  updated_at: string;
}

export interface FairScenarioVersion {
  version_id: string;
  control_id: string;
  version_number: number;
  scenario_name: string;
  probable_loss_min: number;
  probable_loss_most_likely: number;
  probable_loss_max: number;
  annual_event_frequency_min: number;
  annual_event_frequency_most_likely: number;
  annual_event_frequency_max: number;
  vulnerability_percentage: number;
  control_strength_percentage: number;
  loss_magnitude_reduction_percentage: number;
  appetite_threshold: number;
  confidence_percentage: number;
  data_quality: "High" | "Medium" | "Low";
  source_notes: string;
  changed_by: string;
  change_reason: string;
  created_at: string;
}

export interface MutationAuditLogEntry {
  id: string;
  tenant_id: string;
  actor: string;
  auth_mode: string;
  action: string;
  target_type: string;
  target_id: string;
  outcome: "Allowed" | "Blocked";
  reason: string;
  created_at: string;
}

export interface FairSimulationRun {
  run_id: string;
  control_id: string;
  assumption_version_id: string | null;
  tenant_id: string;
  run_label: string;
  base_loss: number;
  control_strength_percentage: number;
  annual_event_frequency: number;
  loss_magnitude_reduction_percentage: number;
  volatility: number;
  trial_count: number;
  p10: number;
  p50: number;
  p90: number;
  expected_loss: number;
  appetite_threshold: number;
  appetite_breach_probability: number;
  sensitivity_driver: string;
  approval_state: "Draft" | "Pending Approval" | "Approved" | "Rejected";
  requested_by: string;
  approved_by: string | null;
  decision_reason: string;
  created_at: string;
  decided_at: string | null;
}

export interface GovernanceSnapshot {
  stats: {
    controls: number;
    frameworks: number;
    requirements: number;
    mappings: number;
    activeMappings: number;
    pendingMappings: number;
    gaps: number;
    avgEvidenceHealth: number;
  };
  controls: GovernanceControl[];
  frameworks: GovernanceFramework[];
  requirements: GovernanceRequirement[];
  mappings: GovernanceMapping[];
  assets: GovernanceAsset[];
  policies: GovernancePolicy[];
  evidenceBlueprints: EvidenceBlueprint[];
  evidenceItems: GovernanceEvidenceItem[];
  relationships: GovernanceRelationship[];
  fairScenarios: FairScenarioParameter[];
  fairScenarioVersions: FairScenarioVersion[];
  fairSimulationRuns: FairSimulationRun[];
  mutationAuditLog: MutationAuditLogEntry[];
  programWorkbench: ProgramWorkbench;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  outcome: "Allowed" | "Blocked" | "Pending";
  detail: string;
}

/**
 * Secure Controls Framework reference data, ingested from GRCEngClub/scf-api by
 * `npm run sync:scf` and served from `GET /api/scf/coverage`.
 *
 * SCF content is CC BY-ND: `title` is upstream text reproduced verbatim and must
 * not be rewritten or paraphrased in the UI.
 */
export interface ScfControlRef {
  id: string;
  title: string;
  familyName: string;
  weight: number;
}

export interface ScfRequirementCoverage {
  requirementId: string;
  frameworkId: string;
  frameworkName: string;
  citation: string;
  requirementTitle: string;
  /** How the citation resolved against SCF: exact, prefix-widened, or not at all. */
  matchType: "exact" | "prefix" | "none";
  /** Active mappings from our own controls to this requirement. */
  activeMappingCount: number;
  scfControls: ScfControlRef[];
}

export interface ScfCoverage {
  attribution: string;
  catalogControlCount: number;
  requirements: ScfRequirementCoverage[];
  summary: {
    requirements: number;
    resolved: number;
    unresolved: number;
    suggestedControls: number;
  };
}

/**
 * Hardening library sourced from grcengineering/how-to-harden (MIT).
 * Generated into src/hardeningData.ts by `npm run sync:hardening`.
 */
export interface HardeningComplianceRef {
  framework: string;
  citation: string;
}

export interface HardeningAuditCheck {
  id: string;
  description: string;
  query: string;
  endpoint: string;
  expected: string;
}

export interface HardeningRemediationStep {
  kind: string;
  description: string;
  detail: string;
}

export interface HardeningControl {
  id: string;
  vendorSlug: string;
  section: string;
  title: string;
  description: string;
  profileLevel: number;
  severity: string;
  guideUrl: string;
  tags: string[];
  compliance: HardeningComplianceRef[];
  auditChecks: HardeningAuditCheck[];
  remediation: HardeningRemediationStep[];
  artifacts: string[];
  /** "pack" has machine-readable audit + remediation; "guide" is heading-level only. */
  depth: "pack" | "guide";
}

export interface HardeningPlatform {
  slug: string;
  vendor: string;
  title: string;
  category: string;
  tier: string;
  description: string;
  version: string;
  maturity: string;
  lastUpdated: string;
  url: string;
  controls: HardeningControl[];
}

export interface HardeningLibrary {
  source: {
    repo: string;
    ref: string;
    license: string;
    url: string;
    site: string;
  };
  guideCount: number;
  controlCount: number;
  /** Subset of controlCount backed by a full upstream control pack. */
  packControlCount: number;
  guides: HardeningPlatform[];
}

/**
 * Nth-party vendor graph sourced from grcengineering/nthpartyfinder (MIT).
 * Generated into src/nthPartyData.ts by `npm run sync:nthparty`.
 */
export interface NthPartyRelationship {
  nth_party_domain: string;
  nth_party_organization: string;
  nth_party_layer: number;
  nth_party_customer_domain: string;
  nth_party_customer_organization: string;
  nth_party_record: string;
  nth_party_record_type: string;
  root_customer_domain: string;
  root_customer_organization: string;
  evidence: string;
}

export interface NthPartySummary {
  total_relationships: number;
  max_depth: number;
  unique_domains: number;
  unique_organizations: number;
}

export interface NthPartyScan {
  domain: string;
  scannedAt: string;
  summary: NthPartySummary;
  relationships: NthPartyRelationship[];
}

export interface NthPartyGraph {
  source: {
    repo: string;
    ref: string;
    license: string;
    url: string;
    tool: string;
  };
  scans: NthPartyScan[];
}

export interface GrcState {
  controls: Control[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  approvals: Approval[];
  evidenceItems: EvidenceItem[];
  integrations: Integration[];
  frameworkRequirements: FrameworkRequirement[];
  vendors: Vendor[];
  policyArtifacts: PolicyArtifact[];
  remediations: RemediationItem[];
  rbacGrants: RbacGrant[];
  knowledgeAnswers: KnowledgeAnswer[];
  auditEvents: AuditEvent[];
}
