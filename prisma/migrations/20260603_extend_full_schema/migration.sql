-- Migration: 20260603_extend_full_schema
-- Description: Extend schema with 20 new enums, new columns on existing tables, 17 new tables, indexes and foreign keys

-- ============================================================================
-- PHASE 1: CREATE NEW ENUM TYPES
-- ============================================================================

CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'APPRENTICE', 'CONTRACTOR', 'TEMP');
CREATE TYPE "SalaryType" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE "AttendanceType" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'PERMISSION', 'VACATION', 'SICK_LEAVE', 'HOLIDAY');
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY');
CREATE TYPE "EngineType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'GAS');
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'GAS', 'ELECTRIC', 'HYBRID');
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTO');
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'IN_SERVICE', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'INACTIVE');
CREATE TYPE "UsageStatus" AS ENUM ('PENDING_RETURN', 'RETURNED_ON_TIME', 'RETURNED_LATE', 'OVERDUE', 'UNAUTHORIZED');
CREATE TYPE "ServiceType" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'DIAGNOSTIC', 'EMERGENCY', 'WARRANTY', 'INSPECTION');
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "ItemType" AS ENUM ('PART', 'LABOR', 'EXTERNAL_SERVICE', 'CONSUMABLE');
CREATE TYPE "InvoiceType" AS ENUM ('BOLETA', 'FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'INTERNAL');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "PaymentChannel" AS ENUM ('IN_PERSON', 'ONLINE', 'MOBILE');
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "ApprovalType" AS ENUM ('EXPENSE', 'VEHICLE_USAGE', 'SALARY_ADVANCE', 'CREDIT_NOTE', 'DISCOUNT', 'IMPORT_COMMISSION', 'INVENTORY_WRITE_OFF');
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED');
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'SECURITY_ALERT');

-- ============================================================================
-- PHASE 2: ALTER EXISTING TABLES — ADD NEW COLUMNS
-- ============================================================================

-- accounts
ALTER TABLE "accounts"
  ADD COLUMN IF NOT EXISTS "lastLoginAt"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastLoginIp"    TEXT,
  ADD COLUMN IF NOT EXISTS "failedAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lockedUntil"    TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "idx_accounts_role" ON "accounts"("role");

-- refresh_tokens
ALTER TABLE "refresh_tokens"
  ADD COLUMN IF NOT EXISTS "deviceInfo" TEXT,
  ADD COLUMN IF NOT EXISTS "ipAddress"  TEXT;

-- vehicles
ALTER TABLE "vehicles"
  ADD COLUMN IF NOT EXISTS "vin"          TEXT,
  ADD COLUMN IF NOT EXISTS "engineType"   "EngineType"      NOT NULL DEFAULT 'GASOLINE',
  ADD COLUMN IF NOT EXISTS "engineCC"     INTEGER,
  ADD COLUMN IF NOT EXISTS "mileage"      INTEGER,
  ADD COLUMN IF NOT EXISTS "fuelType"     "FuelType"        NOT NULL DEFAULT 'GASOLINE',
  ADD COLUMN IF NOT EXISTS "transmission" "TransmissionType" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "photos"       TEXT[],
  ADD COLUMN IF NOT EXISTS "notes"        TEXT,
  ADD COLUMN IF NOT EXISTS "status"       "VehicleStatus"   NOT NULL DEFAULT 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS "idx_vehicles_vin"    ON "vehicles"("vin") WHERE "vin" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_vehicles_status"         ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "idx_vehicles_clientId"       ON "vehicles"("clientId");

-- clients
ALTER TABLE "clients"
  ADD COLUMN IF NOT EXISTS "type"          "ClientType" NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN IF NOT EXISTS "companyName"   TEXT,
  ADD COLUMN IF NOT EXISTS "ruc"           TEXT,
  ADD COLUMN IF NOT EXISTS "phone2"        TEXT,
  ADD COLUMN IF NOT EXISTS "address"       TEXT,
  ADD COLUMN IF NOT EXISTS "district"      TEXT,
  ADD COLUMN IF NOT EXISTS "city"          TEXT         NOT NULL DEFAULT 'Lima',
  ADD COLUMN IF NOT EXISTS "notes"         TEXT,
  ADD COLUMN IF NOT EXISTS "source"        TEXT,
  ADD COLUMN IF NOT EXISTS "creditLimit"   DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "creditBalance" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "isVip"         BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt"     TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_clients_ruc"   ON "clients"("ruc")   WHERE "ruc" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_clients_phone"         ON "clients"("phone");
