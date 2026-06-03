"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash("Arellan2026!", 12);
    const owners = await Promise.all([
        prisma.account.upsert({
            where: { email: "edgar@arellan.pe" },
            update: {},
            create: {
                email: "edgar@arellan.pe",
                passwordHash: hashedPassword,
                role: "OWNER",
                name: "Edgar Arellan",
                mfaEnabled: false,
            },
        }),
        prisma.account.upsert({
            where: { email: "juan@arellan.pe" },
            update: {},
            create: {
                email: "juan@arellan.pe",
                passwordHash: hashedPassword,
                role: "OWNER",
                name: "Juan Arellan",
                mfaEnabled: false,
            },
        }),
    ]);
    const admin = await prisma.account.upsert({
        where: { email: "ana@arellan.pe" },
        update: {},
        create: {
            email: "ana@arellan.pe",
            passwordHash: hashedPassword,
            role: "ADMIN",
            name: "Ana (Administradora)",
            mfaEnabled: true,
        },
    });
    const finance = await prisma.account.upsert({
        where: { email: "finanzas@arellan.pe" },
        update: {},
        create: {
            email: "finanzas@arellan.pe",
            passwordHash: hashedPassword,
            role: "FINANCE",
            name: "Finanzas Arellan",
            mfaEnabled: true,
        },
    });
    const mechanic = await prisma.account.upsert({
        where: { email: "mecanico@arellan.pe" },
        update: {},
        create: {
            email: "mecanico@arellan.pe",
            passwordHash: hashedPassword,
            role: "MECHANIC",
            name: "Mecanico Principal",
        },
    });
    const criticalItems = [
        { sku: "ACE-10W40-001", name: "Aceite Motor 10W40", category: "ACEITES", stock: 24, minStock: 5, unitPrice: 45.0 },
        { sku: "FIL-ACE-001", name: "Filtro de Aceite Generico", category: "FILTROS", stock: 30, minStock: 5, unitPrice: 25.0 },
        { sku: "PAS-DEL-001", name: "Pastillas de Freno Delanteras", category: "FRENOS", stock: 12, minStock: 3, unitPrice: 120.0 },
        { sku: "BUJ-NGK-001", name: "Bujias NGK", category: "ENCENDIDO", stock: 20, minStock: 4, unitPrice: 35.0 },
        { sku: "BAT-12V-001", name: "Bateria 12V 65Ah", category: "ELECTRICO", stock: 5, minStock: 2, unitPrice: 280.0 },
        { sku: "COR-DIS-001", name: "Correa de Distribucion Generica", category: "MOTOR", stock: 8, minStock: 2, unitPrice: 150.0 },
    ];
    for (const item of criticalItems) {
        await prisma.inventoryItem.upsert({
            where: { sku: item.sku },
            update: {},
            create: item,
        });
    }
    const testClient = await prisma.client.upsert({
        where: { dni: "12345678" },
        update: {},
        create: {
            firstName: "Cliente",
            lastName: "De Prueba",
            phone: "999888777",
            email: "cliente@example.com",
            dni: "12345678",
        },
    });
    await prisma.vehicle.upsert({
        where: { plate: "ABC-123" },
        update: {},
        create: {
            plate: "ABC-123",
            brand: "Toyota",
            model: "Hilux",
            year: 2022,
            color: "Blanco",
            clientId: testClient.id,
        },
    });
    console.log("Seed completado: 2 owners, 1 admin, 1 finance, 1 mechanic, 1 cliente, 1 vehiculo, 6 items inventario");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map