/**
 * Sync hardening content from grcengineering/how-to-harden into src/hardeningData.ts.
 *
 * Upstream: https://github.com/grcengineering/how-to-harden (MIT)
 *
 * Three upstream sources are joined per platform:
 *   1. packs/<vendor>/controls/*.yaml  - structured control definitions with
 *      compliance mappings, audit checks, and remediation blocks. The primary source.
 *   2. docs/_guides/<slug>.md          - front matter for platform tier/category/version.
 *   3. packs/<vendor>/**               - artifact inventory (terraform/api/cli/siem/...)
 *      derived from the git tree so we record what automation ships without
 *      bundling 2.2MB of pack bodies into the browser build.
 *
 * Run: npm run sync:hardening
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as yaml from "js-yaml";

const REPO = "grcengineering/how-to-harden";
// Pinned so a rebuild is reproducible. Bump deliberately, then re-run this script.
const REF = process.env.HOW_TO_HARDEN_REF || "05a7d3b680046c4af6e87137283d0ec9abbb6f14";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "src", "hardeningData.ts");

const ARTIFACT_KINDS = ["terraform", "api", "cli", "siem", "db", "sdk", "config", "scripts"];

async function gh(pathname) {
  const url = `https://api.github.com/${pathname}`;
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "u-dont-grc-me-sync" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} ${res.statusText} for ${pathname}`);
  return res.json();
}

async function raw(filePath) {
  const url = `https://raw.githubusercontent.com/${REPO}/${REF}/${filePath}`;
  const res = await fetch(url, { headers: { "User-Agent": "u-dont-grc-me-sync" } });
  if (!res.ok) throw new Error(`raw ${res.status} for ${filePath}`);
  return res.text();
}

/** Pull the YAML front matter block out of a Jekyll guide. */
function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  try {
    return yaml.load(match[1]) || {};
  } catch {
    return {};
  }
}

// Framework labels as they appear in guide prose, normalized to one spelling.
const GUIDE_FRAMEWORKS = {
  "nist 800-53": "NIST 800-53",
  "nist csf": "NIST CSF",
  "cis controls": "CIS Controls",
  "cis control": "CIS Controls",
  "soc 2": "SOC 2",
  "iso 27001": "ISO 27001",
  "pci dss": "PCI DSS",
  hipaa: "HIPAA",
  slsa: "SLSA",
  "disa stig": "DISA STIG",
};

/**
 * Parse `### N.N Title` sections out of a guide body.
 *
 * Guides carry citations in two upstream styles - bold key/value lines
 * (`**NIST 800-53:** IA-2(1)`) and a `| Framework | Control |` table. Both appear,
 * sometimes in the same repo, so handle each.
 */
function parseGuideSections(markdown) {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  const headingRe = /^### (\d+\.\d+)\s+(.+?)\s*$/gm;
  const sections = [];
  const matches = [...body.matchAll(headingRe)];

  for (let i = 0; i < matches.length; i += 1) {
    const [, section, title] = matches[i];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    const chunk = body.slice(start, end);

    const compliance = [];
    const seen = new Set();
    const addCitation = (rawFramework, rawCitations) => {
      const framework = GUIDE_FRAMEWORKS[rawFramework.trim().toLowerCase()];
      if (!framework) return;
      for (const citation of rawCitations.split(",")) {
        const trimmed = citation.trim().replace(/\*+/g, "");
        // Drop parenthetical glosses such as "AC-6 (Least Privilege)".
        const value = trimmed.replace(/\s*\([^)]*[a-z]{3}[^)]*\)\s*$/i, "").trim();
        if (!value || value.length > 40) continue;
        const key = `${framework}|${value}`;
        if (seen.has(key)) continue;
        seen.add(key);
        compliance.push({ framework, citation: value });
      }
    };

    for (const line of chunk.matchAll(/^\*\*([A-Za-z0-9 .&-]+):\*\*\s*(.+)$/gm)) {
      addCitation(line[1], line[2]);
    }
    // Only read tables that declare a Framework/Control header; guides also use
    // tables for changelogs and settings matrices. Capture the contiguous run of
    // pipe rows after the header.
    for (const table of chunk.matchAll(
      /^\|[ \t]*Framework[ \t]*\|[ \t]*Controls?[ \t]*\|[^\n]*\n((?:\|[^\n]*\n?)*)/gim,
    )) {
      for (const row of table[1].matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm)) {
        if (/^[-: ]+$/.test(row[1])) continue;
        addCitation(row[1], row[2]);
      }
    }

    const profileMatch = chunk.match(/\*\*Profile Level:\*\*\s*L(\d)/i);
    const whyMatch = chunk.match(/\*\*Why This Matters:\*\*\s*([\s\S]*?)(?=\n\s*\n|\n\*\*)/);
    const attackMatch = chunk.match(/\*\*Attack Prevented:\*\*\s*([\s\S]*?)(?=\n\s*\n|\n\*\*)/);

    sections.push({
      section: normalizeSection(section),
      title: title.replace(/\s*\{[^}]*\}\s*$/, "").trim(),
      profileLevel: profileMatch ? Number(profileMatch[1]) : 1,
      description: (whyMatch?.[1] || attackMatch?.[1] || "").replace(/\s+/g, " ").trim(),
      compliance,
    });
  }
  return sections;
}

