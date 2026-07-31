import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Dices,
  ExternalLink,
  FileText,
  Github,
  Grid3x3,
  Landmark,
  LineChart,
  Linkedin,
  Mail,
  Network,
} from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./portfolio.css";

const links = {
  email: "HireSusanShepard@pm.me",
  mailto: "mailto:HireSusanShepard@pm.me",
  github: "https://github.com/xnasusx",
  githubProduct: "https://github.com/xnasusx/u-dont-grc-me",
  linkedin: "https://www.linkedin.com/in/xnasusx/",
  grcEngineeringClub: "https://grcengclub.com/chapters/boston#join",
  medium: "https://medium.com/@xnasusx",
  product: "https://xnasusx.github.io/u-dont-grc-me/",
  riskTools: "#/risk-tools",
  calendly: "https://calendly.com/susanshepard",
  headshot: `${import.meta.env.BASE_URL}shepard-headshot.jpg`,
  headshot2x: `${import.meta.env.BASE_URL}shepard-headshot@2x.jpg`,
  resumePdf: `${import.meta.env.BASE_URL}susan-shepard-resume.pdf`,
  resumeJson: `${import.meta.env.BASE_URL}susan-shepard-resume.json`,
  resumeMarkdown: `${import.meta.env.BASE_URL}susan-shepard-resume.md`,
};

const riskQuantifier = {
  url: "https://xnasusx.github.io/risk-quantifier/",
  repo: "https://github.com/xnasusx/risk-quantifier",
  steps: [
    {
      eyebrow: "Step 1 · Place",
      title: "Place your risks",
      body: "Drop up to five risks onto a 5×5 likelihood-by-impact matrix — the same qualitative heat map most risk registers already run on.",
    },
    {
      eyebrow: "Step 2 · Parameterize",
      title: "Define the parameters",
      body: "Give each risk a frequency in events per year and an impact in dollars per event. This is where the detail the matrix flattened comes back.",
    },
    {
      eyebrow: "Step 3 · Simulate",
      title: "Run 10,000 iterations",
      body: "A Monte Carlo run turns the matrix into a loss distribution — a range you can budget against instead of a color you can only argue about.",
    },
  ],
};

const monteCarloDemo = {
  url: "https://xnasusx.github.io/monte-carlo-demo/",
  repo: "https://github.com/xnasusx/monte-carlo-demo",
  steps: [
    {
      eyebrow: "Step 1 · Flip",
      title: "Flip a fair coin",
      body: "Drag from 10 flips up to 100,000 and watch the running proportion of heads after every single flip. Ten flips land anywhere; ten thousand settle down.",
    },
    {
      eyebrow: "Step 2 · Compare",
      title: "Read the noise band",
      body: "The shaded band is where 95% of fair-coin runs fall at each flip count, from the standard error of a binomial proportion: SE = 0.5/√n. It narrows as n grows.",
    },
    {
      eyebrow: "Step 3 · Repeat",
      title: "Run it 200 more times",
      body: "The histogram reruns the whole experiment 200 times at the same flip count, so you can see where your single run landed inside the spread of possible ones.",
    },
  ],
};

const fairModelStudy = {
  url: "https://xnasusx.github.io/fair-model-study/",
  repo: "https://github.com/xnasusx/fair-model-study",
  steps: [
    {
      eyebrow: "Step 1 · Study",
      title: "Walk the tree",
      body: "The full FAIR decomposition, from Risk down to Secondary Loss Magnitude, with the unit every factor carries: dollars, probability, or frequency.",
    },
    {
      eyebrow: "Step 2 · Rebuild",
      title: "Build it from memory",
      body: "The tree comes back empty. Place all 13 components from a shuffled pool, then assign each one its unit — placement and unit accuracy are scored separately.",
    },
    {
      eyebrow: "Step 3 · Define",
      title: "Match 22 definitions",
      body: "The 13 model components, the 6 forms of loss, and the 3 Probability of Action sub-factors, in one pool. Match each name to what it actually measures.",
    },
  ],
};

const lossExceedanceCurve = {
  url: "https://xnasusx.github.io/loss-exceedance-curve/",
  repo: "https://github.com/xnasusx/loss-exceedance-curve",
  steps: [
    {
      eyebrow: "Step 1 · Estimate",
      title: "Give the risk a range",
      body: "A three-point frequency estimate and a three-point loss magnitude — minimum, most likely, maximum. The same inputs a FAIR model runs on.",
    },
    {
      eyebrow: "Step 2 · Simulate",
      title: "Run 10,000 years",
      body: "Those ranges become a histogram of annual loss: the shape of the risk, before anyone has drawn a single threshold on it.",
    },
    {
      eyebrow: "Step 3 · Read",
      title: "Plot the curve",
      body: "The same output, re-plotted as an exceedance curve. Overlay risk tolerance, loss reserves, and materiality to read the odds of crossing each one.",
    },
  ],
};

type RiskLabTool = {
  id: string;
  label: string;
  icon: typeof Grid3x3;
  /** Overrides the default "Risk lab · Interactive tool" kicker. */
  eyebrow?: string;
  title: React.ReactNode;
  blurb: string | string[];
  stepsHeading: React.ReactNode;
  tool: {
    url: string;
    repo: string;
    steps: { eyebrow: string; title: string; body: string }[];
  };
};

const riskLabTools: RiskLabTool[] = [
  {
    id: "heatmaps",
    label: "Heatmaps & Histograms",
    icon: Grid3x3,
    title: (
      <>
        Risk <em>Quantifier</em>
      </>
    ),
    blurb:
      "Place your risks on a heat map, give each one a frequency and a loss range, then run 10,000 Monte Carlo iterations and watch the matrix become a distribution. Built to show exactly how much information a qualitative risk matrix throws away.",
    stepsHeading: (
      <>
        From heat map to histogram, in <em>three</em> steps.
      </>
    ),
    tool: riskQuantifier,
  },
  {
    id: "monte-carlo",
    label: "Monte Carlo",
    icon: Dices,
    // The tool page carries this same copy as its "The Lesson" act, so it is
    // hidden there when embedded and lives here instead.
    eyebrow: "The Lesson",
    title: (
      <>
        Your First <em>Monte Carlo</em>
      </>
    ),
    blurb: [
      "Every Monte Carlo model rests on one unglamorous fact: run a random process enough times and the aggregate stops behaving randomly. That is the law of large numbers. Any single trial is still a toss-up; the average of a hundred thousand of them is a measurement. A fair coin is the smallest honest version of this — one event, one known probability, nothing else in the way.",
      "The tool below does exactly that. The line chart plots the share of heads after every flip, so you can watch one run wander and then settle. The histogram underneath runs the same experiment 200 separate times and bins where each one finished — that is the spread you would have seen on a less lucky afternoon. Move the slider from 10 flips to 100,000 and watch both of them tighten.",
    ],
    stepsHeading: (
      <>
        Why more trials means <em>less</em> noise.
      </>
    ),
    tool: monteCarloDemo,
  },
  {
    id: "fair-model",
    label: "FAIR Model Study",
    icon: Network,
    eyebrow: "The Lesson",
    title: (
      <>
        The FAIR Model, <em>from Memory</em>
      </>
    ),
    blurb: [
      "The FAIR model decomposes risk into its fundamental components. For certification you need this taxonomy cold: every factor, where it sits in the tree, and what unit it carries. Dollars ($) for financial amounts, percent (%) for probabilities, and count (#) for frequencies.",
      "Study the tree below, then switch to practice mode and rebuild it from memory — place each component, then assign its unit. The definitions quiz underneath is a separate exercise covering all 22 testable items: the 13 model components, the 6 forms of loss, and the 3 Probability of Action sub-factors.",
    ],
    stepsHeading: (
      <>
        From study mode to <em>memory</em>, in three steps.
      </>
    ),
    tool: fairModelStudy,
  },
  {
    id: "loss-exceedance",
    label: "Loss Exceedance Curve",
    icon: LineChart,
    eyebrow: "The Lesson",
    title: (
      <>
        How to Read a <em>Loss Exceedance Curve</em>
      </>
    ),
    blurb: [
      "A histogram shows you the shape of the risk. A loss exceedance curve answers the question everyone in the room is thinking: “What are the odds we lose more than $X?”",
      "Reading it is simple: pick any dollar amount on the horizontal axis, look up to the curve, then read across to the vertical axis. That number is the probability that annual losses from this risk will meet or exceed that amount. Once you can read this chart, you can have a real conversation about risk tolerance, loss reserves, and how much exposure your organization carries.",
    ],
    stepsHeading: (
      <>
        From a range to a curve you can <em>read</em>, in three steps.
      </>
    ),
    tool: lossExceedanceCurve,
  },
];

