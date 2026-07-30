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
