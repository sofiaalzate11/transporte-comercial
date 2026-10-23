
-- =====================================================================
-- SCRIPT DDL: BASE DE DATOS TRANSPORTE COMERCIAL COLOMBIA (MySQL)
-- Compatible con MySQL 5.7, MySQL 8.0+ y MariaDB
-- =====================================================================
CREATE DATABASE IF NOT EXISTS transporte_colombia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE transporte_colombia;

-- 1. TABLA: road_alerts (Alertas viales oficiales INVIAS #767)
CREATE TABLE IF NOT EXISTS road_alerts (
  id VARCHAR(64) NOT NULL,
  department VARCHAR(64) NOT NULL,
  road_name VARCHAR(128) NOT NULL,
  sector VARCHAR(128) NOT NULL,
  alert_type VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  description TEXT NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  reported_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  is_resolved TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_road_alerts_resolved (is_resolved),
  INDEX idx_road_alerts_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: toll_stations (Peajes nacionales y tarifas Datos Abiertos SODA)
CREATE TABLE IF NOT EXISTS toll_stations (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  department VARCHAR(64) NOT NULL,
  road_sector VARCHAR(128) NOT NULL,
  concessionaire VARCHAR(128) NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  rates_json JSON NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_toll_stations_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: user_reports (Reportes de incidencias creados por el transportador)
CREATE TABLE IF NOT EXISTS user_reports (
  id VARCHAR(64) NOT NULL,
  road_name VARCHAR(128) NOT NULL,
  kilometer DOUBLE NOT NULL,
  description TEXT NOT NULL,
  incident_type VARCHAR(32) NOT NULL,
  created_at VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_user_reports_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: auth_users (Usuarios y transportadores autenticados)
CREATE TABLE IF NOT EXISTS auth_users (
  id VARCHAR(64) NOT NULL,
  email VARCHAR(128) NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  vehicle_plate VARCHAR(32),
  role VARCHAR(32) NOT NULL DEFAULT 'DRIVER',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_auth_users_email (email),
  INDEX idx_auth_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- DATOS SEMILLA (SEED DATA)
-- =====================================================================

INSERT INTO road_alerts (id, department, road_name, sector, alert_type, severity, description, latitude, longitude, reported_at, updated_at, is_resolved)
VALUES 
  ('ALT-001', 'ANTIOQUIA', 'Medellín - Bogotá', 'Km 42', 'DERRUMBE', 'CRITICAL', 'Cierre total por desprendimiento de rocas', 6.0315, -75.1234, '2026-10-16T10:00:00Z', '2026-10-16T10:30:00Z', 0),
  ('ALT-002', 'CUNDINAMARCA', 'Bogotá - Girardot', 'Subida de Silvania', 'MANTENIMIENTO', 'MODERATE', 'Paso a un carril por obras de repavimentación', 4.4031, -74.3871, '2026-10-16T08:00:00Z', '2026-10-16T09:15:00Z', 0);

INSERT INTO toll_stations (id, name, department, road_sector, concessionaire, latitude, longitude, rates_json, updated_at)
VALUES 
  ('TOLL-001', 'PEAJE CHUSACA', 'CUNDINAMARCA', 'Bogotá - Fusagasugá', 'VÍA 40 EXPRESS', 4.5098, -74.2492, '[{"category":"I","description":"Automóviles","priceCop":13800},{"category":"II","description":"Buses","priceCop":18500},{"category":"V","description":"Tractomulas 5 ejes","priceCop":54200}]', '2026-10-16T12:00:00Z'),
  ('TOLL-002', 'PEAJE COPACABANA', 'ANTIOQUIA', 'Medellín - Guarne', 'DEVIMED', 6.3456, -75.4987, '[{"category":"I","description":"Automóviles","priceCop":16200},{"category":"II","description":"Buses","priceCop":26500},{"category":"V","description":"Tractomulas 5 ejes","priceCop":68900}]', '2026-10-16T12:00:00Z');

INSERT INTO user_reports (id, road_name, kilometer, description, incident_type, created_at)
VALUES 
  ('REP-001', 'Buga - Buenaventura', 64.5, 'Camión varado en carril derecho bloqueando flujo', 'VARADO', '2026-10-16T14:20:00Z');

-- Usuario de prueba predeterminado
INSERT IGNORE INTO auth_users (id, email, full_name, vehicle_plate, role, is_verified, created_at)
VALUES (
  'USR-TEST-001',
  'conductor.prueba@transporte.co',
  'Carlos Rodríguez (Conductor de Prueba)',
  'TLM-987',
  'DRIVER',
  1,
  '2026-10-16T12:00:00Z'
);