const focusAreas = [
  { label: "FAIR cyber risk quantification", tone: "rose" },
  { label: "Compliance-as-code", tone: "amber" },
  { label: "AI-assisted GRC engineering", tone: "sage" },
  { label: "SEC cyber incident materiality", tone: "rose" },
  { label: "Multi-framework control mapping", tone: "amber" },
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
    titleHtml: (
      <>
        Controls are the <em>foundation</em>. Everything else pulls from the controls.
      </>
    ),
    body:
      "If you build controls out properly, audit evidence, risks, policy, and compliance automatically compose. But if you don't understand the layers at which a control sits (product, platform, customer, enterprise) and how much the control costs you (TCO — total cost of ownership), you'll never effectively calculate risk, mature controls down the road, establish realistic KRIs/KPIs, or implement a continuous monitoring program. Bad control data is the path to a weakened or failing GRC program.",
  },
  {
    titleHtml: (
      <>
        Financial quantification in GRC is <em>non-negotiable</em>.
      </>
    ),
    body:
      'Heatmaps are dead. Red is a color, not a unit of risk measurement. You cannot tell leadership "how risky" something is by calling it red. You have to know the true impact and likelihood of risks in dollars to inform leadership of the threat landscape and equip them to make real decisions. FAIR gives you defensible loss exposure ranges that a CFO can budget against.',
  },
  {
    titleHtml: (
      <>
        Risk is not a point in time. Risk is <em>scenarios</em>.
      </>
    ),
    body:
      "Static risk registers are legacy. We already know controls are the foundation for GRC, but specifically for risk, we need to stop looking at it as a snapshot and start thinking of it as scenarios—the same way we run tabletops for BCP/DR. Risk is continuous and ever-evolving. We run scenarios, Monte Carlo simulations, and populate loss exceedance curves to show where threats actually live. When risk is forward-looking instead of reactionary—when it's preventative instead of response-based—you have a mature program.",
  },
  {
    titleHtml: (
      <>
        GRC engineering and <em>automation</em> take programs to the next level.
      </>
    ),
    body:
      "Even with great processes in place, manual workload will eventually take its toll and employee fatigue will cause error. The best way to maintain your program's maturity while not burning out your team is to automate the workflows and engineer solutions. Leverage AI to calculate risks, respond to customer questionnaires, review vendor assessments, and perform threat modeling. AI and engineering take already-mature programs to the next level and give struggling teams a shortcut to the top.",
  },
];

type Role = {
  period: string;
  location: string;
  company: string;
  companyUrl?: string;
  context: string;
  headline: string;
  roles: { title: string; period: string }[];
  summary: string;
  built: string[];
  impact: string[];
  tags: string[];
  current?: boolean;
};

const experience: Role[] = [
  {
    period: "Sep 2021 — present",
    location: "Boston, MA",
    company: "Rapid7",
    companyUrl: "https://www.linkedin.com/company/rapid7/",
    context: "Public-company security · Trust, Risk & Compliance",
    headline: "Staff Trust, Risk, and Compliance Analyst",
    roles: [
      { title: "Staff Trust, Risk, and Compliance Analyst", period: "Feb 2026 — present" },
      { title: "Lead Security Risk Analyst", period: "Feb 2023 — Feb 2026" },
      { title: "Lead Security Compliance Analyst", period: "Sep 2021 — Feb 2023" },
    ],
    summary:
      "Owning the Integrated IS Risk Management framework end-to-end — quantitative risk, third-party risk, and customer risk assessment run as one operating model with board-level visibility. This is where the control-first, quantify-everything stance stopped being a philosophy and became a program.",
    built: [
      "Architected the first Integrated IS Risk Management (ISIRM) framework, consolidating three siloed functions into a single governance model with one control spine underneath it.",
      "Designed a FAIR-based quantification model and embedded it in an LLM application — one of the earliest production AI + GRC integrations in the org.",
      "Built the Incident Severity Calculator, scoring OWASP severity and EO-14028 materiality separately, and led the SEC Cyber Incident Disclosure program around it.",
      "Stood up and administered the OneTrust GRC platform from scratch — risk register, intake, control library — with API integrations into Jira and ICON that route remediation automatically.",
      "Created the Findings Management Calculator so every team rates risk against the same rubric instead of their own instinct.",
    ],
    impact: [
      "Cut findings triage time by 40% by replacing per-team judgment with one standardized rating rubric.",
      "Founded the annual Security Risk Assessment — an executive review that turned into an ongoing board-visibility cadence.",
      "Redesigned Customer Risk Assessment; response SLAs moved from weeks to days without adding headcount.",
      "Managed audit risk assessments and findings management end-to-end across SOC 2 and FedRAMP, from scoping through remediation closure.",
    ],
    tags: ["FAIR", "SEC materiality", "LLM integration", "OneTrust", "Jira API", "SOC 2", "FedRAMP"],
    current: true,
  },
  {
    period: "Mar 2020 — Sep 2021",
    location: "Boston, MA",
    company: "Seven Bridges",
    companyUrl: "https://www.linkedin.com/company/sevenbridges/",
    context: "Biotechnology · Genomics data platform",
    headline: "Senior Risk and Compliance Analyst",
    roles: [{ title: "Senior Risk and Compliance Analyst", period: "Mar 2020 — Sep 2021" }],
    summary:
      "Third-party risk and multi-framework audit for a genomics data platform, where the same control had to satisfy healthcare regulators, federal auditors, and enterprise customers at the same time.",
    built: [
      "Ran third-party risk across a 650+ vendor portfolio, from intake through assessment, findings, and remediation tracking.",
      "Executed audit cycles against HIPAA, ISO, NIST, SOC, and FedRAMP requirements on a single evidence base.",
      "Negotiated the security and privacy terms inside customer and vendor contracts alongside legal and sales.",
    ],
    impact: [
      "Directly enabled $1.5M+ in quarterly bookings by clearing security and privacy contract terms instead of stalling them.",
      "Kept a regulated biotech platform continuously audit-ready across five frameworks at once.",
      "Proved out the pattern I still use: assess the control once, report it five ways.",
    ],
    tags: ["Vendor risk", "HIPAA", "FedRAMP", "ISO 27001", "Contract review"],
  },
  {
    period: "Nov 2017 — Mar 2020",
    location: "Boston, MA",
    company: "Acquia",
    companyUrl: "https://www.linkedin.com/company/acquia/",
    context: "Enterprise SaaS · Global privacy program",
    headline: "Senior Information Security Analyst",
    roles: [
      { title: "Senior Information Security Analyst", period: "Nov 2019 — Mar 2020" },
      { title: "Senior Risk and Controls Analyst, Information Security", period: "Aug 2018 — Mar 2019" },
      { title: "Risk and Controls Analyst, Information Security", period: "Nov 2017 — Aug 2018" },
    ],
    summary:
      "Built a global GDPR program from nothing while running vendor risk at enterprise SaaS scale — the role that taught me a program is only as good as the data model underneath it.",
    built: [
      "Designed and implemented a global GDPR compliance program: policies, vendor due diligence, lawful basis for processing, breach response, and company-wide training.",
      "Managed a 900+ vendor portfolio with audits against HIPAA, ISO, NIST, SOC, and FedRAMP standards.",
      "Authored the control and evidence documentation that the privacy and security programs both resolved against.",
    ],
    impact: [
      "Took the company from no formal privacy program to GDPR-operational ahead of its enforcement exposure.",
      "Scaled vendor due diligence past 900 vendors without proportionally scaling the team.",
      "Established reusable control language that stopped privacy and security from documenting the same thing twice.",
    ],
    tags: ["GDPR", "HIPAA", "ISO", "NIST", "SOC", "FedRAMP"],
  },
  {
    period: "Jan 2017 — Nov 2017",
    location: "Burlington, MA",
    company: "Nuance Communications",
    companyUrl: "https://www.linkedin.com/company/nuance-communications/",
    context: "Healthcare IT · HITRUST",
    headline: "Healthcare IT GRC Analyst, Information Security",
    roles: [
      { title: "Healthcare IT GRC Analyst, Information Security", period: "Jan 2017 — Nov 2017" },
    ],
    summary:
      "Stood up the formal security and privacy GRC program for a healthcare division that had the obligations of a regulated entity and none of the structure.",
    built: [
      "Built the division's formal security and privacy GRC program, aligned to HIPAA, HITRUST, ISO, NIST, SOC, and FedRAMP.",
      "Reviewed the security and privacy terms in healthcare customer contracts before they reached signature.",
    ],
    impact: [
      "Enabled $1.2M+ in quarterly compliant revenue by clearing contracts that would otherwise have stalled.",
      "Gave a regulated healthcare business its first repeatable control and evidence baseline.",
    ],
    tags: ["HIPAA", "HITRUST", "Healthcare", "Contract review"],
  },
  {
    period: "May 2016 — Jan 2017",
    location: "Bedford, MA",
    company: "iRobot",
    companyUrl: "https://www.linkedin.com/company/irobot/",
    context: "Robotics · Security PMO",
    headline: "Program Coordinator, Information Security",
    roles: [
      { title: "Program Coordinator — Information Security (Intern)", period: "May 2016 — Jan 2017" },
    ],
    summary:
      "Ran the information security program through the PMO — intake, scheduling, and delivery tracking across concurrent workstreams.",
    built: [
      "Coordinated the security program's intake and delivery cadence across engineering and IT workstreams.",
      "Maintained the reporting that leadership used to see program status in one place.",
    ],
    impact: [
      "Gave security leadership a single view of status across parallel projects instead of per-team updates.",
      "Learned program discipline first — which is why every GRC system I build now starts with the operating cadence.",
    ],
    tags: ["PMO", "Program coordination", "Robotics"],
  },
  {
    period: "Nov 2015 — May 2016",
    location: "Lake Mary, FL",
    company: "Veritas",
    companyUrl: "https://www.linkedin.com/company/veritas-technologies-llc/",
    context: "Backup & recovery engineering",
    headline: "Backup and Recovery Testing Engineer",
    roles: [
      { title: "Backup and Recovery Testing Engineer (Intern)", period: "Nov 2015 — May 2016" },
    ],
    summary:
      "User acceptance testing on new hardware against Backup and Backup Exec software — the hands-on start of a career that kept circling back to whether a control actually works when you test it.",
    built: [
      "Executed UAT cycles on new hardware configurations against Backup and Backup Exec.",
      "Documented defects and recovery behavior against expected results.",
    ],
    impact: [
      "First-hand exposure to the difference between a documented recovery capability and a tested one.",
      "The instinct behind every evidence pipeline I've built since: if nobody tested it, it isn't a control.",
    ],
    tags: ["UAT", "Backup Exec", "Disaster recovery"],
  },
];

