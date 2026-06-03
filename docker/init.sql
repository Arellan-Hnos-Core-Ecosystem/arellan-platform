-- Inmutabilidad de audit_logs a nivel de BD
CREATE OR REPLACE RULE no_update_audit_logs AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE no_delete_audit_logs AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Extensión para UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