CREATE INDEX IF NOT EXISTS "idx_clients_type"          ON "clients"("type");
CREATE INDEX IF NOT EXISTS "idx_clients_isVip"         ON "clients"("isVip") WHERE "isVip" = true;

-- work_orders
ALTER TABLE "work_orders"
  ADD COLUMN IF NOT EXISTS "priority"          "Priority"      NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS "type"              "ServiceType"   NOT NULL DEFAULT 'CORRECTIVE',
  ADD COLUMN IF NOT EXISTS "recommendation"    TEXT,
  ADD COLUMN IF NOT EXISTS "odometerIn"        INTEGER,
  ADD COLUMN IF NOT EXISTS "odometerOut"       INTEGER,
  ADD COLUMN IF NOT EXISTS "fuelLevel"         TEXT,
  ADD COLUMN IF NOT EXISTS "discount"          DECIMAL(10, 2)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tax"               DECIMAL(10, 2)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "finalAmount"       DECIMAL(10, 2)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "startedAt"         TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completedAt"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentStatus"     "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "customerNotes"     TEXT,
  ADD COLUMN IF NOT EXISTS "internalNotes"     TEXT,
  ADD COLUMN IF NOT EXISTS "photos"            TEXT[],
  ADD COLUMN IF NOT EXISTS "signature"         TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyDays"      INTEGER         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paymentReceivedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentYape"       TEXT,
  ADD COLUMN IF NOT EXISTS "createdBy"         TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy"         TEXT;

-- work_orders: make mechanicId nullable (align with prisma schema)
ALTER TABLE "work_orders" ALTER COLUMN "mechanicId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_work_orders_priority"       ON "work_orders"("priority");
CREATE INDEX IF NOT EXISTS "idx_work_orders_type"           ON "work_orders"("type");
CREATE INDEX IF NOT EXISTS "idx_work_orders_clientId"       ON "work_orders"("clientId");
CREATE INDEX IF NOT EXISTS "idx_work_orders_vehicleId"      ON "work_orders"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_work_orders_paymentStatus"  ON "work_orders"("paymentStatus");
CREATE INDEX IF NOT EXISTS "idx_work_orders_startedAt"      ON "work_orders"("startedAt");
CREATE INDEX IF NOT EXISTS "idx_work_orders_completedAt"    ON "work_orders"("completedAt");
CREATE INDEX IF NOT EXISTS "idx_work_orders_createdBy"      ON "work_orders"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_work_orders_receivedAt"     ON "work_orders"("receivedAt");
CREATE INDEX IF NOT EXISTS "idx_work_orders_number"         ON "work_orders"("number");

-- inventory_items: add new columns (keep old 'category' TEXT column for backward compat)
ALTER TABLE "inventory_items"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "categoryId"  TEXT,
  ADD COLUMN IF NOT EXISTS "supplierId"  TEXT,
  ADD COLUMN IF NOT EXISTS "unit"        TEXT            NOT NULL DEFAULT 'unit',
  ADD COLUMN IF NOT EXISTS "costPrice"   DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "maxStock"    INTEGER         NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "location"    TEXT,
  ADD COLUMN IF NOT EXISTS "barcode"     TEXT,
  ADD COLUMN IF NOT EXISTS "isImported"  BOOLEAN         NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "customsCost" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "photos"      TEXT[],
  ADD COLUMN IF NOT EXISTS "notes"       TEXT,
  ADD COLUMN IF NOT EXISTS "isActive"    BOOLEAN         NOT NULL DEFAULT true;

-- Make old category column nullable so it can coexist with categoryId FK
ALTER TABLE "inventory_items" ALTER COLUMN "category" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_inventory_items_sku"         ON "inventory_items"("sku");
CREATE INDEX IF NOT EXISTS "idx_inventory_items_categoryId"  ON "inventory_items"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_inventory_items_supplierId"  ON "inventory_items"("supplierId");
CREATE INDEX IF NOT EXISTS "idx_inventory_items_barcode"     ON "inventory_items"("barcode") WHERE "barcode" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_inventory_items_isActive"    ON "inventory_items"("isActive") WHERE "isActive" = true;

-- audit_logs
ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO';

CREATE INDEX IF NOT EXISTS "idx_audit_logs_severity" ON "audit_logs"("severity");