/**
 * Normalize a section number to the guide's own form: upstream pack filenames
 * zero-pad past nine ("2.09") while control YAML and guide headings do not ("2.9").
 */
function normalizeSection(section) {
  return String(section)
    .split(".")
    .map((part) => String(Number(part)))
    .join(".");
}

/** Flatten the control YAML `compliance:` map into one list of framework citations. */
function flattenCompliance(compliance) {
  if (!compliance || typeof compliance !== "object") return [];
  const FRAMEWORK_LABELS = {
    soc2: "SOC 2",
    nist_800_53: "NIST 800-53",
    iso_27001: "ISO 27001",
    pci_dss: "PCI DSS",
    hipaa: "HIPAA",
    cis: "CIS Controls",
    cis_controls: "CIS Controls",
    slsa: "SLSA",
    disa_stig: "DISA STIG",
    nist_csf: "NIST CSF",
  };
  const out = [];
  for (const [key, value] of Object.entries(compliance)) {
    const citations = Array.isArray(value) ? value : [value];
    for (const citation of citations) {
      if (citation == null) continue;
      out.push({ framework: FRAMEWORK_LABELS[key] || key, citation: String(citation) });
    }
  }
  return out;
}

/**
 * Turn the control YAML `audit:` list into evidence-check shapes the app can render
 * next to its own evidence blueprints.
 */
function extractAuditChecks(audit) {
  if (!Array.isArray(audit)) return [];
  return audit.map((check, index) => {
    const api = check?.api || {};
    const endpoint = [api.method, api.endpoint].filter(Boolean).join(" ");
    return {
      id: String(check?.id || `check-${index + 1}`),
      description: String(check?.description || ""),
      // `check` is the upstream jq-style assertion; it reads as the query logic.
      query: String(api.check || check?.cli || check?.query || ""),
      endpoint,
      expected: check?.expected === undefined ? "" : String(check.expected),
    };
  });
}

/** Summarize `remediate:` into the shape the remediation panel renders. */
function extractRemediation(remediate) {
  if (!remediate || typeof remediate !== "object") return [];
  const out = [];
  if (Array.isArray(remediate.api)) {
    for (const step of remediate.api) {
      out.push({
        kind: "api",
        description: String(step?.description || "API remediation"),
        detail: [step?.method, step?.endpoint].filter(Boolean).join(" "),
      });
    }
  }
  const tfResources = remediate.terraform?.resources;
  if (Array.isArray(tfResources)) {
    for (const resource of tfResources) {
      out.push({
        kind: "terraform",
        description: `${resource?.type || "resource"}.${resource?.name || "this"}`,
        detail: Object.keys(resource?.config || {}).join(", "),
      });
    }
  }
  for (const kind of ["cli", "console"]) {
    const steps = remediate[kind];
    if (!Array.isArray(steps)) continue;
    for (const step of steps) {
      out.push({
        kind,
        description: String(step?.description || `${kind} remediation`),
        detail: String(step?.command || step?.step || ""),
      });
    }
  }
  return out;
}