const roadmapSteps = [
  { num: "01", title: "Controls Library", desc: "Single source of truth", status: "LIVE" },
  { num: "02", title: "Framework Crosswalks", desc: "SOC 2, NIST, ISO, HITRUST", status: "LIVE" },
  { num: "03", title: "Evidence Automation", desc: "Pipeline-native collection", status: "BUILDING" },
  { num: "04", title: "FAIR Risk Workflows", desc: "Loss exposure per scenario", status: "BUILDING" },
  { num: "05", title: "AI Evidence Scout", desc: "Freshness & relevance scoring", status: "COMING" },
];

const writing = [
  {
    eyebrow: "Boston · President",
    title: "GRC Engineering Club — Boston Chapter",
    body: "President of the Boston chapter. Building the local practice around systems, automation, and modern controls work — meetups, mentorship, and community writing.",
    href: links.grcEngineeringClub,
    cta: "Get #WickedCompliant",
  },
  {
    eyebrow: "Medium · Writing",
    title: "Essays on risk quantification & AI in GRC",
    body: "Long-form pieces on FAIR, compliance-as-code, GRC engineering, and where technical judgment actually belongs in compliance work.",
    href: links.medium,
    cta: "Read on Medium",
  },
  {
    eyebrow: "ISACA · ISC2 · Standards work",
    title: "Shaping how the industry certifies AI competency",
    body: "ISACA AI exam beta tester and member of the exam writing development group for advanced AI security and AI risk certifications. Co-author on ISC2 AI technical guidance. Together that work decides what the profession will consider table stakes for AI risk — and turns complex GRC concepts into reference material the global security community can actually use.",
  },
  {
    eyebrow: "Mentorship · Internal & external",
    title: "Building GRC engineers, one bench at a time",
    body: "Externally, I mentor through ISACA, Big Brothers Big Sisters, and Boston University. Internally, I run the GRC development track for my own team — formal education paths, certification prep, cross-training across risk and compliance, and skills enhancement in GRC engineering, automation, and AI. That runs from one-on-one coaching all the way up to department-wide enablement sessions.",
  },
];

const skillGroups = [
  {
    title: "Risk & quantification",
    blurb:
      "Turning exposure into numbers leadership can act on: frequency, magnitude, tolerance, and the math that makes a control investment hold up in a budget conversation.",
    items: [
      "FAIR (OpenFAIR)",
      "Monte Carlo simulation",
      "Loss exceedance curves",
      "CVSS / OWASP scoring",
      "EO-14028 materiality",
      "Risk appetite modeling",
      "Third-party / vendor risk",
      "SEC 8-K cyber disclosure",
    ],
  },
  {
    title: "Frameworks & attestations",
    blurb:
      "Multi-framework fluency built in regulated SaaS, healthcare, and public-company environments — where one control has to satisfy five auditors without being written five times.",
    items: [
      "SOC 2 Type II",
      "FedRAMP",
      "ISO 27001 / 27017 / 27018",
      "NIST CSF · 800-53 · 800-171 · SSDF",
      "HIPAA / HITRUST",
      "GDPR / CCPA",
      "PCI DSS",
      "OSCAL",
    ],
  },
  {
    title: "GRC engineering",
    blurb:
      "The engineering layer that turns a framework into something a system enforces and proves on its own — every day, without a human chasing screenshots before an audit.",
    items: [
      "Control-first data modeling",
      "Compliance-as-code",
      "Policy-as-code",
      "Continuous control monitoring",
      "Evidence automation",
      "Framework crosswalk parsers",
      "Audit workspace design",
      "React / Node / PostgreSQL",
    ],
  },
  {
    title: "AI & automation",
    blurb:
      "Where AI measurably sharpens the work — scoring, mapping, questionnaire response, vendor review — with the decision itself still legible, reviewable, and human-owned.",
    items: [
      "LLM-assisted risk scoring",
      "Prompt engineering",
      "Agentic workflow design",
      "RAG-based GRC tooling",
      "Model risk / AAISM",
      "AI/ML risk assessment (AAIR)",
    ],
  },
  {
    title: "Platforms",
    blurb:
      "The systems the work actually runs on — enterprise GRC suites plus the ticketing and cloud tooling that evidence has to come out of in the first place.",
    items: ["OneTrust", "Archer", "ServiceNow GRC", "AuditBoard", "Jira / ICON", "AWS (CLF)"],
  },
  {
    title: "Leadership & judgment",
    blurb:
      "The part that turns a function into a program: executive translation, cross-functional partnership, and building the next set of practitioners behind you.",
    items: [
      "Executive risk narrative",
      "Board reporting",
      "Program design",
      "Cross-functional partnership",
      "Chapter president · Boston GRC Engineering Club",
      "Mentorship (ISACA · BBBS · BU)",
    ],
  },
];

