import { useEffect, useMemo, useState } from "react";
import {
  approvals,
  controls,
  evidenceItems,
  frameworkRequirements,
  graphEdges,
  graphNodes,
  integrations,
  knowledgeAnswers,
  policyArtifacts,
  rbacGrants,
  remediations,
  vendors,
} from "./data";
import type { Approval, AuditEvent, Control, EvidenceItem, GraphEdge, GraphNode, GrcState } from "./types";

const STORAGE_KEY = "ollie-grc-state-v1";

function nowStamp() {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function idSuffix() {
  return Math.floor(Math.random() * 9000) + 1000;
}

function demoHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `sha256:${(hash >>> 0).toString(16).padStart(8, "0")}demo`;
}

function initialState(): GrcState {
  return {
    controls,
    graphNodes,
    graphEdges,
    approvals,
    evidenceItems,
    integrations,
    frameworkRequirements,
    vendors,
    policyArtifacts,
    remediations,
    rbacGrants,
    knowledgeAnswers,
    auditEvents: [
      {
        id: "AUD-1001",
        actor: "Framework Mapping Agent",
        action: "CREATE_EDGE:SATISFIES_PENDING",
        target: "CTRL-PAM-001 to ISO 27001 A.5.16",
        timestamp: "07/29, 10:18 PM",
        outcome: "Pending",
        detail: "Created pending mapping edge with human approval required.",
      },
      {
        id: "AUD-1002",
        actor: "Middleware Guardrail",
        action: "DELETE_NODE:CONTROL",
        target: "CTRL-VULN-004",
        timestamp: "07/29, 10:21 PM",
        outcome: "Blocked",
        detail: "Global deny rule blocked an unauthorized delete mutation.",
      },
    ],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return { ...initialState(), ...JSON.parse(raw) } as GrcState;
  } catch {
    return initialState();
  }
}

function upsertNode(nodes: GraphNode[], node: GraphNode) {
  return nodes.some((candidate) => candidate.id === node.id) ? nodes : [...nodes, node];
}

function appendAudit(state: GrcState, event: Omit<AuditEvent, "id" | "timestamp">) {
  const auditEvent: AuditEvent = {
    ...event,
    id: `AUD-${idSuffix()}`,
    timestamp: nowStamp(),
  };
  return { ...state, auditEvents: [auditEvent, ...state.auditEvents].slice(0, 12) };
}

function applyApprovalDecision(state: GrcState, id: string, decision: "Approved" | "Rejected") {
  const approval = state.approvals.find((item) => item.id === id);
  if (!approval) return state;

  const approvalsNext = state.approvals.map((item) => (item.id === id ? { ...item, state: decision } : item));
  const edgeState: GraphEdge["state"] = decision === "Approved" ? "Active" : "Rejected";
  const existingEdge = state.graphEdges.find((edge) => edge.from === approval.controlId && edge.to === approval.requirementId && edge.label === "SATISFIES");
  const proposedEdge: GraphEdge = {
    id: `edge-${idSuffix()}`,
    from: approval.controlId,
    to: approval.requirementId,
    label: "SATISFIES",
    state: edgeState,
    confidence: approval.confidence,
    narrative: approval.reasoning,
  };
  const graphEdgesNext = existingEdge
    ? state.graphEdges.map((edge) => (edge.id === existingEdge.id ? { ...edge, state: edgeState, confidence: approval.confidence, narrative: approval.reasoning } : edge))
    : [...state.graphEdges, proposedEdge];

  const graphNodesNext = upsertNode(state.graphNodes, {
    id: approval.requirementId,
    kind: "Requirement",
    label: approval.requirementId,
    subtitle: "Requirement",
    status: decision === "Approved" ? "Active" : "Pending",
  });

  return appendAudit(
    {
      ...state,
      approvals: approvalsNext,
      graphEdges: graphEdgesNext,
      graphNodes: graphNodesNext,
    },
    {
      actor: "GRC Analyst",
      action: `${decision.toUpperCase()}_AI_MAPPING`,
      target: `${approval.controlId} to ${approval.requirementId}`,
      outcome: "Allowed",
      detail: `${decision} ${approval.action.toLowerCase()} at ${approval.confidence}% confidence.`,
    },
  );
}

