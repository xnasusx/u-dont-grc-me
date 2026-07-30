import test from "node:test";
import assert from "node:assert/strict";
import { createControl, createDatabase, getControl, getGovernanceSnapshot, initializeDatabase, seedDatabase } from "./database.js";

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
