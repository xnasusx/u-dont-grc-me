import {
  Activity,
  AlertTriangle,
  AppWindow,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Cloud,
  FileCheck2,
  FileSearch,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  Landmark,
  LayoutDashboard,
  ListChecks,
  KeyRound,
  LockKeyhole,
  Network,
  PieChart,
  Play,
  PlugZap,
  Route,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TableProperties,
  UserCheck,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { agentWorkflows } from "./data";
import { useGrcStore } from "./store";
import type {
  Approval,
  AuditEvent,
  Control,
  EvidenceItem,
  FrameworkRequirement,
  GraphEdge,
  GraphNode,
  Integration,
  KnowledgeAnswer,
  PolicyArtifact,
  RbacGrant,
  RemediationItem,
  Vendor,
} from "./types";
import { aggregateAle, formatCurrency, healthScore, seededMonteCarlo, statusClass } from "./utils";

type View = "command" | "governance" | "compliance" | "risk" | "admin";

const views: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "governance", label: "Governance", icon: Landmark },
  { id: "compliance", label: "Compliance", icon: FileCheck2 },
  { id: "risk", label: "Risk", icon: CircleDollarSign },
  { id: "admin", label: "Admin", icon: Settings },
];

function App() {
  const { state, approveMapping, connectIntegration, ingestEvidence, resetWorkspace } = useGrcStore();
  const [activeView, setActiveView] = useState<View>("command");
  const [selectedControlId, setSelectedControlId] = useState("CTRL-PAM-001");
  const [frameworkFilter, setFrameworkFilter] = useState("All frameworks");
  const [ownerFilter, setOwnerFilter] = useState("All owners");
  const [persona, setPersona] = useState("GRC Analyst");

  const selectedControl = state.controls.find((control) => control.id === selectedControlId) ?? state.controls[0];
  const filteredControls = state.controls.filter((control) => {
    const frameworkMatches = frameworkFilter === "All frameworks" || control.requirements.some((req) => req.includes(frameworkFilter));
    const ownerMatches = ownerFilter === "All owners" || control.owner === ownerFilter;
    return frameworkMatches && ownerMatches;
  });

  const owners = Array.from(new Set(state.controls.map((control) => control.owner)));
  const ale = aggregateAle(filteredControls);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/u-dont-grc-me-logo.png" alt="u dont GRC me logo" width="54" height="54" />
          <div>
            <strong>u dont GRC me</strong>
            <span>Control-first risk garden</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary navigation">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button key={view.id} className={activeView === view.id ? "nav-item active" : "nav-item"} onClick={() => setActiveView(view.id)}>
                <Icon size={18} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-status">
          <div className="status-light" />
          <div>
            <strong>Runtime guardrails active</strong>
            <span>0 unauthorized graph writes blocked today</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <GlobalFilters
          frameworkFilter={frameworkFilter}
          ownerFilter={ownerFilter}
          persona={persona}
          owners={owners}
          setFrameworkFilter={setFrameworkFilter}
          setOwnerFilter={setOwnerFilter}
          setPersona={setPersona}
          resetWorkspace={resetWorkspace}
        />

        {activeView === "command" && (
          <CommandCenterView controls={filteredControls} approvals={state.approvals} ale={ale} selectedControl={selectedControl} setActiveView={setActiveView} setSelectedControlId={setSelectedControlId} />
        )}
        {activeView === "governance" && (
          <GovernanceView
            controls={filteredControls}
            selectedControl={selectedControl}
            graphNodes={state.graphNodes}
            graphEdges={state.graphEdges}
            frameworkRequirements={state.frameworkRequirements}
            policyArtifacts={state.policyArtifacts}
            setSelectedControlId={setSelectedControlId}
          />
        )}
        {activeView === "compliance" && (
          <ComplianceView
            approvals={state.approvals}
            selectedControl={selectedControl}
            evidenceItems={state.evidenceItems}
            frameworkRequirements={state.frameworkRequirements}
            onDecision={approveMapping}
            onIngestEvidence={ingestEvidence}
          />
        )}
        {activeView === "risk" && <RiskView controls={filteredControls} selectedControl={selectedControl} setSelectedControlId={setSelectedControlId} />}
        {activeView === "admin" && (
          <AdminView
            auditEvents={state.auditEvents}
            integrations={state.integrations}
            vendors={state.vendors}
            remediations={state.remediations}
            rbacGrants={state.rbacGrants}
            knowledgeAnswers={state.knowledgeAnswers}
            onConnect={connectIntegration}
          />
        )}
      </main>
    </div>
  );
}

