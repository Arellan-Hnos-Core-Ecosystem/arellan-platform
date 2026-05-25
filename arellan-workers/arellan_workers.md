# arellan-workers — Jobs y Tareas en Background (BullMQ)

Workers de BullMQ para el procesamiento asíncrono de tareas programadas y en background del ecosistema Arellan Hnos.

## Arquitectura

```
Redis (Upstash MVP / ElastiCache producción)
│
├── Queue: notifications    → NotificationWorker
├── Queue: reports          → ReportWorker
├── Queue: backups          → BackupWorker
├── Queue: inventory-alerts → InventoryAlertWorker
├── Queue: audit-exports    → AuditExportWorker
└── Queue: cron-jobs        → CronWorker
```

## Workers Definidos

### NotificationWorker
Procesa el envío de notificaciones push, email y WhatsApp de forma asíncrona. Ver `arellan-notifications-service` para detalle de eventos.

```typescript
// Configuración de la queue
const notificationQueue = new Queue('notifications', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }
})
```

### InventoryAlertWorker
Verifica niveles de stock y dispara alertas cuando un ítem cae bajo su nivel mínimo.

```typescript
// Ejecutado cada 6 horas
@Cron('0 */6 * * *')
async checkInventoryLevels() {
  const criticalItems = await this.inventoryService.getBelowMinStock()
  for (const item of criticalItems) {
    await this.notificationsQueue.add('inventory-alert', {
      type: 'STOCK_CRITICAL',
      itemId: item.id,
      currentStock: item.stock,
      minStock: item.minStock,
    })
  }
}
```

### BackupWorker
Ejecuta backups automáticos de la base de datos.

```typescript
// Backup diario a las 2 AM
@Cron('0 2 * * *')
async dailyBackup() {
  // En MVP: Supabase maneja backups automáticos
  // En producción AWS: pg_dump → S3 con retención 30 días
  await this.backupService.createSnapshot({
    bucket: process.env.AWS_S3_BACKUP_BUCKET,
    key: `backups/arellan-db-${format(new Date(), 'yyyyMMdd-HHmmss')}.dump`,
    retentionDays: 30,
  })
}
```

### CashboxReportWorker
Genera y envía el reporte de caja diario a owners al cierre del día.

```typescript
// Lunes a sábado a las 8 PM
@Cron('0 20 * * 1-6')
async sendDailyCashboxReport() {
  const summary = await this.financeService.getDailySummary()
  await this.reportsQueue.add('daily-cashbox-pdf', { date: new Date() })
}
```

### AuditAnomalyWorker
Detecta patrones inusuales en los audit logs y dispara alertas.

```typescript
// Ejecutado cada hora
@Cron('0 * * * *')
async detectAnomalies() {
  const anomalies = await this.auditService.detectAnomalies({
    // Accesos fuera de horario laboral (antes de 7 AM o después de 9 PM)
    offHoursAccess: true,
    // Múltiples modificaciones financieras en menos de 5 minutos
    rapidFinanceChanges: { threshold: 5, window: 300 },
    // Exportaciones de datos inusuales
    unusualExports: true,
  })

  for (const anomaly of anomalies) {
    await this.notificationsQueue.add('security-alert', anomaly, { priority: 1 })
  }
}
```

### MonthlyDiscrepancyWorker
Al inicio de cada mes, genera el reporte automático de discrepancias de inventario.

```typescript
// Primer día de cada mes a las 9 AM
@Cron('0 9 1 * *')
async monthlyInventoryAudit() {
  const discrepancies = await this.inventoryService.getMonthlyDiscrepancies()
  await this.reportsQueue.add('monthly-inventory-audit', {
    month: subMonths(new Date(), 1),
    discrepancies,
  })
}
```

## Monitoreo de Queues

En producción, el estado de las queues se monitorea con:
- **BullMQ Board** — dashboard visual de jobs pendientes/completados/fallidos
- **CloudWatch** — métricas de throughput y latencia
- **Sentry** — captura de errores en workers con contexto completo

## Manejo de Fallos

- Todos los jobs tienen `attempts: 3` con backoff exponencial
- Jobs fallidos después de 3 intentos van a la Dead Letter Queue
- Alertas automáticas cuando un job crítico (notificaciones a owner, backup) falla definitivamente
- Retención de jobs fallidos por 7 días para análisis post-mortem
