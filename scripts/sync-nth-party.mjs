/**
 * Ingest nth-party vendor scans from grcengineering/nthpartyfinder into src/nthPartyData.ts.
 *
 * Upstream: https://github.com/grcengineering/nthpartyfinder (MIT)
 *
 * Two modes, in this order:
 *   1. If `nthpartyfinder` is on PATH, scan every domain listed in
 *      data/nth-party/targets.json and write the JSON output beside it.
 *   2. Ingest every *.scan.json already in data/nth-party/ regardless of who
 *      produced it, so scans run on another machine (or in CI, or via the Docker
 *      image) can simply be committed.
 *
 * The tool only reads public signals, but a scan still opens many connections.
 * Only list domains you are authorized to assess.
 *
 * Run: npm run sync:nthparty
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data", "nth-party");
const TARGETS_FILE = path.join(DATA_DIR, "targets.json");
const OUT_FILE = path.join(ROOT, "src", "nthPartyData.ts");

const SOURCE = {
  repo: "grcengineering/nthpartyfinder",
  ref: "bb2b0c636362bf3e358becb48771c8e7e60beaf7",
  license: "MIT",
  url: "https://github.com/grcengineering/nthpartyfinder",
  tool: "nthpartyfinder",
};

function hasBinary() {
  const probe = spawnSync("nthpartyfinder", ["--version"], { encoding: "utf8" });
  return probe.status === 0;
}

function readTargets() {
  if (!existsSync(TARGETS_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(TARGETS_FILE, "utf8"));
    return Array.isArray(parsed.targets) ? parsed.targets : [];
  } catch (error) {
    console.warn(`  ! could not read targets.json: ${error.message}`);
    return [];
  }
}

function runScans(targets) {
  for (const target of targets) {
    const domain = String(target.domain || "").trim();
    if (!domain) continue;
    const depth = String(target.depth ?? 1);
    const outPath = path.join(DATA_DIR, `${domain.replace(/[^a-z0-9.-]/gi, "_")}.scan.json`);
    console.log(`  scanning ${domain} (depth ${depth}) - this can take several minutes`);
    try {
      execFileSync(
        "nthpartyfinder",
        [
          "-d", domain,
          "--depth", depth,
          "-f", "json",
          "-o", outPath,
          "--timeout", String(target.timeoutSeconds ?? 1800),
          ...(target.dnsOnly ? ["--dns-only"] : []),
        ],
        { stdio: "inherit" },
      );
    } catch (error) {
      // A timeout writes a checkpoint and exits non-zero; keep going and ingest
      // whatever landed on disk rather than losing the other targets.
      console.warn(`  ! scan of ${domain} exited non-zero: ${error.message}`);
    }
  }
}

/** Accept either the tool's raw {summary, relationships} or an already-wrapped scan. */
function normalizeScan(fileName, raw) {
  const relationships = Array.isArray(raw.relationships) ? raw.relationships : [];
  const derivedDomain =
    raw.domain ||
    relationships[0]?.root_customer_domain ||
    fileName.replace(/\.scan\.json$/, "");

  const summary = raw.summary || {
    total_relationships: relationships.length,
    max_depth: relationships.reduce((max, r) => Math.max(max, Number(r.nth_party_layer) || 0), 0),
    unique_domains: new Set(relationships.map((r) => r.nth_party_domain)).size,
    unique_organizations: new Set(relationships.map((r) => r.nth_party_organization)).size,
  };

  return {
    domain: String(derivedDomain),
    scannedAt: String(raw.scannedAt || ""),
    summary: {
      total_relationships: Number(summary.total_relationships) || 0,
      max_depth: Number(summary.max_depth) || 0,
      unique_domains: Number(summary.unique_domains) || 0,
      unique_organizations: Number(summary.unique_organizations) || 0,
    },
    relationships: relationships.map((r) => ({
      nth_party_domain: String(r.nth_party_domain || ""),
      nth_party_organization: String(r.nth_party_organization || ""),
      nth_party_layer: Number(r.nth_party_layer) || 0,
      nth_party_customer_domain: String(r.nth_party_customer_domain || ""),
      nth_party_customer_organization: String(r.nth_party_customer_organization || ""),
      nth_party_record: String(r.nth_party_record || ""),
      nth_party_record_type: String(r.nth_party_record_type || ""),
      root_customer_domain: String(r.root_customer_domain || ""),
      root_customer_organization: String(r.root_customer_organization || ""),
      evidence: String(r.evidence || ""),
    })),
  };
}

function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const targets = readTargets();
  if (targets.length && hasBinary()) {
    runScans(targets);
  } else if (targets.length) {
    console.log("  nthpartyfinder not on PATH - skipping live scans, ingesting existing output");
    console.log("  install: brew install nthpartyfinder | cargo install nthpartyfinder");
  } else {
    console.log("  no targets configured - ingesting existing scan output only");
  }

  const scanFiles = readdirSync(DATA_DIR).filter((f) => f.endsWith(".scan.json"));
  const scans = [];
  for (const fileName of scanFiles) {
    try {
      const raw = JSON.parse(readFileSync(path.join(DATA_DIR, fileName), "utf8"));
      scans.push(normalizeScan(fileName, raw));
    } catch (error) {
      console.warn(`  ! skipped ${fileName}: ${error.message}`);
    }
  }
  scans.sort((a, b) => a.domain.localeCompare(b.domain));

  const banner = `// GENERATED FILE - do not edit by hand.
// Source: ${SOURCE.url} @ ${SOURCE.ref} (MIT)
// Regenerate with: npm run sync:nthparty
`;
  writeFileSync(
    OUT_FILE,
    `${banner}import type { NthPartyGraph } from "./types";\n\nexport const nthPartyGraph: NthPartyGraph = ${JSON.stringify(
      { source: SOURCE, scans },
      null,
      2,
    )};\n`,
    "utf8",
  );

  const totalRels = scans.reduce((sum, scan) => sum + scan.relationships.length, 0);
  console.log(`  wrote ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`  ${scans.length} scan(s), ${totalRels} relationship(s)`);
}

main();
