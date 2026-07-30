# User Guide: u dont GRC me

## Purpose

`u dont GRC me` is a control-first GRC workspace. Instead of treating audits, risks, vendors, and evidence as separate spreadsheets, it uses controls as the center of gravity and links everything else back to them.

## Navigation

- **Command Center**: Use this for program oversight. Review risk metrics, filter the program, save dashboard views, create charts, and run Monte Carlo scenarios.
- **Governance**: Use this to manage the control library and control-grounded documentation.
- **Compliance**: Use this to prepare for audits, approve AI-proposed mappings, and validate evidence.
- **Risk**: Use this to manage risk scenarios and calculate FAIR-style exposure.
- **Admin**: Use this for integrations, AI agent boundaries, and mutation audit logs.

## Common Workflows

### Review Program Health

1. Open **Command Center**.
2. Use the framework, owner, and persona filters.
3. Review annualized loss exposure, control health, pending approvals, and evidence freshness.
4. Save a view when a dashboard layout is useful for repeat reviews.

### Approve AI Mappings

1. Open **Compliance**.
2. Select a proposed graph mutation in the approval queue.
3. Compare the requirement context against the control context.
4. Approve or reject the mapping.

### Validate Evidence

1. Open **Compliance**.
2. Confirm the selected control context.
3. Paste a common telemetry payload.
4. Select **Validate Evidence**.
5. Review the generated evidence record and immutable reference metadata.

### Assess Risk

1. Open **Risk**.
2. Select a risk scenario from the register.
3. Adjust loss magnitude, control strength, and uncertainty in the FAIR lab.
4. Review the P10, P50, and P90 exposure outputs.

## Prototype Boundary

This version uses browser-local persistence. It is suitable for product validation, not production GRC operations.
