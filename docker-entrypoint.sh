#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones de Prisma (migrate deploy)..."
npx prisma migrate deploy

echo "[entrypoint] Migraciones OK. Iniciando arellan-platform..."
exec node dist/src/main.js
