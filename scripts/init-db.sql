-- Claude Orchestration Database Schema

-- Create tables for session management
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    metadata JSONB
);

-- Create tables for agent registry
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    status VARCHAR(50) DEFAULT 'idle',
    container_id VARCHAR(100),
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    capabilities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables for task management
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    parent_task_id UUID REFERENCES tasks(id),
    linear_id VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 3,
    assigned_agent_id UUID REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB
);

-- Create tables for audit logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id UUID REFERENCES sessions(id),
    agent_id UUID REFERENCES agents(id),
    task_id UUID REFERENCES tasks(id),
    action VARCHAR(100) NOT NULL,
    context JSONB,
    result JSONB,
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost_cents INTEGER,
    tags TEXT[]
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_session ON audit_logs(session_id);
CREATE INDEX idx_audit_logs_agent ON audit_logs(agent_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_agent_id);
CREATE INDEX idx_agents_status ON agents(status);

-- Create tables for checkpoints
CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state JSONB NOT NULL,
    recovery_instructions JSONB
);

-- Create tables for hook violations
CREATE TABLE IF NOT EXISTS hook_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_id UUID REFERENCES agents(id),
    task_id UUID REFERENCES tasks(id),
    hook_type VARCHAR(100),
    file_path TEXT,
    violation_type VARCHAR(100),
    message TEXT,
    auto_fixed BOOLEAN DEFAULT FALSE,
    metadata JSONB
);

-- Create tables for performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_id UUID REFERENCES agents(id),
    metric_name VARCHAR(100),
    metric_value DECIMAL,
    unit VARCHAR(50),
    metadata JSONB
);

-- Create views for common queries
CREATE OR REPLACE VIEW active_agents AS
SELECT * FROM agents 
WHERE status != 'terminated' 
  AND last_heartbeat > CURRENT_TIMESTAMP - INTERVAL '1 minute';

CREATE OR REPLACE VIEW task_summary AS
SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    a.name as assigned_agent,
    t.created_at,
    t.started_at,
    t.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(t.completed_at, CURRENT_TIMESTAMP) - t.created_at)) as duration_seconds
FROM tasks t
LEFT JOIN agents a ON t.assigned_agent_id = a.id;

-- Insert default policeman agent
INSERT INTO agents (name, role, specialization, status, capabilities)
VALUES (
    'Policeman-01',
    'policeman',
    'orchestration',
    'active',
    '{"can_spawn_agents": true, "can_assign_tasks": true, "can_enforce_rules": true}'::jsonb
) ON CONFLICT (name) DO NOTHING;