import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
  Github,
  Landmark,
  Linkedin,
  Mail,
} from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./portfolio.css";

const links = {
  email: "HireSusanShepard@pm.me",
  mailto: "mailto:HireSusanShepard@pm.me",
  github: "https://github.com/xnasusx",
  linkedin: "https://www.linkedin.com/in/xnasusx/",
  grcEngineeringClub: "https://grcengclub.com/chapters/boston#join",
  medium: "https://medium.com/@xnasusx",
  product: "https://xnasusx.github.io/u-dont-grc-me/",
  resumePdf: `${import.meta.env.BASE_URL}susan-shepard-resume.pdf`,
  resumeJson: `${import.meta.env.BASE_URL}susan-shepard-resume.json`,
  resumeMarkdown: `${import.meta.env.BASE_URL}susan-shepard-resume.md`,
};

const focusAreas = [
  "FAIR cyber risk quantification",
  "Compliance-as-code",
  "AI-assisted GRC engineering",
  "SEC cyber incident materiality",
  "Multi-framework control mapping",
];

const objectives = [
  {
    number: "01",
    verb: "Quantify",
    route: "quantify",
    body:
      "Turn cyber risk from a heat-map color into a defensible loss-exposure range. FAIR-based scenarios, LLM-assisted scoring, and P50 / P90 narratives that let leadership decide instead of react.",
    tags: ["FAIR", "Monte Carlo", "LLM scoring", "Executive narrative"],
    cta: "See the FAIR + LLM build",
  },
  {
    number: "02",
    verb: "Engineer",
    route: "engineer",
    body:
      "Make controls, evidence, and frameworks one operating system — not five parallel spreadsheets. OSCAL-shaped data, compliance-as-code checks, and evidence pipelines that arrive with the work.",
    tags: ["OSCAL", "Compliance-as-code", "Evidence automation", "Control platform"],
    cta: "See the compliance-as-code build",
  },
  {
    number: "03",
    verb: "Translate",
    route: "translate",
    body:
      "Move technical exposure into materiality decisions leaders can defend. OWASP + EO-14028 severity, SEC 8-K disclosure workflows, and calculators that keep the reasoning legible after the incident.",
    tags: ["SEC 8-K", "EO-14028", "Materiality", "Incident severity"],
    cta: "See the SEC materiality program",
  },
];

const principles = [
  {
    title: "Risk should be a number, not a color.",
    body: "Heat maps are where decisions go to die. FAIR belongs in the operating model — with ranges, appetite, and loss exposure a board can actually act on.",
  },
  {
    title: "If a human chases the same evidence every cycle, the system is underbuilt.",
    body: "Assurance should be a byproduct of the work — not a second job that eats a quarter every audit season.",
  },
  {
    title: "Controls need architecture, not paperwork.",
    body: "Frameworks scale when controls, evidence, risk, owners, and policies are modeled as one system instead of five parallel spreadsheets.",
  },
  {
    title: "AI should sharpen judgment, not launder it.",
    body: "I use LLMs where they measurably speed scoring, mapping, and evidence review — and keep the decision itself legible, reviewable, and human-owned.",
  },
];

