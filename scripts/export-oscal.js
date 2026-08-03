/**
 * Export the control inventory as an OSCAL component-definition.
 *
 * OSCAL (https://pages.nist.gov/OSCAL/) is the interchange format auditors and
 * FedRAMP tooling consume, so emitting it is what lets this prototype hand its
 * control graph to something else without a bespoke integration.
 *
 * Model mapping:
 *   our control          -> component (type "process"; these are organisational
 *                           control processes, not pieces of software)
 *   our framework        -> control-implementation, one per framework a control
 *                           is mapped into, `source` naming that framework
 *   our mapping          -> implemented-requirement, control-id = the framework
 *                           citation, with coverage/confidence carried as props
 *   our asset scope      -> component links back to the assets in scope
 *
 * UUIDs are derived (RFC 4122 v5, SHA-1 over a fixed namespace) rather than
 * random, so re-exporting an unchanged database produces a byte-identical file
 * and the diff stays reviewable.
 *
 * Run: npm run export:oscal
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createDatabase,
  getGovernanceSnapshot,
  initializeDatabase,
  seedDatabase,
} from "../server/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_FILE = join(ROOT, "public", "oscal", "component-definition.json");

const OSCAL_VERSION = "1.1.2";

const packageVersion = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

/** Fixed namespace so identifiers stay stable across runs and machines. */
const NAMESPACE = "6f1c9d3e-5b7a-4c2f-9e8d-1a2b3c4d5e6f";

/** RFC 4122 version 5 UUID (SHA-1). Node has randomUUID but no namespaced v5. */
function uuidv5(name) {
  const hex = NAMESPACE.replace(/-/g, "");
  const namespaceBytes = Buffer.from(hex, "hex");
  const hash = createHash("sha1").update(Buffer.concat([namespaceBytes, Buffer.from(name, "utf8")])).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const out = bytes.toString("hex");
  return `${out.slice(0, 8)}-${out.slice(8, 12)}-${out.slice(12, 16)}-${out.slice(16, 20)}-${out.slice(20)}`;
}

function prop(name, value, ns = "https://xnasusx.github.io/u-dont-grc-me/ns/oscal") {
  return { name, value: String(value), ns };
}

/**
 * OSCAL `last-modified` is a dateTime-with-timezone. SQLite hands back
 * "YYYY-MM-DD HH:MM:SS" in UTC, which fails schema validation as-is.
 */
function toOscalTimestamp(sqliteTimestamp) {
  if (!sqliteTimestamp) return "1970-01-01T00:00:00Z";
  const text = String(sqliteTimestamp).trim();
  if (/[Zz]$|[+-]\d{2}:\d{2}$/.test(text)) return text.replace(" ", "T");
  return `${text.replace(" ", "T")}Z`;
}

/**
 * OSCAL `implemented-requirement.control-id` expects a catalog token, which is
 * lowercase with no spaces. Citations like "164.312(a)" and "A.8.8" normalise
 * predictably; the untouched citation is kept alongside as a prop.
 */
