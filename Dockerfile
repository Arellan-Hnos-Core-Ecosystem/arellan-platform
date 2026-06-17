# syntax=docker/dockerfile:1
# Build context: raiz del ecosistema (../ desde arellan-infrastructure)
# Necesario para resolver la dependencia file: a @arellan-hnos/business-intelligence-lab

# ---------- Stage 1: builder ----------
FROM node:24-alpine AS builder
WORKDIR /workspace

# OpenSSL requerido por los binarios nativos del Prisma engine en linux-musl
RUN apk add --no-cache openssl

# Cache de deps: package.json primero
COPY arellan-platform/package.json arellan-platform/package-lock.json ./arellan-platform/
COPY arellan-data-intelligence/arellan-business-intelligence-lab ./arellan-data-intelligence/arellan-business-intelligence-lab

WORKDIR /workspace/arellan-platform
RUN npm install --no-audit --no-fund

# Codigo fuente + Prisma schema
COPY arellan-platform/. .

RUN npx prisma generate
RUN npm run build

# ---------- Stage 2: runner ----------
FROM node:24-alpine AS runner
WORKDIR /workspace/arellan-platform
ENV NODE_ENV=production

# OpenSSL requerido en runtime por @prisma/client (linux-musl-openssl-3.0.x)
RUN apk add --no-cache openssl

COPY arellan-platform/package.json arellan-platform/package-lock.json ./
COPY --from=builder /workspace/arellan-data-intelligence/arellan-business-intelligence-lab /workspace/arellan-data-intelligence/arellan-business-intelligence-lab

# Instala dependencies de produccion — incluye la CLI de Prisma (movida a
# "dependencies") requerida por 'migrate deploy' en el entrypoint
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=builder /workspace/arellan-platform/dist ./dist
COPY --from=builder /workspace/arellan-platform/prisma ./prisma
COPY --from=builder /workspace/arellan-platform/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /workspace/arellan-platform/node_modules/@prisma ./node_modules/@prisma

COPY arellan-platform/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
