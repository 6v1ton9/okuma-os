-- =============================================================================
-- OKUMA OS - Initial Database Schema
-- Complete SQL setup for Supabase PostgreSQL
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS (Authentication)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);

-- =============================================================================
-- CLIENTS (Empresas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    contato VARCHAR(255),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_razao_social ON clients(razao_social);
CREATE INDEX idx_clients_cnpj ON clients(cnpj);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_cidade ON clients(cidade);

-- =============================================================================
-- MACHINE MODELS (Catálogo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS machine_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    line VARCHAR(255),
    controller VARCHAR(255),
    weight FLOAT,
    curso_x FLOAT,
    curso_y FLOAT,
    curso_z FLOAT,
    potencia FLOAT,
    especificacoes_tecnicas TEXT,
    observacoes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_machine_models_name ON machine_models(name);
CREATE INDEX idx_machine_models_model ON machine_models(model);

-- =============================================================================
-- CUSTOMER MACHINES (Máquinas dos Clientes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS customer_machines (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    machine_model_id INTEGER NOT NULL REFERENCES machine_models(id) ON DELETE RESTRICT,
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    ano INTEGER,
    data_instalacao DATE,
    localizacao VARCHAR(255),
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_machines_client ON customer_machines(client_id);
CREATE INDEX idx_customer_machines_model ON customer_machines(machine_model_id);
CREATE INDEX idx_customer_machines_serie ON customer_machines(numero_serie);

-- =============================================================================
-- TECHNICIANS
-- =============================================================================
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cargo VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_technicians_name ON technicians(name);
CREATE INDEX idx_technicians_cpf ON technicians(cpf);
CREATE INDEX idx_technicians_status ON technicians(status);

-- =============================================================================
-- TECHNICIAN EXAMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS technician_exams (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE,
    validade DATE,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tech_exams_technician ON technician_exams(technician_id);
CREATE INDEX idx_tech_exams_validade ON technician_exams(validade);

-- =============================================================================
-- TECHNICIAN TRAININGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS technician_trainings (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    carga_horaria INTEGER,
    date DATE,
    validade DATE,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tech_trainings_technician ON technician_trainings(technician_id);
CREATE INDEX idx_tech_trainings_validade ON technician_trainings(validade);

-- =============================================================================
-- CALENDAR EVENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    customer_machine_id INTEGER REFERENCES customer_machines(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    observacoes TEXT,
    cidade VARCHAR(100),
    metadata_id VARCHAR(50),  -- Referência ao documento MongoDB com dados flexíveis
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_client ON calendar_events(client_id);
CREATE INDEX idx_calendar_events_machine ON calendar_events(customer_machine_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_inicio ON calendar_events(data_inicio);
CREATE INDEX idx_calendar_events_fim ON calendar_events(data_fim);
CREATE INDEX idx_calendar_events_metadata ON calendar_events(metadata_id);

-- Constraint: end must be after start
ALTER TABLE calendar_events ADD CONSTRAINT chk_event_dates 
    CHECK (data_fim > data_inicio);

-- Constraint: valid statuses
ALTER TABLE calendar_events ADD CONSTRAINT chk_event_status 
    CHECK (status IN ('pending', 'confirmed', 'unavailable', 'completed', 'cancelled'));

-- =============================================================================
-- EVENT-TECHNICIAN ASSOCIATION (Many-to-Many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS event_technicians (
    event_id INTEGER NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    technician_id INTEGER NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, technician_id)
);

CREATE INDEX idx_event_tech_event ON event_technicians(event_id);
CREATE INDEX idx_event_tech_technician ON event_technicians(technician_id);

-- =============================================================================
-- UPDATED_AT TRIGGER (Auto-update timestamps)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER trg_clients_updated_at 
    BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_machine_models_updated_at 
    BEFORE UPDATE ON machine_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_customer_machines_updated_at 
    BEFORE UPDATE ON customer_machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_technicians_updated_at 
    BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_technician_exams_updated_at 
    BEFORE UPDATE ON technician_exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_technician_trainings_updated_at 
    BEFORE UPDATE ON technician_trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEW: Dashboard Summary
-- =============================================================================
CREATE OR REPLACE VIEW vw_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM clients WHERE active = true) AS total_active_clients,
    (SELECT COUNT(*) FROM machine_models WHERE active = true) AS total_machine_models,
    (SELECT COUNT(*) FROM customer_machines WHERE active = true) AS total_customer_machines,
    (SELECT COUNT(*) FROM technicians WHERE active = true) AS total_technicians,
    (SELECT COUNT(*) FROM calendar_events WHERE active = true AND data_inicio > NOW()) AS upcoming_events,
    (SELECT COUNT(*) FROM calendar_events WHERE active = true AND status = 'pending') AS pending_events,
    (SELECT COUNT(*) FROM calendar_events WHERE active = true AND status = 'confirmed') AS confirmed_events;

-- =============================================================================
-- VIEW: Technician Event Load
-- =============================================================================
CREATE OR REPLACE VIEW vw_technician_event_load AS
SELECT
    t.id AS technician_id,
    t.name AS technician_name,
    COUNT(et.event_id) AS total_events,
    COUNT(CASE WHEN ce.data_inicio > NOW() THEN 1 END) AS upcoming_events
FROM technicians t
LEFT JOIN event_technicians et ON t.id = et.technician_id
LEFT JOIN calendar_events ce ON et.event_id = ce.id AND ce.active = true
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;

-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Note: The admin user is created automatically by the application
-- on first startup via core/setup.py (password: admin123)

INSERT INTO technicians (name, cpf, email, cargo, status) VALUES
    ('Administrador', '000.000.000-00', 'admin@okuma.com.br', 'Administrador', 'active')
ON CONFLICT (cpf) DO NOTHING;
