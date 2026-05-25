# arellan-reports-engine — Motor de Reportes y Exportaciones

Módulo de generación de reportes financieros, operativos y de auditoría para la Clínica Automotriz Arellan Hnos. Genera PDFs y Excel descargables desde `arellan-frontend-web`.

## Reportes Disponibles — Fase 2

### Reportes Financieros
| Reporte | Descripción | Acceso |
|---------|-------------|--------|
| Resumen mensual de caja | Ingresos, egresos, balance final por día/semana/mes | `OWNER`, `FINANCE` |
| Detalle de ingresos por método de pago | QR, POS, efectivo desglosados | `OWNER`, `FINANCE` |
| Gastos autorizados del período | Todos los gastos con aprobador y justificación | `OWNER`, `FINANCE` |
| Flujo de caja proyectado | Basado en OTs activas y pendientes | `OWNER` |
| Rentabilidad por tipo de servicio | Margen bruto por categoría de reparación | `OWNER` |

### Reportes Operativos
| Reporte | Descripción | Acceso |
|---------|-------------|--------|
| OTs del período | Lista completa con estado, mecánico, tiempo y facturación | `OWNER`, `ADMIN` |
| Productividad por mecánico | OTs completadas, tiempo promedio, calificaciones | `OWNER`, `ADMIN` |
| Inventario actual | Stock completo con valor y alertas activas | `OWNER`, `ADMIN` |
| Movimientos de inventario | Entradas y salidas del período por ítem | `OWNER`, `ADMIN` |
| Importaciones del período | Historial con proveedor, costo y margen de comisión | `OWNER` |

### Reportes de Auditoría
| Reporte | Descripción | Acceso |
|---------|-------------|--------|
| Audit log del período | Todas las acciones con usuario, IP y delta | `OWNER` |
| Accesos al módulo financiero | Quién consultó finanzas y cuándo | `OWNER` |
| Exportaciones realizadas | Log de qué reportes se generaron y por quién | `OWNER` |

## Implementación Técnica

```typescript
// Generación de PDF con @react-pdf/renderer
import { renderToBuffer } from '@react-pdf/renderer'
import { MonthlyFinanceReport } from './templates/MonthlyFinanceReport'

@Injectable()
export class ReportsEngine {
  async generateMonthlyFinancePDF(
    month: Date,
    userId: string,
    role: UserRole,
  ): Promise<Buffer> {
    const data = await this.financeService.getMonthlyReport(month)

    // Watermark con usuario que generó el reporte (anti-fuga)
    const pdf = await renderToBuffer(
      <MonthlyFinanceReport
        data={data}
        generatedBy={userId}
        generatedAt={new Date()}
        watermark={`Generado por: ${userId} — ${new Date().toISOString()}`}
      />
    )

    // Registrar exportación en audit_logs
    await this.auditService.log({
      userId,
      action: 'REPORT_EXPORTED',
      entity: 'monthly_finance_report',
      metadata: { month: month.toISOString(), format: 'PDF' }
    })

    return pdf
  }
}
```

## Generación de Excel (XLSX)

```typescript
import ExcelJS from 'exceljs'

async generateInventoryExcel(userId: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Inventario Actual')

  sheet.columns = [
    { header: 'Código', key: 'sku', width: 15 },
    { header: 'Descripción', key: 'name', width: 40 },
    { header: 'Stock Actual', key: 'stock', width: 15 },
    { header: 'Stock Mínimo', key: 'minStock', width: 15 },
    { header: 'Precio Unit. (S/.)', key: 'unitPrice', width: 20 },
    { header: 'Valor Total (S/.)', key: 'totalValue', width: 20 },
    { header: 'Estado', key: 'status', width: 15 },
  ]

  // ... llenar datos

  return workbook.xlsx.writeBuffer() as Promise<Buffer>
}
```

## Seguridad en Exportaciones

- Todas las exportaciones financieras requieren **confirmación por MFA** del solicitante
- Cada exportación genera un registro inmutable en `audit_logs`
- Los reportes tienen **watermark digital** con nombre del usuario y timestamp
- Los reportes de auditoría solo son accesibles para `OWNER`
- Los archivos generados no se almacenan permanentemente — se generan on-demand y se sirven directamente

## Jobs Programados (Fase 2)

```typescript
// Reporte de caja diario automático enviado por email a owners al cierre
@Cron('0 20 * * 1-6')  // 8 PM, lunes a sábado
async sendDailyCashboxReport() {
  const report = await this.generateDailyCashboxPDF(new Date())
  await this.notificationsService.sendEmail({
    to: ['edgar@arellan.pe', 'juan@arellan.pe'],
    subject: `Resumen de caja — ${format(new Date(), 'dd/MM/yyyy')}`,
    attachments: [{ filename: 'caja-diaria.pdf', content: report }]
  })
}
```
