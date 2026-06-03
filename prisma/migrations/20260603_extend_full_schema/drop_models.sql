-- ============================================================================
-- ROLLBACK: 20260603_extend_full_schema
-- Description: Safely rolls back all changes from the extend_full_schema migration.
-- Run this ONLY on a development/test database. Never on production.
-- ============================================================================

-- ============================================================================
-- PHASE 1: DROP FOREIGN KEY CONSTRAINTS (reverse creation order)
-- ============================================================================

ALTER TABLE "quotes"              DROP CONSTRAINT IF EXISTS "fk_quotes_workOrder";
ALTER TABLE "quotes"              DROP CONSTRAINT IF EXISTS "fk_quotes_client";
ALTER TABLE "commissions"         DROP CONSTRAINT IF EXISTS "fk_commissions_purchase";
ALTER TABLE "commissions"         DROP CONSTRAINT IF EXISTS "fk_commissions_supplier";
ALTER TABLE "commissions"         DROP CONSTRAINT IF EXISTS "fk_commissions_personnel";
ALTER TABLE "purchase_items"      DROP CONSTRAINT IF EXISTS "fk_purchase_items_inventory";
ALTER TABLE "purchase_items"      DROP CONSTRAINT IF EXISTS "fk_purchase_items_purchase";
ALTER TABLE "purchases"           DROP CONSTRAINT IF EXISTS "fk_purchases_supplier";
ALTER TABLE "approvals"           DROP CONSTRAINT IF EXISTS "fk_approvals_expense";
ALTER TABLE "approvals"           DROP CONSTRAINT IF EXISTS "fk_approvals_approvedBy";
ALTER TABLE "approvals"           DROP CONSTRAINT IF EXISTS "fk_approvals_requestedBy";
ALTER TABLE "payments"            DROP CONSTRAINT IF EXISTS "fk_payments_workOrder";
ALTER TABLE "payments"            DROP CONSTRAINT IF EXISTS "fk_payments_invoice";
ALTER TABLE "invoices"            DROP CONSTRAINT IF EXISTS "fk_invoices_client";
ALTER TABLE "invoices"            DROP CONSTRAINT IF EXISTS "fk_invoices_workOrder";
ALTER TABLE "work_order_events"   DROP CONSTRAINT IF EXISTS "fk_wo_events_workOrder";
ALTER TABLE "work_order_items"    DROP CONSTRAINT IF EXISTS "fk_wo_items_inventory";
ALTER TABLE "work_order_items"    DROP CONSTRAINT IF EXISTS "fk_wo_items_workOrder";
ALTER TABLE "work_order_assignees" DROP CONSTRAINT IF EXISTS "fk_wo_assignees_personnel";
ALTER TABLE "work_order_assignees" DROP CONSTRAINT IF EXISTS "fk_wo_assignees_workOrder";
ALTER TABLE "vehicle_usage"       DROP CONSTRAINT IF EXISTS "fk_vehicle_usage_personnel";
ALTER TABLE "vehicle_usage"       DROP CONSTRAINT IF EXISTS "fk_vehicle_usage_vehicle";
ALTER TABLE "attendance"          DROP CONSTRAINT IF EXISTS "fk_attendance_personnel";
ALTER TABLE "personnel"           DROP CONSTRAINT IF EXISTS "fk_personnel_account";
ALTER TABLE "work_orders"         DROP CONSTRAINT IF EXISTS "fk_work_orders_updatedBy";
ALTER TABLE "work_orders"         DROP CONSTRAINT IF EXISTS "fk_work_orders_createdBy";
ALTER TABLE "inventory_items"     DROP CONSTRAINT IF EXISTS "fk_inventory_items_supplier";
ALTER TABLE "inventory_items"     DROP CONSTRAINT IF EXISTS "fk_inventory_items_category";
ALTER TABLE "categories"          DROP CONSTRAINT IF EXISTS "fk_categories_parent";

-- ============================================================================
-- PHASE 2: DROP NEW TABLES (reverse creation order)
-- ============================================================================

