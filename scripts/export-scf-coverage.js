/**
 * Snapshot SCF coverage to public/scf/coverage.json for the hosted build.
 *
 * The hosted Governance API is the DynamoDB-backed Lambda, which does not serve
 * /api/scf/coverage. Rather than have the SCF tab dead-end on GitHub Pages, the
 * same payload the local API returns is written out as a static file and the
 * client falls back to it. Local `dev:full` still hits the live route, so edits
 * to the database show up immediately there.
 *
 * Run: npm run export:scf-coverage
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createDatabase,
  getScfCoverage,
  initializeDatabase,
  seedDatabase,
} from "../server/database.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "public", "scf", "coverage.json");

const db = createDatabase();
initializeDatabase(db);
seedDatabase(db);

const coverage = getScfCoverage(db);
mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, `${JSON.stringify(coverage, null, 2)}\n`, "utf8");

console.log(`  wrote ${OUT_FILE.replace(ROOT, ".")}`);
console.log(
  `  ${coverage.summary.requirements} requirement(s), ${coverage.summary.suggestedControls} suggested control(s)`,
);