-- ============================================================================
-- PHASE 3: CREATE NEW TABLES
-- ============================================================================

-- categories (tree structure for inventory categorization)
CREATE TABLE "categories" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "parentId"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_categories_name" ON "categories"("name");
CREATE INDEX "idx_categories_parentId"     ON "categories"("parentId");

-- suppliers
CREATE TABLE "suppliers" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "contactName"    TEXT,
    "phone"          TEXT,
    "email"          TEXT,
    "address"        TEXT,
    "ruc"            TEXT,
    "website"        TEXT,
    "paymentTerms"   TEXT,
    "notes"          TEXT,
    "isImporter"     BOOLEAN      NOT NULL DEFAULT false,
    "commissionRate" DECIMAL(5, 2),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"      TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_suppliers_ruc"  ON "suppliers"("ruc") WHERE "ruc" IS NOT NULL;
CREATE INDEX "idx_suppliers_name"         ON "suppliers"("name");

-- personnel
CREATE TABLE "personnel" (
    "id"             TEXT          NOT NULL,
    "accountId"      TEXT          NOT NULL,
    "firstName"      TEXT          NOT NULL,
    "lastName"       TEXT          NOT NULL,
    "dni"            TEXT          NOT NULL,
    "phone"          TEXT,
    "emergencyPhone" TEXT,
    "address"        TEXT,
    "birthDate"      TIMESTAMP(3),
    "nationality"    TEXT          NOT NULL DEFAULT 'PE',
    "contractType"   "ContractType" NOT NULL DEFAULT 'FULL_TIME',
    "position"       TEXT          NOT NULL,
    "department"     TEXT,
    "salary"         DECIMAL(10, 2) NOT NULL,
    "salaryType"     "SalaryType"  NOT NULL DEFAULT 'MONTHLY',
    "startDate"      TIMESTAMP(3)  NOT NULL,
    "endDate"        TIMESTAMP(3),
    "photo"          TEXT,
    "documents"      JSONB,
    "notes"          TEXT,
    "createdAt"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"      TIMESTAMP(3),

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_personnel_dni"        ON "personnel"("dni");
CREATE UNIQUE INDEX "idx_personnel_accountId"  ON "personnel"("accountId");
CREATE INDEX "idx_personnel_department"         ON "personnel"("department");

-- attendance
CREATE TABLE "attendance" (
    "id"          TEXT            NOT NULL,
    "personnelId" TEXT            NOT NULL,
    "date"        DATE            NOT NULL,
    "checkIn"     TIMESTAMP(3),
    "checkOut"    TIMESTAMP(3),
    "type"        "AttendanceType" NOT NULL DEFAULT 'PRESENT',
    "notes"       TEXT,
    "verifiedBy"  TEXT,
    "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_attendance_personnel_date" ON "attendance"("personnelId", "date");
CREATE INDEX "idx_attendance_date"                   ON "attendance"("date");

-- vehicle_usage
CREATE TABLE "vehicle_usage" (
    "id"              TEXT          NOT NULL,
    "vehicleId"       TEXT          NOT NULL,
    "personnelId"     TEXT          NOT NULL,
    "authorizedBy"    TEXT,
    "purpose"         TEXT          NOT NULL,
    "destination"     TEXT,
    "odometerOut"     INTEGER,
    "odometerIn"      INTEGER,
    "checkoutAt"      TIMESTAMP(3)  NOT NULL,
    "expectedReturn"  TIMESTAMP(3)  NOT NULL,
    "returnAt"        TIMESTAMP(3),
    "status"          "UsageStatus" NOT NULL DEFAULT 'PENDING_RETURN',
    "notes"           TEXT,
    "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_usage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_vehicle_usage_vehicleId"    ON "vehicle_usage"("vehicleId");
CREATE INDEX "idx_vehicle_usage_personnelId"  ON "vehicle_usage"("personnelId");
CREATE INDEX "idx_vehicle_usage_checkoutAt"   ON "vehicle_usage"("checkoutAt");

-- work_order_assignees
CREATE TABLE "work_order_assignees" (
    "id"          TEXT         NOT NULL,
    "workOrderId" TEXT         NOT NULL,
    "personnelId" TEXT         NOT NULL,
    "role"        TEXT         NOT NULL DEFAULT 'MECHANIC',
    "assignedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "work_order_assignees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_wo_assignees_wo_personnel" ON "work_order_assignees"("workOrderId", "personnelId");

-- work_order_items
CREATE TABLE "work_order_items" (
    "id"          TEXT           NOT NULL,
    "workOrderId" TEXT           NOT NULL,
    "type"        "ItemType"     NOT NULL DEFAULT 'PART',
    "itemId"      TEXT,
    "description" TEXT           NOT NULL,
    "quantity"    DECIMAL(10, 3) NOT NULL,
    "unitPrice"   DECIMAL(10, 2) NOT NULL,
    "totalPrice"  DECIMAL(10, 2) NOT NULL,
    "discount"    DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "notes"       TEXT,
    "createdAt"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_wo_items_workOrderId" ON "work_order_items"("workOrderId");
CREATE INDEX "idx_wo_items_itemId"      ON "work_order_items"("itemId");

-- work_order_events
CREATE TABLE "work_order_events" (
    "id"          TEXT         NOT NULL,
    "workOrderId" TEXT         NOT NULL,
    "event"       TEXT         NOT NULL,
    "description" TEXT,
    "metadata"    JSONB,
    "userId"      TEXT         NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_wo_events_workOrderId" ON "work_order_events"("workOrderId");
CREATE INDEX "idx_wo_events_createdAt"   ON "work_order_events"("createdAt");

-- invoices
CREATE TABLE "invoices" (
    "id"           TEXT           NOT NULL,
    "number"       TEXT           NOT NULL,
    "workOrderId"  TEXT,
    "clientId"     TEXT           NOT NULL,
    "type"         "InvoiceType"  NOT NULL DEFAULT 'BOLETA',
    "status"       "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal"     DECIMAL(10, 2) NOT NULL,
    "tax"          DECIMAL(10, 2) NOT NULL,
    "discount"     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "total"        DECIMAL(10, 2) NOT NULL,
    "paidAmount"   DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "dueAmount"    DECIMAL(10, 2) NOT NULL,
    "dueDate"      TIMESTAMP(3),
    "notes"        TEXT,
    "issuedAt"     TIMESTAMP(3),
    "paidAt"       TIMESTAMP(3),
    "cancelledAt"  TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdBy"    TEXT           NOT NULL,
    "approvedBy"   TEXT,
    "createdAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_invoices_number"      ON "invoices"("number");
CREATE UNIQUE INDEX "idx_invoices_workOrderId" ON "invoices"("workOrderId") WHERE "workOrderId" IS NOT NULL;
CREATE INDEX "idx_invoices_clientId"            ON "invoices"("clientId");
CREATE INDEX "idx_invoices_status"              ON "invoices"("status");

-- payments
CREATE TABLE "payments" (
    "id"             TEXT            NOT NULL,
    "invoiceId"      TEXT,
    "workOrderId"    TEXT,
    "method"         "PaymentMethod" NOT NULL,
    "amount"         DECIMAL(10, 2)  NOT NULL,
    "reference"      TEXT,
    "receivedBy"     TEXT            NOT NULL,
    "verifiedBy"     TEXT,
    "channel"        "PaymentChannel" NOT NULL DEFAULT 'IN_PERSON',
    "isPersonalYape" BOOLEAN         NOT NULL DEFAULT false,
    "yapeAccount"    TEXT,
    "notes"          TEXT,
    "receiptUrl"     TEXT,
    "paidAt"         TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_payments_invoiceId"   ON "payments"("invoiceId");
CREATE INDEX "idx_payments_workOrderId" ON "payments"("workOrderId");
CREATE INDEX "idx_payments_method"      ON "payments"("method");
CREATE INDEX "idx_payments_paidAt"      ON "payments"("paidAt");

-- approvals
CREATE TABLE "approvals" (
    "id"              TEXT            NOT NULL,
    "type"            "ApprovalType"  NOT NULL,
    "status"          "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "title"           TEXT            NOT NULL,
    "description"     TEXT            NOT NULL,
    "amount"          DECIMAL(10, 2),
    "requestedById"   TEXT            NOT NULL,
    "approvedById"    TEXT,
    "expenseId"       TEXT,
    "reason"          TEXT,
    "rejectionReason" TEXT,
    "expiresAt"       TIMESTAMP(3),
    "approvedAt"      TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_approvals_expenseId" ON "approvals"("expenseId") WHERE "expenseId" IS NOT NULL;
CREATE INDEX "idx_approvals_status"           ON "approvals"("status");
CREATE INDEX "idx_approvals_requestedById"    ON "approvals"("requestedById");
CREATE INDEX "idx_approvals_type"             ON "approvals"("type");

-- purchases
CREATE TABLE "purchases" (
    "id"               TEXT           NOT NULL,
    "number"           TEXT           NOT NULL,
    "supplierId"       TEXT           NOT NULL,
    "status"           "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal"         DECIMAL(10, 2) NOT NULL,
    "tax"              DECIMAL(10, 2) NOT NULL,
    "shipping"         DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "customs"          DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "total"            DECIMAL(10, 2) NOT NULL,
    "currency"         TEXT           NOT NULL DEFAULT 'PEN',
    "commissionPaid"   BOOLEAN        NOT NULL DEFAULT false,
    "commissionAmount" DECIMAL(10, 2),
    "commissionTo"     TEXT,
    "isImported"       BOOLEAN        NOT NULL DEFAULT false,
    "notes"            TEXT,
    "orderedAt"        TIMESTAMP(3),
    "expectedAt"       TIMESTAMP(3),
    "receivedAt"       TIMESTAMP(3),
    "createdBy"        TEXT           NOT NULL,
    "approvedBy"       TEXT,
    "createdAt"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_purchases_number" ON "purchases"("number");
CREATE INDEX "idx_purchases_supplierId"     ON "purchases"("supplierId");
CREATE INDEX "idx_purchases_status"         ON "purchases"("status");

-- purchase_items
CREATE TABLE "purchase_items" (
    "id"          TEXT           NOT NULL,
    "purchaseId"  TEXT           NOT NULL,
    "itemId"      TEXT           NOT NULL,
    "quantity"    INTEGER        NOT NULL,
    "unitCost"    DECIMAL(10, 2) NOT NULL,
    "totalCost"   DECIMAL(10, 2) NOT NULL,
    "receivedQty" INTEGER        NOT NULL DEFAULT 0,
    "notes"       TEXT,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_purchase_items_purchaseId" ON "purchase_items"("purchaseId");
CREATE INDEX "idx_purchase_items_itemId"     ON "purchase_items"("itemId");

-- commissions
CREATE TABLE "commissions" (
    "id"          TEXT            NOT NULL,
    "personnelId" TEXT            NOT NULL,
    "supplierId"  TEXT,
    "purchaseId"  TEXT,
    "type"        TEXT            NOT NULL,
    "amount"      DECIMAL(10, 2)  NOT NULL,
    "percentage"  DECIMAL(5, 2),
    "status"      "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes"       TEXT,
    "paidAt"      TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_commissions_personnelId" ON "commissions"("personnelId");
CREATE INDEX "idx_commissions_purchaseId"  ON "commissions"("purchaseId");

-- quotes
CREATE TABLE "quotes" (
    "id"              TEXT          NOT NULL,
    "number"          TEXT          NOT NULL,
    "clientId"        TEXT          NOT NULL,
    "workOrderId"     TEXT,
    "status"          "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil"      TIMESTAMP(3)  NOT NULL,
    "subtotal"        DECIMAL(10, 2) NOT NULL,
    "tax"             DECIMAL(10, 2) NOT NULL,
    "total"           DECIMAL(10, 2) NOT NULL,
    "notes"           TEXT,
    "createdBy"       TEXT          NOT NULL,
    "approvedAt"      TIMESTAMP(3),
    "rejectedAt"      TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_quotes_number"      ON "quotes"("number");
CREATE UNIQUE INDEX "idx_quotes_workOrderId" ON "quotes"("workOrderId") WHERE "workOrderId" IS NOT NULL;
CREATE INDEX "idx_quotes_clientId"            ON "quotes"("clientId");
CREATE INDEX "idx_quotes_status"              ON "quotes"("status");

-- notifications
CREATE TABLE "notifications" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "type"      TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "body"      TEXT         NOT NULL,
    "data"      JSONB,
    "isRead"    BOOLEAN      NOT NULL DEFAULT false,
    "readAt"    TIMESTAMP(3),
    "priority"  TEXT         NOT NULL DEFAULT 'NORMAL',
    "channel"   TEXT         NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_notifications_userId"    ON "notifications"("userId");
CREATE INDEX "idx_notifications_isRead"    ON "notifications"("isRead");
CREATE INDEX "idx_notifications_createdAt" ON "notifications"("createdAt");

-- settings
CREATE TABLE "settings" (
    "id"        TEXT         NOT NULL,
    "key"       TEXT         NOT NULL,
    "value"     TEXT         NOT NULL,
    "category"  TEXT         NOT NULL DEFAULT 'GENERAL',
    "isPublic"  BOOLEAN      NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_settings_key"       ON "settings"("key");
CREATE INDEX "idx_settings_category"          ON "settings"("category");

-- ============================================================================
-- PHASE 4: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- categories → categories (self-referencing tree)
ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_parent"
    FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- inventory_items → categories
ALTER TABLE "inventory_items" ADD CONSTRAINT "fk_inventory_items_category"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- inventory_items → suppliers
ALTER TABLE "inventory_items" ADD CONSTRAINT "fk_inventory_items_supplier"
    FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- work_orders → accounts (createdBy)
ALTER TABLE "work_orders" ADD CONSTRAINT "fk_work_orders_createdBy"
    FOREIGN KEY ("createdBy") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- work_orders → accounts (updatedBy)
ALTER TABLE "work_orders" ADD CONSTRAINT "fk_work_orders_updatedBy"
    FOREIGN KEY ("updatedBy") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- personnel → accounts
ALTER TABLE "personnel" ADD CONSTRAINT "fk_personnel_account"
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- attendance → personnel
ALTER TABLE "attendance" ADD CONSTRAINT "fk_attendance_personnel"
    FOREIGN KEY ("personnelId") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- vehicle_usage → vehicles
ALTER TABLE "vehicle_usage" ADD CONSTRAINT "fk_vehicle_usage_vehicle"
    FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- vehicle_usage → personnel
ALTER TABLE "vehicle_usage" ADD CONSTRAINT "fk_vehicle_usage_personnel"
    FOREIGN KEY ("personnelId") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- work_order_assignees → work_orders
ALTER TABLE "work_order_assignees" ADD CONSTRAINT "fk_wo_assignees_workOrder"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- work_order_assignees → personnel
ALTER TABLE "work_order_assignees" ADD CONSTRAINT "fk_wo_assignees_personnel"
    FOREIGN KEY ("personnelId") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- work_order_items → work_orders
ALTER TABLE "work_order_items" ADD CONSTRAINT "fk_wo_items_workOrder"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- work_order_items → inventory_items
ALTER TABLE "work_order_items" ADD CONSTRAINT "fk_wo_items_inventory"
    FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- work_order_events → work_orders
ALTER TABLE "work_order_events" ADD CONSTRAINT "fk_wo_events_workOrder"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- invoices → work_orders
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_workOrder"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- invoices → clients
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_client"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- payments → invoices
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_invoice"
    FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- payments → work_orders
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_workOrder"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- approvals → accounts (requestedBy)
ALTER TABLE "approvals" ADD CONSTRAINT "fk_approvals_requestedBy"
    FOREIGN KEY ("requestedById") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- approvals → accounts (approvedBy)
ALTER TABLE "approvals" ADD CONSTRAINT "fk_approvals_approvedBy"
    FOREIGN KEY ("approvedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- approvals → expense_authorizations
ALTER TABLE "approvals" ADD CONSTRAINT "fk_approvals_expense"
    FOREIGN KEY ("expenseId") REFERENCES "expense_authorizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- purchases → suppliers
ALTER TABLE "purchases" ADD CONSTRAINT "fk_purchases_supplier"
    FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- purchase_items → purchases
ALTER TABLE "purchase_items" ADD CONSTRAINT "fk_purchase_items_purchase"
    FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- purchase_items → inventory_items
ALTER TABLE "purchase_items" ADD CONSTRAINT "fk_purchase_items_inventory"
    FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- commissions → personnel
ALTER TABLE "commissions" ADD CONSTRAINT "fk_commissions_personnel"
    FOREIGN KEY ("personnelId") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- commissions → suppliers
ALTER TABLE "commissions" ADD CONSTRAINT "fk_commissions_supplier"
    FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- commissions → purchases
ALTER TABLE "commissions" ADD CONSTRAINT "fk_commissions_purchase"
    FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- quotes → clients
ALTER TABLE "quotes" ADD CONSTRAINT "fk_quotes_client"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- quotes → work_orders
ALTER TABLE "quotes" ADD CONSTRAINT "fk_quotes_workOrder"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