DROP TABLE IF EXISTS "settings"              CASCADE;
DROP TABLE IF EXISTS "notifications"         CASCADE;
DROP TABLE IF EXISTS "quotes"                CASCADE;
DROP TABLE IF EXISTS "commissions"           CASCADE;
DROP TABLE IF EXISTS "purchase_items"        CASCADE;
DROP TABLE IF EXISTS "purchases"             CASCADE;
DROP TABLE IF EXISTS "approvals"             CASCADE;
DROP TABLE IF EXISTS "payments"              CASCADE;
DROP TABLE IF EXISTS "invoices"              CASCADE;
DROP TABLE IF EXISTS "work_order_events"     CASCADE;
DROP TABLE IF EXISTS "work_order_items"      CASCADE;
DROP TABLE IF EXISTS "work_order_assignees"  CASCADE;
DROP TABLE IF EXISTS "vehicle_usage"         CASCADE;
DROP TABLE IF EXISTS "attendance"            CASCADE;
DROP TABLE IF EXISTS "personnel"             CASCADE;
DROP TABLE IF EXISTS "suppliers"             CASCADE;
DROP TABLE IF EXISTS "categories"            CASCADE;

-- ============================================================================
-- PHASE 3: DROP NEW COLUMNS FROM EXISTING TABLES
-- ============================================================================

ALTER TABLE "audit_logs"
  DROP COLUMN IF EXISTS "severity";

ALTER TABLE "inventory_items"
  DROP COLUMN IF EXISTS "isActive",
  DROP COLUMN IF EXISTS "notes",
  DROP COLUMN IF EXISTS "photos",
  DROP COLUMN IF EXISTS "customsCost",
  DROP COLUMN IF EXISTS "isImported",
  DROP COLUMN IF EXISTS "barcode",
  DROP COLUMN IF EXISTS "location",
  DROP COLUMN IF EXISTS "maxStock",
  DROP COLUMN IF EXISTS "costPrice",
  DROP COLUMN IF EXISTS "unit",
  DROP COLUMN IF EXISTS "supplierId",
  DROP COLUMN IF EXISTS "categoryId",
  DROP COLUMN IF EXISTS "description";

-- Restore inventory_items.category to NOT NULL (it was relaxed in the migration)
ALTER TABLE "inventory_items" ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "work_orders"
  DROP COLUMN IF EXISTS "updatedBy",
  DROP COLUMN IF EXISTS "createdBy",
  DROP COLUMN IF EXISTS "paymentYape",
  DROP COLUMN IF EXISTS "paymentReceivedBy",
  DROP COLUMN IF EXISTS "warrantyDays",
  DROP COLUMN IF EXISTS "signature",
  DROP COLUMN IF EXISTS "photos",
  DROP COLUMN IF EXISTS "internalNotes",
  DROP COLUMN IF EXISTS "customerNotes",
  DROP COLUMN IF EXISTS "paymentStatus",
  DROP COLUMN IF EXISTS "completedAt",
  DROP COLUMN IF EXISTS "startedAt",
  DROP COLUMN IF EXISTS "finalAmount",
  DROP COLUMN IF EXISTS "tax",
  DROP COLUMN IF EXISTS "discount",
  DROP COLUMN IF EXISTS "fuelLevel",
  DROP COLUMN IF EXISTS "odometerOut",
  DROP COLUMN IF EXISTS "odometerIn",
  DROP COLUMN IF EXISTS "recommendation",
  DROP COLUMN IF EXISTS "type",
  DROP COLUMN IF EXISTS "priority";

-- Restore work_orders.mechanicId to NOT NULL (it was relaxed in the migration)
ALTER TABLE "work_orders" ALTER COLUMN "mechanicId" SET NOT NULL;

ALTER TABLE "clients"
  DROP COLUMN IF EXISTS "deletedAt",
  DROP COLUMN IF EXISTS "isVip",
  DROP COLUMN IF EXISTS "creditBalance",
  DROP COLUMN IF EXISTS "creditLimit",
  DROP COLUMN IF EXISTS "source",
  DROP COLUMN IF EXISTS "notes",
  DROP COLUMN IF EXISTS "city",
  DROP COLUMN IF EXISTS "district",
  DROP COLUMN IF EXISTS "address",
  DROP COLUMN IF EXISTS "phone2",
  DROP COLUMN IF EXISTS "ruc",
  DROP COLUMN IF EXISTS "companyName",
  DROP COLUMN IF EXISTS "type";

