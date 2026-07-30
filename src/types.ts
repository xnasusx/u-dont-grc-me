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
