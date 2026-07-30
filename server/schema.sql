PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS controls (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  family TEXT NOT NULL,
  description TEXT NOT NULL,
  owner TEXT NOT NULL,
  team TEXT NOT NULL,
  control_type TEXT NOT NULL CHECK (control_type IN ('Preventive', 'Detective', 'Corrective', 'Directive')),
  automation_level TEXT NOT NULL CHECK (automation_level IN ('Manual', 'Partially Automated', 'Fully Automated', 'Agentic')),
  implementation_status TEXT NOT NULL CHECK (implementation_status IN ('Not Started', 'In Progress', 'Implemented', 'Degraded', 'Failed', 'Retired')),
  criticality TEXT NOT NULL CHECK (criticality IN ('Low', 'Medium', 'High', 'Mission Critical')),
  testing_cadence TEXT NOT NULL,
  evidence_freshness INTEGER NOT NULL CHECK (evidence_freshness BETWEEN 0 AND 100),
  evidence_relevance INTEGER NOT NULL CHECK (evidence_relevance BETWEEN 0 AND 100),
  evidence_completeness INTEGER NOT NULL CHECK (evidence_completeness BETWEEN 0 AND 100),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS frameworks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS requirements (
  id TEXT PRIMARY KEY,
  framework_id TEXT NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  citation TEXT NOT NULL,
  function_area TEXT NOT NULL,
  title TEXT NOT NULL,
  requirement_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS control_requirement_mappings (
  id TEXT PRIMARY KEY,
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  requirement_id TEXT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  coverage_percentage INTEGER NOT NULL CHECK (coverage_percentage BETWEEN 0 AND 100),
  mapping_confidence INTEGER NOT NULL CHECK (mapping_confidence BETWEEN 0 AND 100),
  state TEXT NOT NULL CHECK (state IN ('Active', 'Pending Approval', 'Gap', 'Rejected')),
  rationale TEXT NOT NULL,
  UNIQUE (control_id, requirement_id)
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  environment TEXT NOT NULL,
  criticality TEXT NOT NULL,
  data_classification TEXT NOT NULL,
  owner TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS control_assets (
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  scope_status TEXT NOT NULL,
  testing_cadence TEXT NOT NULL,
  PRIMARY KEY (control_id, asset_id)
);

CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL,
  approved_version TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS control_policies (
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  policy_id TEXT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  section_reference TEXT NOT NULL,
  PRIMARY KEY (control_id, policy_id)
);

CREATE TABLE IF NOT EXISTS evidence_blueprints (
  id TEXT PRIMARY KEY,
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_system TEXT NOT NULL,
  query_logic TEXT NOT NULL,
  schedule TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Running', 'Needs Review', 'Draft', 'Paused')),
  last_run_at TEXT,
  freshness_days INTEGER NOT NULL,
  pass_rate INTEGER NOT NULL CHECK (pass_rate BETWEEN 0 AND 100),
  owner_approval_state TEXT NOT NULL CHECK (owner_approval_state IN ('Approved', 'Pending', 'Rejected'))
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id TEXT PRIMARY KEY,
  blueprint_id TEXT NOT NULL REFERENCES evidence_blueprints(id) ON DELETE CASCADE,
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_system TEXT NOT NULL,
  verdict TEXT NOT NULL,
  collected_at TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  hash TEXT NOT NULL,
  storage_uri TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS control_relationships (
  id TEXT PRIMARY KEY,
  from_control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  to_entity_id TEXT NOT NULL,
  to_entity_type TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  state TEXT NOT NULL,
  confidence INTEGER,
  narrative TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS program_projects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  frameworks TEXT NOT NULL,
  scoped_controls INTEGER NOT NULL CHECK (scoped_controls >= 0),
  evidence_ready_percentage INTEGER NOT NULL CHECK (evidence_ready_percentage BETWEEN 0 AND 100),
  auditor_collaboration TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Planning', 'In Progress', 'Ready', 'Blocked'))
);

CREATE TABLE IF NOT EXISTS framework_imports (
  id TEXT PRIMARY KEY,
  source_tool TEXT NOT NULL,
  framework_name TEXT NOT NULL,
  framework_version TEXT NOT NULL,
  mapped_framework_id TEXT REFERENCES frameworks(id) ON DELETE SET NULL,
  requirement_total INTEGER NOT NULL CHECK (requirement_total >= 0),
  candidate_controls INTEGER NOT NULL CHECK (candidate_controls >= 0),
  validation_state TEXT NOT NULL CHECK (validation_state IN ('Ready', 'Needs Review', 'Blocked', 'Imported')),
  next_step TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES program_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  framework_id TEXT REFERENCES frameworks(id) ON DELETE SET NULL,
  scoped_controls INTEGER NOT NULL CHECK (scoped_controls >= 0),
  findings_open INTEGER NOT NULL CHECK (findings_open >= 0),
  report_state TEXT NOT NULL CHECK (report_state IN ('Planning', 'Evidence Collection', 'Review', 'Ready')),
  owner TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_reviews (
  id TEXT PRIMARY KEY,
  source_system TEXT NOT NULL,
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  accounts_in_scope INTEGER NOT NULL CHECK (accounts_in_scope >= 0),
  overdue_count INTEGER NOT NULL CHECK (overdue_count >= 0),
  review_cadence TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Running', 'Needs Review', 'Ready', 'Blocked'))
);

CREATE TABLE IF NOT EXISTS vendor_questionnaires (
  id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  questionnaire_type TEXT NOT NULL,
  due_date TEXT NOT NULL,
  response_state TEXT NOT NULL CHECK (response_state IN ('Draft', 'Sent', 'In Review', 'Blocked', 'Complete')),
  relied_upon_controls TEXT NOT NULL,
  risk_signal TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hardening_guides (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  guide_source TEXT NOT NULL,
  hardening_focus TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2')),
  implementation_state TEXT NOT NULL CHECK (implementation_state IN ('Backlog', 'In Progress', 'Ready', 'Blocked')),
  first_party_control TEXT NOT NULL
);
