# Security Policy

## Supported Version

This repository is currently a prototype. Security fixes apply to the latest `main` branch until formal release branches are introduced.

## Reporting A Security Issue

Do not open a public issue with secrets, exploit details, customer data, or sensitive evidence.

For now, report suspected issues directly to the repository owner. When this becomes a public project, replace this section with a dedicated private disclosure channel.

## Prototype Security Boundaries

- Do not use this prototype with real customer data, regulated evidence, secrets, or production credentials.
- Browser `localStorage` is used only for demo persistence.
- AI agent workflows are simulated. No autonomous agent should write directly to a production graph database.
- Future backend work must enforce authentication, tenant isolation, allow-listed graph mutations, and immutable evidence storage.

## Pre-Launch Checklist

- Run `npm run build`.
- Search for secrets before every release.
- Review `.gitignore` before adding new cloud, credential, or environment files.
- Use draft PRs for substantive changes.
- Require human approval before production cloud deployments.
