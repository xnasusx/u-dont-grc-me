export type ControlStatus = "Implemented" | "Degraded" | "Failed" | "In Progress";
export type ControlType = "Preventative" | "Detective" | "Corrective";
export type AutomationLevel = "Manual" | "Partially Automated" | "Fully Automated" | "Agentic";
export type NodeKind = "Control" | "Asset" | "Requirement" | "Evidence" | "Risk" | "Vendor" | "Agent";
export type EdgeLabel = "SATISFIES" | "IMPLEMENTED_ON" | "PROVED_BY" | "MITIGATES" | "OWNED_BY" | "RELATED_TO" | "EVALUATED_BY";

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

export interface Integration {
  id: string;
  name: string;
  category: "Identity" | "Cloud" | "Workflow" | "Vulnerability" | "Vendor";
  status: "Connected" | "Available" | "Needs Attention";
  mappedControls: number;
  quickWin: string;
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
  auditEvents: AuditEvent[];
}
