-- Migration: 20260603_security_v2
-- Description: Add integrity hash columns, composite indexes, and RLS policies

-- Add integrity hash to audit_logs
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS "integrityHash" VARCHAR(64);

-- Add integrity hash to financial_transactions
ALTER TABLE financial_transactions
  ADD COLUMN IF NOT EXISTS "integrityHash" VARCHAR(64);

-- Create extension for cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Composite index: orders by mechanic + status (most frequent mechanic query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_mechanic_status
  ON work_orders ("mechanicId", status)
  WHERE status NOT IN ('DELIVERED', 'CANCELLED');

-- Composite index: financial transactions by session + type (reconciliation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_session_type
  ON financial_transactions ("sessionId", type);

-- Composite index: expenses pending by approval level
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_pending_level
  ON expense_authorizations (status, "approvalLevel")
  WHERE status = 'PENDING_APPROVAL';

-- Composite index: audit logs by user + date (audit trail lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_date
  ON audit_logs ("userId", "createdAt" DESC);

-- Composite index: inventory movements by order (traceability)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_movements_order
  ON inventory_movements ("orderId", type);

-- Index on integrity hash for verification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_integrity
  ON audit_logs ("integrityHash")
  WHERE "integrityHash" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_tx_integrity
  ON financial_transactions ("integrityHash")
  WHERE "integrityHash" IS NOT NULL;

-- Full-text search index for work orders (plate + description + client name)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_fts
  ON work_orders USING gin (
    to_tsvector('spanish', COALESCE(number, '') || ' ' || COALESCE(description, ''))
  );

-- Row Level Security (RLS) — Enable on sensitive tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only OWNER can read all audit logs
CREATE POLICY audit_logs_owner_read ON audit_logs
  FOR SELECT
  USING (current_setting('app.current_user_role', true) = 'OWNER');

-- RLS Policy: ADMIN can read audit logs
CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT
  USING (current_setting('app.current_user_role', true) IN ('OWNER', 'ADMIN'));

-- RLS Policy: No UPDATE on audit logs (append-only)
CREATE POLICY audit_logs_no_update ON audit_logs
  FOR UPDATE USING (false);

-- RLS Policy: No DELETE on audit logs (append-only)
CREATE POLICY audit_logs_no_delete ON audit_logs
  FOR DELETE USING (false);

-- RLS Policy: Financial transactions visible to OWNER, ADMIN, FINANCE
CREATE POLICY financial_tx_read ON financial_transactions
  FOR SELECT
  USING (current_setting('app.current_user_role', true) IN ('OWNER', 'ADMIN', 'FINANCE'));

-- RLS Policy: No DELETE on financial transactions
CREATE POLICY financial_tx_no_delete ON financial_transactions
  FOR DELETE USING (false);

-- Function: Verify integrity chain for audit logs
CREATE OR REPLACE FUNCTION verify_integrity_chain(
  p_entity_id TEXT,
  p_entity_type TEXT
) RETURNS TABLE(
  audit_id TEXT,
  is_valid BOOLEAN,
  expected_hash TEXT,
  stored_hash TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id::TEXT,
    a."integrityHash" = encode(
      digest(
        json_build_object(
          'e', a.entity,
          'id', a."entityId",
          'a', CASE
            WHEN a.action LIKE '%CREATED%' THEN 'CREATE'
            WHEN a.action LIKE '%DELETED%' THEN 'DELETE'
            ELSE 'UPDATE'
          END,
          'b', a."beforeState",
          'f', a."afterState"
        )::text,
        'sha256'
      ),
      'hex'
    ) AS is_valid,
    encode(
      digest(
        json_build_object(
          'e', a.entity,
          'id', a."entityId",
          'a', CASE
            WHEN a.action LIKE '%CREATED%' THEN 'CREATE'
            WHEN a.action LIKE '%DELETED%' THEN 'DELETE'
            ELSE 'UPDATE'
          END,
          'b', a."beforeState",
          'f', a."afterState"
        )::text,
        'sha256'
      ),
      'hex'
    ) AS expected_hash,
    a."integrityHash" AS stored_hash
  FROM audit_logs a
  WHERE (a."entityId" = p_entity_id OR p_entity_id IS NULL)
    AND (a.entity = p_entity_type OR p_entity_type IS NULL)
  ORDER BY a."createdAt";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
