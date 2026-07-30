import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createDatabase, getGovernanceSnapshot, initializeDatabase, seedDatabase } from "../server/database.js";

const outputPath = join(process.cwd(), "server", "governance-seed-snapshot.json");
const db = createDatabase(":memory:");
initializeDatabase(db);
seedDatabase(db);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(getGovernanceSnapshot(db), null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
