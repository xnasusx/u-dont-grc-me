# Third-Party Notices

This project incorporates content and tooling from the following open source projects.

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

Both projects are maintained by [GRC Engineering](https://grc.engineering).