const credentials = [
  {
    abbr: "CISM",
    name: "Certified Information Security Manager",
    detail: "ISACA · security program management and governance leadership.",
    status: "Active",
    tone: "rose",
  },
  {
    abbr: "CRISC",
    name: "Certified in Risk and Information Systems Control",
    detail: "ISACA · enterprise risk identification, response, and control monitoring.",
    status: "Active",
    tone: "amber",
  },
  {
    abbr: "AAISM",
    name: "Advanced in AI Security Management",
    detail: "ISACA · securing and governing AI systems in production.",
    status: "Active",
    tone: "sage",
  },
  {
    abbr: "AAIR",
    name: "Advanced in AI Risk",
    detail: "ISACA · risk assessment and assurance for AI and ML systems.",
    status: "Active",
    tone: "rose",
  },
  {
    abbr: "CC",
    name: "Certified in Cybersecurity",
    detail: "ISC2 · security principles, access control, and operations fundamentals.",
    status: "Active",
    tone: "amber",
  },
  {
    abbr: "CCP",
    name: "AWS Certified Cloud Practitioner",
    detail: "Amazon Web Services · CLF-C02.",
    status: "Active",
    tone: "sage",
  },
  {
    abbr: "CISA",
    name: "Certified Information Systems Auditor",
    detail: "ISACA · IS audit process, governance, and control evaluation.",
    status: "In progress",
    note: "Expected EOY 2026",
    tone: "rose",
  },
  {
    abbr: "AIAA",
    name: "Advanced in AI Audit",
    detail: "ISACA · auditing AI systems, models, and the controls around them.",
    status: "In progress",
    note: "Expected EOY 2026",
    tone: "amber",
  },
];

const education = [
  {
    degree: "M.S. Computer Information Systems",
    detail: "Security concentration",
    school: "Boston University",
  },
  {
    degree: "B.S. Information Technology",
    detail: "Magna cum laude",
    school: "University of Massachusetts Lowell",
  },
];