const experience = [
  {
    period: "Sep 2021 — present",
    company: "Rapid7",
    companyUrl: "https://www.linkedin.com/company/rapid7/",
    location: "Boston, MA",
    roles: [
      { title: "Staff Trust, Risk, and Compliance Analyst", period: "Feb 2026 — present" },
      { title: "Lead Security Risk Analyst", period: "Feb 2023 — Feb 2026" },
      { title: "Lead Security Compliance Analyst", period: "Sep 2021 — Feb 2023" },
    ],
    body:
      "Owning the Integrated IS Risk Management framework end-to-end: quantitative risk, third-party risk, and customer risk assessment as one operating model with board-level visibility.",
    highlights: [
      "Architected the first Integrated IS Risk Management (ISIRM) framework, consolidating three siloed functions into one governance model.",
      "Designed a FAIR-based quantification model and embedded it in an LLM application — one of the earliest production AI + GRC integrations in the org.",
      "Built the Incident Severity Calculator (OWASP + EO-14028 materiality) and led the SEC Cyber Incident Disclosure program.",
      "Built and administered the OneTrust GRC platform from scratch — risk register, intake, control library — and engineered API integrations with Jira and ICON to automate remediation.",
      "Created the Findings Management Calculator to standardize risk ratings and cut triage time by 40%.",
      "Founded the annual Security Risk Assessment: an executive review that established an ongoing board-visibility cadence.",
      "Redesigned Customer Risk Assessment; response SLAs went from weeks to days.",
      "Directed SOC 2 and FedRAMP audit readiness — 100% evidence submission, zero findings.",
    ],
    tags: ["FAIR", "SEC materiality", "LLM integration", "OneTrust", "Jira API", "SOC 2", "FedRAMP"],
  },
  {
    period: "Mar 2020 — Sep 2021",
    company: "Seven Bridges",
    companyUrl: "https://www.linkedin.com/company/seven-bridges/",
    location: "Boston, MA",
    roles: [
      { title: "Senior Risk and Compliance Analyst", period: "Mar 2020 — Sep 2021" },
    ],
    body:
      "Managed 650+ vendors and executed audits for HIPAA, ISO, NIST, SOC, and FedRAMP compliance. Negotiated security and privacy contracts that directly enabled $1.5M+ in quarterly bookings.",
    tags: ["Vendor risk", "HIPAA", "FedRAMP", "Contract review"],
  },
  {
    period: "Nov 2017 — Mar 2020",
    company: "Acquia",
    companyUrl: "https://www.linkedin.com/company/acquia/",
    location: "Boston, MA",
    roles: [
      { title: "Senior Information Security Analyst", period: "Nov 2019 — Mar 2020" },
      { title: "Senior Risk and Controls Analyst, Information Security", period: "Aug 2018 — Mar 2019" },
      { title: "Risk and Controls Analyst, Information Security", period: "Nov 2017 — Aug 2018" },
    ],
    body:
      "Designed and implemented a global GDPR compliance program (policies, vendor due diligence, lawful processing, breach response, training). Managed 900+ vendors with audits against HIPAA, ISO, NIST, SOC, and FedRAMP standards.",
    tags: ["GDPR", "HIPAA", "ISO", "NIST", "SOC", "FedRAMP"],
  },
  {
    period: "Jan 2017 — Nov 2017",
    company: "Nuance Communications",
    companyUrl: "https://www.linkedin.com/company/nuance-communications/",
    location: "Burlington, MA",
    roles: [
      { title: "Healthcare IT GRC Analyst, Information Security", period: "Jan 2017 — Nov 2017" },
    ],
    body:
      "Built formal security and privacy GRC program for healthcare division, aligned to HIPAA, HITRUST, ISO, NIST, SOC, and FedRAMP. Reviewed security and privacy contracts, enabling $1.2M+ in quarterly compliant revenue.",
    tags: ["HIPAA", "HITRUST", "Healthcare"],
  },
  {
    period: "May 2016 — Jan 2017",
    company: "iRobot",
    companyUrl: "https://www.linkedin.com/company/irobot/",
    location: "Bedford, MA",
    roles: [
      { title: "Program Coordinator - Information Security, Intern", period: "May 2016 — Jan 2017" },
    ],
    body:
      "Managed the information security program through PMO.",
    tags: ["PMO", "Program coordination"],
  },
  {
    period: "Nov 2015 — May 2016",
    company: "Veritas (formerly Symantec)",
    companyUrl: "https://www.linkedin.com/company/veritas-technologies-llc/",
    location: "Massachusetts",
    roles: [
      { title: "Backup and Recovery Testing Engineer, Intern", period: "Nov 2015 — May 2016" },
    ],
    body:
      "UAT testing on new hardware against Backup and Backup Exec software.",
    tags: ["UAT", "Backup Exec"],
  },
];

const writing = [
  {
    title: "GRC Engineering Club — Boston Chapter",
    body: "President of the Boston chapter. Growing the local practice around systems, automation, and modern controls work — meetups, mentorship, and community writing.",
    href: links.grcEngineeringClub,
    cta: "Visit chapter",
  },
  {
    title: "Writing on Medium",
    body: "Essays on cyber risk quantification, AI in GRC, and where technical judgment belongs in compliance work.",
    href: links.medium,
    cta: "Read the essays",
  },
  {
    title: "ISC2 technical guidance",
    body: "Co-author on ISC2 technical guidance work and AAISM beta tester / item writer for ISACA — translating security complexity into usable practice.",
  },
];

