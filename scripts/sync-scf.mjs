/**
 * Ingest the Secure Controls Framework catalog from GRCEngClub/scf-api into
 * data/scf/catalog.json, which server/database.js seeds into SQLite.
 *
 * Upstream: https://github.com/GRCEngClub/scf-api
 * Live API: https://grcengclub.github.io/scf-api/
 *
 * Licensing note. SCF content is CC BY-ND (Attribution-NoDerivatives). This
 * script therefore copies `title` and `description` VERBATIM and never rewrites,
 * summarises, or merges them. What we add on top is structure: which SCF control
 * answers which framework citation, and which of our controls already claim that
 * citation. Attribution lives in THIRD-PARTY-NOTICES.md and in the app UI.
 *
 * The upstream api/controls.json is ~14MB. We fetch it once, keep only the
 * controls actually referenced by the frameworks this product models, and drop
 * the rest, so the committed catalog stays around a megabyte.
 *
 * Run: npm run sync:scf
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "data", "scf");
const OUT_FILE = path.join(OUT_DIR, "catalog.json");

const BASE = "https://grcengclub.github.io/scf-api";

const SOURCE = {
  repo: "GRCEngClub/scf-api",
  url: "https://github.com/GRCEngClub/scf-api",
  api: BASE,
  upstream: "https://securecontrolsframework.com",
  license: "CC BY-ND",
  licenseUrl: "https://creativecommons.org/licenses/by-nd/4.0/",
  attribution:
    "Secure Controls Framework (SCF) content is licensed CC BY-ND by the Secure Controls Framework Council. Control titles and descriptions are reproduced verbatim.",
};

/**
 * The frameworks this product already models, mapped to their SCF crosswalk ids.
 * Keys match the `frameworks.id` column seeded in server/database.js so the
 * catalog can join straight onto our own requirements.
 *
 * ISO 27001 takes two crosswalks: the 2022 standard covers only management
 * clauses 4-10, while the Annex A control numbers our requirements cite
 * (A.5.16, A.8.8, A.8.24) are crosswalked under ISO 27002.
 */
const FRAMEWORK_CROSSWALKS = [
  { frameworkId: "SOC2", crosswalkIds: ["general-aicpa-tsc-2017"] },
  { frameworkId: "ISO27001", crosswalkIds: ["general-iso-27001-2022", "general-iso-27002-2022"] },
  { frameworkId: "NISTCSF", crosswalkIds: ["general-nist-csf-2-0"] },
  { frameworkId: "HIPAA", crosswalkIds: ["usa-federal-law-hipaa-security-rule-2013"] },
  { frameworkId: "PCIDSS", crosswalkIds: ["general-pci-dss-4-0-1"] },
  { frameworkId: "GDPR", crosswalkIds: ["emea-eu-gdpr-2016"] },
  { frameworkId: "ISO42001", crosswalkIds: ["general-iso-42001-2023"] },
];

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

/** SCF cites some framework requirements with trailing notes; keep the citation itself. */
function normalizeCitation(citation) {
  return String(citation).trim();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("  fetching SCF families");
  const familiesDoc = await getJson(`${BASE}/api/families.json`);
  const families = (familiesDoc.families ?? []).map((family) => ({
    code: String(family.family_code ?? ""),
    name: String(family.family_name ?? ""),
    controlCount: Number(family.control_count) || 0,
  }));

  const frameworks = [];
  const referenced = new Set();

  for (const entry of FRAMEWORK_CROSSWALKS) {
    // One framework can span several crosswalks; merge them by citation so a
    // citation appearing in both keeps the union of its SCF controls.
    const merged = new Map();
    const displayNames = [];

    for (const crosswalkId of entry.crosswalkIds) {
      console.log(`  fetching crosswalk ${crosswalkId}`);
      const doc = await getJson(`${BASE}/api/crosswalks/${crosswalkId}.json`);
      displayNames.push(String(doc.display_name ?? crosswalkId));

      for (const [citation, scfIds] of Object.entries(doc.framework_to_scf?.mappings ?? {})) {
        const key = normalizeCitation(citation);
        if (!key) continue;
        const ids = (Array.isArray(scfIds) ? scfIds : []).map(String);
        if (!ids.length) continue;
        ids.forEach((id) => referenced.add(id));
        const existing = merged.get(key) ?? { citation: key, crosswalkId, scfControlIds: [] };
        existing.scfControlIds = [...new Set([...existing.scfControlIds, ...ids])];
        merged.set(key, existing);
      }
    }

    frameworks.push({
      frameworkId: entry.frameworkId,
      crosswalkIds: entry.crosswalkIds,
      displayName: displayNames.join(" + "),
      citations: [...merged.values()].sort((a, b) => a.citation.localeCompare(b.citation)),
    });
  }

  console.log(`  fetching full control catalog (~14MB) for ${referenced.size} referenced controls`);
  const controlsDoc = await getJson(`${BASE}/api/controls.json`);
  const allControls = Array.isArray(controlsDoc) ? controlsDoc : (controlsDoc.controls ?? []);

  const controls = [];
  for (const control of allControls) {
    const id = String(control.control_id ?? "");
    if (!referenced.has(id)) continue;
    controls.push({
      // Verbatim upstream fields - see the licensing note above.
      id,
      title: String(control.title ?? ""),
      description: String(control.description ?? ""),
      familyCode: String(control.family ?? ""),
      familyName: String(control.family_name ?? ""),
      weight: Number(control.relative_weight) || 0,
      cadence: String(control.conformity_cadence ?? ""),
      nistCsfFunction: String(control.nist_csf_function ?? ""),
    });
  }
  controls.sort((a, b) => a.id.localeCompare(b.id));

  const missing = [...referenced].filter((id) => !controls.some((c) => c.id === id));
  if (missing.length) {
    console.warn(`  ! ${missing.length} referenced control(s) absent from controls.json`);
  }

  const catalog = {
    source: SOURCE,
    generatedFrom: {
      totalFamilies: Number(familiesDoc.total_families) || families.length,
      totalControls: Number(familiesDoc.total_controls) || 0,
      referencedControls: controls.length,
    },
    families,
    frameworks,
    controls,
  };

  writeFileSync(OUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const citationCount = frameworks.reduce((sum, f) => sum + f.citations.length, 0);
  console.log(`  wrote ${path.relative(ROOT, OUT_FILE)}`);
  console.log(
    `  ${controls.length} control(s), ${frameworks.length} framework(s), ${citationCount} citation(s)`,
  );
}

main().catch((error) => {
  console.error(`  ! sync:scf failed: ${error.message}`);
  process.exitCode = 1;
});