const contactLinks = [
  { label: "Email", meta: links.email, href: links.mailto, icon: Mail },
  { label: "LinkedIn", meta: "linkedin.com/in/xnasusx", href: links.linkedin, icon: Linkedin },
  { label: "GitHub", meta: "github.com/xnasusx", href: links.github, icon: Github },
  { label: "Medium", meta: "medium.com/@xnasusx", href: links.medium, icon: BookOpen },
  {
    label: "GRC Engineering Club",
    meta: "Boston chapter",
    href: links.grcEngineeringClub,
    icon: Landmark,
  },
  { label: "u dont GRC me", meta: "Live prototype", href: links.product, icon: ArrowUpRight },
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
          ["Loss event frequency", "Threat intel + control failure rate", "Whether to prevent, detect, or accept"],
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
          "FAIR distributions shown in the interactive tools on this site are illustrative, not sampled from real Monte Carlo runs.",
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
          {
            value: "OWASP + EO-14028",
            label: "grounded in existing severity and materiality references, not invented from scratch",
          },
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
          [
            "Confidentiality / integrity / availability loss magnitude",
            "Primary loss exposure",
            "Risk analyst",
          ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="site-header" aria-label="Primary">
        <a className="brand-link" href="#/">
          <span>Susan Shepard</span>
        </a>
        <nav className="site-nav" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#principles">Philosophy</a>
          <a href="#bring">Case studies</a>
          <a href="#experience">Experience</a>
          <a href="#/risk-tools">Risk lab</a>
          <a href="#credentials">Credentials</a>
        </nav>
        <a className="nav-cta" href={links.calendly} target="_blank" rel="noopener noreferrer">
          Let's connect <ArrowUpRight size={14} />
        </a>
      </header>

      <section id="top" className="hero-section">
        <aside className="hero-card" aria-label="Contact card">
          <div className="hero-portrait">
            <img
              src={links.headshot}
              srcSet={`${links.headshot} 1x, ${links.headshot2x} 2x`}
              alt="Susan Shepard"
              width={440}
              height={574}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="hero-portrait-fallback" aria-hidden="true">
              Susan
            </span>
          </div>
          <div className="hero-card-body">
            <strong className="hero-name">Susan Shepard</strong>
            <span className="hero-role">Staff · TRC Analyst, InfoSec · Rapid7</span>
          </div>
          <div className="hero-card-stats">
            <div className="hero-stat">
              <span className="hero-stat-label">Experience</span>
              <span className="hero-stat-value">10+ yrs</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">Based in</span>
              <span className="hero-stat-value">Boston</span>
            </div>
          </div>
          <div className="hero-card-skills">
            <span className="hero-skill-tag">RMF</span>
            <span className="hero-skill-tag amber">Policy-as-Code</span>
            <span className="hero-skill-tag">GRC Engineering</span>
            <span className="hero-skill-tag ink">USAF Veteran</span>
            <span className="hero-skill-tag sage">CRQ</span>
            <span className="hero-skill-tag amber">FAIR</span>
            <span className="hero-skill-tag sage">AI Automation</span>
          </div>
        </aside>

        <div className="hero-copy">
          <p className="section-label">
            GRC engineering · FAIR risk quantification · AI-assisted GRC
          </p>
          <h1>
            Cyber risk, <em>quantified</em> into decisions leaders can defend.
          </h1>
          <p className="hero-intro">
            Over a decade across enterprise SaaS, biotechnology, healthcare, and public-company
            security work — now building FAIR-based risk quantification, compliance-as-code, and
            AI-assisted GRC systems that replace the audit spreadsheet with something a board can
            actually read.
          </p>
          <div className="hero-actions">
            <a
              className="primary-link"
              href={links.product}
              target="_blank"
              rel="noopener noreferrer"
            >
              View my work <ArrowUpRight size={18} />
            </a>
            <a className="accent-link" href={links.riskTools}>
              Explore GRC <ArrowUpRight size={18} />
            </a>
          </div>
          <ul className="hero-focus" aria-label="Focus areas">
            {focusAreas.map((area) => (
              <li className={area.tone} key={area.label}>
                {area.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" className="content-section">
        <div className="section-heading">
          <p className="section-label">About</p>
          <h2>
            Controls aren't the paperwork. They're the <em>foundation.</em>
          </h2>
        </div>
        <div className="about-layout">
          <aside className="about-boxes">
            <article className="about-box">
              <div className="about-box-head">
                <span className="about-box-num">01</span>
                <h3>Quantifying what was invisible</h3>
              </div>
              <p>
                Built Rapid7's first FAIR quantification model, embedded in an LLM application, so
                heat-map colors became dollar ranges leadership could budget against.
              </p>
            </article>
            <article className="about-box">
              <div className="about-box-head">
                <span className="about-box-num">02</span>
                <h3>Engineering compliance systems</h3>
              </div>
              <p>
                Architected the Integrated IS Risk Management framework across three siloed
                functions, and stood up OneTrust from scratch with API-automated remediation.
              </p>
            </article>
            <article className="about-box">
              <div className="about-box-head">
                <span className="about-box-num">03</span>
                <h3>Leading without authority</h3>
              </div>
              <p>
                Cut Customer Risk Assessment SLAs from weeks to days, and founded the annual Security
                Risk Assessment that became a standing board-visibility cadence.
              </p>
            </article>
            <article className="about-box">
              <div className="about-box-head">
                <span className="about-box-num">04</span>
                <h3>Building the community</h3>
              </div>
              <p>
                Founded and lead the GRC Engineering Club Boston chapter, and mentor through ISACA,
                Big Brothers Big Sisters, and Boston University.
              </p>
            </article>
          </aside>
          <div className="about-prose">
            <p>
              My work lives at the intersection of risk judgment, product thinking, and hands-on
              engineering. I quantify cyber risk in dollars (FAIR, not colors), treat controls as the
              foundational data model, wire evidence collection into the pipeline instead of the
              audit checklist, and use AI where it measurably sharpens the decision instead of just
              producing more of the same output.
            </p>
            <p>
              That stance came from doing the work the slow way first. I've built a privacy program
              from nothing, run vendor risk across portfolios of 900+ suppliers, sat through the
              audits where the evidence lived in someone's inbox, and watched good teams burn a
              quarter proving things a system should have been proving continuously. Every one of
              those experiences pointed at the same root cause: the control data underneath the
              program was never modeled properly, so everything downstream had to be rebuilt by hand
              every cycle.
            </p>
            <p>
              Ten years and counting across enterprise security, healthcare and privacy, GDPR, vendor
              risk at scale, SEC materiality and disclosure, audit readiness across SOC 2 / FedRAMP /
              HITRUST / ISO / NIST, and now full-stack GRC platform design. Military background
              shaped my discipline around execution and my respect for process rigor. Boston-based.
            </p>
            <p>
              These days that means designing risk programs that answer in dollars, building the
              automation that keeps them honest between audits, and teaching the next set of analysts
              to think like engineers. President of the GRC Engineering Club Boston chapter.
              Currently at Rapid7 as Staff Trust, Risk, and Compliance Analyst — where the fun is
              proving GRC is a <em>revenue enabler</em>, not paperwork.
            </p>
          </div>
        </div>
      </section>

      <section id="principles" className="content-section band">
        <div className="section-heading">
          <p className="section-label">Philosophy</p>
          <h2>
            My <em>GRC</em> philosophy.
          </h2>
        </div>
        <div className="principles-grid">
          {principles.map((principle, index) => (
            <article className="principle-card" key={index}>
              <span className="principle-number">Principle 0{index + 1}</span>
              <h3>{principle.titleHtml}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="bring" className="content-section">
        <div className="section-heading">
          <p className="section-label">Case studies</p>
          <h2>
            Three <em>objectives</em>. Three case studies. Same operating stance.
          </h2>
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
          <h2>
            Over a decade of GRC experience in a variety of industries such as{" "}
            <em>enterprise SaaS, biotechnology, healthcare, and robotics</em>.
          </h2>
        </div>
        <div className="exp-stack">
          {experience.map((job) => (
            <article
              className={`exp-block${job.current ? " feature" : ""}`}
              key={`${job.company}-${job.period}`}
            >
              <div className="exp-top">
                <div className="exp-headline">
                  <p className="exp-period">
                    {job.period} · {job.location}
                  </p>
                  <h3 className="exp-role">{job.headline}</h3>
                  <p className="exp-company">
                    {job.companyUrl ? (
                      <a href={job.companyUrl} target="_blank" rel="noopener noreferrer">
                        {job.company}
                      </a>
                    ) : (
                      job.company
                    )}
                    <span className="dot">·</span>
                    {job.context}
                  </p>
                </div>
                {job.current && <span className="exp-badge">Current role</span>}
              </div>

              {job.roles.length > 1 && (
                <ul className="exp-roles">
                  {job.roles.map((role) => (
                    <li key={role.title}>
                      <span className="exp-role-title">{role.title}</span>
                      <span className="exp-role-period">{role.period}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="exp-summary">{job.summary}</p>

              <div className="exp-cols">
                <div className="exp-col">
                  <h5>What I built</h5>
                  <ul>
                    {job.built.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="exp-col impact">
                  <h5>Impact</h5>
                  <ul>
                    {job.impact.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="tag-row">
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="flagship" className="content-section">
        <div className="section-heading">
          <p className="section-label">— Flagship project · 2026 to present</p>
          <h2>
            u dont <em>GRC</em> me
          </h2>
        </div>
        <div className="roadmap-container">
          <div className="roadmap">
            {roadmapSteps.map((step, index) => (
              <div className="roadmap-step" key={step.num}>
                <div className="roadmap-card">
                  <span className="roadmap-num">{step.num}</span>
                  <div className="roadmap-body">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                  <span className={`roadmap-status ${step.status.toLowerCase()}`}>
                    {step.status}
                  </span>
                </div>
                {index < roadmapSteps.length - 1 && <div className="roadmap-connector" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flagship-copy">
          <p>
            The roadmap above is my philosophy compiled into software. It starts with the controls
            library because controls are the foundation — get the layer and the cost of a control
            right and audit evidence, risk, and policy all resolve off that one spine. Frameworks
            come second, as <em>views</em> over the same data, which is why crosswalks are step two
            and not a rewrite.
          </p>
          <p>
            Steps three and four are where the manual workload dies. Evidence gets collected by the
            pipeline that produced it, and risk stops being a static register entry: each scenario
            carries its own loss exposure, so leadership gets a dollar range instead of a color.
            Step five points the AI at the part humans are worst at — noticing that evidence went
            stale three weeks ago.
          </p>
          <p>
            Built in the open with React, Node/Express, and PostgreSQL, and opinionated on purpose:
            control-first, evidence-attached, framework-agnostic, AI-augmented where it earns its
            keep. Break it, argue with it, or fork it.
          </p>
          <div className="flagship-tags">
            <span>Control-first data model</span>
            <span>OSCAL-shaped</span>
            <span>15+ frameworks</span>
            <span>AI Evidence Scout</span>
            <span>Public prototype</span>
          </div>
          <div className="hero-actions">
            <a
              className="primary-link"
              href={links.product}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit u dont GRC me <ArrowUpRight size={18} />
            </a>
            <a
              className="secondary-link"
              href={links.githubProduct}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <Github size={18} />
            </a>
          </div>
        </div>
      </section>

      <section id="try" className="content-section band">
        <div className="section-heading">
          <p className="section-label">Interactive · risk quantification</p>
          <h2>
            The pitch, in <em>your</em> hands.
          </h2>
          <p className="try-lede">
            The Risk Quantifier turns a qualitative heat map into a Monte Carlo loss distribution —
            live, in the browser, with your own numbers.
          </p>
          <a className="primary-link risk-lab-button" href="#/risk-tools">
            learn to quantify my risks <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="risk-preview-grid">
          {riskQuantifier.steps.map((step) => (
            <a className="risk-preview-card" href="#/risk-tools" key={step.title}>
              <span className="try-link-eyebrow">{step.eyebrow}</span>
              <strong>{step.title}</strong>
              <span className="try-link-body">{step.body}</span>
              <span className="try-link-cta">
                Open the tool <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="writing" className="content-section">
        <div className="section-heading">
          <p className="section-label">Writing, community, mentorship</p>
          <h2>
            Building the practice — and the <em>people</em> — around modern GRC.
          </h2>
        </div>
        <div className="writing-grid">
          {writing.map((item) =>
            item.href ? (
              <a className="writing-card linked" href={item.href} key={item.title}>
                {item.eyebrow && <span className="writing-eyebrow">{item.eyebrow}</span>}
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="writing-cta">
                  {item.cta} <ExternalLink size={14} />
                </span>
              </a>
            ) : (
              <article className="writing-card" key={item.title}>
                {item.eyebrow && <span className="writing-eyebrow">{item.eyebrow}</span>}
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ),
          )}
        </div>
      </section>

      <section id="next" className="content-section next-section">
        <div className="section-heading">
          <p className="section-label">— What I'm building next</p>
          <h2>
            Quantitative GRC for the companies that <em>can't</em> hire a whole team to do it.
          </h2>
          <p className="next-lede">
            Fortune 500s can staff GRC engineering. Small and mid-sized businesses can't. That's
            where the next tool has to live: shrink the complex GRC engineering ideas — controls-first
            data modeling, FAIR quantification, automated evidence, continuous control monitoring —
            into something a company without a program manager can actually stand up.
          </p>
        </div>
        <div className="next-grid">
          <article className="next-card">
            <div className="next-card-head">
              <span className="next-num">i</span>
              <h3>Controls-first, out of the box</h3>
            </div>
            <p>
              The tool starts where every program should: helping the customer identify and encode
              their controls before it asks them about frameworks. Everything else — risk scoring,
              audit prep, evidence — resolves off that spine.
            </p>
          </article>
          <article className="next-card">
            <div className="next-card-head">
              <span className="next-num">ii</span>
              <h3>AI as the implementation team</h3>
            </div>
            <p>
              Instead of paying six months of consulting to configure the platform, an in-product AI
              guide walks the customer through setup like a "new computer" wizard. Controls,
              integrations, framework scoping, thresholds — all conversational, all reviewable, all
              persisted.
            </p>
          </article>
          <article className="next-card">
            <div className="next-card-head">
              <span className="next-num">iii</span>
              <h3>Real integrations, real data, real risk</h3>
            </div>
            <p>
              Connectors pull the actual environment (cloud, endpoint, ticketing, identity), the AI
              threat-hunts against it, and every risk number — TCO, ROI, KPIs, KRIs, FAIR loss
              exposure — gets computed against the customer's real footprint, not a generic industry
              benchmark.
            </p>
          </article>
          <article className="next-card">
            <div className="next-card-head">
              <span className="next-num">iv</span>
              <h3>One brain for the whole program</h3>
            </div>
            <p>
              Same AI runs audits, collects evidence, flags drift, quantifies the next scenario, and
              writes the exec update. Not four disconnected copilots — one persistent GRC brain that
              remembers what happened last quarter and what changed since.
            </p>
          </article>
        </div>
      </section>

      <section className="content-section band">
        <div className="section-heading">
          <p className="section-label">Skills &amp; tooling</p>
          <h2>
            The operational <em>architecture</em> of modern GRC.
          </h2>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-group" key={group.title}>
              <h3>{group.title}</h3>
              <p className="skill-blurb">{group.blurb}</p>
              <div className="skill-pills">
                {group.items.map((item) => (
                  <span className="skill-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="credentials" className="content-section">
        <div className="section-heading">
          <p className="section-label">Credentials &amp; education</p>
          <h2>
            Credentialed, degreed, and <em>still studying.</em>
          </h2>
        </div>
        <div className="credentials-grid">
          <div className="cred-column">
            <h3 className="cred-column-title">Certifications</h3>
            <div className="cert-boxes">
              {credentials.map((cred) => (
                <div className="cert-box" key={cred.abbr + cred.name}>
                  <span className={`cert-mark ${cred.tone}`} aria-hidden="true">
                    {cred.abbr}
                  </span>
                  <div className="cert-info">
                    <h4>
                      {cred.name}
                      <span
                        className={`cert-status ${
                          cred.status === "Active" ? "active" : "progress"
                        }`}
                      >
                        {cred.status}
                      </span>
                    </h4>
                    <p>
                      {cred.detail}
                      {cred.note ? ` ${cred.note}.` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cred-column">
            <h3 className="cred-column-title">Education</h3>
            <div className="education-box">
              {education.map((entry, index) => (
                <React.Fragment key={entry.degree}>
                  {index > 0 && <div className="education-divider" />}
                  <div className="education-entry">
                    <strong>{entry.degree}</strong>
                    <span className="education-detail">{entry.detail}</span>
                    <em className="education-school">{entry.school}</em>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="service-card">
              <p className="service-eyebrow">// Service</p>
              <h3>
                United States Air Force <em>veteran</em>
              </h3>
              <p>
                The foundation underneath everything after it. Military service is where I learned
                execution discipline, how systems get used under pressure, and why a control nobody
                tested is a control nobody has.
              </p>
              <div className="service-divider" />
              <p className="service-eyebrow">// Community</p>
              <p>
                President, GRC Engineering Club Boston chapter. Mentor through ISACA, Big Brothers
                Big Sisters, and Boston University.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="section-heading contact-heading">
          <p className="section-label">— Let's connect</p>
          <h2>
            Want to bring <em>quantitative, engineered</em> GRC to your organization?
          </h2>
          <p>
            I'm open to conversations about GRC engineering leadership, FAIR risk quantification
            programs, cyber materiality and disclosure work, and AI-augmented compliance platforms —
            especially if you're trying to shape the function around what actually generates value,
            not what fills a binder.
          </p>
        </div>

        <div className="contact-grid">
          {contactLinks.map((item) => {
            const Icon = item.icon;
            const external = item.href.startsWith("http");
            return (
              <a
                className="contact-link"
                href={item.href}
                key={item.label}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
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

        <div className="contact-resume">
          <a className="primary-link" href={links.resumePdf}>
            Download resume (PDF) <FileText size={16} />
          </a>
          <p className="resume-line">
            Also available as <a href={links.resumeMarkdown}>Markdown</a> ·{" "}
            <a href={links.resumeJson}>JSON</a>.
          </p>
        </div>
      </section>
    </main>
  );
}

/* -------------------- Risk lab -------------------- */

type RiskStep = (typeof riskQuantifier.steps)[number];

function RiskStepCard({ step }: { step: RiskStep }) {
  return (
    <article className="risk-tool-card risk-step-card">
      <span className="try-link-eyebrow">{step.eyebrow}</span>
      <strong>{step.title}</strong>
      <span>{step.body}</span>
    </article>
  );
}

// The tool is served from the same origin as the portfolio, so in production we
// can read its height and grow the frame to match instead of trapping it in a
// scrolling window. In local dev the origins differ and this throws, which just
// leaves the CSS fallback height in place.
// `resetKey` changes when the frame is pointed at a different tool, so the
// height measured for the previous one does not stick to the new document.
function useFrameAutoHeight(
  frameRef: React.RefObject<HTMLIFrameElement | null>,
  resetKey?: string,
) {
  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.height = "";

    const sync = () => {
      // Cross-origin (local dev) hands back null, and the CSS height stands.
      const doc = frame.contentDocument;
      const view = frame.contentWindow;
      const body = doc?.body;
      if (!body || !view) return;
      // Measure the body, not documentElement: documentElement.scrollHeight is
      // clamped to the frame's own viewport, so it can only ever report the
      // height we already set and the frame would never shrink back down.
      const margins = view.getComputedStyle(body);
      const height =
        body.scrollHeight +
        parseFloat(margins.marginTop || "0") +
        parseFloat(margins.marginBottom || "0");
      // Guard against a blank or half-parsed document collapsing the frame.
      if (height > 400 && Math.abs(height - frame.offsetHeight) > 1) {
        frame.style.height = `${height}px`;
      }
    };

    // The tool grows by ~500px once a simulation renders its charts. A
    // ResizeObserver on the frame's body never delivered across the document
    // boundary in testing, so poll instead — it is one layout read.
    sync();
    frame.addEventListener("load", sync);
    const timer = window.setInterval(sync, 300);
    return () => {
      frame.removeEventListener("load", sync);
      window.clearInterval(timer);
    };
  }, [frameRef, resetKey]);
}

function RiskLabPage() {
  const [activeId, setActiveId] = React.useState(riskLabTools[0].id);
  const active = riskLabTools.find((entry) => entry.id === activeId) ?? riskLabTools[0];
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  useFrameAutoHeight(frameRef, active.id);

  return (
    <main className="portfolio-shell risk-lab-shell">
      <header className="site-header case-header" aria-label="Risk lab">
        <a className="brand-link" href="#/">
          <span>Susan Shepard</span>
        </a>
        <a className="case-back" href="#/">
          <ArrowLeft size={16} /> Back to portfolio
        </a>
      </header>

      <div className="risk-tab-bar">
        <div className="risk-tab-list" role="tablist" aria-label="Risk lab tools">
          {riskLabTools.map((entry) => {
            const Icon = entry.icon;
            const isActive = entry.id === activeId;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`risk-tab-${entry.id}`}
                aria-selected={isActive}
                aria-controls={`risk-panel-${entry.id}`}
                className={isActive ? "risk-tab active" : "risk-tab"}
                onClick={() => setActiveId(entry.id)}
              >
                <Icon size={16} />
                <span>{entry.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="risk-tab-panel"
        id={`risk-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`risk-tab-${active.id}`}
      >
        <section className="risk-tool-detail">
          <div className="risk-tool-detail-copy">
            <p className="section-label">{active.eyebrow ?? "Risk lab · Interactive tool"}</p>
            <h1>{active.title}</h1>
            {(Array.isArray(active.blurb) ? active.blurb : [active.blurb]).map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
            <div className="risk-tool-actions">
              <a
                className="primary-link"
                href={active.tool.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open full screen <ExternalLink size={16} />
              </a>
              <a
                className="secondary-link"
                href={active.tool.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <Github size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="risk-embed-shell" aria-label={`${active.label} interactive tool`}>
          <iframe
            ref={frameRef}
            className="risk-tool-frame"
            src={active.tool.url}
            title={`${active.label} interactive tool`}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        <section className="risk-lab-section" aria-labelledby="risk-lab-steps">
          <div className="section-heading">
            <p className="section-label">How it works</p>
            <h2 id="risk-lab-steps">{active.stepsHeading}</h2>
          </div>
          <div className="risk-tool-grid">
            {active.tool.steps.map((step) => (
              <RiskStepCard step={step} key={step.title} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------- Heat map vs histogram -------------------- */

const heatmapRows = [
  { likelihood: "Rare", impact: "High", label: "Ransomware on prod", loss: 3_200_000, color: "#c7848d" },
  { likelihood: "Unlikely", impact: "High", label: "Third-party breach", loss: 1_900_000, color: "#c7848d" },
  {
    likelihood: "Possible",
    impact: "Medium",
    label: "BEC / credential phishing",
    loss: 145_000,
    color: "#e6b04a",
  },
  { likelihood: "Likely", impact: "Low", label: "Laptop loss", loss: 8_500, color: "#e6b04a" },
  {
    likelihood: "Almost certain",
    impact: "Low",
    label: "Phishing click-through",
    loss: 2_800,
    color: "#e6b04a",
  },
];

function HeatmapVsHistogram() {
  const sorted = [...heatmapRows].sort((a, b) => b.loss - a.loss);
  const max = sorted[0].loss;
  return (
    <main className="portfolio-shell case-shell">
      <header className="site-header case-header" aria-label="Case study">
        <a className="brand-link" href="#/">
          <span>Susan Shepard</span>
        </a>
        <a className="case-back" href="#/">
          <ArrowLeft size={16} /> Back to portfolio
        </a>
      </header>

      <article className="case-article">
        <p className="section-label">Interactive · concept 01</p>
        <h1>
          Heat map vs <em>histogram</em>.
        </h1>
        <p className="case-tagline">What a 3-by-3 matrix hides that a histogram makes obvious.</p>
        <p className="case-intro">
          Heat maps look decisive. That's their job — five colored buckets, one glance, done. The
          problem is that "one glance, done" is the same summary whether the exposure is $8,500 or
          $3,200,000. Compress five very different risks into "High" and "Low" and you've thrown away
          the only information anyone needed to actually allocate capital against them.
        </p>

        <section className="case-section">
          <h2>The heat map</h2>
          <p>
            Five real scenarios, plotted the way most risk registers plot them. Every red cell is
            "High." Every yellow cell is "Medium" or "Low." That is the entire signal.
          </p>
          <div className="hv-heatmap-wrap">
            <table className="hv-heatmap">
              <caption className="hv-caption">
                Risk register color-coded by likelihood × impact
              </caption>
              <thead>
                <tr>
                  <th />
                  <th>Likelihood</th>
                  <th>Impact</th>
                  <th>Heat</th>
                </tr>
              </thead>
              <tbody>
                {heatmapRows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.likelihood}</td>
                    <td>{row.impact}</td>
                    <td>
                      <span className="hv-heat-cell" style={{ background: row.color }}>
                        {row.color === "#c7848d" ? "High" : "Medium"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="case-section">
          <h2>The histogram</h2>
          <p>
            Same five scenarios, plotted as expected annual loss in dollars. The board can now tell
            which "High" risk is 400× more expensive than the other. That's the decision the heat map
            was hiding.
          </p>
          <div
            className="hv-histogram"
            role="img"
            aria-label="Bar chart of expected annual loss per scenario"
          >
            {sorted.map((row) => {
              const pct = (row.loss / max) * 100;
              return (
                <div className="hv-bar-row" key={row.label}>
                  <span className="hv-bar-label">{row.label}</span>
                  <div className="hv-bar-track">
                    <div className="hv-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="hv-bar-value">${row.loss.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="case-section">
          <h2>What just happened</h2>
          <p>
            Nothing about the underlying risks changed — same five scenarios, same likelihoods, same
            impacts. All that changed was the visualization. The heat map treated "$3.2M ransomware"
            and "$1.9M third-party breach" as the same problem. The histogram lets you see that
            fixing the top two exposures reduces annual loss by ~$5M — a number a CFO can weigh
            against control investment cost.
          </p>
          <p>
            This is the shape FAIR-based quantification enforces by default. Every risk is expressed
            as a distribution of possible losses, which stack into an aggregate loss exceedance
            curve. Colors don't stack. Distributions do.
          </p>
        </section>

        <div className="case-footer">
          <a className="primary-link" href="#/monte-carlo">
            Next: your first Monte Carlo <ArrowUpRight size={16} />
          </a>
          <a className="secondary-link" href="#/">
            <ArrowLeft size={16} /> Back to portfolio
          </a>
        </div>
      </article>
    </main>
  );
}

/* -------------------- Monte Carlo -------------------- */

function triangular(low: number, mode: number, high: number) {
  const u = Math.random();
  const c = (mode - low) / (high - low);
  return u < c
    ? low + Math.sqrt(u * (high - low) * (mode - low))
    : high - Math.sqrt((1 - u) * (high - low) * (high - mode));
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function MonteCarloPage() {
  const [freqLow, setFreqLow] = React.useState(0.1);
  const [freqMode, setFreqMode] = React.useState(0.25);
  const [freqHigh, setFreqHigh] = React.useState(0.6);
  const [magLow, setMagLow] = React.useState(250_000);
  const [magMode, setMagMode] = React.useState(1_200_000);
  const [magHigh, setMagHigh] = React.useState(4_000_000);
  const [samples, setSamples] = React.useState<number[]>([]);
  const [running, setRunning] = React.useState(false);
  const frameRef = React.useRef<number | null>(null);
  const TOTAL = 10_000;
  const BATCH = 200;

  const step = React.useCallback(() => {
    setSamples((prev) => {
      if (prev.length >= TOTAL) {
        setRunning(false);
        return prev;
      }
      const next = prev.slice();
      const take = Math.min(BATCH, TOTAL - prev.length);
      for (let i = 0; i < take; i += 1) {
        const f = triangular(freqLow, freqMode, freqHigh);
        const m = triangular(magLow, magMode, magHigh);
        next.push(f * m);
      }
      return next;
    });
  }, [freqLow, freqMode, freqHigh, magLow, magMode, magHigh]);

  React.useEffect(() => {
    if (!running) return;
    frameRef.current = window.requestAnimationFrame(() => {
      step();
    });
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [running, samples, step]);

  const run = () => {
    setSamples([]);
    setRunning(true);
  };
  const stop = () => setRunning(false);

  const stats = React.useMemo(() => {
    if (samples.length === 0) return { p10: 0, p50: 0, p90: 0, mean: 0 };
    const sorted = [...samples].sort((a, b) => a - b);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    return {
      p10: percentile(sorted, 10),
      p50: percentile(sorted, 50),
      p90: percentile(sorted, 90),
      mean,
    };
  }, [samples]);

  const histogram = React.useMemo(() => {
    if (samples.length === 0) return { bins: [] as { x: number; count: number }[], max: 0 };
    const lo = Math.min(...samples);
    const hi = Math.max(...samples);
    const binCount = 24;
    const width = (hi - lo) / binCount || 1;
    const bins = Array.from({ length: binCount }, (_, i) => ({ x: lo + i * width, count: 0 }));
    for (const s of samples) {
      const idx = Math.min(binCount - 1, Math.floor((s - lo) / width));
      bins[idx].count += 1;
    }
    return { bins, max: Math.max(...bins.map((b) => b.count)) };
  }, [samples]);

  return (
    <main className="portfolio-shell case-shell">
      <header className="site-header case-header" aria-label="Case study">
        <a className="brand-link" href="#/">
          <span>Susan Shepard</span>
        </a>
        <a className="case-back" href="#/">
          <ArrowLeft size={16} /> Back to portfolio
        </a>
      </header>

      <article className="case-article">
        <p className="section-label">Interactive · simulation 02</p>
        <h1>
          Your first <em>Monte Carlo</em>.
        </h1>
        <p className="case-tagline">
          Watch a defensible loss distribution take shape, one sample at a time.
        </p>
        <p className="case-intro">
          A single point estimate is a lie the math tells to look confident. A Monte Carlo simulation
          samples each input as a distribution instead, and the output is the shape of the answer —
          not a number, a curve. Set the inputs below, press run, and watch 10,000 possible futures
          settle into a range you can actually defend.
        </p>

        <section className="case-section">
          <h2>The inputs</h2>
          <p>
            Two distributions: how often the loss event happens per year (frequency), and how big
            each occurrence costs (magnitude). Each is a triangular distribution — low / most likely
            / high — because most calibrated experts can give you those three numbers before they can
            give you a mean and a standard deviation.
          </p>
          <div className="mc-inputs">
            <fieldset>
              <legend>Loss event frequency (per year)</legend>
              <label>
                <span>Low</span>
                <input
                  type="number"
                  step="0.05"
                  min={0}
                  value={freqLow}
                  onChange={(e) => setFreqLow(Number(e.target.value))}
                />
              </label>
              <label>
                <span>Most likely</span>
                <input
                  type="number"
                  step="0.05"
                  min={0}
                  value={freqMode}
                  onChange={(e) => setFreqMode(Number(e.target.value))}
                />
              </label>
              <label>
                <span>High</span>
                <input
                  type="number"
                  step="0.05"
                  min={0}
                  value={freqHigh}
                  onChange={(e) => setFreqHigh(Number(e.target.value))}
                />
              </label>
            </fieldset>
            <fieldset>
              <legend>Loss magnitude per event (USD)</legend>
              <label>
                <span>Low</span>
                <input
                  type="number"
                  step="10000"
                  min={0}
                  value={magLow}
                  onChange={(e) => setMagLow(Number(e.target.value))}
                />
              </label>
              <label>
                <span>Most likely</span>
                <input
                  type="number"
                  step="10000"
                  min={0}
                  value={magMode}
                  onChange={(e) => setMagMode(Number(e.target.value))}
                />
              </label>
              <label>
                <span>High</span>
                <input
                  type="number"
                  step="10000"
                  min={0}
                  value={magHigh}
                  onChange={(e) => setMagHigh(Number(e.target.value))}
                />
              </label>
            </fieldset>
          </div>
          <div className="mc-controls">
            <button type="button" className="primary-link" onClick={run} disabled={running}>
              {running ? "Running…" : samples.length > 0 ? "Run again" : "Run 10,000 trials"}
            </button>
            {running && (
              <button type="button" className="secondary-link" onClick={stop}>
                Stop
              </button>
            )}
            <span className="mc-progress">
              {samples.length.toLocaleString()} / {TOTAL.toLocaleString()} trials
            </span>
          </div>
        </section>

        <section className="case-section">
          <h2>The distribution</h2>
          <p>
            Each bar is a bucket of annualized loss outcomes. The percentiles below mark where 10%,
            50%, and 90% of outcomes fall. A board conversation lives on those three numbers.
          </p>
          <div
            className="mc-histogram"
            role="img"
            aria-label="Monte Carlo histogram of annualized loss"
          >
            {histogram.bins.map((bin, i) => (
              <div
                className="mc-bar"
                key={i}
                style={{ height: histogram.max ? `${(bin.count / histogram.max) * 100}%` : "0%" }}
                title={`~$${Math.round(bin.x).toLocaleString()} — ${bin.count} trials`}
              />
            ))}
          </div>
          <div className="mc-stats">
            <div>
              <span>P10</span>
              <strong>${Math.round(stats.p10).toLocaleString()}</strong>
            </div>
            <div>
              <span>P50 (median)</span>
              <strong>${Math.round(stats.p50).toLocaleString()}</strong>
            </div>
            <div>
              <span>P90</span>
              <strong>${Math.round(stats.p90).toLocaleString()}</strong>
            </div>
            <div>
              <span>Mean</span>
              <strong>${Math.round(stats.mean).toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className="case-section">
          <h2>What the shape tells you</h2>
          <p>
            A right-skewed distribution — the shape almost every real cyber-risk scenario produces —
            has a mean that's noticeably higher than the median. That's the tail: rare but expensive
            events that a heat map can't represent at all. Underwriters and treasurers reason about
            the tail directly; risk teams that only report point estimates unintentionally hide it.
          </p>
          <p>
            The next step in a production FAIR program is stacking many of these distributions into a
            single organization-level loss exceedance curve — one chart that answers "how much annual
            loss are we willing to fund on our own balance sheet, and how much do we want to
            transfer?"
          </p>
        </section>

        <div className="case-footer">
          <a className="secondary-link" href="#/heatmap-vs-histogram">
            <ArrowLeft size={16} /> Back: heat map vs histogram
          </a>
          <a className="primary-link" href="#/">
            Back to portfolio <ArrowUpRight size={16} />
          </a>
        </div>
      </article>
    </main>
  );
}

/* -------------------- App root -------------------- */

const INTERACTIVE_ROUTES = new Set(["heatmap-vs-histogram", "monte-carlo"]);
const ALL_ROUTES = (() => {
  const set = new Set(CASE_ROUTES);
  INTERACTIVE_ROUTES.forEach((r) => set.add(r));
  set.add("risk-tools");
  return set;
})();

function App() {
  const route = useHashRoute();
  const prevRoute = React.useRef(route);

  React.useEffect(() => {
    const prev = prevRoute.current;
    const wasRouted = ALL_ROUTES.has(prev);
    const isRouted = ALL_ROUTES.has(route);
    if (route !== prev && (wasRouted || isRouted)) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    prevRoute.current = route;
  }, [route]);

  if (CASE_ROUTES.has(route)) return <CaseStudyView study={caseStudies[route]} />;
  // Old per-tool links (#/risk-tools/<slug>) now land on the single Risk Quantifier page.
  if (route === "risk-tools" || route.startsWith("risk-tools/")) return <RiskLabPage />;
  if (route === "heatmap-vs-histogram") return <HeatmapVsHistogram />;
  if (route === "monte-carlo") return <MonteCarloPage />;
  return <MainPortfolio />;
}

ReactDOM.createRoot(document.getElementById("portfolio-root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
