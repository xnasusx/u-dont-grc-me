import test from "node:test";
import assert from "node:assert/strict";
import {
  createControl,
  createDatabase,
  createFairSimulationRun,
  decideFairSimulationRun,
  getControl,
  getFairScenarioVersions,
  getFairSimulationRuns,
  getFairSettings,
  getGovernanceSnapshot,
  getMutationAuditLog,
  getProgramWorkbench,
  getScfControl,
  getScfCoverage,
  initializeDatabase,
  seedDatabase,
  updateControl,
  updateFairSetting,
} from "./database.js";

function seededMemoryDb() {
  const db = createDatabase(":memory:");
  initializeDatabase(db);
  seedDatabase(db);
  return db;
}

test("governance snapshot returns a mapped control inventory", () => {
  const db = seededMemoryDb();
  const snapshot = getGovernanceSnapshot(db);

  assert.equal(snapshot.stats.controls, 12);
  assert.equal(snapshot.stats.frameworks, 7);
  assert.equal(snapshot.stats.mappings, 16);
  assert.ok(snapshot.stats.activeMappings > snapshot.stats.gaps);

  const pam = snapshot.controls.find((control) => control.id === "CTRL-PAM-001");
  assert.ok(pam);
  assert.deepEqual(pam.mappedFrameworks.sort(), ["ISO 27001", "NIST CSF", "SOC 2"]);
  assert.equal(pam.assets.length, 2);
  assert.equal(pam.evidenceBlueprints.length, 2);
});

test("single control lookup includes mapping, evidence, policy, and asset detail", () => {
  const db = seededMemoryDb();
  const control = getControl(db, "CTRL-VULN-004");

  assert.equal(control.name, "Critical Vulnerability Remediation");
  assert.equal(control.mappings.length, 2);
  assert.equal(control.assets[0].name, "AWS Security Hub");
  assert.equal(control.evidenceItems[0].verdict, "Degraded");
  assert.equal(control.policies[0].title, "Vulnerability Management Standard");
});

test("new controls are validated and persisted", () => {
  const db = seededMemoryDb();
  const created = createControl(db, {
    id: "CTRL-NEW-999",
    tenant_id: "tenant-acme-us",
    name: "New Control",
    family: "Governance",
    description: "A test control.",
    owner: "owner@example.com",
    team: "GRC",
    control_type: "Directive",
    automation_level: "Manual",
    implementation_status: "In Progress",
    criticality: "Low",
    testing_cadence: "Quarterly",
  });

  assert.equal(created.id, "CTRL-NEW-999");
  assert.equal(getGovernanceSnapshot(db).stats.controls, 13);
});

test("new controls reject missing required fields", () => {
  const db = seededMemoryDb();
  assert.throws(() => createControl(db, { id: "CTRL-BAD-001" }), /Missing required fields/);
});

test("program workbench returns open-source GRC integration queues", () => {
  const db = seededMemoryDb();
  const workbench = getProgramWorkbench(db);

  assert.equal(workbench.projects.length, 3);
  assert.equal(workbench.frameworkImports.length, 5);
  assert.equal(workbench.assessmentRuns.length, 3);
  assert.equal(workbench.accountReviews.length, 3);
  assert.equal(workbench.vendorQuestionnaires.length, 3);
  assert.equal(workbench.hardeningGuides.length, 4);

  const cisoImport = workbench.frameworkImports.find((item) => item.source_tool === "CISO Assistant");
  assert.ok(cisoImport);
  assert.equal(cisoImport.validation_state, "Ready");
  assert.ok(cisoImport.candidate_controls >= 20);

  const oktaReview = workbench.accountReviews.find((item) => item.source_system === "Okta Workforce");
  assert.ok(oktaReview);
  assert.equal(oktaReview.control_id, "CTRL-IAM-002");
});