function connectIntegration(state: GrcState, id: string) {
  const integration = state.integrations.find((item) => item.id === id);
  if (!integration || integration.status === "Connected") return state;

  return appendAudit(
    {
      ...state,
      integrations: state.integrations.map((item) =>
        item.id === id ? { ...item, status: "Connected", mappedControls: item.mappedControls + 3 } : item,
      ),
    },
    {
      actor: "System Admin",
      action: "CONNECT_INTEGRATION",
      target: integration.name,
      outcome: "Allowed",
      detail: `Integration connected and queued ${integration.mappedControls + 3} controls for discovery mapping.`,
    },
  );
}

function ingestEvidence(state: GrcState, control: Control, payload: string) {
  let parsedPayload: unknown = payload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch {
    parsedPayload = payload;
  }

  const serialized = typeof parsedPayload === "string" ? parsedPayload : JSON.stringify(parsedPayload);
  const normalized = serialized.toLowerCase();
  const passed = normalized.includes('"mfa_verified":true') || normalized.includes('"status":"resolved"');
  const verdict: EvidenceItem["verdict"] = passed ? "Implemented" : "Degraded";
  const evidence: EvidenceItem = {
    id: `EV-SIM-${idSuffix()}`,
    controlId: control.id,
    name: "Simulated evidence review",
    type: "API Telemetry",
    method: "Agent",
    source: "Common GRC Telemetry Schema",
    collectedAt: nowStamp(),
    validUntil: "90 days",
    s3VersionUri: `s3://ollie-evidence/simulated/${control.id.toLowerCase()}-${idSuffix()}.json?versionId=pending`,
    hash: demoHash(serialized),
    verdict,
    reasoning: passed
      ? "The payload contains the required success signal for the selected control context."
      : "The payload is missing a required success signal, so the guardrail treats the control as degraded.",
  };

  const graphEdge: GraphEdge = {
    id: `edge-${idSuffix()}`,
    from: control.id,
    to: evidence.id,
    label: "PROVED_BY",
    state: "Active",
    confidence: passed ? 96 : 62,
    narrative: evidence.reasoning,
  };

  const graphNode: GraphNode = {
    id: evidence.id,
    kind: "Evidence",
    label: evidence.name,
    subtitle: "Evidence",
    status: "Active",
  };

  const controlsNext = state.controls.map((item) =>
    item.id === control.id
      ? {
          ...item,
          status: verdict,
          evidence: [evidence.id, ...item.evidence],
          evidenceFreshness: Math.min(100, item.evidenceFreshness + 2),
          lastAgentReview: nowStamp(),
        }
      : item,
  );

  return appendAudit(
    {
      ...state,
      controls: controlsNext,
      evidenceItems: [evidence, ...state.evidenceItems],
      graphEdges: [graphEdge, ...state.graphEdges],
      graphNodes: upsertNode(state.graphNodes, graphNode),
    },
    {
      actor: "Evidence & Telemetry Agent",
      action: "CREATE_EDGE:PROVED_BY",
      target: `${control.id} to ${evidence.id}`,
      outcome: "Allowed",
      detail: `${verdict} verdict written with immutable evidence hash ${evidence.hash}.`,
    },
  );
}

export function useGrcStore() {
  const [state, setState] = useState<GrcState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return useMemo(
    () => ({
      state,
      approveMapping: (id: string, decision: Approval["state"]) => {
        if (decision === "Pending") return;
        setState((current) => applyApprovalDecision(current, id, decision));
      },
      connectIntegration: (id: string) => setState((current) => connectIntegration(current, id)),
      ingestEvidence: (control: Control, payload: string) => setState((current) => ingestEvidence(current, control, payload)),
      resetWorkspace: () => setState(initialState()),
    }),
    [state],
  );
}