async function main() {
  console.log(`Syncing ${REPO} @ ${REF.slice(0, 7)}`);

  const tree = await gh(`repos/${REPO}/git/trees/${REF}?recursive=1`);
  const blobs = tree.tree.filter((node) => node.type === "blob");

  const controlFiles = blobs
    .map((node) => node.path)
    .filter((p) => /^packs\/[^/]+\/controls\/.+\.ya?ml$/.test(p));
  const guideFiles = blobs
    .map((node) => node.path)
    .filter((p) => /^docs\/_guides\/[^/]+\.md$/.test(p));

  console.log(`  ${controlFiles.length} control definitions, ${guideFiles.length} guides`);

  // Artifact inventory keyed by "<vendor>|<section>" from pack filenames such as
  // packs/github/terraform/hth-github-1.01-enforce-2fa-for-org-members.tf
  const artifactIndex = new Map();
  for (const node of blobs) {
    const match = node.path.match(/^packs\/([^/]+)\/([^/]+)\/(?:.*\/)?hth-[^/]*?-(\d+\.\d+)-[^/]*$/);
    if (!match) continue;
    const [, vendor, kind, section] = match;
    if (!ARTIFACT_KINDS.includes(kind)) continue;
    const key = `${vendor}|${normalizeSection(section)}`;
    if (!artifactIndex.has(key)) artifactIndex.set(key, new Set());
    artifactIndex.get(key).add(kind);
  }

  // Guide front matter + parsed sections, keyed by slug.
  const guides = new Map();
  for (const filePath of guideFiles) {
    const slug = path.basename(filePath, ".md");
    const markdown = await raw(filePath);
    const front = parseFrontMatter(markdown);
    guides.set(slug, {
      slug,
      vendor: String(front.vendor || slug),
      title: String(front.title || `${slug} Hardening Guide`),
      category: String(front.category || "Uncategorized"),
      tier: String(front.tier || ""),
      description: String(front.description || ""),
      version: String(front.version || ""),
      maturity: String(front.maturity || ""),
      lastUpdated: String(front.last_updated || ""),
      url: `https://howtoharden.com/guides/${slug}/`,
      sections: parseGuideSections(markdown),
      controls: [],
    });
  }

  // Control definitions joined onto their guide.
  let controlCount = 0;
  for (const filePath of controlFiles) {
    let doc;
    try {
      doc = yaml.load(await raw(filePath));
    } catch (error) {
      console.warn(`  ! skipped ${filePath}: ${error.message}`);
      continue;
    }
    if (!doc || typeof doc !== "object") continue;

    const vendorSlug = String(doc.vendor || filePath.split("/")[1]);
    const section = normalizeSection(doc.section || "0");
    const guide = guides.get(vendorSlug);
    if (!guide) {
      console.warn(`  ! ${filePath} references unknown guide "${vendorSlug}"`);
      continue;
    }

    guide.controls.push({
      id: String(doc.id || `${vendorSlug}-${section}`),
      vendorSlug,
      section,
      title: String(doc.title || ""),
      description: String(doc.description || "").trim(),
      profileLevel: Number(doc.profile_level) || 1,
      severity: String(doc.severity || ""),
      guideUrl: String(doc.guide_url || guide.url),
      tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
      compliance: flattenCompliance(doc.compliance),
      auditChecks: extractAuditChecks(doc.audit),
      remediation: extractRemediation(doc.remediate),
      artifacts: [...(artifactIndex.get(`${vendorSlug}|${section}`) || [])].sort(),
      // "pack" carries machine-readable audit + remediation; "guide" is
      // heading-level only. The UI labels the difference rather than implying parity.
      depth: "pack",
    });
    controlCount += 1;
  }

  // Fill in the platforms upstream has not yet given a control pack. Their guide
  // headings still yield a section, profile level, and framework citations.
  let guideDerivedCount = 0;
  for (const guide of guides.values()) {
    const covered = new Set(guide.controls.map((control) => control.section));
    for (const section of guide.sections) {
      if (covered.has(section.section)) continue;
      const artifacts = [...(artifactIndex.get(`${guide.slug}|${section.section}`) || [])].sort();
      // Skip prose-only sections with nothing to anchor on.
      if (!section.compliance.length && !artifacts.length) continue;
      guide.controls.push({
        id: `${guide.slug}-${section.section}`,
        vendorSlug: guide.slug,
        section: section.section,
        title: section.title,
        description: section.description,
        profileLevel: section.profileLevel,
        severity: "",
        guideUrl: `${guide.url}#${section.section.replace(".", "")}-${section.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}`,
        tags: [],
        compliance: section.compliance,
        auditChecks: [],
        remediation: [],
        artifacts,
        depth: "guide",
      });
      guideDerivedCount += 1;
    }
  }

  // Keep only guides with at least one anchored control; the rest are prose-only
  // upstream and have nothing for the app to render.
  const populated = [...guides.values()]
    .filter((guide) => guide.controls.length > 0)
    .map(({ sections, ...guide }) => ({
      ...guide,
      controls: guide.controls.sort(
        (a, b) =>
          Number(a.section.split(".")[0]) - Number(b.section.split(".")[0]) ||
          Number(a.section.split(".")[1]) - Number(b.section.split(".")[1]),
      ),
    }))
    .sort((a, b) => a.vendor.localeCompare(b.vendor));

  const payload = {
    source: {
      repo: REPO,
      ref: REF,
      license: "MIT",
      url: `https://github.com/${REPO}`,
      site: "https://howtoharden.com",
    },
    guideCount: populated.length,
    controlCount: controlCount + guideDerivedCount,
    packControlCount: controlCount,
    guides: populated,
  };

  const banner = `// GENERATED FILE - do not edit by hand.
// Source: https://github.com/${REPO} @ ${REF} (MIT)
// Regenerate with: npm run sync:hardening
`;
  writeFileSync(
    OUT_FILE,
    `${banner}import type { HardeningLibrary } from "./types";\n\nexport const hardeningLibrary: HardeningLibrary = ${JSON.stringify(
      payload,
      null,
      2,
    )};\n`,
    "utf8",
  );

  console.log(`  wrote ${path.relative(ROOT, OUT_FILE)}`);
  console.log(
    `  ${populated.length} platforms, ${controlCount + guideDerivedCount} controls ` +
      `(${controlCount} from control packs, ${guideDerivedCount} from guide sections)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