function controlToken(citation) {
  return String(citation).toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildComponent(control, mappingsForControl, assetsForControl) {
  const byFramework = new Map();
  for (const mapping of mappingsForControl) {
    const list = byFramework.get(mapping.framework_id) ?? [];
    list.push(mapping);
    byFramework.set(mapping.framework_id, list);
  }

  const controlImplementations = [...byFramework.entries()].map(([frameworkId, mappings]) => ({
    uuid: uuidv5(`impl:${control.id}:${frameworkId}`),
    source: `#${uuidv5(`framework:${frameworkId}`)}`,
    description: `${control.name} as implemented against ${mappings[0].framework_name}.`,
    props: [prop("framework-id", frameworkId), prop("framework-name", mappings[0].framework_name)],
    "implemented-requirements": mappings.map((mapping) => ({
      uuid: uuidv5(`ir:${mapping.id}`),
      "control-id": controlToken(mapping.citation),
      description: mapping.rationale,
      props: [
        prop("citation", mapping.citation),
        prop("requirement-title", mapping.requirement_title),
        prop("mapping-state", mapping.state),
        prop("coverage-percentage", mapping.coverage_percentage),
        prop("mapping-confidence", mapping.mapping_confidence),
      ],
    })),
  }));

  const component = {
    uuid: uuidv5(`component:${control.id}`),
    type: "process",
    title: control.name,
    description: control.description,
    purpose: `${control.control_type} control owned by ${control.team}.`,
    props: [
      prop("control-id", control.id),
      prop("control-family", control.family),
      prop("control-type", control.control_type),
      prop("automation-level", control.automation_level),
      prop("implementation-status", control.implementation_status),
      prop("criticality", control.criticality),
      prop("testing-cadence", control.testing_cadence),
      prop("evidence-freshness", control.evidence_freshness),
      prop("evidence-relevance", control.evidence_relevance),
      prop("evidence-completeness", control.evidence_completeness),
    ],
    "responsible-roles": [
      { "role-id": "control-owner", "party-uuids": [uuidv5(`party:${control.owner}`)] },
    ],
  };

  if (assetsForControl.length) {
    component.links = assetsForControl.map((asset) => ({
      href: `#${uuidv5(`asset:${asset.id}`)}`,
      rel: "uses",
      text: `${asset.name} (${asset.environment}, ${asset.data_classification})`,
    }));
  }

  if (controlImplementations.length) {
    component["control-implementations"] = controlImplementations;
  }

  return component;
}

function main() {
  const db = createDatabase();
  initializeDatabase(db);
  seedDatabase(db);
  const snapshot = getGovernanceSnapshot(db);

  const mappingsByControl = new Map();
  for (const mapping of snapshot.mappings) {
    const list = mappingsByControl.get(mapping.control_id) ?? [];
    list.push(mapping);
    mappingsByControl.set(mapping.control_id, list);
  }

  const assetsByControl = new Map();
  for (const asset of snapshot.assets) {
    const list = assetsByControl.get(asset.control_id) ?? [];
    list.push(asset);
    assetsByControl.set(asset.control_id, list);
  }

  const owners = [...new Set(snapshot.controls.map((control) => control.owner))].sort();

  const components = snapshot.controls
    .map((control) =>
      buildComponent(
        control,
        mappingsByControl.get(control.id) ?? [],
        assetsByControl.get(control.id) ?? [],
      ),
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  const document = {
    "component-definition": {
      uuid: uuidv5("component-definition:u-dont-grc-me"),
      metadata: {
        title: "u dont GRC me - control inventory",
        // Derived from the newest control row rather than a wall clock so an
        // unchanged database re-exports byte-identically.
        "last-modified": toOscalTimestamp(
          snapshot.controls
            .map((control) => control.updated_at)
            .sort()
            .at(-1),
        ),
        version: packageVersion,
        "oscal-version": OSCAL_VERSION,
        roles: [{ id: "control-owner", title: "Control Owner" }],
        parties: owners.map((owner) => ({
          uuid: uuidv5(`party:${owner}`),
          type: "person",
          "email-addresses": [owner],
        })),
        remarks:
          "Generated from the u dont GRC me prototype control graph by npm run export:oscal. Prototype data, not an assurance artifact.",
      },
      components,
      "back-matter": {
        resources: snapshot.frameworks.map((framework) => ({
          uuid: uuidv5(`framework:${framework.id}`),
          title: `${framework.name} ${framework.version}`,
          props: [prop("framework-id", framework.id), prop("category", framework.category)],
        })),
      },
    },
  };

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, `${JSON.stringify(document, null, 2)}\n`, "utf8");

  const irCount = components.reduce(
    (sum, component) =>
      sum +
      (component["control-implementations"] ?? []).reduce(
        (inner, impl) => inner + impl["implemented-requirements"].length,
        0,
      ),
    0,
  );
  console.log(`  wrote ${OUT_FILE.replace(ROOT, ".")}`);
  console.log(`  ${components.length} component(s), ${irCount} implemented-requirement(s)`);
}

main();