ALTER TABLE "vehicles"
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "notes",
  DROP COLUMN IF EXISTS "photos",
  DROP COLUMN IF EXISTS "transmission",
  DROP COLUMN IF EXISTS "fuelType",
  DROP COLUMN IF EXISTS "mileage",
  DROP COLUMN IF EXISTS "engineCC",
  DROP COLUMN IF EXISTS "engineType",
  DROP COLUMN IF EXISTS "vin";

ALTER TABLE "refresh_tokens"
  DROP COLUMN IF EXISTS "ipAddress",
  DROP COLUMN IF EXISTS "deviceInfo";

ALTER TABLE "accounts"
  DROP COLUMN IF EXISTS "lockedUntil",
  DROP COLUMN IF EXISTS "failedAttempts",
  DROP COLUMN IF EXISTS "lastLoginIp",
  DROP COLUMN IF EXISTS "lastLoginAt";

-- ============================================================================
-- PHASE 4: DROP NEW INDEXES ON EXISTING TABLES
-- ============================================================================

DROP INDEX IF EXISTS "idx_audit_logs_severity";
DROP INDEX IF EXISTS "idx_inventory_items_isActive";
DROP INDEX IF EXISTS "idx_inventory_items_barcode";
DROP INDEX IF EXISTS "idx_inventory_items_supplierId";
DROP INDEX IF EXISTS "idx_inventory_items_categoryId";
DROP INDEX IF EXISTS "idx_inventory_items_sku";
DROP INDEX IF EXISTS "idx_work_orders_number";
DROP INDEX IF EXISTS "idx_work_orders_receivedAt";
DROP INDEX IF EXISTS "idx_work_orders_createdBy";
DROP INDEX IF EXISTS "idx_work_orders_completedAt";
DROP INDEX IF EXISTS "idx_work_orders_startedAt";
DROP INDEX IF EXISTS "idx_work_orders_paymentStatus";
DROP INDEX IF EXISTS "idx_work_orders_vehicleId";
DROP INDEX IF EXISTS "idx_work_orders_clientId";
DROP INDEX IF EXISTS "idx_work_orders_type";
DROP INDEX IF EXISTS "idx_work_orders_priority";
DROP INDEX IF EXISTS "idx_clients_isVip";
DROP INDEX IF EXISTS "idx_clients_type";
DROP INDEX IF EXISTS "idx_clients_phone";
DROP INDEX IF EXISTS "idx_clients_ruc";
DROP INDEX IF EXISTS "idx_vehicles_clientId";
DROP INDEX IF EXISTS "idx_vehicles_status";
DROP INDEX IF EXISTS "idx_vehicles_vin";
DROP INDEX IF EXISTS "idx_accounts_role";

-- ============================================================================
-- PHASE 5: DROP NEW ENUM TYPES
-- ============================================================================

DROP TYPE IF EXISTS "AuditSeverity";
DROP TYPE IF EXISTS "QuoteStatus";
DROP TYPE IF EXISTS "PurchaseStatus";
DROP TYPE IF EXISTS "ApprovalType";
DROP TYPE IF EXISTS "ApprovalStatus";
DROP TYPE IF EXISTS "PaymentChannel";
DROP TYPE IF EXISTS "InvoiceStatus";
DROP TYPE IF EXISTS "InvoiceType";
DROP TYPE IF EXISTS "ItemType";
DROP TYPE IF EXISTS "Priority";
DROP TYPE IF EXISTS "ServiceType";
DROP TYPE IF EXISTS "UsageStatus";
DROP TYPE IF EXISTS "VehicleStatus";
DROP TYPE IF EXISTS "TransmissionType";
DROP TYPE IF EXISTS "FuelType";
DROP TYPE IF EXISTS "EngineType";
DROP TYPE IF EXISTS "ClientType";
DROP TYPE IF EXISTS "AttendanceType";
DROP TYPE IF EXISTS "SalaryType";
DROP TYPE IF EXISTS "ContractType";