const whatsNext = [
  "CISSP (in progress) to close the last formal credential loop.",
  "Publishing the FAIR + LLM scoring pattern as a public reference build.",
  "Prototyping agentic evidence collection tied to the u dont GRC me control model.",
];

const skillGroups = [
  {
    title: "Risk & quantification",
    items: ["FAIR", "Monte Carlo simulation", "CVSS", "OWASP scoring", "EO-14028 materiality", "Risk appetite modeling"],
  },
  {
    title: "Frameworks",
    items: ["SOC 2", "FedRAMP", "ISO 27001", "NIST CSF / 800-53", "HIPAA", "HITRUST", "GDPR"],
  },
  {
    title: "AI & automation",
    items: ["LLM-assisted risk scoring", "Prompt engineering", "Agentic workflow design", "RAG-based GRC tooling"],
  },
  {
    title: "Platforms & code",
    items: ["OneTrust", "Archer", "ServiceNow GRC", "AuditBoard", "Python", "SQL", "Jira API"],
  },
];

const credentials = [
  { label: "CISM", detail: "ISACA · Certified Information Security Manager" },
  { label: "CRISC", detail: "ISACA · Risk & Information Systems Control" },
  { label: "AAISM", detail: "ISACA · Advanced in AI Security Management" },
  { label: "AAIR", detail: "ISACA · Advanced in AI Risk" },
  { label: "ISC2 CC", detail: "Certified in Cybersecurity" },
  { label: "AWS CCP", detail: "Cloud Practitioner (CLF-C02)" },
  { label: "CISSP", detail: "In progress" },
];

const education = [
  "M.S. Computer Information Systems, Security concentration — Boston University",
  "B.S. Information Technology, magna cum laude — UMass Lowell",
];

const contactLinks = [
  { label: "Email", meta: links.email, href: links.mailto, icon: Mail },
  { label: "LinkedIn", meta: "linkedin.com/in/xnasusx", href: links.linkedin, icon: Linkedin },
  { label: "GitHub", meta: "github.com/xnasusx", href: links.github, icon: Github },
  { label: "Medium", meta: "medium.com/@xnasusx", href: links.medium, icon: BookOpen },
  { label: "GRC Engineering Club", meta: "Boston chapter", href: links.grcEngineeringClub, icon: Landmark },
  { label: "u dont GRC me", meta: "Live prototype", href: links.product, icon: ArrowUpRight },
];

const resumeFormats = [
  { label: "PDF", href: links.resumePdf },
  { label: "Markdown", href: links.resumeMarkdown },
  { label: "JSON", href: links.resumeJson },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Susan Shepard",
  email: links.email,
  url: "https://xnasusx.github.io/portfolio/",
  sameAs: [links.linkedin, links.github, links.medium],
  jobTitle: "Staff Trust, Risk, and Compliance Analyst",
  worksFor: { "@type": "Organization", name: "Rapid7" },
  knowsAbout: [
    "FAIR cyber risk quantification",
    "GRC engineering",
    "Compliance-as-code",
    "AI-driven security automation",
    "SEC cyber incident materiality",
    "SOC 2",
    "FedRAMP",
    "ISO 27001",
    "NIST 800-53",
    "HITRUST",
    "GDPR",
  ],
};

/* -------------------- Hash routing -------------------- */

const CASE_ROUTES = new Set(objectives.map((o) => o.route));