function GlobalFilters({
  frameworkFilter,
  ownerFilter,
  persona,
  owners,
  setFrameworkFilter,
  setOwnerFilter,
  setPersona,
  resetWorkspace,
}: {
  frameworkFilter: string;
  ownerFilter: string;
  persona: string;
  owners: string[];
  setFrameworkFilter: (value: string) => void;
  setOwnerFilter: (value: string) => void;
  setPersona: (value: string) => void;
  resetWorkspace: () => void;
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">u dont GRC me</p>
        <h1>{viewTitle(persona)}</h1>
      </div>
      <div className="filter-row" aria-label="Global filters">
        <label>
          <Filter size={15} />
          <select value={frameworkFilter} onChange={(event) => setFrameworkFilter(event.target.value)}>
            <option>All frameworks</option>
            <option>NIST</option>
            <option>ISO</option>
            <option>SOC 2</option>
          </select>
        </label>
        <label>
          <UserCheck size={15} />
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option>All owners</option>
            {owners.map((owner) => (
              <option key={owner}>{owner}</option>
            ))}
          </select>
        </label>
        <label>
          <AppWindow size={15} />
          <select value={persona} onChange={(event) => setPersona(event.target.value)}>
            <option>GRC Analyst</option>
            <option>Control Owner</option>
            <option>Executive</option>
            <option>System Admin</option>
          </select>
        </label>
        <button className="secondary-button compact-button" onClick={resetWorkspace}>
          <RefreshCw size={15} /> Reset demo
        </button>
      </div>
    </header>
  );
}

function viewTitle(persona: string) {
  if (persona === "Executive") return "Program Command Center";
  if (persona === "Control Owner") return "Owner Action Workspace";
  if (persona === "System Admin") return "GRC Operations Console";
  return "Control Graph Workspace";
}

function CommandCenterView({
  controls,
  approvals,
  ale,
  selectedControl,
  setActiveView,
  setSelectedControlId,
}: {
  controls: Control[];
  approvals: Approval[];
  ale: { p10: number; p50: number; p90: number };
  selectedControl: Control;
  setActiveView: (view: View) => void;
  setSelectedControlId: (id: string) => void;
}) {
  return (
    <section className="view-stack">
      <Dashboard controls={controls} approvals={approvals} ale={ale} setActiveView={setActiveView} setSelectedControlId={setSelectedControlId} />
      <section className="dashboard-grid">
        <SavedViews />
        <ChartBuilder controls={controls} />
      </section>
      <RiskLab selectedControl={selectedControl} />
    </section>
  );
}

