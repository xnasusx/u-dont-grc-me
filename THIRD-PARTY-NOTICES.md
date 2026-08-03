# Third-Party Notices

This project incorporates content and tooling from the following open source projects.

## Secure Controls Framework (via scf-api)

- Source: https://github.com/GRCEngClub/scf-api
- API: https://grcengclub.github.io/scf-api/
- Upstream: https://securecontrolsframework.com
- License: **CC BY-ND 4.0** (Attribution-NoDerivatives)

SCF control titles and descriptions are reproduced **verbatim** and are never
rewritten, paraphrased, summarised, or merged, because the NoDerivatives term
does not permit it. What this project adds is structure around that text: which
SCF control crosswalks to which framework citation, and how that compares to our
own control mappings. Synced into `data/scf/catalog.json` by `npm run sync:scf`,
seeded into the `scf_controls` and `scf_framework_map` tables, and surfaced in
Governance > SCF Coverage with attribution shown in the panel.

Crosswalks ingested: AICPA TSC 2017, ISO 27001:2022, ISO 27002:2022,
NIST CSF 2.0, HIPAA Security Rule 2013, PCI DSS 4.0.1, EU GDPR 2016,
ISO 42001:2023.

## how-to-harden

- Source: https://github.com/grcengineering/how-to-harden
- Site: https://howtoharden.com
- License: MIT
- Pinned commit: `05a7d3b680046c4af6e87137283d0ec9abbb6f14`

Hardening guide content, structured control definitions, framework citations, audit
checks, and remediation metadata are synced into `src/hardeningData.ts` by
`npm run sync:hardening` and rendered in the Admin > SaaS Hardening Library panel.
Pack bodies (Terraform, API scripts, Sigma rules) are not vendored; the app records
which artifact types exist per control and links to the upstream guide.

## nthpartyfinder

- Source: https://github.com/grcengineering/nthpartyfinder
- License: MIT
- Pinned commit: `bb2b0c636362bf3e358becb48771c8e7e60beaf7`

Nth-party vendor relationship discovery. The tool itself is not vendored; scan output
in `data/nth-party/*.scan.json` is ingested into `src/nthPartyData.ts` by
`npm run sync:nthparty` and rendered in the Admin > Nth-Party Discovery panel.

`how-to-harden` and `nthpartyfinder` are maintained by
[GRC Engineering](https://grc.engineering). `scf-api` is maintained by the
[GRC Engineering Club](https://grcengclub.com).
