-- FUN-18: enlace formal Cuenta↔Cliente para la identidad del portal CLIENT.
-- No destructiva: columna nullable + índice único + FK. Los clientes existentes
-- quedan con accountId NULL (sin cuenta de portal); las cuentas CLIENT sin
-- Client enlazado no ven ningún recurso (fail-closed en la capa de servicio).
-- Rollback: DROP CONSTRAINT clients_accountId_fkey; DROP INDEX clients_accountId_key;
--           ALTER TABLE "clients" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "clients" ADD COLUMN "accountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_accountId_key" ON "clients"("accountId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "accounts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
