/**
 * Write server/governance-seed-snapshot.json from the seeded database.
 *
 * server/lambda.js bundles this file, so when it drifts from the schema the
 * hosted API ships stale data even after a redeploy. `--check` exists to catch
 * that in CI without needing AWS access.
 *
 * Run: npm run export:snapshot
 *      npm run export:snapshot -- --check
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createDatabase, getGovernanceSnapshot, initializeDatabase, seedDatabase } from "../server/database.js";

const outputPath = join(process.cwd(), "server", "governance-seed-snapshot.json");
const check = process.argv.includes("--check");

const db = createDatabase(":memory:");
initializeDatabase(db);
seedDatabase(db);
const snapshot = getGovernanceSnapshot(db);

/**
 * Blank the timestamps SQLite stamps with CURRENT_TIMESTAMP at seed time.
 *
 * Those move on every run, so a byte comparison of two exports always differs
 * even when nothing meaningful changed. Everything else - collections, ids,
 * field values - still compares exactly, so a genuinely drifted seed is caught.
 */
function withoutGeneratedTimestamps(value) {
  if (Array.isArray(value)) return value.map(withoutGeneratedTimestamps);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) =>
        key === "created_at" || key === "updated_at"
          ? [key, null]
          : [key, withoutGeneratedTimestamps(inner)],
      ),
    );
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(withoutGeneratedTimestamps(value));
}

if (check) {
  let committed;
  try {
    committed = JSON.parse(readFileSync(outputPath, "utf8"));
  } catch (error) {
    console.error(`  ! cannot read ${outputPath}: ${error.message}`);
    process.exit(1);
  }

  if (stableJson(committed) === stableJson(snapshot)) {
    console.log("  seed snapshot is up to date");
    process.exit(0);
  }

  const summary = (value) =>
    Object.entries(value)
      .filter(([, inner]) => Array.isArray(inner))
      .map(([name, inner]) => `${name}=${inner.length}`)
      .sort()
      .join(" ");

  console.error("  ! server/governance-seed-snapshot.json is out of date.");
  console.error(`    committed: ${summary(committed)}`);
  console.error(`    expected:  ${summary(snapshot)}`);
  console.error("    Run 'npm run export:snapshot' and commit the result.");
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