test("governance snapshot includes program workbench data", () => {
  const db = seededMemoryDb();
  const snapshot = getGovernanceSnapshot(db);

  assert.ok(snapshot.programWorkbench);
  assert.equal(snapshot.programWorkbench.projects[0].tenant_id, "tenant-acme-us");
  assert.equal(snapshot.programWorkbench.hardeningGuides[0].control_id.startsWith("CTRL-"), true);
  assert.ok(snapshot.fairScenarioVersions.length >= snapshot.fairScenarios.length);
  assert.ok(Array.isArray(snapshot.fairSimulationRuns));
  assert.ok(Array.isArray(snapshot.mutationAuditLog));
});

test("controls can be edited through an allowlisted update", () => {
  const db = seededMemoryDb();
  const updated = updateControl(db, "CTRL-PAM-001", {
    owner: "identity-risk@company.com",
    implementation_status: "Degraded",
    evidence_freshness: 72,
    ignored_field: "nope",
  });

  assert.equal(updated.owner, "identity-risk@company.com");
  assert.equal(updated.implementation_status, "Degraded");
  assert.equal(updated.evidence_freshness, 72);
  assert.equal(getControl(db, "CTRL-PAM-001").owner, "identity-risk@company.com");
});

test("FAIR settings are database-backed and editable", () => {
  const db = seededMemoryDb();
  const settings = getFairSettings(db);
  assert.ok(settings.length >= 6);
  const beforeVersions = getFairScenarioVersions(db, "CTRL-VULN-004").length;

  const updated = updateFairSetting(db, "CTRL-VULN-004", {
    probable_loss_most_likely: 2100000,
    vulnerability_percentage: 52,
    appetite_threshold: 3000000,
    source_notes: "Updated by local admin test.",
    change_reason: "Test calibration update",
  }, { actor: "Unit Test", authMode: "bearer-token", tenantId: "tenant-acme-us" });

  assert.equal(updated.probable_loss_most_likely, 2100000);
  assert.equal(updated.vulnerability_percentage, 52);
  assert.equal(updated.appetite_threshold, 3000000);
  assert.match(getGovernanceSnapshot(db).fairScenarios.find((item) => item.control_id === "CTRL-VULN-004").source_notes, /local admin test/);
  const afterVersions = getFairScenarioVersions(db, "CTRL-VULN-004");
  assert.equal(afterVersions.length, beforeVersions + 1);
  assert.equal(afterVersions[0].changed_by, "Unit Test");
  assert.equal(afterVersions[0].change_reason, "Test calibration update");
  assert.equal(getMutationAuditLog(db)[0].action, "UPDATE_FAIR_SETTING");
});

test("tenant-scoped mutations reject cross-tenant writes", () => {
  const db = seededMemoryDb();

  assert.throws(
    () => updateControl(db, "CTRL-PAM-001", { owner: "wrong-tenant@example.com" }, { actor: "Unit Test", authMode: "bearer-token", tenantId: "tenant-other" }),
    /outside the active tenant scope/,
  );
});

test("FAIR simulation runs are persisted against assumption versions", () => {
  const db = seededMemoryDb();
  const run = createFairSimulationRun(db, "CTRL-VULN-004", {
    base_loss: 2100000,
    control_strength_percentage: 64,
    annual_event_frequency: 0.82,
    loss_magnitude_reduction_percentage: 18,
    appetite_threshold: 600000,
    volatility: 1.4,
    run_label: "Critical vuln board run",
  }, { actor: "Risk Owner", authMode: "bearer-token", tenantId: "tenant-acme-us" });

  assert.match(run.run_id, /^FAIR-RUN-/);
  assert.equal(run.control_id, "CTRL-VULN-004");
  assert.equal(run.approval_state, "Pending Approval");
  assert.equal(run.trial_count, 10000);
  assert.ok(run.assumption_version_id);
  assert.ok(run.p90 >= run.p50);
  assert.ok(run.appetite_breach_probability >= 0);
  assert.equal(getFairSimulationRuns(db, "CTRL-VULN-004")[0].run_label, "Critical vuln board run");
  assert.equal(getGovernanceSnapshot(db).fairSimulationRuns[0].run_id, run.run_id);
  assert.equal(getMutationAuditLog(db)[0].action, "CREATE_FAIR_SIMULATION_RUN");
});

