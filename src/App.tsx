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
  Download,
  FileCheck2,
  FileSearch,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  Landmark,
  LayoutDashboard,
  Library,
  ListChecks,
  KeyRound,
  LockKeyhole,
  Network,
  PieChart,
  Play,
  PlugZap,
  Route,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TableProperties,
  Trash2,
  UserCheck,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { agentWorkflows } from "./data";
import { nthPartyGraph } from "./nthPartyData";
import { buildGovernanceFallback, createFairSimulationRun, decideFairSimulationRun, loadGovernanceSnapshot, loadScfCoverage, saveFairScenario, saveGovernanceControl } from "./governanceApi";
import { useGrcStore } from "./store";
import type {
  Approval,
  AuditEvent,
  Control,
  EvidenceItem,
  FairScenarioParameter,
  FairScenarioVersion,
  FairSimulationRun,
  FrameworkRequirement,
  GovernanceControl,
  GovernanceSnapshot,
  GraphEdge,
  GraphNode,
  HardeningLibrary,
  Integration,
  KnowledgeAnswer,
  MutationAuditLogEntry,
  PolicyArtifact,
  ProgramWorkbench,
  RbacGrant,
  RemediationItem,
  ScfCoverage,
  Vendor,
} from "./types";
import { aggregateAle, formatCurrency, healthScore, seededMonteCarlo, statusClass } from "./utils";

type View = "command" | "governance" | "compliance" | "risk" | "histogram" | "admin";
type GovernanceTab = "inventory" | "program" | "mappings" | "scf" | "evidence" | "policies" | "assets" | "graph";

const views: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "governance", label: "Governance", icon: Landmark },
  { id: "compliance", label: "Compliance", icon: FileCheck2 },
  { id: "risk", label: "Risk", icon: CircleDollarSign },
  { id: "histogram", label: "Histogram Lab", icon: BarChart3 },
  { id: "admin", label: "Admin", icon: Settings },
];

const brandLogoUrl = `${import.meta.env.BASE_URL}u-dont-grc-me-logo-transparent.png`;

const fairScenarioRequirements: Record<string, {
  asset: string;
  threat: string;
  method: string;
  effect: string;
  decision: string;
  fairCam: string;
}> = {
  "CTRL-PAM-001": {
    asset: "Production administrative access",
    threat: "External attacker or malicious insider",
    method: "Compromised privileged identity",
    effect: "Confidentiality and integrity loss across production systems",
    decision: "Prioritize privileged access hardening and MFA exception removal",
    fairCam: "Resistance + Detection + Decision Support",
  },
  "CTRL-VULN-004": {
    asset: "Internet-facing production workload",
    threat: "Opportunistic exploit actor",
    method: "Known critical vulnerability exploitation",
    effect: "Availability interruption and response cost escalation",
    decision: "Fund automated patch orchestration for public assets",
    fairCam: "Avoidance + Resistance + Variance Management",
  },
  "CTRL-TPRM-002": {
    asset: "Tier 1 vendor customer-data processing",
    threat: "Third-party control failure",
    method: "Vendor breach or unavailable assurance evidence",
    effect: "Privacy, contractual, and regulatory loss exposure",
    decision: "Escalate continuous vendor monitoring and bridge-letter automation",
    fairCam: "Decision Support + Detection + Variance Management",
  },
  "CTRL-EVID-007": {
    asset: "Audit evidence repository",
    threat: "Evidence tampering or stale attestation",
    method: "Mutable artifact or broken evidence chain",
    effect: "Audit failure, remediation cost, and trust loss",
    decision: "Maintain object-lock retention and evidence hash verification",
    fairCam: "Resistance + Detection + Decision Support",
  },
};

type HeatRisk = {
  heatCell: string;
  name: string;
  freqMin: number;
  freqMode: number;
  freqMax: number;
  magMin: number;
  magMode: number;
  magMax: number;
};

const heatRiskLimit = 5;
const heatRiskTrials = 10000;
const heatLikelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
const heatImpactLabels = ["Negligible", "Minor", "Moderate", "Major", "Severe"];
const heatRiskColors = ["#c7848d", "#2f6fb7", "#2f7a35", "#795e86", "#966218"];
const heatCellClasses = [
  ["heat-low", "heat-low", "heat-watch", "heat-watch", "heat-raise"],
  ["heat-low", "heat-watch", "heat-watch", "heat-raise", "heat-raise"],
  ["heat-watch", "heat-watch", "heat-raise", "heat-raise", "heat-high"],
  ["heat-watch", "heat-raise", "heat-raise", "heat-high", "heat-high"],
  ["heat-raise", "heat-raise", "heat-high", "heat-high", "heat-critical"],
];

const frequencyDefaults = [
  { freqMin: 0.05, freqMode: 0.1, freqMax: 0.3 },
  { freqMin: 0.1, freqMode: 0.4, freqMax: 1 },
  { freqMin: 0.5, freqMode: 1.5, freqMax: 3 },
  { freqMin: 1, freqMode: 3, freqMax: 8 },
  { freqMin: 3, freqMode: 8, freqMax: 20 },
];

const magnitudeDefaults = [
  { magMin: 5000, magMode: 15000, magMax: 50000 },
  { magMin: 25000, magMode: 100000, magMax: 300000 },
  { magMin: 100000, magMode: 500000, magMax: 1500000 },
  { magMin: 500000, magMode: 2000000, magMax: 7000000 },
  { magMin: 2000000, magMode: 8000000, magMax: 25000000 },
];

function defaultHeatRisk(row: number, column: number): HeatRisk {
  return {
    heatCell: `${row}-${column}`,
    name: "",
    ...frequencyDefaults[row],
    ...magnitudeDefaults[column],
  };
}

function randomPert(min: number, mode: number, max: number) {
  if (min >= max) return mode;
  const range = max - min;
  const alpha = 1 + (4 * (mode - min)) / range;
  const beta = 1 + (4 * (max - mode)) / range;
  let u = 0;
  let v = 0;
  let sum = 0;
  let attempts = 0;

  do {
    u = Math.random();
    v = Math.random();
    sum = Math.pow(u, 1 / alpha) + Math.pow(v, 1 / beta);
    attempts += 1;
    if (attempts > 1000) return mode;
  } while (sum > 1 || sum === 0);

  return min + (Math.pow(u, 1 / alpha) / sum) * range;
}

function randomPoisson(lambda: number) {
  if (lambda <= 0) return 0;
  if (lambda < 30) {
    const threshold = Math.exp(-lambda);
    let count = 0;
    let product = 1;
    do {
      count += 1;
      product *= Math.random();
    } while (product > threshold);
    return count - 1;
  }

  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z));
}

function simulateHeatRisk(risk: HeatRisk, trials = heatRiskTrials) {
  const samples: number[] = [];
  for (let trial = 0; trial < trials; trial += 1) {
    let annualLoss = 0;
    const frequency = randomPert(risk.freqMin, risk.freqMode, risk.freqMax);
    const events = randomPoisson(Math.max(0, frequency));
    for (let event = 0; event < events; event += 1) {
      annualLoss += randomPert(risk.magMin, risk.magMode, risk.magMax);
    }
    samples.push(annualLoss);
  }
  return samples.sort((a, b) => a - b);
}

function percentile(sortedSamples: number[], percentileRank: number) {
  return sortedSamples[Math.min(Math.floor(sortedSamples.length * percentileRank), sortedSamples.length - 1)] ?? 0;
}

function formatRiskMoney(value: number) {
  if (value === 0) return "$0";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function summarizeHeatSimulation(samples: number[]) {
  const p50 = percentile(samples, 0.5);
  const p90 = percentile(samples, 0.9);
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / Math.max(1, samples.length);
  const zeroYears = samples.filter((sample) => sample === 0).length;
  const nonZeroSamples = samples.filter((sample) => sample > 0);
  const minPositive = nonZeroSamples[0] ?? 0;
  const max = nonZeroSamples.at(-1) ?? 0;
  const binCount = 32;
  const width = max > minPositive ? (max - minPositive) / binCount : 1;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    lower: minPositive + index * width,
    upper: minPositive + (index + 1) * width,
    count: 0,
  }));

  for (const sample of nonZeroSamples) {
    const binIndex = Math.min(binCount - 1, Math.floor((sample - minPositive) / width));
    bins[binIndex].count += 1;
  }

  return {
    p50,
    p90,
    mean,
    zeroYears,
    zeroPercent: Math.round((zeroYears / Math.max(1, samples.length)) * 100),
    bins,
    maxBin: Math.max(...bins.map((bin) => bin.count), 1),
  };
}