function SavedViews() {
  const savedViews = [
    { name: "Board Risk Brief", owner: "Executive", focus: "P90 FAIR exposure, overdue evidence, top degraded controls" },
    { name: "Audit Standup", owner: "GRC Analyst", focus: "Pending mappings, evidence freshness, audit blockers" },
    { name: "Owner Digest", owner: "Control Owner", focus: "Assigned controls, SLA misses, next evidence request" },
  ];

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dashboards</p>
          <h2>Saved Views</h2>
        </div>
        <Save size={19} />
      </div>
      <div className="saved-view-list">
        {savedViews.map((view) => (
          <button className="saved-view" key={view.name}>
            <strong>{view.name}</strong>
            <span>{view.owner}</span>
            <p>{view.focus}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ChartBuilder({ controls }: { controls: Control[] }) {
  const chartRows = [
    { label: "Control Health", value: Math.round(controls.reduce((sum, control) => sum + healthScore(control), 0) / controls.length), color: "rose" },
    { label: "Evidence Freshness", value: Math.round(controls.reduce((sum, control) => sum + control.evidenceFreshness, 0) / controls.length), color: "ash" },
    { label: "Framework Coverage", value: Math.round(controls.reduce((sum, control) => sum + control.frameworkCoverage, 0) / controls.length), color: "mauve" },
  ];

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Chart Studio</p>
          <h2>Create Charts</h2>
        </div>
        <BarChart3 size={19} />
      </div>
      <div className="chart-studio">
        {chartRows.map((row) => (
          <div className="chart-row" key={row.label}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.value}%</span>
            </div>
            <div className="bar-track">
              <div className={`bar-fill ${row.color}`} style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <button className="secondary-button chart-action">
        <Save size={16} /> Save View
      </button>
    </section>
  );
}

function GovernanceSummary({ selectedControl }: { selectedControl: Control }) {
  return (
    <section className="metric-grid">
      <Metric label="Control library" value="4 controls" detail="Control-first source of truth with owner and implementation context." icon={ShieldCheck} />
      <Metric label="Policy drafts" value="1 active" detail={`${selectedControl.name} standard is graph-grounded.`} icon={FileText} />
      <Metric label="Cross-maps" value={String(selectedControl.requirements.length)} detail="Framework requirements linked to this control." icon={GitBranch} />
      <Metric label="Owners assigned" value="100%" detail="Every seeded control has an accountable owner." icon={UserCheck} />
    </section>
  );
}

function FrameworkMapper({ requirements }: { requirements: FrameworkRequirement[] }) {
  const avgCoverage = Math.round(requirements.reduce((sum, requirement) => sum + requirement.coverage, 0) / requirements.length);
  const pending = requirements.filter((requirement) => requirement.approvalState === "Pending").length;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Framework mapper</p>
          <h2>Requirements, Coverage & Approval State</h2>
        </div>
        <Route size={19} />
      </div>
      <div className="summary-strip">
        <Detail label="Primary framework" value="NIST CSF 2.0" />
        <Detail label="Average coverage" value={`${avgCoverage}%`} />
        <Detail label="Pending mappings" value={String(pending)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Mapped Controls</th>
              <th>Coverage</th>
              <th>Gap</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((requirement) => (
              <tr key={requirement.id}>
                <td>
                  <strong>{requirement.id}</strong>
                  <span>{requirement.framework} / {requirement.functionArea}</span>
                </td>
                <td>{requirement.mappedControls.join(", ")}</td>
                <td>
                  <div className="coverage-cell">
                    <strong>{requirement.coverage}%</strong>
                    <div className="bar-track">
                      <div className="bar-fill rose" style={{ width: `${requirement.coverage}%` }} />
                    </div>
                  </div>
                </td>
                <td>{requirement.gap}</td>
                <td><StatusPill status={requirement.approvalState} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PolicyLibrary({ policyArtifacts }: { policyArtifacts: PolicyArtifact[] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Policy traceability</p>
          <h2>Documents Connected to Controls</h2>
        </div>
        <BookOpen size={19} />
      </div>
      <div className="artifact-grid">
        {policyArtifacts.map((artifact) => (
          <div className="artifact-card" key={artifact.id}>
            <div>
              <strong>{artifact.title}</strong>
              <span>{artifact.id} / {artifact.type}</span>
            </div>
            <StatusPill status={artifact.status} />
            <p>{artifact.mappedControls.join(", ")} / {artifact.approvedVersion} / {artifact.owner}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DataModelRules() {
  const rules = [
    "Every node and edge carries tenant_id and business-unit scope.",
    "AI writes start as PENDING_APPROVAL unless the middleware allow-list permits the action.",
    "Evidence edges store exact S3 bucket, key, version ID, hash, and retention context.",
    "The graph remains the source of truth; vector search only returns candidate graph identifiers.",
  ];

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Graph data model</p>
          <h2>Control-Centric Rules</h2>
        </div>
        <Network size={19} />
      </div>
      <div className="pipeline">
        {rules.map((rule, index) => (
          <PipelineStep key={rule} label={`Rule ${index + 1}`} detail={rule} active />
        ))}
      </div>
    </section>
  );
}

function AuditReadiness({ controls, approvals, evidenceItems }: { controls: Control[]; approvals: Approval[]; evidenceItems: EvidenceItem[] }) {
  const pendingApprovals = approvals.filter((approval) => approval.state === "Pending").length;
  const validEvidence = evidenceItems.filter((item) => item.verdict === "Implemented").length;
  const readiness = Math.max(0, Math.min(100, 84 - pendingApprovals * 7 + validEvidence * 2));

  return (
    <section className="panel audit-readiness">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Audit Readiness</p>
          <h2>Evidence, Exceptions & Review Gates</h2>
        </div>
        <ClipboardCheck size={19} />
      </div>
      <div className="readiness-score">
        <PieChart size={42} />
        <div>
          <strong>{readiness}% ready</strong>
          <span>{pendingApprovals} pending AI mappings, {validEvidence} implemented evidence records, {controls.length} scoped control set</span>
        </div>
      </div>
      <div className="audit-checklist">
        <PipelineStep label="Framework scope locked" detail="NIST, ISO, and SOC 2 mappings are tracked through control edges." active />
        <PipelineStep label="Evidence linked" detail="PROVED_BY edges connect evidence records to controls." active={validEvidence > 0} />
        <PipelineStep label="Human approvals cleared" detail="Pending AI mappings must be approved or rejected before audit freeze." active={pendingApprovals === 0} />
      </div>
    </section>
  );
}

function RiskRegister({ controls, setSelectedControlId }: { controls: Control[]; setSelectedControlId: (id: string) => void }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Risk Register</p>
          <h2>Control-Driven Risk Scenarios</h2>
        </div>
        <ListChecks size={19} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Control</th>
              <th>Status</th>
              <th>P90 exposure</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.id}>
                <td>
                  <strong>{control.riskScenarios[0]}</strong>
                  <span>{control.team}</span>
                </td>
                <td>{control.name}</td>
                <td><StatusPill status={control.status} /></td>
                <td>{formatCurrency(control.fair.aleP90)}</td>
                <td>
                  <button className="secondary-button" onClick={() => setSelectedControlId(control.id)}>
                    Open FAIR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminSummary() {
  return (
    <section className="metric-grid">
      <Metric label="Agent boundary" value="3 agents" detail="Each agent has an allow-list, deny-list, and service account." icon={Bot} />
      <Metric label="Integrations" value="5 apps" detail="Identity, cloud, workflow, vulnerability, and vendor connectors." icon={PlugZap} />
      <Metric label="Mutation ledger" value="12 max" detail="Recent graph writes and blocked guardrail actions." icon={LockKeyhole} />
      <Metric label="Demo storage" value="Local" detail="Browser-local API-shaped state until a backend is connected." icon={Settings} />
    </section>
  );
}

function GovernanceView({
  controls,
  selectedControl,
  graphNodes,
  graphEdges,
  frameworkRequirements,
  policyArtifacts,
  setSelectedControlId,
}: {
  controls: Control[];
  selectedControl: Control;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  frameworkRequirements: FrameworkRequirement[];
  policyArtifacts: PolicyArtifact[];
  setSelectedControlId: (id: string) => void;
}) {
  return (
    <section className="view-stack">
      <GovernanceSummary selectedControl={selectedControl} />
      <ControlsView controls={controls} selectedControl={selectedControl} graphNodes={graphNodes} graphEdges={graphEdges} setSelectedControlId={setSelectedControlId} />
      <FrameworkMapper requirements={frameworkRequirements} />
      <DataModelRules />
      <PolicyLibrary policyArtifacts={policyArtifacts} />
      <DocsView selectedControl={selectedControl} />
    </section>
  );
}

function ComplianceView({
  approvals,
  selectedControl,
  evidenceItems,
  frameworkRequirements,
  onDecision,
  onIngestEvidence,
}: {
  approvals: Approval[];
  selectedControl: Control;
  evidenceItems: EvidenceItem[];
  frameworkRequirements: FrameworkRequirement[];
  onDecision: (id: string, state: "Approved" | "Rejected") => void;
  onIngestEvidence: (control: Control, payload: string) => void;
}) {
  return (
    <section className="view-stack">
      <AuditReadiness controls={[selectedControl]} approvals={approvals} evidenceItems={evidenceItems} />
      <AuditPackage requirements={frameworkRequirements} evidenceItems={evidenceItems} />
      <ApprovalsView approvals={approvals} onDecision={onDecision} />
      <EvidenceView selectedControl={selectedControl} evidenceItems={evidenceItems} onIngestEvidence={onIngestEvidence} />
    </section>
  );
}

function RiskView({ controls, selectedControl, setSelectedControlId }: { controls: Control[]; selectedControl: Control; setSelectedControlId: (id: string) => void }) {
  return (
    <section className="view-stack">
      <RiskRegister controls={controls} setSelectedControlId={setSelectedControlId} />
      <RiskLab selectedControl={selectedControl} />
    </section>
  );
}

function AdminView({
  auditEvents,
  integrations,
  vendors,
  remediations,
  rbacGrants,
  knowledgeAnswers,
  onConnect,
}: {
  auditEvents: AuditEvent[];
  integrations: Integration[];
  vendors: Vendor[];
  remediations: RemediationItem[];
  rbacGrants: RbacGrant[];
  knowledgeAnswers: KnowledgeAnswer[];
  onConnect: (id: string) => void;
}) {
  return (
    <section className="view-stack">
      <AdminSummary />
      <IntegrationsView integrations={integrations} onConnect={onConnect} />
      <KnowledgeSystemView answers={knowledgeAnswers} />
      <VendorRiskView vendors={vendors} />
      <RemediationView remediations={remediations} />
      <TrustRbacView grants={rbacGrants} />
      <AgentsView auditEvents={auditEvents} />
    </section>
  );
}

function Dashboard({
  controls,
  approvals,
  ale,
  setActiveView,
  setSelectedControlId,
}: {
  controls: Control[];
  approvals: Approval[];
  ale: { p10: number; p50: number; p90: number };
  setActiveView: (view: View) => void;
  setSelectedControlId: (id: string) => void;
}) {
  const implemented = controls.filter((control) => control.status === "Implemented").length;
  const degraded = controls.filter((control) => control.status === "Degraded").length;
  const inProgress = controls.filter((control) => control.status === "In Progress").length;
  const averageHealth = Math.round(controls.reduce((sum, control) => sum + healthScore(control), 0) / controls.length);
  const riskSorted = [...controls].sort((a, b) => b.fair.aleP90 - a.fair.aleP90);

  return (
    <section className="view-stack">
      <div className="metric-grid">
        <Metric label="Median annualized loss exposure" value={formatCurrency(ale.p50)} detail={`P10 ${formatCurrency(ale.p10)} / P90 ${formatCurrency(ale.p90)}`} icon={CircleDollarSign} />
        <Metric label="Control health" value={`${averageHealth}%`} detail={`${implemented} implemented, ${degraded} degraded, ${inProgress} in progress`} icon={ShieldCheck} />
        <Metric label="Pending AI approvals" value={String(approvals.filter((approval) => approval.state === "Pending").length)} detail="Mappings waiting for human decision" icon={ClipboardCheck} />
        <Metric label="Evidence freshness" value="82%" detail="Object-locked evidence with version IDs" icon={LockKeyhole} />
      </div>

      <div className="dashboard-grid">
        <section className="panel wide">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Risk posture</p>
              <h2>FAIR exposure by control</h2>
            </div>
            <button className="icon-button" title="Refresh">
              <RefreshCw size={18} />
            </button>
          </div>
          <div className="risk-bars">
            {riskSorted.map((control) => (
              <button
                className="risk-bar-row"
                key={control.id}
                onClick={() => {
                  setSelectedControlId(control.id);
                  setActiveView("governance");
                }}
              >
                <span>{control.name}</span>
                <div className="bar-track">
                  <div className={`bar-fill ${statusClass(control.status)}`} style={{ width: `${Math.min(100, control.fair.aleP90 / 55000)}%` }} />
                </div>
                <strong>{formatCurrency(control.fair.aleP90)}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quick wins</p>
              <h2>Day 0 value</h2>
            </div>
            <Sparkles size={19} />
          </div>
          <div className="timeline">
            <TimelineItem icon={Cloud} label="AWS connected" detail="Security Hub mapped 18 controls from live findings." />
            <TimelineItem icon={KeyRound} label="Identity discovered" detail="Okta generated MFA and lifecycle evidence." />
            <TimelineItem icon={GitBranch} label="Graph bootstrapped" detail="36 edges created, 2 pending approval." />
          </div>
        </section>
      </div>
    </section>
  );
}

function ControlsView({
  controls,
  selectedControl,
  graphNodes,
  graphEdges,
  setSelectedControlId,
}: {
  controls: Control[];
  selectedControl: Control;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  setSelectedControlId: (id: string) => void;
}) {
  return (
    <section className="controls-layout">
      <div className="control-list">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Control center</p>
            <h2>Controls</h2>
          </div>
          <TableProperties size={18} />
        </div>
        {controls.map((control) => (
          <button key={control.id} className={selectedControl.id === control.id ? "control-row selected" : "control-row"} onClick={() => setSelectedControlId(control.id)}>
            <div>
              <strong>{control.name}</strong>
              <span>{control.id}</span>
            </div>
            <StatusPill status={control.status} />
          </button>
        ))}
      </div>

      <div className="control-detail">
        <section className="panel">
          <div className="control-title">
            <div>
              <p className="eyebrow">{selectedControl.id}</p>
              <h2>{selectedControl.name}</h2>
            </div>
            <StatusPill status={selectedControl.status} />
          </div>
          <p className="description">{selectedControl.description}</p>
          <div className="detail-grid">
            <Detail label="Owner" value={selectedControl.owner} />
            <Detail label="Team" value={selectedControl.team} />
            <Detail label="Type" value={selectedControl.type} />
            <Detail label="Automation" value={selectedControl.automation} />
            <Detail label="Framework coverage" value={`${selectedControl.frameworkCoverage}%`} />
            <Detail label="Health score" value={`${healthScore(selectedControl)}%`} />
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sub-graph</p>
              <h2>Edges around this control</h2>
            </div>
            <Network size={19} />
          </div>
          <GraphView selectedControlId={selectedControl.id} graphNodes={graphNodes} graphEdges={graphEdges} />
        </section>

        <section className="split-panels">
          <div className="panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">KPIs and KRIs</p>
                <h2>Operating signals</h2>
              </div>
            </div>
            <div className="signal-list">
              {selectedControl.indicators.map((indicator) => (
                <div className="signal" key={indicator.label}>
                  <span>{indicator.label}</span>
                  <strong className={indicator.intent}>{indicator.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Linked requirements</p>
                <h2>Cross-maps</h2>
              </div>
            </div>
            <div className="tag-cloud">
              {selectedControl.requirements.map((requirement) => (
                <span key={requirement}>{requirement}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function GraphView({ selectedControlId, graphNodes, graphEdges }: { selectedControlId: string; graphNodes: GraphNode[]; graphEdges: GraphEdge[] }) {
  const relatedEdges = graphEdges.filter((edge) => edge.from === selectedControlId);
  const visibleIds = new Set([selectedControlId, ...relatedEdges.map((edge) => edge.to)]);
  const visibleNodes = graphNodes.filter((node) => visibleIds.has(node.id));
  const positions = useMemo(() => {
    const center = { x: 310, y: 205 };
    const map = new Map<string, { x: number; y: number }>();
    map.set(selectedControlId, center);
    visibleNodes
      .filter((node) => node.id !== selectedControlId)
      .forEach((node, index, array) => {
        const angle = (Math.PI * 2 * index) / Math.max(1, array.length) - Math.PI / 2;
        map.set(node.id, { x: center.x + Math.cos(angle) * 230, y: center.y + Math.sin(angle) * 145 });
      });
    return map;
  }, [selectedControlId, visibleNodes]);

  return (
    <div className="graph-shell">
      <svg viewBox="0 0 620 410" role="img" aria-label="Control relationship graph">
        {relatedEdges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={edge.id}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={edge.state === "Pending Approval" ? "graph-edge pending" : "graph-edge"} />
              <text x={midX} y={midY - 8} className="edge-label">
                {edge.label}
              </text>
            </g>
          );
        })}
        {visibleNodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          return (
            <g key={node.id}>
              <circle cx={position.x} cy={position.y} r={node.kind === "Control" ? 48 : 38} className={`graph-node ${node.kind.toLowerCase()}`} />
              <text x={position.x} y={position.y - 4} className="node-label">
                {node.label.length > 20 ? `${node.label.slice(0, 20)}...` : node.label}
              </text>
              <text x={position.x} y={position.y + 15} className="node-subtitle">
                {node.subtitle}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="edge-inspector">
        {relatedEdges.map((edge) => (
          <div key={edge.id} className="edge-card">
            <strong>{edge.label}</strong>
            <span>{edge.narrative}</span>
            {edge.confidence && <small>{edge.confidence}% AI confidence</small>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalsView({ approvals, onDecision }: { approvals: Approval[]; onDecision: (id: string, state: "Approved" | "Rejected") => void }) {
  const [selectedId, setSelectedId] = useState(approvals[0]?.id);
  const selected = approvals.find((approval) => approval.id === selectedId) ?? approvals[0];

  return (
    <section className="approvals-layout">
      <div className="approval-inbox">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Human-in-the-loop</p>
            <h2>Pending graph mutations</h2>
          </div>
        </div>
        {approvals.map((approval) => (
          <button key={approval.id} className={selected?.id === approval.id ? "approval-row selected" : "approval-row"} onClick={() => setSelectedId(approval.id)}>
            <div>
              <strong>{approval.action}</strong>
              <span>{approval.controlId} to {approval.requirementId}</span>
            </div>
            <StatusPill status={approval.state} />
          </button>
        ))}
      </div>
      {selected && (
        <section className="panel approval-detail">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{selected.id} / {selected.submittedAt}</p>
              <h2>{selected.action}</h2>
            </div>
            <div className="confidence">{selected.confidence}% confidence</div>
          </div>
          <div className="diff-viewer">
            <div>
              <h3>Requirement context</h3>
              <p>{highlightTerms(selected.requirementContext, selected.matchingEvidence)}</p>
            </div>
            <div>
              <h3>Control context</h3>
              <p>{highlightTerms(selected.controlContext, selected.matchingEvidence)}</p>
            </div>
          </div>
          <div className="reasoning-box">
            <BrainCircuit size={18} />
            <p>{selected.reasoning}</p>
          </div>
          <div className="action-row">
            <button className="primary-button" onClick={() => onDecision(selected.id, "Approved")}>
              <Check size={17} /> Approve
            </button>
            <button className="danger-button" onClick={() => onDecision(selected.id, "Rejected")}>
              <X size={17} /> Reject
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function EvidenceView({
  selectedControl,
  evidenceItems,
  onIngestEvidence,
}: {
  selectedControl: Control;
  evidenceItems: EvidenceItem[];
  onIngestEvidence: (control: Control, payload: string) => void;
}) {
  const [payload, setPayload] = useState('{"identity_id":"admin@company.com","asset_id":"aws-prod-iam","action_taken":"Login_Success","mfa_verified":true}');

  const validateEvidence = () => {
    onIngestEvidence(selectedControl, payload);
  };

  return (
    <section className="evidence-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence agent</p>
            <h2>Telemetry review simulator</h2>
          </div>
          <Play size={19} />
        </div>
        <label className="field-label">
          Control context
          <input value={`${selectedControl.id} - ${selectedControl.name}`} readOnly />
        </label>
        <label className="field-label">
          Common telemetry payload
          <textarea value={payload} onChange={(event) => setPayload(event.target.value)} rows={9} />
        </label>
        <button className="primary-button" onClick={validateEvidence}>
          <BrainCircuit size={17} /> Validate evidence
        </button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Immutable pipeline</p>
            <h2>Graph-to-S3 sync</h2>
          </div>
          <LockKeyhole size={19} />
        </div>
        <div className="pipeline">
          <PipelineStep label="Schema validation" detail="Drop malformed telemetry before it reaches a prompt." active />
          <PipelineStep label="Agent decision" detail="Structured JSON verdict only; no raw graph query output." active />
          <PipelineStep label="S3 Object Lock" detail="Write evidence with WORM retention and hash." active={evidenceItems.some((item) => item.name === "Simulated evidence review")} />
          <PipelineStep label="PROVED_BY edge" detail="Create edge with exact S3 VersionId and reasoning." active={evidenceItems.some((item) => item.name === "Simulated evidence review")} />
        </div>
      </section>

      <section className="panel wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence library</p>
            <h2>Control-linked artifacts</h2>
          </div>
        </div>
        <EvidenceTable items={evidenceItems} />
      </section>
    </section>
  );
}

function AuditPackage({ requirements, evidenceItems }: { requirements: FrameworkRequirement[]; evidenceItems: EvidenceItem[] }) {
  const exportReady = evidenceItems.filter((item) => item.hash.startsWith("sha256:") && item.s3VersionUri.includes("versionId")).length;
  const gaps = requirements.filter((requirement) => requirement.approvalState !== "Active").length;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Auditor workspace</p>
          <h2>Audit Package Assembly</h2>
        </div>
        <FileSearch size={19} />
      </div>
      <div className="summary-strip">
        <Detail label="Export-ready evidence" value={String(exportReady)} />
        <Detail label="Framework gaps" value={String(gaps)} />
        <Detail label="Package rule" value="Exact object versions only" />
      </div>
      <div className="pipeline">
        <PipelineStep label="Scope framework" detail="Requirements inherit global filters and control mappings." active />
        <PipelineStep label="Lock evidence set" detail="Only hashed artifacts with immutable version references enter the package." active={exportReady > 0} />
        <PipelineStep label="Resolve mapping gaps" detail="Pending or gap states remain visible to auditors with rationale." active={gaps === 0} />
      </div>
    </section>
  );
}

function RiskLab({ selectedControl }: { selectedControl: Control }) {
  const [baseLoss, setBaseLoss] = useState(selectedControl.fair.aleP90);
  const [strength, setStrength] = useState(selectedControl.fair.strength);
  const [volatility, setVolatility] = useState(1.15);
  const simulation = seededMonteCarlo(baseLoss, strength, volatility);

  return (
    <section className="risk-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAIR integration</p>
            <h2>Monte Carlo scenario lab</h2>
          </div>
          <SlidersHorizontal size={19} />
        </div>
        <p className="description">Tune loss magnitude, control strength, and uncertainty to see how degraded controls change annualized exposure.</p>
        <Range label="Probable loss magnitude" min={100000} max={9000000} step={100000} value={baseLoss} display={formatCurrency(baseLoss)} onChange={setBaseLoss} />
        <Range label="Control strength" min={10} max={100} step={1} value={strength} display={`${strength}%`} onChange={setStrength} />
        <Range label="Uncertainty" min={0.25} max={2.5} step={0.05} value={volatility} display={`${volatility.toFixed(2)}x`} onChange={setVolatility} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Annualized loss exposure</p>
            <h2>{selectedControl.name}</h2>
          </div>
        </div>
        <div className="percentile-grid">
          <Metric label="P10 low case" value={formatCurrency(simulation.p10)} detail="10% of simulated outcomes fall below this." icon={CircleDollarSign} />
          <Metric label="P50 most likely" value={formatCurrency(simulation.p50)} detail="Median simulated annualized loss." icon={Activity} />
          <Metric label="P90 board case" value={formatCurrency(simulation.p90)} detail="Risk appetite comparison point." icon={AlertTriangle} />
        </div>
      </section>
    </section>
  );
}

function KnowledgeSystemView({ answers }: { answers: KnowledgeAnswer[] }) {
  const [selectedId, setSelectedId] = useState(answers[0]?.id);
  const selected = answers.find((answer) => answer.id === selectedId) ?? answers[0];

  return (
    <section className="knowledge-layout">
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AI knowledge system</p>
            <h2>Read-Only Graph Answers</h2>
          </div>
          <BrainCircuit size={19} />
        </div>
        <div className="saved-view-list">
          {answers.map((answer) => (
            <button className={selected?.id === answer.id ? "saved-view selected" : "saved-view"} key={answer.id} onClick={() => setSelectedId(answer.id)}>
              <strong>{answer.question}</strong>
              <span>{answer.confidence}% confidence</span>
              <p>{answer.answer}</p>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Query preview</p>
              <h2>Cited Graph Path</h2>
            </div>
            <Route size={19} />
          </div>
          <code>{selected.queryPreview}</code>
          <div className="graph-path">
            {selected.graphPath.map((pathPart, index) => (
              <span key={`${pathPart}-${index}`}>{pathPart}</span>
            ))}
          </div>
          <div className="reasoning-box">
            <LockKeyhole size={18} />
            <p>Knowledge answers are read-only, source-grounded, and must cite graph nodes or edges before they are shown.</p>
          </div>
        </section>
      )}
    </section>
  );
}

function VendorRiskView({ vendors }: { vendors: Vendor[] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Third-party risk</p>
          <h2>Vendor Nodes and Control Dependencies</h2>
        </div>
        <Boxes size={19} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Data Access</th>
              <th>Controls Relied On</th>
              <th>Assessment</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <strong>{vendor.name}</strong>
                  <span>{vendor.tier} / {vendor.externalRating}</span>
                </td>
                <td>
                  {vendor.dataAccess}
                  <span>{vendor.businessOwner}</span>
                </td>
                <td>{vendor.reliedUponControls.join(", ")}</td>
                <td><StatusPill status={vendor.assessmentStatus} /></td>
                <td>{vendor.riskSignal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RemediationView({ remediations }: { remediations: RemediationItem[] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Remediation engine</p>
          <h2>Playbooks with Human Gates</h2>
        </div>
        <Workflow size={19} />
      </div>
      <div className="artifact-grid">
        {remediations.map((item) => (
          <div className="artifact-card" key={item.id}>
            <div>
              <strong>{item.playbook}</strong>
              <span>{item.id} / {item.controlId}</span>
            </div>
            <StatusPill status={item.status} />
            <p>{item.trigger} on {item.asset}. Gate: {item.approvalGate}. Tier: {item.riskTier}.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustRbacView({ grants }: { grants: RbacGrant[] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Trust UX and RBAC</p>
          <h2>Role Permissions Matrix</h2>
        </div>
        <UsersRound size={19} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>FAIR</th>
              <th>Graph Access</th>
              <th>Evidence</th>
              <th>Approvals</th>
              <th>Guardrails</th>
            </tr>
          </thead>
          <tbody>
            {grants.map((grant) => (
              <tr key={grant.role}>
                <td><strong>{grant.role}</strong></td>
                <td>{grant.globalFair}</td>
                <td>{grant.graphAccess}</td>
                <td>{grant.evidence}</td>
                <td>{grant.approvals}</td>
                <td>{grant.guardrails}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="trust-grid">
        <PipelineStep label="Confidence surfaced" detail="AI recommendations show confidence, source context, and approval state." active />
        <PipelineStep label="High-risk friction" detail="Mission-critical remediation calls out second approver and change-window gates." active />
        <PipelineStep label="Deny-list active" detail="Unauthorized graph mutations are blocked and recorded in the audit ledger." active />
      </div>
    </section>
  );
}

function AgentsView({ auditEvents }: { auditEvents: AuditEvent[] }) {
  return (
    <section className="view-stack">
      <div className="agent-grid">
        {agentWorkflows.map((agent) => (
          <section className="panel agent-panel" key={agent.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{agent.serviceAccount}</p>
                <h2>{agent.name}</h2>
              </div>
              <StatusPill status={agent.status} />
            </div>
            <div className="detail-grid tight">
              <Detail label="Model" value={agent.modelVersion} />
              <Detail label="Tool calls" value={agent.metrics.toolCalls.toLocaleString()} />
              <Detail label="Avg depth" value={`${agent.metrics.avgTraversalDepth} hops`} />
              <Detail label="Failed validations" value={String(agent.metrics.failedValidations)} />
            </div>
            <div className="workflow-steps">
              {agent.steps.map((step, index) => (
                <div className="workflow-step" key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <div className="allow-deny">
              <div>
                <strong>Allow-list</strong>
                {agent.allowedActions.map((action) => <span key={action}>{action}</span>)}
              </div>
              <div>
                <strong>Deny-list</strong>
                {agent.deniedActions.map((action) => <span key={action}>{action}</span>)}
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mutation ledger</p>
            <h2>Graph API audit events</h2>
          </div>
          <LockKeyhole size={19} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Outcome</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.actor}</strong>
                    <span>{event.timestamp}</span>
                  </td>
                  <td><code>{event.action}</code></td>
                  <td>{event.target}</td>
                  <td><StatusPill status={event.outcome} /></td>
                  <td>{event.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function IntegrationsView({ integrations, onConnect }: { integrations: Integration[]; onConnect: (id: string) => void }) {
  return (
    <section className="view-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Discovery and bootstrapping</p>
            <h2>Integration marketplace</h2>
          </div>
          <PlugZap size={19} />
        </div>
        <div className="integration-grid">
          {integrations.map((integration) => (
            <div className="integration-card" key={integration.id}>
              <div className="integration-icon">{integration.category === "Cloud" ? <Cloud /> : integration.category === "Identity" ? <KeyRound /> : integration.category === "Workflow" ? <GitBranch /> : integration.category === "Vulnerability" ? <AlertTriangle /> : <Boxes />}</div>
              <div>
                <strong>{integration.name}</strong>
                <span>{integration.category}</span>
              </div>
              <StatusPill status={integration.status} />
              <p>{integration.quickWin}</p>
              <button className={integration.status === "Connected" ? "secondary-button" : "primary-button"} onClick={() => onConnect(integration.id)} disabled={integration.status === "Connected"}>
                {integration.status === "Connected" ? <BadgeCheck size={16} /> : <PlugZap size={16} />}
                {integration.status === "Connected" ? `${integration.mappedControls} mapped controls` : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function DocsView({ selectedControl }: { selectedControl: Control }) {
  const draft = `# ${selectedControl.name} Standard

## Purpose
This standard defines how ${selectedControl.team} operates ${selectedControl.name.toLowerCase()} as a monitored control in the enterprise control graph.

## Scope
Assets: ${selectedControl.assets.join(", ")}
Framework mappings: ${selectedControl.requirements.join(", ")}

## Control Requirements
- Maintain an accountable owner: ${selectedControl.owner}
- Collect evidence through approved manual, API, or agentic collection paths
- Store evidence in immutable storage and link it through PROVED_BY graph edges
- Route AI-proposed mapping changes through human approval before activation

## Operating Metrics
${selectedControl.indicators.map((indicator) => `- ${indicator.label}: ${indicator.value}`).join("\n")}`;

  return (
    <section className="docs-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Policy and document generator</p>
            <h2>Graph-grounded draft</h2>
          </div>
          <FileText size={19} />
        </div>
        <div className="detail-grid">
          <Detail label="Template" value="Control Standard" />
          <Detail label="Scope" value={selectedControl.name} />
          <Detail label="Source edges" value={`${selectedControl.assets.length + selectedControl.requirements.length + selectedControl.evidence.length} linked nodes`} />
          <Detail label="Review gate" value="Human required" />
        </div>
      </section>
      <section className="panel editor-panel">
        <textarea aria-label="Generated document draft" defaultValue={draft} />
      </section>
    </section>
  );
}

function EvidenceTable({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Evidence</th>
            <th>Control</th>
            <th>Source</th>
            <th>Verdict</th>
            <th>Immutable reference</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <span>{item.id} / {item.type}</span>
              </td>
              <td>{item.controlId}</td>
              <td>{item.source}</td>
              <td><StatusPill status={item.verdict} /></td>
              <td>
                <code>{item.hash}</code>
                <span>{item.s3VersionUri}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Activity }) {
  return (
    <section className="metric">
      <div className="metric-icon"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`pill ${statusClass(status as never)}`}>{status}</span>;
}

function TimelineItem({ icon: Icon, label, detail }: { icon: typeof Activity; label: string; detail: string }) {
  return (
    <div className="timeline-item">
      <div><Icon size={17} /></div>
      <p><strong>{label}</strong><span>{detail}</span></p>
    </div>
  );
}

function PipelineStep({ label, detail, active }: { label: string; detail: string; active: boolean }) {
  return (
    <div className={active ? "pipeline-step active" : "pipeline-step"}>
      <div>{active ? <Check size={16} /> : <ChevronRight size={16} />}</div>
      <p><strong>{label}</strong><span>{detail}</span></p>
    </div>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-row">
      <span>{label}<strong>{display}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function highlightTerms(text: string, terms: string[]) {
  const normalized = terms.filter(Boolean).sort((a, b) => b.length - a.length);
  if (!normalized.length) return text;
  const pattern = new RegExp(`(${normalized.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(pattern).map((part, index) => {
    const matched = normalized.some((term) => term.toLowerCase() === part.toLowerCase());
    return matched ? <mark key={`${part}-${index}`}>{part}</mark> : part;
  });
}

export default App;
