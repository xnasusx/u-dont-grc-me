# Contributing

## Development Flow

1. Create or update a PMO/task plan when the change spans multiple modules.
2. Make scoped changes.
3. Run `npm run build`.
4. Update docs, changelog, and release notes when user-facing behavior changes.
5. Open a draft pull request for review.

## Commit Style

Use concise, imperative commit messages:

```text
Add control library audit readiness views
```

## Quality Gates

- TypeScript build must pass.
- Browser console should have no active errors.
- UI changes should be checked on desktop and mobile widths.
- Security-sensitive changes require a focused review for secrets, auth, authorization, and data handling.

## Project Boundaries

This prototype is control-centric. New modules should preserve the relationship between controls, evidence, requirements, assets, risks, and agent decisions.