test("FAIR simulation run decisions update approval state and audit log", () => {
  const db = seededMemoryDb();
  const run = createFairSimulationRun(db, "CTRL-PAM-001", {}, { actor: "Risk Analyst", authMode: "bearer-token", tenantId: "tenant-acme-us" });
  const decided = decideFairSimulationRun(db, run.run_id, {
    decision: "Approved",
    reason: "Board packet ready",
  }, { actor: "CISO", authMode: "bearer-token", tenantId: "tenant-acme-us" });

  assert.equal(decided.approval_state, "Approved");
  assert.equal(decided.approved_by, "CISO");
  assert.equal(decided.decision_reason, "Board packet ready");
  assert.ok(decided.decided_at);
  assert.equal(getMutationAuditLog(db)[0].action, "DECIDE_FAIR_SIMULATION_RUN");
});

test("control writes create mutation audit records", () => {
  const db = seededMemoryDb();
  updateControl(db, "CTRL-PAM-001", { owner: "identity-risk@company.com" }, { actor: "Unit Test", authMode: "bearer-token", tenantId: "tenant-acme-us" });

  const audit = getMutationAuditLog(db)[0];
  assert.equal(audit.action, "UPDATE_CONTROL");
  assert.equal(audit.outcome, "Allowed");
  assert.equal(audit.actor, "Unit Test");
  assert.equal(audit.auth_mode, "bearer-token");
});

test("SCF catalog seeds and crosswalks resolve to our requirements", () => {
  const db = seededMemoryDb();
  const coverage = getScfCoverage(db);

  assert.ok(coverage.catalogControlCount > 0, "SCF catalog should be seeded");
  assert.equal(coverage.summary.requirements, coverage.requirements.length);
  assert.equal(
    coverage.summary.resolved + coverage.summary.unresolved,
    coverage.summary.requirements,
  );
  assert.match(coverage.attribution, /CC BY-ND/);

  // Every resolved requirement must carry at least one SCF control, and every
  // referenced control must exist in the catalog.
  for (const entry of coverage.requirements) {
    if (entry.matchType === "none") {
      assert.equal(entry.scfControls.length, 0);
      continue;
    }
    assert.ok(entry.scfControls.length > 0, `${entry.citation} resolved with no SCF controls`);
    for (const control of entry.scfControls) {
      assert.ok(getScfControl(db, control.id), `${control.id} missing from scf_controls`);
    }
  }
});

test("ISO Annex A citations match SCF exactly rather than by prefix", () => {
  const db = seededMemoryDb();
  const coverage = getScfCoverage(db);

  // A.8.8 normalises to 8.8 and must resolve exactly, so it cannot absorb 8.8.x.
  const annexA = coverage.requirements.find((entry) => entry.citation === "A.8.8");
  assert.ok(annexA, "expected the seeded ISO 27001 A.8.8 requirement");
  assert.equal(annexA.matchType, "exact");
  assert.ok(annexA.scfControls.length > 0);
});

test("coarse HIPAA citations widen to SCF subsections by prefix", () => {
  const db = seededMemoryDb();
  const coverage = getScfCoverage(db);

  // We cite 164.312(a); SCF cites 164.312(a)(1), (a)(2)(i), and so on.
  const hipaa = coverage.requirements.find((entry) => entry.citation === "164.312(a)");
  assert.ok(hipaa, "expected the seeded HIPAA 164.312(a) requirement");
  assert.equal(hipaa.matchType, "prefix");
  assert.ok(hipaa.scfControls.length > 0);
});

test("re-seeding replaces the SCF catalog instead of duplicating edges", () => {
  const db = seededMemoryDb();
  const before = getScfCoverage(db);
  seedDatabase(db);
  const after = getScfCoverage(db);

  assert.equal(after.catalogControlCount, before.catalogControlCount);
  assert.equal(after.summary.suggestedControls, before.summary.suggestedControls);
});