function useHashRoute() {
  const [route, setRoute] = React.useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash.replace(/^#\/?/, "") : "",
  );
  React.useEffect(() => {
    const handler = () => setRoute(window.location.hash.replace(/^#\/?/, ""));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return route;
}

/* -------------------- FAIR mini calculator -------------------- */

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const scenarios = [
  {
    id: "phishing",
    label: "Credential phishing → BEC",
    freqLow: 2,
    freqHigh: 6,
    magLow: 40_000,
    magHigh: 250_000,
    heatmap: "Medium",
  },
  {
    id: "ransomware",
    label: "Ransomware on production",
    freqLow: 0.05,
    freqHigh: 0.4,
    magLow: 500_000,
    magHigh: 6_000_000,
    heatmap: "High",
  },
  {
    id: "third-party",
    label: "Third-party data breach",
    freqLow: 0.1,
    freqHigh: 0.6,
    magLow: 250_000,
    magHigh: 3_500_000,
    heatmap: "High",
  },
];

type ScenarioState = {
  freqLow: number;
  freqHigh: number;
  magLow: number;
  magHigh: number;
  heatmap: string;
};

function FairMiniCalculator() {
  const [scenarioId, setScenarioId] = React.useState(scenarios[0].id);
  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const [state, setState] = React.useState<ScenarioState>(() => ({ ...scenario }));

  React.useEffect(() => {
    const s = scenarios.find((x) => x.id === scenarioId)!;
    setState({ ...s });
  }, [scenarioId]);

  const aleLow = state.freqLow * state.magLow;
  const aleHigh = state.freqHigh * state.magHigh;
  const alePoint = (aleLow + aleHigh) / 2;

  const update = (key: keyof ScenarioState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setState((prev) => ({ ...prev, [key]: raw === "" ? 0 : Number(raw) }));
  };

  return (
    <div className="fair-calc">
      <div className="fair-calc-header">
        <div>
          <p className="section-label">Try it</p>
          <h3>Same risk, two answers.</h3>
          <p className="fair-calc-lede">
            Pick a scenario. The left side is what a heat map tells your CFO. The right side is what FAIR
            tells them. Adjust the inputs and watch which number moves.
          </p>
        </div>
        <label className="fair-scenario-select" htmlFor="fair-scenario">
          <span>Scenario</span>
          <select
            id="fair-scenario"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          >
            {scenarios.map((s) => (
              <option value={s.id} key={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="fair-calc-body">
        <div className="fair-inputs">
          <fieldset>
            <legend>Loss event frequency (per year)</legend>
            <label>
              <span>Low estimate</span>
              <input
                type="number"
                min={0}
                step={0.05}
                value={state.freqLow}
                onChange={update("freqLow")}
              />
            </label>
            <label>
              <span>High estimate</span>
              <input
                type="number"
                min={0}
                step={0.05}
                value={state.freqHigh}
                onChange={update("freqHigh")}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Loss magnitude per event (USD)</legend>
            <label>
              <span>Low estimate</span>
              <input
                type="number"
                min={0}
                step={5000}
                value={state.magLow}
                onChange={update("magLow")}
              />
            </label>
            <label>
              <span>High estimate</span>
              <input
                type="number"
                min={0}
                step={5000}
                value={state.magHigh}
                onChange={update("magHigh")}
              />
            </label>
          </fieldset>
        </div>

        <div className="fair-outputs">
          <div className="fair-output heatmap">
            <span className="fair-output-label">Heat-map answer</span>
            <strong>{state.heatmap}</strong>
            <p>A color that can't be defended, budgeted against, or compared to any other risk.</p>
          </div>
          <div className="fair-output fair">
            <span className="fair-output-label">FAIR annualized loss</span>
            <strong>
              {CURRENCY.format(aleLow)}
              <span className="fair-dash"> — </span>
              {CURRENCY.format(aleHigh)}
            </strong>
            <p>
              Point estimate <em>{CURRENCY.format(alePoint)}</em>. A range leadership can size a control
              investment against.
            </p>
          </div>
        </div>
      </div>
      <p className="fair-footnote">
        Illustrative math for demonstration. A production FAIR analysis models each variable as a
        distribution and runs a Monte Carlo simulation to produce P10 / P50 / P90 exposure curves.
      </p>
    </div>
  );
}

/* -------------------- Case study shell + pages -------------------- */

type CaseSection =
  | { kind: "prose"; heading: string; body: string | string[] }
  | { kind: "metrics"; heading: string; items: { value: string; label: string }[] }
  | { kind: "list"; heading: string; body?: string; items: string[] }
  | { kind: "table"; heading: string; columns: string[]; rows: string[][] }
  | { kind: "note"; heading: string; body: string };

type CaseStudy = {
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
  sections: CaseSection[];
};

const caseStudies: Record<string, CaseStudy> = {
  quantify: {
    eyebrow: "Objective 01 · Quantify",
    title: "FAIR + LLM risk quantification",
    tagline: "Turning a heat map into a defensible dollar range.",
    intro:
      "Executives could tell you which risks were red. They couldn't tell you which was more expensive, which control investment was cheaper than the loss it prevented, or which residual risk fit inside appetite. Heat maps hide those questions. FAIR answers them — if the analysis can keep up with the volume of scenarios a modern security team faces. This build pairs the OpenFAIR method with LLM-assisted scenario intake so the ontology stays consistent and the math stays honest.",
    sections: [
      {
        kind: "metrics",
        heading: "Business & risk impact",
        items: [
          { value: "6→1", label: "risk registers consolidated into one FAIR-scored view" },
          { value: "P10/P50/P90", label: "loss ranges published for every material scenario" },
          { value: "40%", label: "reduction in triage time using a standardized rating rubric" },
        ],
      },
      {
        kind: "prose",
        heading: "What I built",
        body: [
          "A FAIR-based quantification model covering loss event frequency, threat event frequency, vulnerability, and the four loss magnitude forms (productivity, response, replacement, fines).",
          "An LLM-assisted intake layer that captures scenario descriptions in plain English, structures them against the FAIR ontology, and flags missing evidence before scoring runs. The LLM proposes; a human confirms; the model records both.",
          "A Monte Carlo layer that samples each variable as a distribution rather than a point estimate — producing P10 / P50 / P90 loss curves instead of a single number that fakes precision.",
        ],
      },
      {
        kind: "prose",
        heading: "Why FAIR + LLM instead of a heat map",
        body: [
          "Heat maps compress every dimension of risk into a color. That looks decisive and hides everything a CFO needs to allocate capital: what does the loss actually cost, how often does it happen, and which control changes those numbers.",
          "FAIR gives you a defensible number in dollars. The LLM layer solves the other half of the problem: FAIR is slow. Scenario intake, decomposition, and evidence gathering are the tax that keeps most programs stuck on 3–5 scenarios a year. LLMs move that tax off the analyst — as long as the analyst still owns the decision.",
        ],
      },
      {
        kind: "table",
        heading: "Ontology → decision surface",
        columns: ["FAIR variable", "Where it comes from", "What it lets leaders decide"],
        rows: [
          [
            "Loss event frequency",
            "Threat intel + control failure rate",
            "Whether to prevent, detect, or accept",
          ],
          [
            "Primary loss magnitude",
            "Productivity, response, replacement modeling",
            "Whether the incident is even worth escalating",
          ],
          [
            "Secondary loss magnitude",
            "Fines, notification costs, brand exposure",
            "Whether the risk is 8-K-material under SEC rules",
          ],
          [
            "Vulnerability",
            "Control coverage across NIST 800-53 / ISO 27001",
            "Which control gaps are actually reducing loss exposure",
          ],
        ],
      },
      {
        kind: "list",
        heading: "Boundaries I want you to know",
        body: "Everything on this page describes approach and public-facing design decisions.",
        items: [
          "No proprietary employer data, dashboards, or scenario libraries are reproduced here.",
          "FAIR distributions shown in the mini-calculator on the home page are illustrative, not sampled from real Monte Carlo runs.",
          "LLM prompts, scoring rubrics, and human-in-the-loop review criteria stay inside my employer's environment.",
        ],
      },
    ],
  },
  engineer: {
    eyebrow: "Objective 02 · Engineer",
    title: "GRC engineering & compliance-as-code",
    tagline: "Controls, evidence, and frameworks as one operating system.",
    intro:
      "Most GRC programs run on parallel spreadsheets: one for the framework crosswalks, one for controls, one for evidence, one for owners, one for policies. Every audit is a merge conflict a human resolves by hand. This is what happens when compliance isn't modeled as data. GRC engineering treats controls the way software engineering treats infrastructure: as code, in version control, with tests. u dont GRC me is my public reference build for that idea.",
    sections: [
      {
        kind: "metrics",
        heading: "Business & risk impact",
        items: [
          { value: "15+", label: "frameworks crosswalked from a single control-first data model" },
          { value: "0", label: "shared-drive spreadsheets in the control-to-evidence path" },
          { value: "1", label: "control change propagates to every mapped framework automatically" },
        ],
      },
      {
        kind: "prose",
        heading: "What I built",
        body: [
          "A control-first data model — OSCAL-shaped — where the control is the primary entity and frameworks are views over it. NIST 800-53, ISO 27001, SOC 2 CC series, PCI DSS, HIPAA, HITRUST, and FedRAMP all resolve against the same source of truth.",
          "Compliance-as-code checks that turn a written control statement into a machine-readable expectation. Evidence flows in from pipelines, scanners, and ticketing systems and is tagged against the control it satisfies — not against a control ID that no one can find in a wiki.",
          "An audit workspace that assembles evidence per control per period, on demand, without a human copy-pasting screenshots. When a control statement changes, the workspace shows exactly which evidence needs to be re-run.",
        ],
      },
      {
        kind: "prose",
        heading: "Why control-first, not framework-first",
        body: [
          "Framework-first designs make every new framework a rewrite. Control-first designs treat frameworks as reports over a normalized graph — add ISO 27002:2022 as a mapping, not a migration.",
          "This is where compliance-as-code actually pays off. Once the control is the atom, you can test it, version it, and diff it. You can ask: which controls changed this quarter, which evidence broke, which owners inherited work they don't know about yet. None of those questions are answerable from a spreadsheet.",
        ],
      },
      {
        kind: "list",
        heading: "Stack",
        items: [
          "React + TypeScript on the front end.",
          "Node.js / Express API layer.",
          "PostgreSQL with a control-first schema; frameworks live in mapping tables, not their own tables.",
          "OSCAL as the interchange format for control statements, parameters, and assessment plans.",
          "Optional LLM Evidence Scout for freshness / relevance / sufficiency scoring across distributed evidence sources.",
        ],
      },
      {
        kind: "note",
        heading: "See the working build",
        body:
          "u dont GRC me is live at xnasusx.github.io/u-dont-grc-me/. The prototype is deliberately opinionated: control-first, evidence-attached, framework-agnostic. Break it, argue with it, or fork it.",
      },
    ],
  },
  translate: {
    eyebrow: "Objective 03 · Translate",
    title: "SEC cyber incident materiality program",
    tagline: "From severity color to 8-K-defensible decision.",
    intro:
      "Since December 2023, public companies have four business days to disclose a material cyber incident on Form 8-K. That clock starts when the incident is determined to be material — not when it happens. Which means the highest-stakes decision in a modern security program is a legal one: is this thing material. Most programs answer that decision the same way they used to score severity: with a color. Colors don't hold up under SEC scrutiny. This is the classifier and workflow I built so they don't have to.",
    sections: [
      {
        kind: "metrics",
        heading: "Business & risk impact",
        items: [
          { value: "1", label: "Incident Severity Calculator, replacing three parallel scoring habits" },
          { value: "4 days", label: "SEC disclosure clock — measured from a defensible materiality trigger" },
          { value: "OWASP + EO-14028", label: "grounded in existing severity and materiality references, not invented from scratch" },
        ],
      },
      {
        kind: "prose",
        heading: "What I built",
        body: [
          "An Incident Severity Calculator that combines OWASP risk rating with the materiality factors that appear in Executive Order 14028 legal guidance. Severity and materiality are scored separately and recorded separately, because they answer different questions.",
          "A disclosure workflow that routes borderline decisions to counsel with the reasoning attached, not just a score. The record of decision includes the inputs, the calculator output, the human override (if any), and the timestamp — so the file survives the audit trail SEC enforcement staff will look for.",
          "Training and enablement so the incident commander, not the risk analyst, drives the classification during the first hour of an event. Materiality is not a post-hoc analytics exercise.",
        ],
      },
      {
        kind: "prose",
        heading: "Why separate severity from materiality",
        body: [
          "A P1 outage can be immaterial. A quiet data exfiltration can be material. Conflating the two into one score is how programs miss disclosure timelines — the severity score stays green because operations are fine, and the materiality question never gets asked.",
          "Two scores force two conversations. Ops answers severity. Legal answers materiality. Both go on the record. That's the shape SEC final rules and their enforcement posture reward.",
        ],
      },
      {
        kind: "table",
        heading: "Inputs vs decisions",
        columns: ["Input", "Answers", "Owned by"],
        rows: [
          ["OWASP likelihood + impact", "Operational severity", "Incident commander"],
          ["Confidentiality / integrity / availability loss magnitude", "Primary loss exposure", "Risk analyst"],
          ["Regulated data classes touched", "Notification triggers", "Privacy / counsel"],
          ["Reasonable-investor test factors", "SEC materiality", "Counsel + CISO"],
        ],
      },
      {
        kind: "list",
        heading: "Boundaries I want you to know",
        items: [
          "No proprietary employer disclosure records, thresholds, or counsel guidance are reproduced here.",
          "The calculator's exact weightings and scoring bands stay inside my employer's environment.",
          "This page describes design intent and the frameworks I anchored to. Use it as a reference for building your own — not as a drop-in tool.",
        ],
      },
    ],
  },
};

function CaseStudyView({ study }: { study: CaseStudy }) {
  return (
    <main className="portfolio-shell case-shell">
      <header className="site-header case-header" aria-label="Case study">
        <a className="brand-link" href="#/">
          <span className="brand-mark">SS</span>
          <span>Susan Shepard</span>
        </a>
        <a className="case-back" href="#/">
          <ArrowLeft size={16} /> Back to portfolio
        </a>
      </header>

      <article className="case-article">
        <p className="section-label">{study.eyebrow}</p>
        <h1>{study.title}</h1>
        <p className="case-tagline">{study.tagline}</p>
        <p className="case-intro">{study.intro}</p>

        {study.sections.map((section, index) => (
          <section className="case-section" key={`${section.kind}-${index}`}>
            <h2>{section.heading}</h2>
            {renderSection(section)}
          </section>
        ))}

        <div className="case-footer">
          <a className="primary-link" href="#/">
            <ArrowLeft size={16} /> Back to portfolio
          </a>
          <a className="secondary-link" href={links.mailto}>
            Get in touch <Mail size={16} />
          </a>
        </div>
      </article>
    </main>
  );
}

function renderSection(section: CaseSection) {
  if (section.kind === "prose") {
    const paragraphs = Array.isArray(section.body) ? section.body : [section.body];
    return (
      <>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </>
    );
  }
  if (section.kind === "metrics") {
    return (
      <div className="case-metrics">
        {section.items.map((item) => (
          <div className="case-metric" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (section.kind === "list") {
    return (
      <>
        {section.body && <p>{section.body}</p>}
        <ul>
          {section.items.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </>
    );
  }
  if (section.kind === "table") {
    return (
      <div className="case-table-wrap">
        <table className="case-table">
          <thead>
            <tr>
              {section.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (section.kind === "note") {
    return <p className="case-note">{section.body}</p>;
  }
  return null;
}

/* -------------------- Main portfolio -------------------- */

function MainPortfolio() {
  return (
    <main className="portfolio-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className="site-header" aria-label="Primary">
        <a className="brand-link" href="#/">
          <span className="brand-mark">SS</span>
          <span>Susan Shepard</span>
        </a>
        <nav className="site-nav" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#principles">Philosophy</a>
          <a href="#bring">What I bring</a>
          <a href="#experience">Experience</a>
          <a href="#try">Try it</a>
          <a href="#credentials">Credentials</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="top" className="hero-section">
        <p className="section-label">Staff Trust, Risk & Compliance Analyst · Rapid7</p>
        <h1>Cyber risk, quantified into decisions leaders can defend.</h1>
        <p className="hero-intro">
          Fifteen-plus years across enterprise, healthcare, and public-company security work — now building
          FAIR-based risk quantification, compliance-as-code, and AI-assisted GRC systems that replace the
          audit spreadsheet with something a board can actually read.
        </p>
        <div className="hero-actions">
          <a className="primary-link" href={links.product}>
            View work <ArrowUpRight size={18} />
          </a>
          <a className="secondary-link" href={links.resumePdf}>
            Resume (PDF) <FileText size={18} />
          </a>
        </div>
        <ul className="hero-focus" aria-label="Focus areas">
          {focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </section>

      <section id="about" className="content-section">
        <div className="section-heading">
          <p className="section-label">About</p>
          <h2>Security is strongest when it's built into the workflow, not stapled on top of it.</h2>
        </div>
        <div className="prose-grid">
          <p>
            My work sits at the intersection of risk judgment, product thinking, and hands-on engineering.
            I build systems that quantify cyber risk in dollars, encode controls as code, and turn
            technical exposure into decisions leaders can act on.
          </p>
          <p>
            That perspective comes from a career that runs through enterprise security, healthcare and
            privacy, third-party risk, SEC materiality and disclosure, audit readiness, and now full-stack
            GRC platform design. Military veteran. Boston-based. Currently at Rapid7 as Staff Trust, Risk,
            and Compliance Analyst.
          </p>
        </div>
      </section>

      <section id="principles" className="content-section band">
        <div className="section-heading">
          <p className="section-label">Philosophy</p>
          <h2>How I think about modern GRC engineering.</h2>
        </div>
        <div className="principles-grid">
          {principles.map((principle, index) => (
            <article className="principle-card" key={principle.title}>
              <span className="principle-number">Principle 0{index + 1}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="bring" className="content-section">
        <div className="section-heading">
          <p className="section-label">What I bring to a security team</p>
          <h2>Three objectives. Three case studies. Same operating stance.</h2>
        </div>
        <div className="objectives-grid">
          {objectives.map((obj) => (
            <a className="objective-card" href={`#/${obj.route}`} key={obj.route}>
              <span className="objective-number">{obj.number}</span>
              <h3>{obj.verb}</h3>
              <p>{obj.body}</p>
              <div className="tag-row">
                {obj.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <span className="objective-cta">
                {obj.cta} <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="experience" className="content-section band">
        <div className="section-heading">
          <p className="section-label">Experience</p>
          <h2>A career built at the intersection of security, software, risk, and scale.</h2>
        </div>
        <div className="experience-list">
          {experience.map((chapter) => (
            <article className="experience-row" key={`${chapter.company}-${chapter.period}`}>
              <div className="experience-period">{chapter.period}</div>
              <div className="experience-copy">
                <h3>
                  {chapter.companyUrl ? (
                    <a href={chapter.companyUrl} target="_blank" rel="noopener noreferrer">
                      {chapter.company}
                    </a>
                  ) : (
                    chapter.company
                  )}
                </h3>
                <p className="experience-context">{chapter.location}</p>
                <ul className="experience-roles">
                  {chapter.roles.map((role) => (
                    <li key={role.title}>
                      <span className="experience-role-title">{role.title}</span>
                      <span className="experience-role-period">{role.period}</span>
                    </li>
                  ))}
                </ul>
                <p>{chapter.body}</p>
                {chapter.highlights && (
                  <ul>
                    {chapter.highlights.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
                {chapter.tags && (
                  <div className="tag-row">
                    {chapter.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="try" className="content-section">
        <div className="section-heading">
          <p className="section-label">Interactive</p>
          <h2>The pitch, in your hands.</h2>
        </div>
        <FairMiniCalculator />
      </section>

      <section id="writing" className="content-section band">
        <div className="section-heading">
          <p className="section-label">Writing & community</p>
          <h2>Shaping the conversation around modern GRC.</h2>
        </div>
        <div className="writing-grid">
          {writing.map((item) =>
            item.href ? (
              <a className="writing-card linked" href={item.href} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="writing-cta">
                  {item.cta} <ExternalLink size={14} />
                </span>
              </a>
            ) : (
              <article className="writing-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="section-label">What's next</p>
          <h2>Where the work is heading.</h2>
        </div>
        <ul className="next-list">
          {whatsNext.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="content-section band">
        <div className="section-heading">
          <p className="section-label">Skills & tooling</p>
          <h2>The technical depth behind the frameworks.</h2>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="credentials" className="content-section">
        <div className="section-heading">
          <p className="section-label">Credentials & education</p>
          <h2>Formal training and ongoing learning.</h2>
        </div>
        <div className="credentials-layout">
          <div className="credentials-column">
            <h3>Certifications</h3>
            <ul className="credentials-list">
              {credentials.map((cred) => (
                <li key={cred.label}>
                  <strong>{cred.label}</strong>
                  <span>{cred.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="credentials-column">
            <h3>Education</h3>
            <ul className="credentials-list plain">
              {education.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3>Service</h3>
            <p className="supporting-note">Military veteran.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="section-heading contact-heading">
          <p className="section-label">Contact</p>
          <h2>Let's build engineering-grade risk and compliance systems together.</h2>
        </div>

        <div className="contact-grid">
          {contactLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a className="contact-link" href={item.href} key={item.label}>
                <span className="contact-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="contact-copy">
                  <strong>{item.label}</strong>
                  <span>{item.meta}</span>
                </span>
                <ExternalLink size={16} className="contact-arrow" />
              </a>
            );
          })}
        </div>

        <p className="resume-line">
          Resume in{" "}
          {resumeFormats.map((format, index) => (
            <React.Fragment key={format.label}>
              <a href={format.href}>{format.label}</a>
              {index < resumeFormats.length - 1 ? " · " : ""}
            </React.Fragment>
          ))}
          .
        </p>
      </section>
    </main>
  );
}

/* -------------------- App root -------------------- */

function App() {
  const route = useHashRoute();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route]);
  if (CASE_ROUTES.has(route)) {
    return <CaseStudyView study={caseStudies[route]} />;
  }
  return <MainPortfolio />;
}

ReactDOM.createRoot(document.getElementById("portfolio-root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