function App() {
  const { state, approveMapping, connectIntegration, ingestEvidence, resetWorkspace } = useGrcStore();
  const [activeView, setActiveView] = useState<View>("command");
  const [selectedControlId, setSelectedControlId] = useState("CTRL-PAM-001");
  const [frameworkFilter, setFrameworkFilter] = useState("All frameworks");
  const [ownerFilter, setOwnerFilter] = useState("All owners");
  const [persona, setPersona] = useState("GRC Analyst");
  const [governanceSnapshot, setGovernanceSnapshot] = useState<GovernanceSnapshot | null>(null);
  const [governanceSource, setGovernanceSource] = useState<"Governance API" | "Seeded fallback">("Seeded fallback");

  const selectedControl = state.controls.find((control) => control.id === selectedControlId) ?? state.controls[0];
  const governanceInventory = governanceSnapshot ?? buildGovernanceFallback(state);
  const selectedFairScenario = governanceInventory.fairScenarios.find((scenario) => scenario.control_id === selectedControlId) ?? governanceInventory.fairScenarios[0] ?? null;
  const filteredControls = state.controls.filter((control) => {
    const frameworkMatches = frameworkFilter === "All frameworks" || control.requirements.some((req) => req.includes(frameworkFilter));
    const ownerMatches = ownerFilter === "All owners" || control.owner === ownerFilter;
    return frameworkMatches && ownerMatches;
  });

  const owners = Array.from(new Set(state.controls.map((control) => control.owner)));
  const ale = aggregateAle(filteredControls);

  const refreshGovernance = useCallback(async (signal?: AbortSignal) => {
    const snapshot = await loadGovernanceSnapshot(signal);
    if (snapshot) {
      setGovernanceSnapshot(snapshot);
      setGovernanceSource("Governance API");
    }
    return snapshot;
  }, []);

  const updateGovernanceControl = useCallback(async (id: string, updates: Partial<GovernanceControl>) => {
    await saveGovernanceControl(id, updates);
    await refreshGovernance();
  }, [refreshGovernance]);

  const updateFairScenario = useCallback(async (controlId: string, updates: Partial<FairScenarioParameter>) => {
    await saveFairScenario(controlId, updates);
    await refreshGovernance();
  }, [refreshGovernance]);

  const saveFairRun = useCallback(async (controlId: string, payload: Partial<FairSimulationRun>) => {
    const run = await createFairSimulationRun(controlId, payload);
    await refreshGovernance();
    return run;
  }, [refreshGovernance]);

  const decideFairRun = useCallback(async (runId: string, decision: "Approved" | "Rejected", reason: string) => {
    await decideFairSimulationRun(runId, decision, reason);
    await refreshGovernance();
  }, [refreshGovernance]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 850);
    refreshGovernance(controller.signal)
      .catch(() => {
        setGovernanceSource("Seeded fallback");
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src={brandLogoUrl} alt="u dont GRC me logo" width="54" height="54" />
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
          activeView={activeView}
          owners={owners}
          setFrameworkFilter={setFrameworkFilter}
          setOwnerFilter={setOwnerFilter}
          setPersona={setPersona}
          resetWorkspace={resetWorkspace}
        />

        {activeView === "command" && (
          <CommandCenterView controls={filteredControls} approvals={state.approvals} ale={ale} selectedControl={selectedControl} fairScenario={selectedFairScenario} setActiveView={setActiveView} setSelectedControlId={setSelectedControlId} onCreateFairRun={saveFairRun} />
        )}
        {activeView === "governance" && (
          <GovernanceView
            controls={filteredControls}
            selectedControl={selectedControl}
            graphNodes={state.graphNodes}
            graphEdges={state.graphEdges}
            frameworkRequirements={state.frameworkRequirements}
            policyArtifacts={state.policyArtifacts}
            governanceInventory={governanceInventory}
            governanceSource={governanceSource}
            selectedControlId={selectedControlId}
            setSelectedControlId={setSelectedControlId}
            onUpdateControl={updateGovernanceControl}
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
        {activeView === "risk" && <RiskView controls={filteredControls} selectedControl={selectedControl} fairScenario={selectedFairScenario} setSelectedControlId={setSelectedControlId} onCreateFairRun={saveFairRun} />}
        {activeView === "histogram" && <HeatmapHistogramView />}
        {activeView === "admin" && (
          <AdminView
            auditEvents={state.auditEvents}
            integrations={state.integrations}
            vendors={state.vendors}
            remediations={state.remediations}
            rbacGrants={state.rbacGrants}
            knowledgeAnswers={state.knowledgeAnswers}
            fairScenarios={governanceInventory.fairScenarios}
            fairScenarioVersions={governanceInventory.fairScenarioVersions ?? []}
            fairSimulationRuns={governanceInventory.fairSimulationRuns ?? []}
            mutationAuditLog={governanceInventory.mutationAuditLog ?? []}
            controls={governanceInventory.controls}
            onConnect={connectIntegration}
            onUpdateFairScenario={updateFairScenario}
            onDecideFairRun={decideFairRun}
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
  activeView,
  owners,
  setFrameworkFilter,
  setOwnerFilter,
  setPersona,
  resetWorkspace,
}: {
  frameworkFilter: string;
  ownerFilter: string;
  persona: string;
  activeView: View;
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
        <h1>{viewTitle(persona, activeView)}</h1>
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

function viewTitle(persona: string, activeView: View) {
  if (activeView === "histogram") return "Heatmap Conversion Lab";
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
  fairScenario,
  setActiveView,
  setSelectedControlId,
  onCreateFairRun,
}: {
  controls: Control[];
  approvals: Approval[];
  ale: { p10: number; p50: number; p90: number };
  selectedControl: Control;
  fairScenario: FairScenarioParameter | null;
  setActiveView: (view: View) => void;
  setSelectedControlId: (id: string) => void;
  onCreateFairRun: (controlId: string, payload: Partial<FairSimulationRun>) => Promise<FairSimulationRun>;
}) {
  return (
    <section className="view-stack">
      <Dashboard controls={controls} approvals={approvals} ale={ale} setActiveView={setActiveView} setSelectedControlId={setSelectedControlId} />
      <section className="dashboard-grid">
        <SavedViews />
        <ChartBuilder controls={controls} />
      </section>
      <RiskLab selectedControl={selectedControl} fairScenario={fairScenario} onCreateFairRun={onCreateFairRun} />
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

function GovernanceSummary({
  selectedControl,
  inventory,
  source,
}: {
  selectedControl: GovernanceControl;
  inventory: GovernanceSnapshot;
  source: "Governance API" | "Seeded fallback";
}) {
  return (
    <section className="metric-grid">
      <Metric label="Control inventory" value={`${inventory.stats.controls} controls`} detail={`${source}; control owners, status, cadence, and health are stored centrally.`} icon={ShieldCheck} />
      <Metric label="Framework mappings" value={String(inventory.stats.mappings)} detail={`${inventory.stats.activeMappings} active, ${inventory.stats.pendingMappings} pending, ${inventory.stats.gaps} gaps.`} icon={GitBranch} />
      <Metric label="Evidence health" value={`${inventory.stats.avgEvidenceHealth}%`} detail={`Relevance, freshness, and completeness scored across ${inventory.stats.controls} controls.`} icon={Gauge} />
      <Metric label="Selected control" value={selectedControl.id} detail={`${selectedControl.name} remains the current working context.`} icon={UserCheck} />
    </section>
  );
}

function GovernanceTabs({ activeTab, setActiveTab }: { activeTab: GovernanceTab; setActiveTab: (tab: GovernanceTab) => void }) {
  const tabs: { id: GovernanceTab; label: string; icon: typeof Activity }[] = [
    { id: "inventory", label: "Control Inventory", icon: TableProperties },
    { id: "program", label: "Program Workbench", icon: ClipboardCheck },
    { id: "mappings", label: "Mappings", icon: GitBranch },
    { id: "scf", label: "SCF Coverage", icon: Library },
    { id: "evidence", label: "Evidence Health", icon: Gauge },
    { id: "policies", label: "Policies", icon: FileText },
    { id: "assets", label: "Assets", icon: Boxes },
    { id: "graph", label: "Graph", icon: Network },
  ];

  return (
    <div className="module-tabs" role="tablist" aria-label="Governance tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "module-tab active" : "module-tab"} onClick={() => setActiveTab(tab.id)}>
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ControlInventoryTab({
  inventory,
  selectedControlId,
  setSelectedControlId,
  openControl,
}: {
  inventory: GovernanceSnapshot;
  selectedControlId: string;
  setSelectedControlId: (id: string) => void;
  openControl: (control: GovernanceControl) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const visibleControls = inventory.controls.filter((control) => {
    const haystack = `${control.id} ${control.name} ${control.family} ${control.owner} ${control.mappedFrameworks.join(" ")}`.toLowerCase();
    const queryMatches = haystack.includes(query.toLowerCase());
    const statusMatches = statusFilter === "All statuses" || control.implementation_status === statusFilter;
    return queryMatches && statusMatches;
  });

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Control center</p>
          <h2>Inventory System of Record</h2>
        </div>
        <TableProperties size={19} />
      </div>
      <div className="inventory-toolbar">
        <label>
          <Filter size={15} />
          <input aria-label="Search controls" placeholder="Search control, owner, family, framework..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          <ShieldAlert size={15} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All statuses</option>
            <option>Implemented</option>
            <option>In Progress</option>
            <option>Degraded</option>
            <option>Failed</option>
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Control</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Automation</th>
              <th>Mappings</th>
              <th>Evidence Health</th>
              <th>Cadence</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {visibleControls.map((control) => {
              const evidenceHealth = Math.round((control.evidence_freshness + control.evidence_relevance + control.evidence_completeness) / 3);
              return (
                <tr key={control.id} className={selectedControlId === control.id ? "selected-table-row" : undefined}>
                  <td>
                    <button className="text-link" onClick={() => setSelectedControlId(control.id)}>
                      <strong>{control.name}</strong>
                      <span>{control.id} / {control.family}</span>
                    </button>
                  </td>
                  <td>
                    {control.owner}
                    <span>{control.team}</span>
                  </td>
                  <td><StatusPill status={control.implementation_status} /></td>
                  <td>{control.automation_level}</td>
                  <td>
                    <strong>{control.mappingCount}</strong>
                    <span>{control.mappedFrameworks.join(", ")}</span>
                  </td>
                  <td>
                    <div className="coverage-cell">
                      <strong>{evidenceHealth}%</strong>
                      <div className="bar-track">
                        <div className={`bar-fill ${evidenceHealth < 80 ? "degraded" : "rose"}`} style={{ width: `${evidenceHealth}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>{control.testing_cadence}</td>
                  <td>
                    <button className="icon-button" title={`Open ${control.name}`} onClick={() => openControl(control)}>
                      <AppWindow size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ControlRecordPanel({
  control,
  onUpdateControl,
  openControl,
}: {
  control: GovernanceControl;
  onUpdateControl: (id: string, updates: Partial<GovernanceControl>) => Promise<void>;
  openControl: (control: GovernanceControl) => void;
}) {
  const [form, setForm] = useState({
    owner: control.owner,
    implementation_status: control.implementation_status,
    testing_cadence: control.testing_cadence,
    evidence_freshness: control.evidence_freshness,
    evidence_relevance: control.evidence_relevance,
    evidence_completeness: control.evidence_completeness,
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const evidenceHealth = Math.round((control.evidence_freshness + control.evidence_relevance + control.evidence_completeness) / 3);

  useEffect(() => {
    setForm({
      owner: control.owner,
      implementation_status: control.implementation_status,
      testing_cadence: control.testing_cadence,
      evidence_freshness: control.evidence_freshness,
      evidence_relevance: control.evidence_relevance,
      evidence_completeness: control.evidence_completeness,
    });
    setSaveState("idle");
  }, [control.id]);

  const saveControl = async () => {
    setSaveState("saving");
    try {
      await onUpdateControl(control.id, form);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <section className="panel control-record-panel">
      <div className="control-title">
        <div>
          <p className="eyebrow">{control.id} / {control.family}</p>
          <h2>{control.name}</h2>
        </div>
        <div className="action-row tight-actions">
          <button className="icon-button" title="Open drilldown" onClick={() => openControl(control)}>
            <AppWindow size={16} />
          </button>
          <StatusPill status={control.implementation_status} />
        </div>
      </div>
      <p className="description">{control.description}</p>
      <div className="detail-grid">
        <Detail label="Owner" value={control.owner} />
        <Detail label="Criticality" value={control.criticality} />
        <Detail label="Cadence" value={control.testing_cadence} />
        <Detail label="Control type" value={control.control_type} />
        <Detail label="Automation" value={control.automation_level} />
        <Detail label="Evidence health" value={`${evidenceHealth}%`} />
      </div>
      <div className="evidence-health-card">
        <div>
          <span>Relevance</span>
          <strong>{control.evidence_relevance}%</strong>
        </div>
        <div>
          <span>Freshness</span>
          <strong>{control.evidence_freshness}%</strong>
        </div>
        <div>
          <span>Completeness</span>
          <strong>{control.evidence_completeness}%</strong>
        </div>
      </div>
      <div className="edit-grid">
        <label className="field-label">
          Owner
          <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
        </label>
        <label className="field-label">
          Status
          <select value={form.implementation_status} onChange={(event) => setForm((current) => ({ ...current, implementation_status: event.target.value }))}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Implemented</option>
            <option>Degraded</option>
            <option>Failed</option>
            <option>Retired</option>
          </select>
        </label>
        <label className="field-label">
          Cadence
          <input value={form.testing_cadence} onChange={(event) => setForm((current) => ({ ...current, testing_cadence: event.target.value }))} />
        </label>
        <label className="field-label">
          Freshness
          <input type="number" min="0" max="100" value={form.evidence_freshness} onChange={(event) => setForm((current) => ({ ...current, evidence_freshness: Number(event.target.value) }))} />
        </label>
        <label className="field-label">
          Relevance
          <input type="number" min="0" max="100" value={form.evidence_relevance} onChange={(event) => setForm((current) => ({ ...current, evidence_relevance: Number(event.target.value) }))} />
        </label>
        <label className="field-label">
          Completeness
          <input type="number" min="0" max="100" value={form.evidence_completeness} onChange={(event) => setForm((current) => ({ ...current, evidence_completeness: Number(event.target.value) }))} />
        </label>
      </div>
      <div className="action-row">
        <button className="primary-button" onClick={saveControl} disabled={saveState === "saving"}>
          <Save size={17} /> {saveState === "saving" ? "Saving" : "Save control"}
        </button>
        <span className={`save-state ${saveState}`}>{saveState === "saved" ? "Saved to database" : saveState === "error" ? "Start the local API to save edits" : "Editable database record"}</span>
      </div>
    </section>
  );
}

function ControlDrilldownModal({ control, close }: { control: GovernanceControl; close: () => void }) {
  const evidenceHealth = Math.round((control.evidence_freshness + control.evidence_relevance + control.evidence_completeness) / 3);
  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <section className="modal-window" role="dialog" aria-modal="true" aria-label={`${control.name} drilldown`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{control.id} / {control.family}</p>
            <h2>{control.name}</h2>
          </div>
          <button className="icon-button" title="Close" onClick={close}>
            <X size={18} />
          </button>
        </div>
        <p className="description">{control.description}</p>
        <div className="summary-strip">
          <Detail label="Owner" value={control.owner} />
          <Detail label="Status" value={control.implementation_status} />
          <Detail label="Evidence health" value={`${evidenceHealth}%`} />
          <Detail label="Mappings" value={String(control.mappingCount)} />
        </div>
        <div className="modal-grid">
          <section>
            <h3>Framework mappings</h3>
            <div className="compact-list">
              {control.mappings.map((mapping) => (
                <div key={mapping.id}>
                  <strong>{mapping.framework_name} {mapping.citation}</strong>
                  <span>{mapping.coverage_percentage}% coverage / {mapping.mapping_confidence}% confidence / {mapping.state}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3>Assets</h3>
            <div className="compact-list">
              {control.assets.map((asset) => (
                <div key={asset.id}>
                  <strong>{asset.name}</strong>
                  <span>{asset.environment} / {asset.data_classification} / {asset.scope_status}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3>Evidence</h3>
            <div className="compact-list">
              {control.evidenceItems.map((item) => (
                <div key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.verdict} / {item.hash} / {item.storage_uri}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3>FAIR assumptions</h3>
            {control.fairScenario ? (
              <div className="compact-list">
                <div>
                  <strong>{control.fairScenario.scenario_name}</strong>
                  <span>{formatCurrency(control.fairScenario.probable_loss_min)} to {formatCurrency(control.fairScenario.probable_loss_max)}</span>
                </div>
                <div>
                  <strong>Frequency and strength</strong>
                  <span>{control.fairScenario.annual_event_frequency_most_likely}/year / {control.fairScenario.control_strength_percentage}% strength / {control.fairScenario.vulnerability_percentage}% vulnerability</span>
                </div>
                <div>
                  <strong>Source notes</strong>
                  <span>{control.fairScenario.source_notes}</span>
                </div>
              </div>
            ) : (
              <p className="description">No FAIR row has been mapped to this control yet.</p>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

/**
 * Compares our own mapping coverage against the Secure Controls Framework.
 *
 * The useful signal is the gap: SCF asserts N controls satisfy a citation, and
 * we can see how many of ours actually claim it. A requirement with SCF
 * suggestions and zero active mappings is unclaimed coverage.
 *
 * SCF titles are CC BY-ND and rendered verbatim - do not paraphrase them here.
 */
function ScfCoverageTab() {
  const [coverage, setCoverage] = useState<ScfCoverage | null>(null);
  const [loadError, setLoadError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadScfCoverage(controller.signal)
      .then((result) => setCoverage(result))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : String(error));
      });
    return () => controller.abort();
  }, []);

  if (loadError) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Secure Controls Framework</p>
            <h2>SCF Coverage</h2>
          </div>
          <Library size={19} />
        </div>
        <p className="description">Could not load SCF coverage: {loadError}</p>
      </section>
    );
  }

  if (!coverage) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Secure Controls Framework</p>
            <h2>SCF Coverage</h2>
          </div>
          <Library size={19} />
        </div>
        <p className="description">
          Loading the SCF catalog. Run <code>npm run sync:scf</code> and start the local API if this
          does not resolve.
        </p>
      </section>
    );
  }

  const unclaimed = coverage.requirements.filter(
    (entry) => entry.scfControls.length > 0 && entry.activeMappingCount === 0,
  );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Secure Controls Framework</p>
          <h2>SCF Coverage</h2>
        </div>
        <Library size={19} />
      </div>
      <div className="framework-chip-row">
        <span>Catalog <strong>{coverage.catalogControlCount}</strong></span>
        <span>Requirements resolved <strong>{coverage.summary.resolved}/{coverage.summary.requirements}</strong></span>
        <span>Suggested controls <strong>{coverage.summary.suggestedControls}</strong></span>
        <span>Unclaimed <strong>{unclaimed.length}</strong></span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Framework</th>
              <th>Citation</th>
              <th>Match</th>
              <th>SCF controls</th>
              <th>Our active mappings</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {coverage.requirements.map((entry) => {
              const isOpen = expanded === entry.requirementId;
              return (
                <Fragment key={entry.requirementId}>
                  <tr>
                    <td><strong>{entry.frameworkName}</strong></td>
                    <td>
                      {entry.citation}
                      <span>{entry.requirementTitle}</span>
                    </td>
                    <td>{entry.matchType}</td>
                    <td>
                      {entry.scfControls.length > 0 ? (
                        <button
                          type="button"
                          className="link-button"
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : entry.requirementId)}
                        >
                          {entry.scfControls.length} {isOpen ? "hide" : "show"}
                        </button>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td>{entry.activeMappingCount}</td>
                    <td>
                      {entry.scfControls.length > 0 && entry.activeMappingCount === 0
                        ? "Unclaimed coverage"
                        : entry.matchType === "none"
                          ? "No SCF crosswalk"
                          : "Covered"}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={6}>
                        <ul className="scf-control-list">
                          {entry.scfControls.map((control) => (
                            <li key={control.id}>
                              <strong>{control.id}</strong> {control.title}
                              <span>{control.familyName} · weight {control.weight}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="description">{coverage.attribution}</p>
    </section>
  );
}

function MappingMatrixTab({ inventory, selectedControlId }: { inventory: GovernanceSnapshot; selectedControlId: string }) {
  const rows = inventory.mappings.filter((mapping) => mapping.control_id === selectedControlId);
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Map once, prove many</p>
          <h2>Framework Mapping Matrix</h2>
        </div>
        <GitBranch size={19} />
      </div>
      <div className="framework-chip-row">
        {inventory.frameworks.map((framework) => (
          <span key={framework.id}>{framework.name} <strong>{framework.requirement_count}</strong></span>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Framework</th>
              <th>Requirement</th>
              <th>Coverage</th>
              <th>Confidence</th>
              <th>State</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((mapping) => (
              <tr key={mapping.id}>
                <td><strong>{mapping.framework_name}</strong></td>
                <td>
                  {mapping.citation}
                  <span>{mapping.requirement_title}</span>
                </td>
                <td>{mapping.coverage_percentage}%</td>
                <td>{mapping.mapping_confidence}%</td>
                <td><StatusPill status={mapping.state} /></td>
                <td>{mapping.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EvidenceHealthTab({ control }: { control: GovernanceControl }) {
  return (
    <section className="evidence-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence studio</p>
            <h2>Blueprint Library</h2>
          </div>
          <Sparkles size={19} />
        </div>
        <div className="pipeline">
          {control.evidenceBlueprints.map((blueprint) => (
            <div className="blueprint-row" key={blueprint.id}>
              <div>
                <strong>{blueprint.name}</strong>
                <span>{blueprint.source_system} / {blueprint.schedule} / {blueprint.freshness_days}d old</span>
              </div>
              <StatusPill status={blueprint.status} />
              <code>{blueprint.query_logic}</code>
              <div className="bar-track">
                <div className={`bar-fill ${blueprint.pass_rate < 80 ? "degraded" : "rose"}`} style={{ width: `${blueprint.pass_rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Live, auditable proof</p>
            <h2>Evidence Runs</h2>
          </div>
          <FileCheck2 size={19} />
        </div>
        <div className="pipeline">
          {control.evidenceItems.map((item) => (
            <div className="edge-card" key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.source_system} / collected {item.collected_at}</span>
              <StatusPill status={item.verdict} />
              <code>{item.hash}</code>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function PoliciesTab({ control }: { control: GovernanceControl }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Policy management</p>
          <h2>Control-Aligned Documents</h2>
        </div>
        <BookOpen size={19} />
      </div>
      <div className="artifact-grid">
        {control.policies.map((policy) => (
          <div className="artifact-card" key={policy.id}>
            <div>
              <strong>{policy.title}</strong>
              <span>{policy.id} / {policy.document_type}</span>
            </div>
            <StatusPill status={policy.status} />
            <p>{policy.section_reference} / {policy.approved_version} / {policy.owner}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssetsTab({ control }: { control: GovernanceControl }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Asset scope</p>
          <h2>Where This Control Operates</h2>
        </div>
        <Boxes size={19} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th>Environment</th>
              <th>Data</th>
              <th>Owner</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {control.assets.map((asset) => (
              <tr key={asset.id}>
                <td><strong>{asset.name}</strong></td>
                <td>{asset.asset_type}</td>
                <td>{asset.environment}</td>
                <td>{asset.data_classification}</td>
                <td>{asset.owner}</td>
                <td><StatusPill status={asset.scope_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProgramWorkbenchTab({ workbench }: { workbench: ProgramWorkbench }) {
  const totalEvidenceReady = Math.round(
    workbench.projects.reduce((sum, project) => sum + project.evidence_ready_percentage, 0) / Math.max(1, workbench.projects.length),
  );
  const readyImports = workbench.frameworkImports.filter((item) => item.validation_state === "Ready" || item.validation_state === "Imported").length;
  const overdueReviews = workbench.accountReviews.reduce((sum, review) => sum + review.overdue_count, 0);
  const p0Hardening = workbench.hardeningGuides.filter((guide) => guide.priority === "P0").length;

  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Program projects" value={String(workbench.projects.length)} detail={`${totalEvidenceReady}% average evidence readiness across active scopes.`} icon={ClipboardCheck} />
        <Metric label="Framework intake" value={`${readyImports}/${workbench.frameworkImports.length}`} detail="Imports ready for mapping review or already loaded." icon={FileSearch} />
        <Metric label="Account reviews" value={String(overdueReviews)} detail="Overdue access review items across source systems." icon={UserCheck} />
        <Metric label="Hardening backlog" value={`${p0Hardening} P0`} detail="First-party integration controls from GRC Engineering patterns." icon={ShieldCheck} />
      </section>

      <section className="program-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Gapps pattern</p>
              <h2>Program Projects</h2>
            </div>
            <ClipboardCheck size={19} />
          </div>
          <div className="artifact-grid">
            {workbench.projects.map((project) => (
              <div className="artifact-card" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.frameworks} / {project.scoped_controls} controls</span>
                </div>
                <StatusPill status={project.status} />
                <p>{project.evidence_ready_percentage}% evidence ready. {project.auditor_collaboration}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CISO Assistant and OpenGRC pattern</p>
              <h2>Framework Import Queue</h2>
            </div>
            <FileSearch size={19} />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Framework</th>
                  <th>Requirements</th>
                  <th>Candidates</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {workbench.frameworkImports.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.source_tool}</strong></td>
                    <td>
                      {item.framework_name}
                      <span>{item.framework_version}</span>
                    </td>
                    <td>{item.requirement_total}</td>
                    <td>{item.candidate_controls}</td>
                    <td>
                      <StatusPill status={item.validation_state} />
                      <span>{item.next_step}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="program-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Eramba and OpenGRC pattern</p>
              <h2>Assessments and Account Reviews</h2>
            </div>
            <UserCheck size={19} />
          </div>
          <div className="split-table-grid">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Scope</th>
                    <th>Findings</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {workbench.assessmentRuns.map((run) => (
                    <tr key={run.id}>
                      <td>
                        <strong>{run.name}</strong>
                        <span>{run.assessment_type} / {run.owner}</span>
                      </td>
                      <td>{run.scoped_controls} controls</td>
                      <td>{run.findings_open}</td>
                      <td><StatusPill status={run.report_state} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source System</th>
                    <th>Control</th>
                    <th>Accounts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workbench.accountReviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <strong>{review.source_system}</strong>
                        <span>{review.review_cadence} / {review.reviewer}</span>
                      </td>
                      <td>{review.control_id}</td>
                      <td>{review.accounts_in_scope} / {review.overdue_count} overdue</td>
                      <td><StatusPill status={review.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TPRM and hardening pattern</p>
              <h2>Questionnaires and Integration Guides</h2>
            </div>
            <Boxes size={19} />
          </div>
          <div className="artifact-grid">
            {workbench.vendorQuestionnaires.map((questionnaire) => (
              <div className="artifact-card" key={questionnaire.id}>
                <div>
                  <strong>{questionnaire.vendor_name}</strong>
                  <span>{questionnaire.questionnaire_type} / due {questionnaire.due_date}</span>
                </div>
                <StatusPill status={questionnaire.response_state} />
                <p>{questionnaire.risk_signal} Relied-upon controls: {questionnaire.relied_upon_controls}.</p>
              </div>
            ))}
            {workbench.hardeningGuides.map((guide) => (
              <div className="artifact-card" key={guide.id}>
                <div>
                  <strong>{guide.platform}</strong>
                  <span>{guide.priority} / {guide.control_id}</span>
                </div>
                <StatusPill status={guide.implementation_state} />
                <p>{guide.hardening_focus} Control: {guide.first_party_control}.</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </section>
  );
}

function GovernanceGraphTab({
  selectedControlId,
  graphNodes,
  graphEdges,
  inventory,
}: {
  selectedControlId: string;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  inventory: GovernanceSnapshot;
}) {
  const relationships = inventory.relationships.filter((relationship) => relationship.from_control_id === selectedControlId);
  const selected = inventory.controls.find((control) => control.id === selectedControlId);
  const graphHasSelectedControl = graphNodes.some((node) => node.id === selectedControlId);
  const dbGraphNodes: GraphNode[] = [
    {
      id: selectedControlId,
      kind: "Control",
      label: selected?.name ?? selectedControlId,
      subtitle: "Control",
      status: selected?.implementation_status as GraphNode["status"],
    },
    ...relationships.map((relationship) => ({
      id: relationship.to_entity_id,
      kind: relationship.to_entity_type as GraphNode["kind"],
      label: relationship.to_entity_id,
      subtitle: relationship.to_entity_type,
      status: relationship.state as GraphNode["status"],
    })),
  ];
  const dbGraphEdges: GraphEdge[] = relationships.map((relationship) => ({
    id: relationship.id,
    from: relationship.from_control_id,
    to: relationship.to_entity_id,
    label: relationship.relationship_type as GraphEdge["label"],
    state: relationship.state as GraphEdge["state"],
    confidence: relationship.confidence ?? undefined,
    narrative: relationship.narrative,
  }));
  const graphNodesForView = graphHasSelectedControl ? graphNodes : dbGraphNodes;
  const graphEdgesForView = graphHasSelectedControl ? graphEdges : dbGraphEdges;

  return (
    <section className="view-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Control graph</p>
            <h2>Relationship Paths</h2>
          </div>
          <Network size={19} />
        </div>
        <GraphView selectedControlId={selectedControlId} graphNodes={graphNodesForView} graphEdges={graphEdgesForView} />
      </section>
      <section className="panel">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Database relationships</p>
            <h2>Stored Edges</h2>
          </div>
        </div>
        <div className="edge-inspector">
          {relationships.map((relationship) => (
            <div className="edge-card" key={relationship.id}>
              <strong>{relationship.relationship_type} / {relationship.to_entity_type}</strong>
              <span>{relationship.to_entity_id}</span>
              <small>{relationship.narrative}</small>
            </div>
          ))}
        </div>
      </section>
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
  governanceInventory,
  governanceSource,
  selectedControlId,
  setSelectedControlId,
  onUpdateControl,
}: {
  controls: Control[];
  selectedControl: Control;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  frameworkRequirements: FrameworkRequirement[];
  policyArtifacts: PolicyArtifact[];
  governanceInventory: GovernanceSnapshot;
  governanceSource: "Governance API" | "Seeded fallback";
  selectedControlId: string;
  setSelectedControlId: (id: string) => void;
  onUpdateControl: (id: string, updates: Partial<GovernanceControl>) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<GovernanceTab>("inventory");
  const [drilldownControl, setDrilldownControl] = useState<GovernanceControl | null>(null);
  const selectedInventoryControl = governanceInventory.controls.find((control) => control.id === selectedControlId) ?? governanceInventory.controls[0];

  return (
    <section className="view-stack">
      <GovernanceSummary selectedControl={selectedInventoryControl} inventory={governanceInventory} source={governanceSource} />
      <section className="panel module-hero">
        <div>
          <p className="eyebrow">Governance module</p>
          <h2>One Control Library, Every Framework, Live Evidence</h2>
          <p className="description">
            Controls are stored once, mapped to every framework they satisfy, linked to policies/assets/evidence, and scored for relevance, freshness, and completeness.
          </p>
        </div>
        <div className="module-source">
          <span>Data source</span>
          <strong>{governanceSource}</strong>
        </div>
      </section>
      <GovernanceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "inventory" && (
        <section className="governance-tab-layout">
          <ControlInventoryTab
            inventory={governanceInventory}
            selectedControlId={selectedInventoryControl.id}
            setSelectedControlId={setSelectedControlId}
            openControl={setDrilldownControl}
          />
          <ControlRecordPanel control={selectedInventoryControl} onUpdateControl={onUpdateControl} openControl={setDrilldownControl} />
        </section>
      )}
      {activeTab === "program" && <ProgramWorkbenchTab workbench={governanceInventory.programWorkbench} />}
      {activeTab === "mappings" && (
        <section className="governance-tab-layout">
          <MappingMatrixTab inventory={governanceInventory} selectedControlId={selectedInventoryControl.id} />
          <DataModelRules />
        </section>
      )}
      {activeTab === "scf" && <ScfCoverageTab />}
      {activeTab === "evidence" && <EvidenceHealthTab control={selectedInventoryControl} />}
      {activeTab === "policies" && (
        <section className="governance-tab-layout">
          <PoliciesTab control={selectedInventoryControl} />
          <DocsView selectedControl={selectedControl} />
        </section>
      )}
      {activeTab === "assets" && <AssetsTab control={selectedInventoryControl} />}
      {activeTab === "graph" && <GovernanceGraphTab selectedControlId={selectedInventoryControl.id} graphNodes={graphNodes} graphEdges={graphEdges} inventory={governanceInventory} />}
      {drilldownControl && <ControlDrilldownModal control={drilldownControl} close={() => setDrilldownControl(null)} />}
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

function RiskView({
  controls,
  selectedControl,
  fairScenario,
  setSelectedControlId,
  onCreateFairRun,
}: {
  controls: Control[];
  selectedControl: Control;
  fairScenario: FairScenarioParameter | null;
  setSelectedControlId: (id: string) => void;
  onCreateFairRun: (controlId: string, payload: Partial<FairSimulationRun>) => Promise<FairSimulationRun>;
}) {
  return (
    <section className="view-stack">
      <RiskRegister controls={controls} setSelectedControlId={setSelectedControlId} />
      <RiskLab selectedControl={selectedControl} fairScenario={fairScenario} onCreateFairRun={onCreateFairRun} />
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
  fairScenarios,
  fairScenarioVersions,
  fairSimulationRuns,
  mutationAuditLog,
  controls,
  onConnect,
  onUpdateFairScenario,
  onDecideFairRun,
}: {
  auditEvents: AuditEvent[];
  integrations: Integration[];
  vendors: Vendor[];
  remediations: RemediationItem[];
  rbacGrants: RbacGrant[];
  knowledgeAnswers: KnowledgeAnswer[];
  fairScenarios: FairScenarioParameter[];
  fairScenarioVersions: FairScenarioVersion[];
  fairSimulationRuns: FairSimulationRun[];
  mutationAuditLog: MutationAuditLogEntry[];
  controls: GovernanceControl[];
  onConnect: (id: string) => void;
  onUpdateFairScenario: (controlId: string, updates: Partial<FairScenarioParameter>) => Promise<void>;
  onDecideFairRun: (runId: string, decision: "Approved" | "Rejected", reason: string) => Promise<void>;
}) {
  return (
    <section className="view-stack">
      <AdminSummary />
      <FairDatabaseAdmin fairScenarios={fairScenarios} controls={controls} onUpdateFairScenario={onUpdateFairScenario} />
      <FairTraceabilityView versions={fairScenarioVersions} auditLog={mutationAuditLog} simulationRuns={fairSimulationRuns} onDecideFairRun={onDecideFairRun} />
      <IntegrationsView integrations={integrations} onConnect={onConnect} />
      <KnowledgeSystemView answers={knowledgeAnswers} />
      <VendorRiskView vendors={vendors} />
      <NthPartyView />
      <RemediationView remediations={remediations} />
      <HardeningLibraryView />
      <TrustRbacView grants={rbacGrants} />
      <AgentsView auditEvents={auditEvents} />
    </section>
  );
}

function HeatmapHistogramView() {
  const [risks, setRisks] = useState<HeatRisk[]>([]);
  const [simulationResults, setSimulationResults] = useState<number[][] | null>(null);
  const selectedCells = new Set(risks.map((risk) => risk.heatCell));
  const selectedSummaries = useMemo(
    () => simulationResults?.map((samples) => summarizeHeatSimulation(samples)) ?? null,
    [simulationResults],
  );

  const clearResults = () => setSimulationResults(null);
  const toggleCell = (row: number, column: number) => {
    const heatCell = `${row}-${column}`;
    setRisks((current) => {
      const existingIndex = current.findIndex((risk) => risk.heatCell === heatCell);
      if (existingIndex >= 0) return current.filter((_, index) => index !== existingIndex);
      if (current.length >= heatRiskLimit) return current;
      return [...current, defaultHeatRisk(row, column)];
    });
    clearResults();
  };
  const updateRisk = (index: number, field: keyof HeatRisk, value: string | number) => {
    setRisks((current) => current.map((risk, riskIndex) => (riskIndex === index ? { ...risk, [field]: value } : risk)));
    clearResults();
  };
  const removeRisk = (index: number) => {
    setRisks((current) => current.filter((_, riskIndex) => riskIndex !== index));
    clearResults();
  };
  const runSimulation = () => {
    if (!risks.length) return;
    setSimulationResults(risks.map((risk) => simulateHeatRisk(risk)));
  };
  const resetLab = () => {
    setRisks([]);
    setSimulationResults(null);
  };
  const downloadCsv = () => {
    if (!simulationResults || !selectedSummaries) return;
    const rows = [
      ["risk", "heat_cell", "likelihood", "impact", "frequency_min", "frequency_most_likely", "frequency_max", "magnitude_min", "magnitude_most_likely", "magnitude_max", "mean", "p50", "p90", "zero_loss_years_percent"],
      ...risks.map((risk, index) => {
        const { row, column } = splitHeatCell(risk.heatCell);
        const summary = selectedSummaries[index];
        return [
          risk.name || `Risk ${index + 1}`,
          risk.heatCell,
          heatLikelihoodLabels[row],
          heatImpactLabels[column],
          risk.freqMin,
          risk.freqMode,
          risk.freqMax,
          risk.magMin,
          risk.magMode,
          risk.magMax,
          Math.round(summary.mean),
          Math.round(summary.p50),
          Math.round(summary.p90),
          summary.zeroPercent,
        ];
      }),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "heatmap-histogram-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="view-stack heatlab">
      <section className="heatlab-hero panel">
        <div>
          <p className="eyebrow">CRQ translation lab</p>
          <h2>Heatmap to Histogram</h2>
          <p>
            Place risks on a 5x5 matrix, replace color labels with event frequency and loss magnitude ranges,
            then run 10,000 annual-loss simulations.
          </p>
        </div>
        <div className="heatlab-actions">
          <button className="secondary-button" onClick={resetLab}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="secondary-button" onClick={downloadCsv} disabled={!simulationResults}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </section>

      <section className="heatlab-layout">
        <section className="panel heatlab-matrix-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Place up to five risks</h2>
            </div>
            <BadgeCheck size={19} />
          </div>
          <div className="heatmap-grid" aria-label="Likelihood and impact heat map">
            <div />
            {heatImpactLabels.map((label) => (
              <div className="heatmap-axis impact-axis" key={label}>{label}</div>
            ))}
            {[...heatLikelihoodLabels].reverse().map((label, reversedIndex) => {
              const row = heatLikelihoodLabels.length - 1 - reversedIndex;
              return (
                <Fragment key={label}>
                  <div className="heatmap-axis likelihood-axis">{label}</div>
                  {heatImpactLabels.map((_, column) => {
                    const cell = `${row}-${column}`;
                    const riskIndex = risks.findIndex((risk) => risk.heatCell === cell);
                    const active = selectedCells.has(cell);
                    const maxed = risks.length >= heatRiskLimit && !active;
                    return (
                      <button
                        key={cell}
                        className={`heatmap-cell ${heatCellClasses[row][column]}${active ? " active" : ""}`}
                        onClick={() => toggleCell(row, column)}
                        disabled={maxed}
                        aria-label={`${heatLikelihoodLabels[row]} likelihood, ${heatImpactLabels[column]} impact`}
                      >
                        {active && (
                          <span style={{ background: heatRiskColors[riskIndex] }}>
                            {riskIndex + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
          <div className="heatmap-footnotes">
            <span>Likelihood increases upward</span>
            <span>Impact increases rightward</span>
          </div>
          {risks.length >= heatRiskLimit && (
            <p className="heatlab-note">Maximum of five active risks. Remove a numbered cell to add another.</p>
          )}
          {!risks.length && (
            <div className="heatlab-empty">Click a cell to start translating color into numbers.</div>
          )}
        </section>

        <section className="panel heatlab-form-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Define the ranges behind the color</h2>
            </div>
            <SlidersHorizontal size={19} />
          </div>
          <p className="description">
            Defaults come from matrix position. Adjust the low, most likely, and high estimates before running the model.
          </p>
          {risks.length ? (
            <div className="heat-risk-list">
              {risks.map((risk, index) => (
                <HeatRiskEditor
                  key={`${risk.heatCell}-${index}`}
                  risk={risk}
                  index={index}
                  updateRisk={updateRisk}
                  removeRisk={removeRisk}
                />
              ))}
              <button className="primary-button heat-run-button" onClick={runSimulation}>
                <Play size={17} /> Run {heatRiskTrials.toLocaleString()} simulations
              </button>
            </div>
          ) : (
            <div className="heatlab-empty tall">Selected risks will appear here with editable frequency and loss ranges.</div>
          )}
        </section>
      </section>

      {simulationResults && selectedSummaries && (
        <section className="panel heatlab-results-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Step 3</p>
              <h2>What the heatmap was compressing</h2>
            </div>
            <BarChart3 size={19} />
          </div>
          <div className="heatlab-contrast">
            <div>
              <span>Heatmap output</span>
              <strong>{risks.length} color-coded {risks.length === 1 ? "cell" : "cells"}</strong>
              <p>No annual loss distribution, no expected value, no bad-year estimate.</p>
            </div>
            <div>
              <span>Histogram output</span>
              <strong>{risks.length} simulated {risks.length === 1 ? "distribution" : "distributions"}</strong>
              <p>Percentiles, zero-loss years, expected value, and financial ranges.</p>
            </div>
          </div>
          <div className="heat-results-grid">
            {risks.map((risk, index) => (
              <HeatRiskResultCard
                key={`${risk.heatCell}-${index}`}
                risk={risk}
                index={index}
                samples={simulationResults[index]}
                summary={selectedSummaries[index]}
              />
            ))}
          </div>
          <div className="heatlab-disclaimer">
            This is an educational model. Risks are simulated independently, defaults are illustrative, and production analysis still needs vetted data, assumption review, and correlation treatment.
          </div>
        </section>
      )}
    </section>
  );
}

function HeatRiskEditor({
  risk,
  index,
  updateRisk,
  removeRisk,
}: {
  risk: HeatRisk;
  index: number;
  updateRisk: (index: number, field: keyof HeatRisk, value: string | number) => void;
  removeRisk: (index: number) => void;
}) {
  const { row, column } = splitHeatCell(risk.heatCell);
  const updateNumber = (field: keyof HeatRisk, value: string) => updateRisk(index, field, Number(value));

  return (
    <div className="heat-risk-editor" style={{ borderLeftColor: heatRiskColors[index] }}>
      <div className="heat-risk-title">
        <span style={{ background: heatRiskColors[index] }}>{index + 1}</span>
        <label>
          <span className="sr-only">Risk name</span>
          <input value={risk.name} placeholder={`Risk ${index + 1}`} onChange={(event) => updateRisk(index, "name", event.target.value)} />
        </label>
        <small>{heatLikelihoodLabels[row]} / {heatImpactLabels[column]}</small>
        <button className="icon-button" onClick={() => removeRisk(index)} title="Remove risk" aria-label="Remove risk">
          <Trash2 size={16} />
        </button>
      </div>
      <HeatTripleInput
        label="Frequency (events per year)"
        min={risk.freqMin}
        mode={risk.freqMode}
        max={risk.freqMax}
        setMin={(value) => updateNumber("freqMin", value)}
        setMode={(value) => updateNumber("freqMode", value)}
        setMax={(value) => updateNumber("freqMax", value)}
      />
      <HeatTripleInput
        label="Loss magnitude per event"
        min={risk.magMin}
        mode={risk.magMode}
        max={risk.magMax}
        setMin={(value) => updateNumber("magMin", value)}
        setMode={(value) => updateNumber("magMode", value)}
        setMax={(value) => updateNumber("magMax", value)}
      />
    </div>
  );
}

function HeatTripleInput({
  label,
  min,
  mode,
  max,
  setMin,
  setMode,
  setMax,
}: {
  label: string;
  min: number;
  mode: number;
  max: number;
  setMin: (value: string) => void;
  setMode: (value: string) => void;
  setMax: (value: string) => void;
}) {
  return (
    <div className="heat-triple-input">
      <span>{label}</span>
      <label>
        Min
        <input type="number" value={min} onChange={(event) => setMin(event.target.value)} />
      </label>
      <label>
        Most likely
        <input type="number" value={mode} onChange={(event) => setMode(event.target.value)} />
      </label>
      <label>
        Max
        <input type="number" value={max} onChange={(event) => setMax(event.target.value)} />
      </label>
    </div>
  );
}

function HeatRiskResultCard({
  risk,
  index,
  samples,
  summary,
}: {
  risk: HeatRisk;
  index: number;
  samples: number[];
  summary: ReturnType<typeof summarizeHeatSimulation>;
}) {
  const { row, column } = splitHeatCell(risk.heatCell);
  const name = risk.name || `Risk ${index + 1}`;

  return (
    <section className="heat-result-card" style={{ borderLeftColor: heatRiskColors[index] }}>
      <div className="heat-result-heading">
        <div>
          <span style={{ background: heatRiskColors[index] }}>{index + 1}</span>
          <div>
            <strong>{name}</strong>
            <small>{heatLikelihoodLabels[row]} / {heatImpactLabels[column]}</small>
          </div>
        </div>
        <small>{summary.zeroPercent}% zero-loss years</small>
      </div>
      {summary.zeroYears > 0 && (
        <p className="heat-zero-note">{summary.zeroPercent}% of simulated years produced no loss event, so the visible histogram focuses on non-zero outcomes.</p>
      )}
      <div className="heat-stat-row">
        <Detail label="Median P50" value={summary.p50 === 0 ? "No loss" : formatRiskMoney(summary.p50)} />
        <Detail label="Expected" value={formatRiskMoney(summary.mean)} />
        <Detail label="Bad year P90" value={summary.p90 === 0 ? "No loss" : formatRiskMoney(summary.p90)} />
      </div>
      <HeatHistogram summary={summary} color={heatRiskColors[index]} />
      <div className="chart-caption">
        <span>{samples.length.toLocaleString()} annual trials</span>
        <span>Max non-zero {formatRiskMoney(summary.bins.at(-1)?.upper ?? 0)}</span>
      </div>
    </section>
  );
}

function HeatHistogram({ summary, color }: { summary: ReturnType<typeof summarizeHeatSimulation>; color: string }) {
  const p90 = summary.p90;
  const first = summary.bins[0]?.lower ?? 0;
  const last = summary.bins.at(-1)?.upper ?? 1;
  const p90Position = last > first ? Math.max(0, Math.min(100, ((p90 - first) / (last - first)) * 100)) : 0;

  return (
    <div className="heat-histogram-wrap">
      <div className="heat-histogram" aria-label="Annual loss histogram">
        {summary.bins.map((bin, index) => (
          <div className="heat-histogram-bin" key={`${bin.lower}-${index}`}>
            <span
              style={{
                height: `${Math.max(4, (bin.count / summary.maxBin) * 100)}%`,
                background: color,
              }}
              title={`${bin.count} trials from ${formatRiskMoney(bin.lower)} to ${formatRiskMoney(bin.upper)}`}
            />
          </div>
        ))}
        {p90 > 0 && <i style={{ left: `${p90Position}%` }} title={`P90 ${formatRiskMoney(p90)}`} />}
      </div>
    </div>
  );
}

function splitHeatCell(heatCell: string) {
  const [row, column] = heatCell.split("-").map(Number);
  return { row, column };
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

function RiskLab({
  selectedControl,
  fairScenario = null,
  onCreateFairRun,
}: {
  selectedControl: Control;
  fairScenario?: FairScenarioParameter | null;
  onCreateFairRun: (controlId: string, payload: Partial<FairSimulationRun>) => Promise<FairSimulationRun>;
}) {
  const [baseLoss, setBaseLoss] = useState(fairScenario?.probable_loss_most_likely ?? selectedControl.fair.aleP90);
  const [strength, setStrength] = useState(fairScenario?.control_strength_percentage ?? selectedControl.fair.strength);
  const [volatility, setVolatility] = useState(1.15);
  const [runSaveState, setRunSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const frequency = fairScenario?.annual_event_frequency_most_likely ?? 0.45;
  const lossMagnitudeReduction = fairScenario?.loss_magnitude_reduction_percentage ?? Math.round(selectedControl.fair.plmReduction * 100);
  const appetiteThreshold = fairScenario?.appetite_threshold ?? selectedControl.fair.aleP90;
  const simulation = seededMonteCarlo(baseLoss, strength, volatility, frequency, lossMagnitudeReduction);
  const scenario = fairScenarioRequirements[selectedControl.id] ?? {
    asset: selectedControl.assets[0] ?? "Scoped asset",
    threat: "Relevant threat agent",
    method: selectedControl.riskScenarios[0] ?? "Scoped loss event",
    effect: "Confidentiality, integrity, or availability impact",
    decision: "Select the control investment this analysis supports",
    fairCam: "Decision Support",
  };

  useEffect(() => {
    setBaseLoss(fairScenario?.probable_loss_most_likely ?? selectedControl.fair.aleP90);
    setStrength(fairScenario?.control_strength_percentage ?? selectedControl.fair.strength);
    setRunSaveState("idle");
  }, [fairScenario, selectedControl]);

  const saveBoardRun = async () => {
    setRunSaveState("saving");
    try {
      await onCreateFairRun(selectedControl.id, {
        run_label: `${selectedControl.name} board scenario`,
        base_loss: baseLoss,
        control_strength_percentage: strength,
        annual_event_frequency: frequency,
        loss_magnitude_reduction_percentage: lossMagnitudeReduction,
        volatility,
        appetite_threshold: appetiteThreshold,
        approval_state: "Pending Approval",
      });
      setRunSaveState("saved");
    } catch {
      setRunSaveState("error");
    }
  };

  return (
    <>
      <section className="risk-layout">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FAIR integration</p>
              <h2>Monte Carlo scenario lab</h2>
            </div>
            <SlidersHorizontal size={19} />
          </div>
          <p className="description">Tune loss magnitude, control strength, and uncertainty to see how degraded controls change annualized exposure across 10,000 trials.</p>
          <Range label="Probable loss magnitude" min={100000} max={9000000} step={100000} value={baseLoss} display={formatCurrency(baseLoss)} onChange={setBaseLoss} />
          <Range label="Control strength" min={10} max={100} step={1} value={strength} display={`${strength}%`} onChange={setStrength} />
          <Range label="Uncertainty" min={0.25} max={2.5} step={0.05} value={volatility} display={`${volatility.toFixed(2)}x`} onChange={setVolatility} />
          <div className="scenario-scope">
            <Detail label="Asset" value={scenario.asset} />
            <Detail label="Threat" value={scenario.threat} />
            <Detail label="Method" value={scenario.method} />
            <Detail label="Effect" value={scenario.effect} />
            <Detail label="Decision" value={scenario.decision} />
            <Detail label="FAIR-CAM function" value={scenario.fairCam} />
            <Detail label="Event frequency" value={`${frequency}/year`} />
            <Detail label="LM reduction" value={`${lossMagnitudeReduction}%`} />
            <Detail label="Appetite" value={formatCurrency(appetiteThreshold)} />
            <Detail label="Data quality" value={fairScenario?.data_quality ?? "Demo"} />
          </div>
          <div className="action-row">
            <button className="primary-button" onClick={saveBoardRun} disabled={runSaveState === "saving"}>
              <ClipboardCheck size={17} /> {runSaveState === "saving" ? "Saving run" : "Save board run"}
            </button>
            <span className={`save-state ${runSaveState}`}>
              {runSaveState === "saved" ? "Run saved for approval" : runSaveState === "error" ? "Start the local API to save runs" : "Persists this scenario to the admin queue"}
            </span>
          </div>
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
            <Metric label="Expected value" value={formatCurrency(simulation.mean)} detail="Mean value for ROSI and control investment comparison." icon={BarChart3} />
          </div>
        </section>
      </section>
      <CrqDecisionSupport selectedControl={selectedControl} simulation={simulation} fairScenario={fairScenario} />
    </>
  );
}

function CrqDecisionSupport({
  selectedControl,
  simulation,
  fairScenario,
}: {
  selectedControl: Control;
  simulation: ReturnType<typeof seededMonteCarlo>;
  fairScenario?: FairScenarioParameter | null;
}) {
  const topBin = Math.max(...simulation.histogram.map((bin) => bin.count), 1);
  const fiveNumberSummary = [
    { label: "Min", value: simulation.min },
    { label: "Q1", value: simulation.q1 },
    { label: "Median", value: simulation.p50 },
    { label: "Q3", value: simulation.q3 },
    { label: "Max", value: simulation.max },
  ];
  const exceedanceStatement = simulation.exceedance[0]
    ? `There is a ${Math.round(simulation.exceedance[0].probability * 100)}% chance annualized loss exceeds ${formatCurrency(simulation.exceedance[0].loss)}.`
    : "Run the simulation to generate an exceedance statement.";
  const lossForms = [
    "Productivity",
    "Response",
    "Replacement",
    "Fines and judgments",
    "Reputation",
    "Competitive advantage",
  ];
  const calibration = [
    { word: "Possible", range: "10-30%", action: "Use when evidence is thin; widen the range." },
    { word: "Likely", range: "55-75%", action: "Ask which observed base rate supports it." },
    { word: "Almost certain", range: "85-95%", action: "Require internal data or strong external analogs." },
  ];
  const evidenceNutrition = [
    { label: "Unit", value: "USD/year and events/year" },
    { label: "Citation", value: fairScenario?.source_notes ?? "Internal telemetry, external analog, or SME estimate" },
    { label: "Collected", value: fairScenario?.updated_at ?? "Date-stamped before model approval" },
    { label: "Quality", value: fairScenario?.data_quality ?? "Grade with bias and sample-size adjustment" },
    { label: "Confidence", value: fairScenario ? `${fairScenario.confidence_percentage}%` : "Pending calibration" },
  ];
  const approvalGates = [
    "Scope threat, asset, method, and effect before collecting data",
    "Capture P5 / P50 / P95 range rationale for frequency and magnitude",
    "Apply range-widening when data is weak, biased, or unverifiable",
    "Require human approval before AI-assisted assumptions affect reports",
  ];
  const dataChecks = [
    "Internal incidents, tickets, and control failures",
    "External loss and threat frequency analogs",
    "SME range with low / most likely / high estimates",
    "Documented confidence and bias adjustment",
  ];

  return (
    <section className="panel crq-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CRQ workbench</p>
          <h2>From Heatmaps to Histograms</h2>
        </div>
        <BarChart3 size={19} />
      </div>
      <p className="description">
        Convert {selectedControl.name.toLowerCase()} from color-coded risk language into distributions, exceedance statements, and explicit data-quality checks.
      </p>
      <div className="exceedance-statement">
        <CircleDollarSign size={19} />
        <strong>{exceedanceStatement}</strong>
        <span>{simulation.trials.toLocaleString()} Monte Carlo trials; heatmap language stays secondary to financial distributions.</span>
      </div>
      <div className="crq-grid">
        <div>
          <h3>Loss histogram</h3>
          <div className="histogram" aria-label="Monte Carlo loss histogram">
            {simulation.histogram.map((bin) => (
              <div className="histogram-bin" key={`${bin.lower}-${bin.upper}`}>
                <div style={{ height: `${Math.max(8, (bin.count / topBin) * 100)}%` }} title={`${bin.percentage}% between ${formatCurrency(bin.lower)} and ${formatCurrency(bin.upper)}`} />
              </div>
            ))}
          </div>
          <div className="chart-caption">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(simulation.histogram.at(-1)?.upper ?? 0)}</span>
          </div>
        </div>
        <div>
          <h3>Five-number summary</h3>
          <div className="five-number-grid">
            {fiveNumberSummary.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{formatCurrency(item.value)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Loss exceedance</h3>
          <div className="exceedance-list">
            {simulation.exceedance.map((point) => (
              <div className="signal" key={point.probability}>
                <span>{Math.round(point.probability * 100)}% chance loss exceeds</span>
                <strong>{formatCurrency(point.loss)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Six loss forms</h3>
          <div className="tag-cloud">
            {lossForms.map((form) => (
              <span key={form}>{form}</span>
            ))}
          </div>
        </div>
        <div>
          <h3>Evidence nutrition label</h3>
          <div className="nutrition-grid">
            {evidenceNutrition.map((item) => (
              <Detail key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
        <div>
          <h3>Data vetting</h3>
          <div className="check-list">
            {dataChecks.map((item) => (
              <span key={item}>
                <Check size={15} />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>Calibration anchors</h3>
          <div className="calibration-list">
            {calibration.map((item) => (
              <div key={item.word}>
                <strong>{item.word}</strong>
                <span>{item.range}</span>
                <p>{item.action}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Human approval controls</h3>
          <div className="check-list">
            {approvalGates.map((item) => (
              <span key={item}>
                <Check size={15} />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="wide-crq">
          <h3>SME chip-and-bin elicitation</h3>
          <div className="chip-bins">
            {["0-1 events", "2-4 events", "5-8 events", "9+ events"].map((label, index) => (
              <div className="chip-bin" key={label}>
                <span>{label}</span>
                <strong>{[18, 42, 28, 12][index]} chips</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
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

function NthPartyView() {
  const scans = nthPartyGraph.scans;
  const [selectedDomain, setSelectedDomain] = useState(scans[0]?.domain ?? "");
  const [layerFilter, setLayerFilter] = useState("all");

  const scan = scans.find((entry) => entry.domain === selectedDomain) ?? scans[0];
  const rows = useMemo(() => {
    if (!scan) return [];
    const filtered =
      layerFilter === "all"
        ? scan.relationships
        : scan.relationships.filter((rel) => String(rel.nth_party_layer) === layerFilter);
    return [...filtered].sort(
      (a, b) =>
        a.nth_party_layer - b.nth_party_layer ||
        a.nth_party_organization.localeCompare(b.nth_party_organization),
    );
  }, [scan, layerFilter]);

  const layers = useMemo(
    () => [...new Set(scan?.relationships.map((rel) => rel.nth_party_layer) ?? [])].sort((a, b) => a - b),
    [scan],
  );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Nth-party discovery</p>
          <h2>Vendor Graph Beyond Tier 1</h2>
        </div>
        <Network size={19} />
      </div>

      {!scan ? (
        <div className="empty-state">
          <p>
            No nth-party scans ingested yet. Vendor concentration below Tier 1 stays invisible until a
            scan runs.
          </p>
          <p>
            Add authorized domains to <code>data/nth-party/targets.json</code>, install the CLI
            (<code>brew install nthpartyfinder</code> or <code>cargo install nthpartyfinder</code>), then run{" "}
            <code>npm run sync:nthparty</code>. Scan output committed from any machine is ingested the
            same way.
          </p>
        </div>
      ) : (
        <>
          <div className="filter-row" aria-label="Nth-party filters">
            <label>
              <span className="filter-label">Scanned domain</span>
              <select value={scan.domain} onChange={(event) => setSelectedDomain(event.target.value)}>
                {scans.map((entry) => (
                  <option key={entry.domain} value={entry.domain}>{entry.domain}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="filter-label">Layer</span>
              <select value={layerFilter} onChange={(event) => setLayerFilter(event.target.value)}>
                <option value="all">All layers</option>
                {layers.map((layer) => (
                  <option key={layer} value={String(layer)}>Layer {layer}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="framework-chip-row">
            <span>Relationships <strong>{scan.summary.total_relationships}</strong></span>
            <span>Max depth <strong>{scan.summary.max_depth}</strong></span>
            <span>Unique domains <strong>{scan.summary.unique_domains}</strong></span>
            <span>Unique orgs <strong>{scan.summary.unique_organizations}</strong></span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nth party</th>
                  <th>Layer</th>
                  <th>Reached via</th>
                  <th>Discovery source</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((rel, index) => (
                  <tr key={`${rel.nth_party_domain}-${rel.nth_party_record_type}-${index}`}>
                    <td>
                      <strong>{rel.nth_party_organization || rel.nth_party_domain}</strong>
                      <span>{rel.nth_party_domain}</span>
                    </td>
                    <td>{rel.nth_party_layer}</td>
                    <td>
                      {rel.nth_party_customer_organization || rel.nth_party_customer_domain}
                      <span>{rel.nth_party_customer_domain}</span>
                    </td>
                    <td><code>{rel.nth_party_record_type}</code></td>
                    <td className="evidence-cell">{rel.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="source-note">
        Discovery by{" "}
        <a href={nthPartyGraph.source.url} target="_blank" rel="noreferrer noopener">
          {nthPartyGraph.source.tool}
        </a>{" "}
        ({nthPartyGraph.source.license}) from public DNS, certificate transparency, trust-center
        subprocessor, and web-traffic signals.
      </p>
    </section>
  );
}

function HardeningLibraryView() {
  // The generated library is ~1.7MB, so it is code-split out of the initial
  // bundle and pulled in only when the Admin view renders.
  const [hardeningLibrary, setHardeningLibrary] = useState<HardeningLibrary | null>(null);
  const [loadError, setLoadError] = useState("");
  const [platform, setPlatform] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [automationOnly, setAutomationOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("./hardeningData")
      .then((module) => {
        if (!cancelled) setHardeningLibrary(module.hardeningLibrary);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const guide =
    hardeningLibrary?.guides.find((entry) => entry.slug === platform) ?? hardeningLibrary?.guides[0];

  const controls = useMemo(() => {
    if (!guide) return [];
    return guide.controls.filter((control) => {
      if (profileFilter !== "all" && String(control.profileLevel) !== profileFilter) return false;
      if (automationOnly && control.artifacts.length === 0) return false;
      return true;
    });
  }, [guide, profileFilter, automationOnly]);

  const automatedCount = guide?.controls.filter((control) => control.artifacts.length > 0).length ?? 0;

  if (!hardeningLibrary) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Integration hardening</p>
            <h2>SaaS Hardening Library</h2>
          </div>
          <ShieldCheck size={19} />
        </div>
        <div className="empty-state">
          <p>{loadError ? `Could not load the hardening library: ${loadError}` : "Loading hardening library..."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Integration hardening</p>
          <h2>SaaS Hardening Library</h2>
        </div>
        <ShieldCheck size={19} />
      </div>

      <div className="framework-chip-row">
        <span>Platforms <strong>{hardeningLibrary.guideCount}</strong></span>
        <span>Controls <strong>{hardeningLibrary.controlCount}</strong></span>
        <span>Full control packs <strong>{hardeningLibrary.packControlCount}</strong></span>
      </div>

      <div className="filter-row" aria-label="Hardening library filters">
        <label>
          <span className="filter-label">Platform</span>
          <select value={guide?.slug ?? ""} onChange={(event) => setPlatform(event.target.value)}>
            {hardeningLibrary.guides.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.vendor} ({entry.controls.length})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="filter-label">Profile level</span>
          <select value={profileFilter} onChange={(event) => setProfileFilter(event.target.value)}>
            <option value="all">All levels</option>
            <option value="1">L1 Crawl</option>
            <option value="2">L2 Walk</option>
            <option value="3">L3 Run</option>
          </select>
        </label>
        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={automationOnly}
            onChange={(event) => setAutomationOnly(event.target.checked)}
          />
          <span>Has automation only ({automatedCount})</span>
        </label>
      </div>

      {guide ? (
        <>
          <p className="guide-meta">
            {guide.description}{" "}
            <a href={guide.url} target="_blank" rel="noreferrer noopener">Full guide</a>
            {guide.category ? ` / ${guide.category}` : ""}
            {guide.version ? ` / v${guide.version}` : ""}
            {guide.maturity ? ` / ${guide.maturity}` : ""}
          </p>

          <div className="pipeline">
            {controls.map((control) => (
              <div className="hardening-row" key={control.id}>
                <div className="hardening-head">
                  <div>
                    <strong>{control.section} {control.title}</strong>
                    <span>
                      L{control.profileLevel}
                      {control.severity ? ` / ${control.severity}` : ""}
                      {control.depth === "pack" ? " / control pack" : " / guide section"}
                    </span>
                  </div>
                  <a href={control.guideUrl} target="_blank" rel="noreferrer noopener">Guide</a>
                </div>

                {control.description ? <p>{control.description}</p> : null}

                {control.compliance.length > 0 ? (
                  <div className="citation-row">
                    {control.compliance.map((ref) => (
                      <span key={`${ref.framework}-${ref.citation}`}>
                        {ref.framework} <strong>{ref.citation}</strong>
                      </span>
                    ))}
                  </div>
                ) : null}

                {control.artifacts.length > 0 ? (
                  <div className="artifact-badges">
                    {control.artifacts.map((kind) => (
                      <span key={kind} className={`pill ${kind}`}>{kind}</span>
                    ))}
                  </div>
                ) : null}

                {control.auditChecks.length > 0 ? (
                  <div className="hardening-detail">
                    <p className="field-label">Evidence checks</p>
                    {control.auditChecks.map((check) => (
                      <div key={check.id} className="hardening-check">
                        <span>{check.description}</span>
                        <code>{check.endpoint || check.query}</code>
                      </div>
                    ))}
                  </div>
                ) : null}

                {control.remediation.length > 0 ? (
                  <div className="hardening-detail">
                    <p className="field-label">Remediation</p>
                    {control.remediation.map((step, index) => (
                      <div key={`${step.kind}-${index}`} className="hardening-check">
                        <span>{step.kind}: {step.description}</span>
                        {step.detail ? <code>{step.detail}</code> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {controls.length === 0 ? <p className="guide-meta">No controls match these filters.</p> : null}
          </div>
        </>
      ) : null}

      <p className="source-note">
        Content from{" "}
        <a href={hardeningLibrary.source.url} target="_blank" rel="noreferrer noopener">
          {hardeningLibrary.source.repo}
        </a>{" "}
        ({hardeningLibrary.source.license}), pinned at {hardeningLibrary.source.ref.slice(0, 7)}.
        Controls marked <em>control pack</em> carry machine-readable evidence checks and remediation;
        <em> guide section</em> entries carry framework citations only.
      </p>
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

function FairTraceabilityView({
  versions,
  auditLog,
  simulationRuns,
  onDecideFairRun,
}: {
  versions: FairScenarioVersion[];
  auditLog: MutationAuditLogEntry[];
  simulationRuns: FairSimulationRun[];
  onDecideFairRun: (runId: string, decision: "Approved" | "Rejected", reason: string) => Promise<void>;
}) {
  const latestVersions = versions.slice(0, 8);
  const latestAudit = auditLog.slice(0, 8);
  const latestRuns = simulationRuns.slice(0, 8);
  const [decisionState, setDecisionState] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  const decideRun = async (run: FairSimulationRun, decision: "Approved" | "Rejected") => {
    setDecisionState((current) => ({ ...current, [run.run_id]: "saving" }));
    try {
      await onDecideFairRun(run.run_id, decision, `${decision} in admin approval queue`);
      setDecisionState((current) => ({ ...current, [run.run_id]: "saved" }));
    } catch {
      setDecisionState((current) => ({ ...current, [run.run_id]: "error" }));
    }
  };

  return (
    <section className="view-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Board risk governance</p>
            <h2>Simulation Approval Queue</h2>
          </div>
          <ClipboardCheck size={19} />
        </div>
        {latestRuns.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Scenario output</th>
                  <th>Assumption link</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {latestRuns.map((run) => (
                  <tr key={run.run_id}>
                    <td>
                      <strong>{run.run_label}</strong>
                      <span>{run.control_id} / {run.requested_by} / {run.created_at}</span>
                    </td>
                    <td>
                      <strong>{formatCurrency(run.p90)} P90</strong>
                      <span>P50 {formatCurrency(run.p50)} / expected {formatCurrency(run.expected_loss)} / {run.appetite_breach_probability}% breach</span>
                    </td>
                    <td>
                      <strong>{run.sensitivity_driver}</strong>
                      <span>{run.assumption_version_id ?? "No version link"}</span>
                    </td>
                    <td>
                      <StatusPill status={run.approval_state} />
                      {run.approval_state === "Pending Approval" ? (
                        <div className="row-actions">
                          <button className="secondary-button compact-button" onClick={() => decideRun(run, "Approved")} disabled={decisionState[run.run_id] === "saving"}>
                            <Check size={15} /> Approve
                          </button>
                          <button className="secondary-button compact-button" onClick={() => decideRun(run, "Rejected")} disabled={decisionState[run.run_id] === "saving"}>
                            <X size={15} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span>{run.approved_by ? `${run.approved_by} / ${run.decision_reason}` : run.decision_reason || "No decision note"}</span>
                      )}
                      {decisionState[run.run_id] === "error" && <span className="save-state error">Decision failed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="reasoning-box">
            <ClipboardCheck size={18} />
            <p>No board runs are waiting yet. Save a scenario from the risk lab to create an approval record.</p>
          </div>
        )}
      </section>

      <section className="program-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAIR lineage</p>
            <h2>Assumption Version History</h2>
          </div>
          <Route size={19} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Version</th>
                <th>Likely loss</th>
                <th>Frequency</th>
                <th>Changed by</th>
              </tr>
            </thead>
            <tbody>
              {latestVersions.map((version) => (
                <tr key={version.version_id}>
                  <td>
                    <strong>{version.scenario_name}</strong>
                    <span>{version.control_id} / {version.change_reason}</span>
                  </td>
                  <td>v{version.version_number}</td>
                  <td>{formatCurrency(version.probable_loss_most_likely)}</td>
                  <td>{version.annual_event_frequency_most_likely}/year</td>
                  <td>
                    {version.changed_by}
                    <span>{version.created_at}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Write guardrails</p>
            <h2>Mutation Audit Log</h2>
          </div>
          <LockKeyhole size={19} />
        </div>
        <div className="pipeline">
          {latestAudit.length ? latestAudit.map((entry) => (
            <div className="edge-card" key={entry.id}>
              <strong>{entry.action} / {entry.outcome}</strong>
              <span>{entry.target_type} {entry.target_id} / {entry.actor} / {entry.auth_mode}</span>
              <small>{entry.reason}</small>
            </div>
          )) : (
            <div className="reasoning-box">
              <LockKeyhole size={18} />
              <p>No local mutations have been recorded yet. Save a control or FAIR assumption to create an audit event.</p>
            </div>
          )}
        </div>
      </section>
      </section>
    </section>
  );
}

function FairDatabaseAdmin({
  fairScenarios,
  controls,
  onUpdateFairScenario,
}: {
  fairScenarios: FairScenarioParameter[];
  controls: GovernanceControl[];
  onUpdateFairScenario: (controlId: string, updates: Partial<FairScenarioParameter>) => Promise<void>;
}) {
  const [selectedControlId, setSelectedControlId] = useState(fairScenarios[0]?.control_id ?? "");
  const selected = fairScenarios.find((scenario) => scenario.control_id === selectedControlId) ?? fairScenarios[0];
  const selectedControl = controls.find((control) => control.id === selected?.control_id);
  const [form, setForm] = useState<Partial<FairScenarioParameter>>(selected ?? {});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setForm(selected ?? {});
    setSaveState("idle");
  }, [selected.control_id]);

  if (!selected) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAIR database</p>
            <h2>No Scenario Factors Found</h2>
          </div>
          <CircleDollarSign size={19} />
        </div>
      </section>
    );
  }

  const setNumber = (field: keyof FairScenarioParameter, value: string) => setForm((current) => ({ ...current, [field]: Number(value) }));
  const setText = (field: keyof FairScenarioParameter, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const save = async () => {
    setSaveState("saving");
    try {
      await onUpdateFairScenario(selected.control_id, form);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FAIR database</p>
          <h2>Calculation Factors</h2>
        </div>
        <CircleDollarSign size={19} />
      </div>
      <div className="fair-admin-layout">
        <div className="fair-admin-list">
          {fairScenarios.map((scenario) => {
            const control = controls.find((item) => item.id === scenario.control_id);
            return (
              <button
                key={scenario.control_id}
                className={selected.control_id === scenario.control_id ? "saved-view selected" : "saved-view"}
                onClick={() => setSelectedControlId(scenario.control_id)}
              >
                <strong>{scenario.scenario_name}</strong>
                <span>{scenario.control_id} / {control?.implementation_status ?? "Unmapped"}</span>
                <p>{formatCurrency(scenario.probable_loss_most_likely)} likely loss, {scenario.annual_event_frequency_most_likely}/year frequency, {scenario.control_strength_percentage}% strength</p>
              </button>
            );
          })}
        </div>
        <div className="fair-editor">
          <div className="summary-strip">
            <Detail label="Control" value={selectedControl?.name ?? selected.control_id} />
            <Detail label="Appetite" value={formatCurrency(Number(form.appetite_threshold ?? 0))} />
            <Detail label="Data quality" value={String(form.data_quality ?? "Medium")} />
          </div>
          <div className="edit-grid">
            <label className="field-label wide-field">
              Scenario
              <input value={String(form.scenario_name ?? "")} onChange={(event) => setText("scenario_name", event.target.value)} />
            </label>
            <label className="field-label">
              Loss min
              <input type="number" min="0" step="10000" value={Number(form.probable_loss_min ?? 0)} onChange={(event) => setNumber("probable_loss_min", event.target.value)} />
            </label>
            <label className="field-label">
              Loss most likely
              <input type="number" min="0" step="10000" value={Number(form.probable_loss_most_likely ?? 0)} onChange={(event) => setNumber("probable_loss_most_likely", event.target.value)} />
            </label>
            <label className="field-label">
              Loss max
              <input type="number" min="0" step="10000" value={Number(form.probable_loss_max ?? 0)} onChange={(event) => setNumber("probable_loss_max", event.target.value)} />
            </label>
            <label className="field-label">
              Frequency min
              <input type="number" min="0" step="0.01" value={Number(form.annual_event_frequency_min ?? 0)} onChange={(event) => setNumber("annual_event_frequency_min", event.target.value)} />
            </label>
            <label className="field-label">
              Frequency likely
              <input type="number" min="0" step="0.01" value={Number(form.annual_event_frequency_most_likely ?? 0)} onChange={(event) => setNumber("annual_event_frequency_most_likely", event.target.value)} />
            </label>
            <label className="field-label">
              Frequency max
              <input type="number" min="0" step="0.01" value={Number(form.annual_event_frequency_max ?? 0)} onChange={(event) => setNumber("annual_event_frequency_max", event.target.value)} />
            </label>
            <label className="field-label">
              Vulnerability %
              <input type="number" min="0" max="100" value={Number(form.vulnerability_percentage ?? 0)} onChange={(event) => setNumber("vulnerability_percentage", event.target.value)} />
            </label>
            <label className="field-label">
              Control strength %
              <input type="number" min="0" max="100" value={Number(form.control_strength_percentage ?? 0)} onChange={(event) => setNumber("control_strength_percentage", event.target.value)} />
            </label>
            <label className="field-label">
              LM reduction %
              <input type="number" min="0" max="100" value={Number(form.loss_magnitude_reduction_percentage ?? 0)} onChange={(event) => setNumber("loss_magnitude_reduction_percentage", event.target.value)} />
            </label>
            <label className="field-label">
              Appetite threshold
              <input type="number" min="0" step="10000" value={Number(form.appetite_threshold ?? 0)} onChange={(event) => setNumber("appetite_threshold", event.target.value)} />
            </label>
            <label className="field-label">
              Confidence %
              <input type="number" min="0" max="100" value={Number(form.confidence_percentage ?? 0)} onChange={(event) => setNumber("confidence_percentage", event.target.value)} />
            </label>
            <label className="field-label">
              Data quality
              <select value={String(form.data_quality ?? "Medium")} onChange={(event) => setText("data_quality", event.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="field-label wide-field">
              Source notes
              <textarea rows={4} value={String(form.source_notes ?? "")} onChange={(event) => setText("source_notes", event.target.value)} />
            </label>
          </div>
          <div className="action-row">
            <button className="primary-button" onClick={save} disabled={saveState === "saving"}>
              <Save size={17} /> {saveState === "saving" ? "Saving" : "Save FAIR factors"}
            </button>
            <span className={`save-state ${saveState}`}>{saveState === "saved" ? "Saved to database" : saveState === "error" ? "Start the local API to save FAIR factors" : "Used by the risk calculator"}</span>
          </div>
        </div>
      </div>
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
