# User Guide: u dont GRC me

## Purpose

`u dont GRC me` is a control-first GRC workspace. Instead of treating audits, risks, vendors, and evidence as separate spreadsheets, it uses controls as the center of gravity and links everything else back to them.

## Navigation

- **Command Center**: Use this for program oversight. Review risk metrics, filter the program, save dashboard views, create charts, and run Monte Carlo scenarios.
- **Governance**: Use this to manage the control inventory, framework mappings, evidence health, graph path context, policies, assets, and control-grounded documentation.
- **Compliance**: Use this to prepare audit packages, approve AI-proposed mappings, and validate evidence.
- **Risk**: Use this to manage risk scenarios and calculate FAIR-style exposure with percentile, histogram, exceedance, calibration, and data-quality views.
- **Admin**: Use this for integrations, knowledge answers, vendor risk, remediation, RBAC, AI agent boundaries, and mutation audit logs.

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

### Review Framework Coverage

1. Open **Governance**.
2. Use the tabs across the top of the module.
3. Start with **Control Inventory** to choose a control.
4. Open **Mappings** to check coverage, confidence, approval state, and remaining gaps.

### Review Evidence Health

1. Open **Governance**.
2. Select a control in **Control Inventory**.
3. Open **Evidence Health**.
4. Review evidence blueprints, source systems, schedules, pass rates, and stale checks.

### Review Vendors and Remediation

1. Open **Admin**.
2. Review third-party risk for vendors connected to controls.
3. Review remediation playbooks and approval gates before action.

### Assess Risk

1. Open **Risk**.
2. Select a risk scenario from the register.
3. Adjust loss magnitude, control strength, and uncertainty in the FAIR lab.
4. Review the P10, P50, and P90 exposure outputs.
5. Use the CRQ workbench to review the loss histogram, loss exceedance thresholds, data-vetting checklist, calibration anchors, and SME chip-and-bin elicitation.

## Prototype Boundary

This version uses hosted read-only Governance data plus browser-local persistence for simulated workflow actions. It is suitable for product validation, not production GRC operations.
