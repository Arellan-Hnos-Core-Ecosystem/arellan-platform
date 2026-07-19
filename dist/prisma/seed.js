"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
function dt(date, time = "08:00") {
    return new Date(`${date}T${time}:00.000-05:00`);
}
function daysAgo(n, h = 8, m = 0) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(h, m, 0, 0);
    return d;
}
async function main() {
    console.log("Iniciando seed Arellan Hnos...\n");
    const hash = await bcrypt.hash("Arellan2026!", 12);
    console.log("Creando cuentas...");
    const ed = await prisma.account.upsert({
        where: { email: "edgar@arellanautos.pe" },
        update: { passwordHash: hash, role: "OWNER", name: "Edgar Arellan" },
        create: { email: "edgar@arellanautos.pe", passwordHash: hash, role: "OWNER", name: "Edgar Arellan" },
    });
    const ju = await prisma.account.upsert({
        where: { email: "juan@arellanautos.pe" },
        update: { passwordHash: hash, role: "OWNER", name: "Juan Arellan" },
        create: { email: "juan@arellanautos.pe", passwordHash: hash, role: "OWNER", name: "Juan Arellan" },
    });
    const an = await prisma.account.upsert({
        where: { email: "ana@arellanautos.pe" },
        update: { passwordHash: hash, role: "ADMIN", name: "Ana Arellan" },
        create: { email: "ana@arellanautos.pe", passwordHash: hash, role: "ADMIN", name: "Ana Arellan" },
    });
    const so = await prisma.account.upsert({
        where: { email: "finanzas@arellanautos.pe" },
        update: { passwordHash: hash, role: "FINANCE", name: "Sofía Arellan" },
        create: { email: "finanzas@arellanautos.pe", passwordHash: hash, role: "FINANCE", name: "Sofía Arellan" },
    });
    const ca = await prisma.account.upsert({
        where: { email: "mecanico1@arellanautos.pe" },
        update: { passwordHash: hash, role: "MECHANIC", name: "Carlos Quispe" },
        create: { email: "mecanico1@arellanautos.pe", passwordHash: hash, role: "MECHANIC", name: "Carlos Quispe" },
    });
    const lu = await prisma.account.upsert({
        where: { email: "mecanico2@arellanautos.pe" },
        update: { passwordHash: hash, role: "MECHANIC", name: "Luis Mamani" },
        create: { email: "mecanico2@arellanautos.pe", passwordHash: hash, role: "MECHANIC", name: "Luis Mamani" },
    });
    const mi = await prisma.account.upsert({
        where: { email: "practicante@arellanautos.pe" },
        update: { passwordHash: hash, role: "TRAINEE", name: "Miguel Torres" },
        create: { email: "practicante@arellanautos.pe", passwordHash: hash, role: "TRAINEE", name: "Miguel Torres" },
    });
    console.log("  OK 7 cuentas");
    console.log("Creando personal...");
    const pe = await prisma.personnel.upsert({
        where: { dni: "40852163" },
        update: { accountId: ed.id, firstName: "Edgar", lastName: "Arellan", phone: "987654321", emergencyPhone: "987654320", address: "Av. Arequipa 1234, Miraflores", contractType: "FULL_TIME", position: "Gerente General", department: "Gerencia", salary: 5000, startDate: new Date("2023-01-15T00:00:00-05:00") },
        create: { accountId: ed.id, firstName: "Edgar", lastName: "Arellan", dni: "40852163", phone: "987654321", emergencyPhone: "987654320", address: "Av. Arequipa 1234, Miraflores", contractType: "FULL_TIME", position: "Gerente General", department: "Gerencia", salary: 5000, salaryType: "MONTHLY", startDate: new Date("2023-01-15T00:00:00-05:00") },
    });
    const pj = await prisma.personnel.upsert({
        where: { dni: "40852164" },
        update: { accountId: ju.id, firstName: "Juan", lastName: "Arellan", phone: "987654322", emergencyPhone: "987654321", address: "Jr. Puno 567, Surquillo", contractType: "FULL_TIME", position: "Jefe de Taller", department: "Operaciones", salary: 4500, startDate: new Date("2023-01-15T00:00:00-05:00") },
        create: { accountId: ju.id, firstName: "Juan", lastName: "Arellan", dni: "40852164", phone: "987654322", emergencyPhone: "987654321", address: "Jr. Puno 567, Surquillo", contractType: "FULL_TIME", position: "Jefe de Taller", department: "Operaciones", salary: 4500, salaryType: "MONTHLY", startDate: new Date("2023-01-15T00:00:00-05:00") },
    });
    const pa = await prisma.personnel.upsert({
        where: { dni: "40852165" },
        update: { accountId: an.id, firstName: "Ana", lastName: "Arellan", phone: "987654323", emergencyPhone: "987654322", address: "Av. Benavides 890, Miraflores", contractType: "FULL_TIME", position: "Administradora", department: "Administración", salary: 3500, startDate: new Date("2023-03-01T00:00:00-05:00") },
        create: { accountId: an.id, firstName: "Ana", lastName: "Arellan", dni: "40852165", phone: "987654323", emergencyPhone: "987654322", address: "Av. Benavides 890, Miraflores", contractType: "FULL_TIME", position: "Administradora", department: "Administración", salary: 3500, salaryType: "MONTHLY", startDate: new Date("2023-03-01T00:00:00-05:00") },
    });
    const ps = await prisma.personnel.upsert({
        where: { dni: "40852166" },
        update: { accountId: so.id, firstName: "Sofía", lastName: "Arellan", phone: "987654324", emergencyPhone: "987654323", address: "Calle Los Olivos 234, San Isidro", contractType: "FULL_TIME", position: "Jefe Financiero", department: "Finanzas", salary: 4000, startDate: new Date("2023-06-01T00:00:00-05:00") },
        create: { accountId: so.id, firstName: "Sofía", lastName: "Arellan", dni: "40852166", phone: "987654324", emergencyPhone: "987654323", address: "Calle Los Olivos 234, San Isidro", contractType: "FULL_TIME", position: "Jefe Financiero", department: "Finanzas", salary: 4000, salaryType: "MONTHLY", startDate: new Date("2023-06-01T00:00:00-05:00") },
    });
    const pc = await prisma.personnel.upsert({
        where: { dni: "45879231" },
        update: { accountId: ca.id, firstName: "Carlos", lastName: "Quispe", pin: "147258", phone: "912345678", emergencyPhone: "912345670", address: "Av. Primavera 456, Surquillo", contractType: "FULL_TIME", position: "Mecánico Senior", department: "Taller", salary: 3500, startDate: new Date("2024-01-10T00:00:00-05:00") },
        create: { accountId: ca.id, firstName: "Carlos", lastName: "Quispe", dni: "45879231", pin: "147258", phone: "912345678", emergencyPhone: "912345670", address: "Av. Primavera 456, Surquillo", contractType: "FULL_TIME", position: "Mecánico Senior", department: "Taller", salary: 3500, salaryType: "MONTHLY", startDate: new Date("2024-01-10T00:00:00-05:00") },
    });
    const pl = await prisma.personnel.upsert({
        where: { dni: "45879232" },
        update: { accountId: lu.id, firstName: "Luis", lastName: "Mamani", pin: "258369", phone: "912345679", emergencyPhone: "912345671", address: "Calle 8 789, Chorrillos", contractType: "FULL_TIME", position: "Mecánico Junior", department: "Taller", salary: 2500, startDate: new Date("2024-03-15T00:00:00-05:00") },
        create: { accountId: lu.id, firstName: "Luis", lastName: "Mamani", dni: "45879232", pin: "258369", phone: "912345679", emergencyPhone: "912345671", address: "Calle 8 789, Chorrillos", contractType: "FULL_TIME", position: "Mecánico Junior", department: "Taller", salary: 2500, salaryType: "MONTHLY", startDate: new Date("2024-03-15T00:00:00-05:00") },
    });
    const pm = await prisma.personnel.upsert({
        where: { dni: "73214589" },
        update: { accountId: mi.id, firstName: "Miguel", lastName: "Torres", pin: "369147", phone: "923456780", emergencyPhone: "923456781", address: "Jr. Las Flores 321, San Borja", contractType: "APPRENTICE", position: "Practicante", department: "Taller", salary: 1025, startDate: new Date("2024-06-01T00:00:00-05:00") },
        create: { accountId: mi.id, firstName: "Miguel", lastName: "Torres", dni: "73214589", pin: "369147", phone: "923456780", emergencyPhone: "923456781", address: "Jr. Las Flores 321, San Borja", contractType: "APPRENTICE", position: "Practicante", department: "Taller", salary: 1025, salaryType: "MONTHLY", startDate: new Date("2024-06-01T00:00:00-05:00") },
    });
    console.log("  OK 7 personal");
    console.log("Creando proveedores...");
    const s1 = await prisma.supplier.upsert({
        where: { id: "supplier-001" },
        update: { name: "Importaciones Automotriz del Sur S.A.C.", contactName: "Ricardo Shimabukuro", phone: "945123456", email: "ventas@importacionsur.pe", address: "Av. Argentina 3456, Cercado de Lima", isImporter: false, paymentTerms: "30 días" },
        create: { id: "supplier-001", name: "Importaciones Automotriz del Sur S.A.C.", contactName: "Ricardo Shimabukuro", phone: "945123456", email: "ventas@importacionsur.pe", address: "Av. Argentina 3456, Cercado de Lima", ruc: "20123456781", isImporter: false, paymentTerms: "30 días" },
    });
    const s2 = await prisma.supplier.upsert({
        where: { id: "supplier-002" },
        update: { name: "Repuestos Lima E.I.R.L.", contactName: "Carmen Vargas", phone: "946234567", email: "info@repuestoslima.pe", address: "Jr. Parinacochas 1234, La Victoria", isImporter: false, paymentTerms: "Contado" },
        create: { id: "supplier-002", name: "Repuestos Lima E.I.R.L.", contactName: "Carmen Vargas", phone: "946234567", email: "info@repuestoslima.pe", address: "Jr. Parinacochas 1234, La Victoria", ruc: "20123456782", isImporter: false, paymentTerms: "Contado" },
    });
    const s3 = await prisma.supplier.upsert({
        where: { id: "supplier-003" },
        update: { name: "Global Auto Parts S.A.C.", contactName: "Kenji Tanaka", phone: "947345678", email: "pedidos@globalautoparts.com", address: "Av. Materiales 567, Cercado de Lima", isImporter: true, paymentTerms: "45 días", commissionRate: 3.5 },
        create: { id: "supplier-003", name: "Global Auto Parts S.A.C.", contactName: "Kenji Tanaka", phone: "947345678", email: "pedidos@globalautoparts.com", address: "Av. Materiales 567, Cercado de Lima", ruc: "20123456783", isImporter: true, paymentTerms: "45 días", commissionRate: 3.5 },
    });
    const s4 = await prisma.supplier.upsert({
        where: { id: "supplier-004" },
        update: { name: "Lubricantes Nacionales S.A.C.", contactName: "Walter Huamán", phone: "948456789", email: "contacto@lubrinac.pe", address: "Av. Venezuela 2345, Cercado de Lima", isImporter: false, paymentTerms: "15 días" },
        create: { id: "supplier-004", name: "Lubricantes Nacionales S.A.C.", contactName: "Walter Huamán", phone: "948456789", email: "contacto@lubrinac.pe", address: "Av. Venezuela 2345, Cercado de Lima", ruc: "20123456784", isImporter: false, paymentTerms: "15 días" },
    });
    const s5 = await prisma.supplier.upsert({
        where: { id: "supplier-005" },
        update: { name: "Filtros y Componentes Perú S.A.", contactName: "Marisol Quispe", phone: "949567891", email: "ventas@filtrosyperu.pe", address: "Av. Colonial 890, Cercado de Lima", isImporter: false, paymentTerms: "Contado" },
        create: { id: "supplier-005", name: "Filtros y Componentes Perú S.A.", contactName: "Marisol Quispe", phone: "949567891", email: "ventas@filtrosyperu.pe", address: "Av. Colonial 890, Cercado de Lima", ruc: "20123456785", isImporter: false, paymentTerms: "Contado" },
    });
    const s6 = await prisma.supplier.upsert({
        where: { id: "supplier-006" },
        update: { name: "Eléctricos Automotrices Lima S.A.C.", contactName: "Julio Sánchez", phone: "950678912", email: "pedidos@electricosautos.pe", address: "Jr. Amazonas 456, La Victoria", isImporter: false, paymentTerms: "30 días" },
        create: { id: "supplier-006", name: "Eléctricos Automotrices Lima S.A.C.", contactName: "Julio Sánchez", phone: "950678912", email: "pedidos@electricosautos.pe", address: "Jr. Amazonas 456, La Victoria", ruc: "20123456786", isImporter: false, paymentTerms: "30 días" },
    });
    console.log("  OK 6 proveedores");
    console.log("Creando categorías...");
    const catA = await prisma.category.upsert({ where: { name: "Aceites" }, update: { description: "Aceites de motor, transmisión, hidráulicos y refrigerantes" }, create: { name: "Aceites", description: "Aceites de motor, transmisión, hidráulicos y refrigerantes" } });
    const catF = await prisma.category.upsert({ where: { name: "Filtros" }, update: { description: "Filtros de aceite, aire, combustible y cabina" }, create: { name: "Filtros", description: "Filtros de aceite, aire, combustible y cabina" } });
    const catR = await prisma.category.upsert({ where: { name: "Frenos" }, update: { description: "Pastillas, discos, líquido de frenos y componentes" }, create: { name: "Frenos", description: "Pastillas, discos, líquido de frenos y componentes" } });
    const catS = await prisma.category.upsert({ where: { name: "Suspensión" }, update: { description: "Amortiguadores, resortes, rótulas y terminales" }, create: { name: "Suspensión", description: "Amortiguadores, resortes, rótulas y terminales" } });
    const catM = await prisma.category.upsert({ where: { name: "Motor" }, update: { description: "Bujías, correas, empaquetaduras y componentes internos" }, create: { name: "Motor", description: "Bujías, correas, empaquetaduras y componentes internos" } });
    const catE = await prisma.category.upsert({ where: { name: "Eléctrico" }, update: { description: "Baterías, alternadores, fusibles y cableado" }, create: { name: "Eléctrico", description: "Baterías, alternadores, fusibles y cableado" } });
    console.log("  OK 6 categorías");
    console.log("Creando clientes...");
    const c1 = await prisma.client.upsert({
        where: { dni: "19283746" },
        update: { type: "INDIVIDUAL", firstName: "Roberto", lastName: "Gonzales", phone: "956781234", address: "Av. Angamos 1234", district: "Surquillo", source: "Referido", isVip: true, creditLimit: 2000 },
        create: { type: "INDIVIDUAL", firstName: "Roberto", lastName: "Gonzales", dni: "19283746", phone: "956781234", address: "Av. Angamos 1234", district: "Surquillo", source: "Referido", isVip: true, creditLimit: 2000 },
    });
    const c2 = await prisma.client.upsert({
        where: { dni: "29384756" },
        update: { type: "INDIVIDUAL", firstName: "María", lastName: "Fernández", phone: "967892345", address: "Calle Schell 567", district: "Miraflores", source: "Google" },
        create: { type: "INDIVIDUAL", firstName: "María", lastName: "Fernández", dni: "29384756", phone: "967892345", address: "Calle Schell 567", district: "Miraflores", source: "Google" },
    });
    const c3 = await prisma.client.upsert({
        where: { dni: "39485761" },
        update: { type: "INDIVIDUAL", firstName: "José", lastName: "Mendoza", phone: "978903456", address: "Av. Defensores del Morro 890", district: "Chorrillos", source: "Walk-in" },
        create: { type: "INDIVIDUAL", firstName: "José", lastName: "Mendoza", dni: "39485761", phone: "978903456", address: "Av. Defensores del Morro 890", district: "Chorrillos", source: "Walk-in" },
    });
    const c4 = await prisma.client.upsert({
        where: { dni: "49586720" },
        update: { type: "INDIVIDUAL", firstName: "Carmen", lastName: "Huamán", phone: "989014567", address: "Jr. Las Artes 234", district: "Barranco", source: "Referido" },
        create: { type: "INDIVIDUAL", firstName: "Carmen", lastName: "Huamán", dni: "49586720", phone: "989014567", address: "Jr. Las Artes 234", district: "Barranco", source: "Referido" },
    });
    const c5 = await prisma.client.upsert({
        where: { dni: "59687123" },
        update: { type: "INDIVIDUAL", firstName: "Pedro", lastName: "Salazar", phone: "990125678", address: "Av. Javier Prado 3456", district: "San Isidro", source: "Referido", isVip: true, creditLimit: 3000 },
        create: { type: "INDIVIDUAL", firstName: "Pedro", lastName: "Salazar", dni: "59687123", phone: "990125678", address: "Av. Javier Prado 3456", district: "San Isidro", source: "Referido", isVip: true, creditLimit: 3000 },
    });
    const c6 = await prisma.client.upsert({
        where: { dni: "69788234" },
        update: { type: "INDIVIDUAL", firstName: "Rosa", lastName: "Chávez", phone: "991236789", address: "Calle 5 123", district: "San Borja", source: "Google" },
        create: { type: "INDIVIDUAL", firstName: "Rosa", lastName: "Chávez", dni: "69788234", phone: "991236789", address: "Calle 5 123", district: "San Borja", source: "Google" },
    });
    const c7 = await prisma.client.upsert({
        where: { dni: "79889345" },
        update: { type: "INDIVIDUAL", firstName: "Diego", lastName: "Ríos", phone: "992347890", address: "Av. Huaylas 456", district: "Chorrillos", source: "Walk-in" },
        create: { type: "INDIVIDUAL", firstName: "Diego", lastName: "Ríos", dni: "79889345", phone: "992347890", address: "Av. Huaylas 456", district: "Chorrillos", source: "Walk-in" },
    });
    const c8 = await prisma.client.upsert({
        where: { dni: "89901456" },
        update: { type: "INDIVIDUAL", firstName: "Patricia", lastName: "Vargas", phone: "993458901", address: "Jr. Bolognesi 567", district: "Barranco", source: "Google" },
        create: { type: "INDIVIDUAL", firstName: "Patricia", lastName: "Vargas", dni: "89901456", phone: "993458901", address: "Jr. Bolognesi 567", district: "Barranco", source: "Google" },
    });
    const c9 = await prisma.client.upsert({
        where: { dni: "45678901" },
        update: { type: "COMPANY", firstName: "Jorge", lastName: "Yamamoto", companyName: "Empresa Transportes del Sur S.A.C.", ruc: "20456789012", phone: "953214567", phone2: "953214568", address: "Av. Industrial 1234", district: "Surquillo", source: "Referido" },
        create: { type: "COMPANY", firstName: "Jorge", lastName: "Yamamoto", dni: "45678901", companyName: "Empresa Transportes del Sur S.A.C.", ruc: "20456789012", phone: "953214567", phone2: "953214568", address: "Av. Industrial 1234", district: "Surquillo", source: "Referido" },
    });
    const c10 = await prisma.client.upsert({
        where: { dni: "56789012" },
        update: { type: "COMPANY", firstName: "Renato", lastName: "Ishikawa", companyName: "Inversiones Los Olivos S.A.", ruc: "20567890123", phone: "954325678", address: "Av. El Polo 567", district: "San Isidro", source: "Google" },
        create: { type: "COMPANY", firstName: "Renato", lastName: "Ishikawa", dni: "56789012", companyName: "Inversiones Los Olivos S.A.", ruc: "20567890123", phone: "954325678", address: "Av. El Polo 567", district: "San Isidro", source: "Google" },
    });
    const c11 = await prisma.client.upsert({
        where: { dni: "67890123" },
        update: { type: "COMPANY", firstName: "Felipe", lastName: "Huarcaya", companyName: "Taxi Seguro Lima E.I.R.L.", ruc: "20678901234", phone: "955436789", address: "Av. Universitaria 890", district: "San Borja", source: "Walk-in" },
        create: { type: "COMPANY", firstName: "Felipe", lastName: "Huarcaya", dni: "67890123", companyName: "Taxi Seguro Lima E.I.R.L.", ruc: "20678901234", phone: "955436789", address: "Av. Universitaria 890", district: "San Borja", source: "Walk-in" },
    });
    const c12 = await prisma.client.upsert({
        where: { dni: "78901234" },
        update: { type: "COMPANY", firstName: "Gloria", lastName: "Paredes", companyName: "Multiservicios Andinos S.A.C.", ruc: "20345678901", phone: "952103456", phone2: "952103457", address: "Av. República de Panamá 345", district: "Barranco", source: "Google" },
        create: { type: "COMPANY", firstName: "Gloria", lastName: "Paredes", dni: "78901234", companyName: "Multiservicios Andinos S.A.C.", ruc: "20345678901", phone: "952103456", phone2: "952103457", address: "Av. República de Panamá 345", district: "Barranco", source: "Google" },
    });
    console.log("  OK 12 clientes");
    console.log("Creando vehículos...");
    const v = (p, b, m, y, c, e, f, t, km, cl) => prisma.vehicle.upsert({
        where: { plate: p },
        update: { brand: b, model: m, year: y, color: c, engineType: e, fuelType: f, transmission: t, mileage: km, clientId: cl, photos: [] },
        create: { plate: p, brand: b, model: m, year: y, color: c, engineType: e, fuelType: f, transmission: t, mileage: km, clientId: cl, photos: [] },
    });
    const v1 = await v("ABC-123", "Toyota", "Hilux", 2020, "Blanco", "DIESEL", "DIESEL", "AUTOMATIC", 85000, c1.id);
    const v2 = await v("DEF-456", "Nissan", "Sentra", 2018, "Gris", "GASOLINE", "GASOLINE", "MANUAL", 120000, c1.id);
    const v3 = await v("GHI-789", "Hyundai", "Tucson", 2021, "Plata", "GASOLINE", "GASOLINE", "AUTOMATIC", 65000, c2.id);
    const v4 = await v("JKL-012", "Kia", "Rio", 2019, "Rojo", "GASOLINE", "GASOLINE", "MANUAL", 95000, c2.id);
    const v5 = await v("MNO-345", "Suzuki", "Swift", 2017, "Azul", "GASOLINE", "GASOLINE", "MANUAL", 140000, c3.id);
    const v6 = await v("PQR-678", "Nissan", "Frontier", 2016, "Negro", "DIESEL", "DIESEL", "MANUAL", 180000, c3.id);
    const v7 = await v("STU-901", "Honda", "Civic", 2015, "Blanco", "GASOLINE", "GASOLINE", "AUTOMATIC", 160000, c3.id);
    const v8 = await v("VWX-234", "Toyota", "Corolla", 2022, "Plata", "GASOLINE", "GASOLINE", "AUTOMATIC", 45000, c4.id);
    const v9 = await v("YZA-567", "Chevrolet", "Spark", 2020, "Verde", "GASOLINE", "GASOLINE", "MANUAL", 70000, c4.id);
    const v10 = await v("BCD-890", "Toyota", "Land Cruiser Prado", 2023, "Negro", "DIESEL", "DIESEL", "AUTOMATIC", 35000, c5.id);
    const v11 = await v("EFG-123", "Honda", "CR-V", 2021, "Azul", "GASOLINE", "GASOLINE", "AUTOMATIC", 55000, c5.id);
    const v12 = await v("HIJ-456", "Hyundai", "Santa Fe", 2019, "Blanco", "DIESEL", "DIESEL", "AUTOMATIC", 90000, c5.id);
    const v13 = await v("KLM-789", "Kia", "Sportage", 2020, "Gris", "GASOLINE", "GASOLINE", "AUTOMATIC", 75000, c6.id);
    const v14 = await v("NOP-012", "Nissan", "Versa", 2018, "Rojo", "GASOLINE", "GASOLINE", "MANUAL", 130000, c6.id);
    const v15 = await v("QRS-345", "Toyota", "Yaris", 2017, "Azul", "GASOLINE", "GASOLINE", "MANUAL", 150000, c7.id);
    const v16 = await v("TUV-678", "Hyundai", "Accent", 2014, "Blanco", "GASOLINE", "GASOLINE", "MANUAL", 200000, c7.id);
    const v17 = await v("WXY-901", "Suzuki", "Grand Vitara", 2016, "Negro", "GASOLINE", "GASOLINE", "MANUAL", 170000, c8.id);
    const v18 = await v("ZAB-234", "Chevrolet", "Cruze", 2015, "Plata", "GASOLINE", "GASOLINE", "AUTOMATIC", 185000, c8.id);
    const v19 = await v("CDE-567", "Toyota", "Hiace", 2022, "Blanco", "DIESEL", "DIESEL", "AUTOMATIC", 40000, c9.id);
    const v20 = await v("FGH-890", "Nissan", "NP300", 2021, "Blanco", "DIESEL", "DIESEL", "MANUAL", 55000, c9.id);
    const v21 = await v("IJK-123", "Toyota", "Fortuner", 2023, "Negro", "DIESEL", "DIESEL", "AUTOMATIC", 30000, c10.id);
    const v22 = await v("LMN-456", "Hyundai", "Grand i10", 2022, "Blanco", "GAS", "GAS", "MANUAL", 60000, c11.id);
    const v23 = await v("OPQ-789", "Kia", "Soluto", 2021, "Plata", "GAS", "GAS", "MANUAL", 70000, c11.id);
    const v24 = await v("RST-012", "Nissan", "Navara", 2020, "Gris", "DIESEL", "DIESEL", "AUTOMATIC", 80000, c12.id);
    console.log("  OK 24 vehículos");
    console.log("Creando inventario...");
    const itm = (sku, name, desc, cat, sup, unit, cost, price, stock, minS, maxS, loc, imp, customs) => prisma.inventoryItem.upsert({
        where: { sku },
        update: { name, description: desc, categoryId: cat.id, supplierId: sup.id, unit, costPrice: cost, unitPrice: price, stock, minStock: minS, maxStock: maxS, location: loc, isImported: imp ?? false, customsCost: customs, isActive: true, photos: [] },
        create: { sku, name, description: desc, categoryId: cat.id, supplierId: sup.id, unit, costPrice: cost, unitPrice: price, stock, minStock: minS, maxStock: maxS, location: loc, isImported: imp ?? false, customsCost: customs, isActive: true, photos: [] },
    });
    await itm("ACE-001", "Aceite 20W-50 Galón", "Aceite mineral multigrado 20W-50 para motor", catA, s4, "galón", 45, 72, 30, 10, 50, "Estante A-1");
    await itm("ACE-002", "Aceite Sintético 5W-30 Litro", "Aceite sintético multigrado 5W-30 alta tecnología importado", catA, s3, "litro", 38, 62, 2, 8, 40, "Estante A-1", true, 2.5);
    await itm("ACE-003", "Aceite Hidráulico ATF Galón", "Aceite para transmisión automática ATF Dexron III", catA, s1, "galón", 52, 85, 18, 5, 30, "Estante A-2");
    await itm("ACE-004", "Aceite SAE 40 Litro", "Aceite mineral monogrado SAE 40 para motores diésel", catA, s4, "litro", 28, 45, 24, 6, 48, "Estante A-2");
    await itm("ACE-005", "Refrigerante Verde Galón", "Refrigerante anticongelante base etilenglicol", catA, s1, "galón", 22, 38, 15, 4, 25, "Estante A-3");
    await itm("FIL-001", "Filtro de Aceite Toyota", "Filtro de aceite para vehículos Toyota original", catF, s1, "unidad", 18, 35, 40, 10, 80, "Estante F-1");
    await itm("FIL-002", "Filtro de Aceite Nissan", "Filtro de aceite para vehículos Nissan", catF, s1, "unidad", 16, 30, 35, 8, 60, "Estante F-1");
    await itm("FIL-003", "Filtro de Aire Genérico", "Filtro de aire universal para motores", catF, s5, "unidad", 12, 25, 25, 10, 50, "Estante F-2");
    await itm("FIL-004", "Filtro de Combustible Hyundai/Kia", "Filtro de combustible para Hyundai y Kia", catF, s1, "unidad", 22, 40, 1, 5, 20, "Estante F-2");
    await itm("FIL-005", "Filtro de Cabina Suzuki", "Filtro de aire acondicionado para Suzuki", catF, s1, "unidad", 15, 28, 20, 6, 40, "Estante F-3");
    await itm("FIL-006", "Filtro de Aceite Honda", "Filtro de aceite original para vehículos Honda importado", catF, s3, "unidad", 20, 38, 12, 5, 30, "Estante F-3", true, 1.8);
    await itm("FRE-001", "Pastillas de Freno Delanteras Toyota", "Juego de pastillas de freno delanteras para Toyota", catR, s1, "juego", 85, 150, 14, 4, 20, "Estante FR-1");
    await itm("FRE-002", "Pastillas de Freno Traseras Nissan", "Juego de pastillas de freno traseras para Nissan", catR, s2, "juego", 75, 130, 10, 4, 20, "Estante FR-1");
    await itm("FRE-003", "Disco de Freno Delantero Hyundai", "Disco de freno ventilado delantero para Hyundai", catR, s1, "unidad", 120, 210, 6, 2, 10, "Estante FR-2");
    await itm("FRE-004", "Líquido de Frenos DOT-4 500ml", "Líquido de frenos DOT-4 alta calidad 500ml", catR, s4, "frasco", 12, 22, 45, 10, 100, "Estante FR-2");
    await itm("FRE-005", "Pastillas de Freno Kia Cerámicas", "Pastillas de freno cerámicas para Kia", catR, s1, "juego", 95, 170, 0, 3, 15, "Estante FR-3");
    await itm("SUS-001", "Amortiguador Delantero Toyota", "Amortiguador hidráulico delantero para Toyota", catS, s1, "unidad", 145, 260, 8, 2, 16, "Estante S-1");
    await itm("SUS-002", "Amortiguador Trasero Nissan", "Amortiguador hidráulico trasero para Nissan", catS, s2, "unidad", 135, 240, 6, 2, 12, "Estante S-1");
    await itm("SUS-003", "Rótula Inferior Hyundai/Kia", "Rótula de suspensión inferior para Hyundai y Kia", catS, s1, "unidad", 65, 115, 3, 4, 12, "Estante S-2");
    await itm("SUS-004", "Terminal de Dirección Suzuki", "Terminal externo de dirección para Suzuki", catS, s2, "unidad", 48, 85, 10, 3, 20, "Estante S-2");
    await itm("SUS-005", "Espiral Delantero Chevrolet", "Resorte espiral delantero para Chevrolet", catS, s1, "unidad", 110, 190, 5, 2, 10, "Estante S-3");
    await itm("MOT-001", "Bujía NGK Iridio", "Bujía de iridio NGK para motor gasolinero importada", catM, s3, "unidad", 25, 45, 48, 12, 100, "Estante M-1", true, 1.5);
    await itm("MOT-002", "Correa de Distribución Toyota", "Correa dentada de distribución para vehículos Toyota", catM, s1, "unidad", 68, 120, 7, 3, 15, "Estante M-1");
    await itm("MOT-003", "Empaquetadura de Culata Nissan", "Empaquetadura de cabeza para motor Nissan", catM, s1, "unidad", 95, 175, 3, 2, 10, "Estante M-2");
    await itm("MOT-004", "Bomba de Agua Chevrolet", "Bomba de agua para motor Chevrolet", catM, s1, "unidad", 130, 235, 4, 2, 8, "Estante M-2");
    await itm("MOT-005", "Correa de Alternador Multi-V", "Correa poli-V para alternador de múltiples aplicaciones", catM, s5, "unidad", 35, 60, 16, 5, 30, "Estante M-3");
    await itm("MOT-006", "Tensor de Cadena Distribución Honda", "Tensor de cadena de distribución para motores Honda", catM, s3, "unidad", 198, 350, 1, 3, 8, "Estante M-3", true, 5.2);
    await itm("ELE-001", "Batería 12V 65Ah", "Batería de automóvil 12V 65Ah libre de mantenimiento", catE, s1, "unidad", 180, 320, 8, 3, 15, "Estante E-1");
    await itm("ELE-002", "Alternador Toyota Reconstruido", "Alternador reconstruido para vehículos Toyota", catE, s6, "unidad", 280, 490, 2, 1, 5, "Estante E-1");
    await itm("ELE-003", "Juego de Fusibles Surtido 100pcs", "Kit de fusibles automotrices surtidos 100 piezas", catE, s6, "kit", 15, 28, 22, 5, 50, "Estante E-2");
    await itm("ELE-004", "Faro Principal Derecho Nissan", "Faro halógeno principal lado derecho para Nissan", catE, s1, "unidad", 175, 310, 1, 2, 6, "Estante E-2");
    await itm("ELE-005", "Sensor de Oxígeno Universal", "Sensor de oxígeno universal para sistema de inyección", catE, s3, "unidad", 155, 280, 5, 2, 12, "Estante E-3", true, 3.8);
    console.log("  OK 32 ítems");
    console.log("Creando órdenes de trabajo...");
    const wo = (num, vid, cid, mid, st, p, tp, desc, diag, kmIn, kmOut, lab, parts, total, disc, finAmt, recv, start, comp, delv, estDel, paySt, warr, creat, upd) => prisma.workOrder.upsert({
        where: { number: num },
        update: { vehicleId: vid, clientId: cid, mechanicId: mid, status: st, priority: p, type: tp, description: desc, diagnosis: diag, odometerIn: kmIn, odometerOut: kmOut, laborCost: lab, partsCost: parts, totalCost: total, discount: disc, tax: 0, finalAmount: finAmt ?? total ?? 0, receivedAt: recv, startedAt: start, completedAt: comp, deliveredAt: delv, estimatedDelivery: estDel, paymentStatus: paySt, warrantyDays: warr, updatedBy: upd },
        create: { number: num, vehicleId: vid, clientId: cid, mechanicId: mid, status: st, priority: p, type: tp, description: desc, diagnosis: diag, odometerIn: kmIn, odometerOut: kmOut, laborCost: lab, partsCost: parts, totalCost: total, discount: disc, tax: 0, finalAmount: finAmt ?? total ?? 0, receivedAt: recv, startedAt: start, completedAt: comp, deliveredAt: delv, estimatedDelivery: estDel, paymentStatus: paySt, warrantyDays: warr, createdBy: creat, photos: [] },
    });
    const o1 = await wo("OT-2026-0001", v1.id, c1.id, null, "DELIVERED", "NORMAL", "PREVENTIVE", "Cambio de aceite y filtros", "Mantenimiento regular programado 5,000 km", 85000, 85010, 80, 215, 295, 0, null, dt("2026-05-02"), dt("2026-05-02", "09:00"), dt("2026-05-02", "11:30"), dt("2026-05-02", "12:00"), null, "PAID", 30, ed.id, an.id);
    const o2 = await wo("OT-2026-0002", v2.id, c1.id, ca.id, "IN_PROGRESS", "HIGH", "CORRECTIVE", "Reparación de frenos delanteros", "Pastillas de freno delanteras desgastadas al límite, discos con rayado leve", 120000, null, 150, 450, 600, 0, null, dt("2026-06-02", "10:15"), dt("2026-06-02", "11:00"), null, null, dt("2026-06-05", "18:00"), "DRAFT", 60, ju.id, ju.id);
    const o3 = await wo("OT-2026-0003", v3.id, c2.id, null, "RECEIVED", "NORMAL", "PREVENTIVE", "Alineamiento y balanceo de las 4 ruedas", null, 65000, null, null, null, null, 0, null, dt("2026-06-03", "09:45"), null, null, null, null, "DRAFT", 0, an.id, null);
    const o4 = await wo("OT-2026-0004", v4.id, c2.id, null, "BUDGETED", "HIGH", "CORRECTIVE", "Cambio de embrague completo", "Disco de embrague desgastado, collarín con ruido, volante bimasa rayado", 95000, null, 450, 1200, 1650, 0, 1650, dt("2026-06-01", "14:00"), null, null, null, dt("2026-06-10", "18:00"), "DRAFT", 90, ed.id, null);
    const o5 = await wo("OT-2026-0005", v5.id, c3.id, null, "DELIVERED", "NORMAL", "PREVENTIVE", "Mantenimiento preventivo 50,000 km", "Servicio completo según programa de mantenimiento del fabricante", 140000, 140015, 200, 380, 580, 0, null, dt("2026-05-10"), dt("2026-05-10", "08:45"), dt("2026-05-10", "16:00"), dt("2026-05-10", "16:30"), null, "PAID", 30, ju.id, ju.id);
    const o6 = await wo("OT-2026-0006", v6.id, c3.id, lu.id, "IN_PROGRESS", "URGENT", "EMERGENCY", "Reparación de sistema de inyección diésel", "Falla en inyectores, dos con fuga de combustible, bomba de alta presión con presión baja", 180000, null, 350, 2800, 3150, 100, 3050, dt("2026-06-01", "07:30"), dt("2026-06-01", "09:00"), null, null, dt("2026-06-06", "18:00"), "PARTIALLY_PAID", 90, ed.id, null);
    const o7 = await wo("OT-2026-0007", v7.id, c3.id, null, "IN_REVIEW", "NORMAL", "CORRECTIVE", "Cambio de empaquetadura de tapa de válvulas", "Fuga de aceite por empaquetadura de tapa de válvulas deteriorada", 160000, null, 120, 85, 205, 0, null, dt("2026-06-02", "14:30"), dt("2026-06-03", "08:00"), dt("2026-06-03", "10:00"), null, null, "DRAFT", 30, ju.id, null);
    const o8 = await wo("OT-2026-0008", v8.id, c4.id, null, "READY", "NORMAL", "PREVENTIVE", "Mantenimiento general 60,000 km y cambio de filtros", "Filtros de aire y cabina sucios, aceite en condiciones regulares", 45000, null, 180, 340, 520, 0, null, dt("2026-06-02", "08:00"), dt("2026-06-02", "08:30"), dt("2026-06-03", "08:30"), null, null, "DRAFT", 30, an.id, null);
    const o9 = await wo("OT-2026-0009", v9.id, c4.id, null, "CANCELLED", "LOW", "DIAGNOSTIC", "Diagnóstico de ruido en suspensión delantera", "Revisión inicial: amortiguadores con desgaste normal, rótulas en buen estado", 70000, null, null, null, null, 0, null, dt("2026-05-28", "16:00"), null, null, null, null, "CANCELLED", 0, ed.id, an.id);
    const o10 = await wo("OT-2026-0010", v10.id, c5.id, ca.id, "DELIVERED", "HIGH", "CORRECTIVE", "Cambio de amortiguadores delanteros y posteriores", "Amortiguadores originales con fuga de aceite, mal estado de carreteras", 35000, 35010, 250, 1040, 1290, 0, null, dt("2026-05-15"), dt("2026-05-15", "09:00"), dt("2026-05-16", "15:00"), dt("2026-05-16", "16:30"), null, "PAID", 365, ed.id, ed.id);
    const o11 = await wo("OT-2026-0011", v11.id, c5.id, null, "IN_DIAGNOSIS", "NORMAL", "DIAGNOSTIC", "Diagnóstico de recalentamiento del motor", null, 55000, null, null, null, null, 0, null, dt("2026-06-03", "11:00"), null, null, null, null, "DRAFT", 0, an.id, null);
    const o12 = await wo("OT-2026-0012", v12.id, c5.id, null, "RECEIVED", "NORMAL", "INSPECTION", "Inspección técnica vehicular general", null, 90000, null, null, null, null, 0, null, dt("2026-06-03", "08:30"), null, null, null, null, "DRAFT", 0, an.id, null);
    const o13 = await wo("OT-2026-0013", v13.id, c6.id, null, "IN_PROGRESS", "NORMAL", "PREVENTIVE", "Cambio de bujías y limpieza de inyectores", "Bujías con desgaste avanzado, inyectores con carbonilla acumulada", 75000, null, 100, 180, 280, 0, null, dt("2026-06-02", "13:00"), dt("2026-06-02", "14:00"), null, null, dt("2026-06-04", "12:00"), "DRAFT", 30, ju.id, null);
    const o14 = await wo("OT-2026-0014", v14.id, c6.id, null, "BUDGETED", "NORMAL", "PREVENTIVE", "Cambio de faja de distribución y bomba de agua", "Faja de distribución vencida por kilometraje a los 130,000 km", 130000, null, 220, 480, 700, 0, 700, dt("2026-06-01", "15:30"), null, null, null, dt("2026-06-08", "18:00"), "DRAFT", 60, ed.id, null);
    const o15 = await wo("OT-2026-0015", v15.id, c7.id, lu.id, "DELIVERED", "NORMAL", "CORRECTIVE", "Reparación de alternador y cambio de batería", "Alternador no carga adecuadamente, batería desgastada", 150000, 150012, 120, 810, 930, 30, 900, dt("2026-05-18"), dt("2026-05-18", "10:30"), dt("2026-05-18", "17:00"), dt("2026-05-18", "17:30"), null, "PAID", 90, ju.id, ju.id);
    const o16 = await wo("OT-2026-0016", v16.id, c7.id, null, "BUDGETED", "LOW", "CORRECTIVE", "Reparación de sistema de aire acondicionado", "Compresor de aire acondicionado no enciende, posible fuga de gas refrigerante", 200000, null, 180, null, null, 0, null, dt("2026-05-30", "09:00"), null, null, null, dt("2026-06-12", "18:00"), "DRAFT", 0, ed.id, null);
    const o17 = await wo("OT-2026-0017", v17.id, c8.id, null, "IN_DIAGNOSIS", "NORMAL", "DIAGNOSTIC", "Diagnóstico de pérdida de potencia en subida", null, 170000, null, null, null, null, 0, null, dt("2026-06-02", "16:00"), null, null, null, null, "DRAFT", 0, an.id, null);
    const o18 = await wo("OT-2026-0018", v18.id, c8.id, null, "READY", "NORMAL", "CORRECTIVE", "Cambio de terminales de dirección y alineamiento", "Terminales de dirección con juego excesivo, dirección desalineada", 185000, null, 150, 170, 320, 0, null, dt("2026-06-01", "10:00"), dt("2026-06-01", "11:00"), dt("2026-06-03", "09:00"), null, null, "DRAFT", 60, ju.id, null);
    const o19 = await wo("OT-2026-0019", v19.id, c9.id, ca.id, "IN_REVIEW", "NORMAL", "PREVENTIVE", "Mantenimiento flota: cambio de aceite y revisión general", "Aceite vencido por kilometraje, filtros en buen estado. Sin novedades mecánicas.", 40000, null, 100, 320, 420, 0, null, dt("2026-06-02", "07:30"), dt("2026-06-02", "08:00"), dt("2026-06-03", "14:00"), null, null, "DRAFT", 30, ju.id, null);
    const o20 = await wo("OT-2026-0020", v20.id, c9.id, null, "IN_PROGRESS", "HIGH", "CORRECTIVE", "Reparación de sistema de transmisión y diferencial", "Ruido en diferencial trasero, aceite de transmisión con partículas metálicas", 55000, null, 380, null, null, 0, null, dt("2026-06-01", "08:00"), dt("2026-06-01", "09:30"), null, null, dt("2026-06-06", "18:00"), "DRAFT", 180, ed.id, null);
    const o21 = await wo("OT-2026-0021", v22.id, c11.id, null, "CANCELLED", "NORMAL", "DIAGNOSTIC", "Diagnóstico de encendido irregular con GAS", "Sistema de gas mal calibrado, no es falla del motor. Recomendar calibración en taller especializado GAS.", 60000, null, null, null, null, 0, null, dt("2026-05-25", "15:00"), null, null, null, null, "CANCELLED", 0, ed.id, ed.id);
    const o22 = await wo("OT-2026-0022", v23.id, c11.id, null, "IN_DIAGNOSIS", "NORMAL", "CORRECTIVE", "Revisión de sistema de frenos y suspensión", null, 70000, null, null, null, null, 0, null, dt("2026-06-03", "14:00"), null, null, null, null, "DRAFT", 0, an.id, null);
    console.log("  OK 22 órdenes");
    console.log("Creando eventos de órdenes...");
    const we = (oid, ev, desc, uid, created) => ({ workOrderId: oid, event: ev, description: desc, userId: uid, createdAt: created });
    const events = [
        we(o1.id, "STATUS_CHANGED", "Orden recibida en taller", ed.id, dt("2026-05-02")),
        we(o1.id, "MECHANIC_ASSIGNED", "Mecánico Luis Mamani asignado", ju.id, dt("2026-05-02", "08:45")),
        we(o1.id, "STATUS_CHANGED", "Trabajo iniciado", lu.id, dt("2026-05-02", "09:00")),
        we(o1.id, "STATUS_CHANGED", "Trabajo completado, listo para entrega", lu.id, dt("2026-05-02", "11:30")),
        we(o1.id, "STATUS_CHANGED", "Vehículo entregado al cliente", an.id, dt("2026-05-02", "12:00")),
        we(o2.id, "STATUS_CHANGED", "Orden recibida - reparación de frenos", ju.id, dt("2026-06-02", "10:15")),
        we(o2.id, "MECHANIC_ASSIGNED", "Mecánico Carlos Quispe asignado al trabajo", ju.id, dt("2026-06-02", "10:30")),
        we(o2.id, "DIAGNOSIS_COMPLETED", "Pastillas desgastadas y discos rayados", ca.id, dt("2026-06-02", "10:50")),
        we(o2.id, "STATUS_CHANGED", "Trabajo en progreso", ca.id, dt("2026-06-02", "11:00")),
        we(o3.id, "STATUS_CHANGED", "Orden recibida - alineamiento y balanceo", an.id, dt("2026-06-03", "09:45")),
        we(o4.id, "STATUS_CHANGED", "Orden recibida - revisión de embrague", ed.id, dt("2026-06-01", "14:00")),
        we(o4.id, "DIAGNOSIS_COMPLETED", "Disco desgastado, collarín con ruido, volante rayado", ed.id, dt("2026-06-01", "16:00")),
        we(o4.id, "STATUS_CHANGED", "Cotización enviada al cliente por S/ 1,650.00", ed.id, dt("2026-06-01", "16:30")),
        we(o5.id, "STATUS_CHANGED", "Orden recibida - mantenimiento preventivo", ju.id, dt("2026-05-10")),
        we(o5.id, "MECHANIC_ASSIGNED", "Mecánico Carlos Quispe asignado", ju.id, dt("2026-05-10", "08:30")),
        we(o5.id, "STATUS_CHANGED", "Mantenimiento en progreso", ca.id, dt("2026-05-10", "08:45")),
        we(o5.id, "STATUS_CHANGED", "Vehículo entregado al cliente", ju.id, dt("2026-05-10", "16:30")),
        we(o6.id, "STATUS_CHANGED", "Orden de emergencia - sistema de inyección diésel", ed.id, dt("2026-06-01", "07:30")),
        we(o6.id, "MECHANIC_ASSIGNED", "Mecánico Luis Mamani asignado", ed.id, dt("2026-06-01", "08:00")),
        we(o6.id, "DIAGNOSIS_COMPLETED", "Inyectores con fuga, bomba de alta presión defectuosa", lu.id, dt("2026-06-01", "08:45")),
        we(o6.id, "STATUS_CHANGED", "Reparación en progreso", lu.id, dt("2026-06-01", "09:00")),
        we(o7.id, "STATUS_CHANGED", "Orden recibida - empaquetadura de válvulas", ju.id, dt("2026-06-02", "14:30")),
        we(o7.id, "DIAGNOSIS_COMPLETED", "Fuga de aceite confirmada en tapa de válvulas", ju.id, dt("2026-06-02", "15:00")),
        we(o7.id, "STATUS_CHANGED", "Trabajo completado, en revisión final", ju.id, dt("2026-06-03", "10:00")),
        we(o8.id, "STATUS_CHANGED", "Orden recibida - mantenimiento 60,000 km", an.id, dt("2026-06-02", "08:00")),
        we(o8.id, "STATUS_CHANGED", "Trabajo completado, vehículo listo para entrega", ju.id, dt("2026-06-03", "08:30")),
        we(o9.id, "STATUS_CHANGED", "Orden recibida - diagnóstico de suspensión", an.id, dt("2026-05-28", "16:00")),
        we(o9.id, "DIAGNOSIS_COMPLETED", "Diagnóstico parcial completado. Cliente no autorizó revisión completa.", ca.id, dt("2026-05-28", "17:00")),
        we(o9.id, "STATUS_CHANGED", "Orden cancelada por el cliente", an.id, dt("2026-05-29", "09:00")),
        we(o10.id, "STATUS_CHANGED", "Orden recibida - cambio de amortiguadores", ed.id, dt("2026-05-15")),
        we(o10.id, "MECHANIC_ASSIGNED", "Mecánico Carlos Quispe asignado", ed.id, dt("2026-05-15", "08:45")),
        we(o10.id, "PART_ADDED", "4 amortiguadores SUS-001 agregados al inventario usado", ca.id, dt("2026-05-15", "10:00")),
        we(o10.id, "STATUS_CHANGED", "Trabajo completado y entregado al cliente", ed.id, dt("2026-05-16", "16:30")),
        we(o11.id, "STATUS_CHANGED", "Orden recibida - diagnóstico de recalentamiento", an.id, dt("2026-06-03", "11:00")),
        we(o11.id, "STATUS_CHANGED", "Vehículo en diagnóstico", an.id, dt("2026-06-03", "11:15")),
        we(o12.id, "STATUS_CHANGED", "Orden recibida - inspección técnica vehicular", an.id, dt("2026-06-03", "08:30")),
        we(o13.id, "STATUS_CHANGED", "Orden recibida - cambio de bujías y limpieza", ju.id, dt("2026-06-02", "13:00")),
        we(o13.id, "DIAGNOSIS_COMPLETED", "Bujías con desgaste, inyectores con carbonilla", ju.id, dt("2026-06-02", "13:30")),
        we(o13.id, "STATUS_CHANGED", "Trabajo en progreso", ju.id, dt("2026-06-02", "14:00")),
        we(o14.id, "STATUS_CHANGED", "Orden recibida - cambio de faja de distribución", ed.id, dt("2026-06-01", "15:30")),
        we(o14.id, "DIAGNOSIS_COMPLETED", "Faja vencida por kilometraje, requiere cambio urgente", ed.id, dt("2026-06-01", "16:15")),
        we(o14.id, "STATUS_CHANGED", "Cotización enviada a cliente por S/ 700.00", ed.id, dt("2026-06-01", "16:30")),
        we(o15.id, "STATUS_CHANGED", "Orden recibida - reparación de alternador", ju.id, dt("2026-05-18")),
        we(o15.id, "MECHANIC_ASSIGNED", "Mecánico Luis Mamani asignado", ju.id, dt("2026-05-18", "10:00")),
        we(o15.id, "STATUS_CHANGED", "Trabajo completado y entregado al cliente", ju.id, dt("2026-05-18", "17:30")),
        we(o16.id, "STATUS_CHANGED", "Orden recibida - aire acondicionado", ed.id, dt("2026-05-30", "09:00")),
        we(o16.id, "DIAGNOSIS_COMPLETED", "Compresor no enciende, posible fuga de gas", ed.id, dt("2026-05-30", "10:30")),
        we(o16.id, "STATUS_CHANGED", "Cotización pendiente: requiere repuesto importado", ed.id, dt("2026-05-30", "11:00")),
        we(o17.id, "STATUS_CHANGED", "Orden recibida - pérdida de potencia", an.id, dt("2026-06-02", "16:00")),
        we(o17.id, "STATUS_CHANGED", "Vehículo en proceso de diagnóstico", an.id, dt("2026-06-02", "16:30")),
        we(o18.id, "STATUS_CHANGED", "Orden recibida - terminales y alineamiento", ju.id, dt("2026-06-01", "10:00")),
        we(o18.id, "MECHANIC_ASSIGNED", "Trabajo asignado al taller general", ju.id, dt("2026-06-01", "10:30")),
        we(o18.id, "PART_ADDED", "2 terminales de dirección SUS-004 usados", ju.id, dt("2026-06-01", "12:00")),
        we(o18.id, "STATUS_CHANGED", "Trabajo completado, listo para entrega", ju.id, dt("2026-06-03", "09:00")),
        we(o19.id, "STATUS_CHANGED", "Orden recibida - mantenimiento de flota", ju.id, dt("2026-06-02", "07:30")),
        we(o19.id, "MECHANIC_ASSIGNED", "Mecánico Carlos Quispe asignado", ju.id, dt("2026-06-02", "07:45")),
        we(o19.id, "STATUS_CHANGED", "Trabajo completado, en revisión por jefe de taller", ca.id, dt("2026-06-03", "14:00")),
        we(o20.id, "STATUS_CHANGED", "Orden recibida - transmisión y diferencial", ed.id, dt("2026-06-01", "08:00")),
        we(o20.id, "DIAGNOSIS_COMPLETED", "Ruido en diferencial, aceite con partículas metálicas", ed.id, dt("2026-06-01", "09:00")),
        we(o20.id, "STATUS_CHANGED", "Reparación en progreso", ed.id, dt("2026-06-01", "09:30")),
        we(o21.id, "STATUS_CHANGED", "Orden recibida - encendido irregular GAS", ed.id, dt("2026-05-25", "15:00")),
        we(o21.id, "DIAGNOSIS_COMPLETED", "Sistema de gas mal calibrado, no es falla mecánica", ed.id, dt("2026-05-25", "15:45")),
        we(o21.id, "STATUS_CHANGED", "Orden cancelada - referido a taller GAS", ed.id, dt("2026-05-25", "16:00")),
        we(o22.id, "STATUS_CHANGED", "Orden recibida - frenos y suspensión", an.id, dt("2026-06-03", "14:00")),
        we(o22.id, "STATUS_CHANGED", "Vehículo en proceso de diagnóstico", an.id, dt("2026-06-03", "14:30")),
    ];
    const evCount = await prisma.workOrderEvent.count();
    if (evCount === 0) {
        await prisma.workOrderEvent.createMany({ data: events });
        console.log("  OK " + events.length + " eventos");
    }
    else {
        console.log("  Eventos ya existentes, omitiendo");
    }
    console.log("Creando asistencia...");
    const personnel = [pe, pj, pa, ps, pc, pl, pm];
    const latePeople = [pm.id, pl.id];
    const absentPeople = [pm.id];
    let attCount = 0;
    for (let day = 1; day <= 30; day++) {
        const date = daysAgo(day);
        const dow = date.getDay();
        if (dow === 0 || dow === 6)
            continue;
        for (const pers of personnel) {
            let type = "PRESENT", checkIn = daysAgo(day, 8, 0), checkOut = daysAgo(day, 18, 0), notes = null;
            if (absentPeople.includes(pers.id) && day % 13 === 0) {
                type = "ABSENT";
                checkIn = null;
                checkOut = null;
                notes = "Falta injustificada";
            }
            else if (latePeople.includes(pers.id) && day % 7 === 0) {
                type = "LATE";
                checkIn = daysAgo(day, 8, 35);
                notes = "Llegada tarde 35 minutos";
            }
            await prisma.attendance.upsert({
                where: { personnelId_date: { personnelId: pers.id, date } },
                update: { type, checkIn, checkOut, notes },
                create: { personnelId: pers.id, date, type, checkIn, checkOut, notes },
            });
            attCount++;
        }
    }
    console.log("  OK " + attCount + " registros de asistencia");
    console.log("Creando gastos...");
    const exp = (amt, cat, desc, st, lvl, req, app, createdAt) => prisma.expenseAuthorization.upsert({
        where: { id: "exp-" + createdAt.getTime() + "-" + desc.substring(0, 5).replace(/\s/g, "") + amt },
        update: {},
        create: { id: "exp-" + createdAt.getTime() + "-" + desc.substring(0, 5).replace(/\s/g, "") + amt, amount: amt, currency: "PEN", category: cat, description: desc, status: st, approvalLevel: lvl, requesterId: req, approverId: app, createdAt },
    });
    await exp(1250, "PARTS", "Compra de repuestos para stock general", "APPROVED", "OWNER", ju.id, ed.id, dt("2026-05-05", "10:00"));
    await exp(350, "SUPPLIES", "Insumos de limpieza y desengrasantes", "APPROVED", "ADMIN", an.id, an.id, dt("2026-05-08", "14:00"));
    await exp(850, "TOOLS", "Juego de llaves de torque y herramientas especializadas", "APPROVED", "OWNER", ca.id, ju.id, dt("2026-05-12", "09:00"));
    await exp(1200, "UTILITIES", "Pago de servicio de luz - mayo 2026", "APPROVED", "ADMIN", an.id, an.id, dt("2026-05-15", "11:00"));
    await exp(480, "UTILITIES", "Pago de servicio de agua - mayo 2026", "APPROVED", "ADMIN", an.id, an.id, dt("2026-05-15", "11:30"));
    await exp(380, "UTILITIES", "Pago de internet y telefonía - mayo 2026", "APPROVED", "ADMIN", an.id, an.id, dt("2026-05-16", "09:00"));
    await exp(5000, "SALARY", "Planilla quincena mayo 2026", "APPROVED", "DUAL_OWNER", so.id, ed.id, dt("2026-05-15", "15:00"));
    await exp(5000, "SALARY", "Planilla fin de mes mayo 2026", "DISBURSED", "DUAL_OWNER", so.id, ed.id, dt("2026-05-31", "10:00"));
    await exp(650, "MAINTENANCE", "Mantenimiento del elevador hidráulico principal", "APPROVED", "ADMIN", ju.id, an.id, dt("2026-05-20", "08:00"));
    await exp(280, "SUPPLIES", "Compra de trapos industriales y guantes descartables", "APPROVED", "ADMIN", lu.id, an.id, dt("2026-05-22", "16:00"));
    await exp(1500, "PARTS", "Pedido urgente de repuestos importados para cliente", "APPROVED", "OWNER", ju.id, ed.id, dt("2026-06-01", "09:30"));
    await exp(95, "OTHER", "Recarga de extintores del taller", "PENDING_APPROVAL", "ADMIN", an.id, null, dt("2026-06-02", "15:00"));
    await exp(420, "SUPPLIES", "Material de oficina y papelería", "PENDING_APPROVAL", "FINANCE", so.id, null, dt("2026-06-03", "08:00"));
    await exp(120, "OTHER", "Movilidad para trámites bancarios", "REJECTED", "FINANCE", so.id, an.id, dt("2026-05-25", "17:00"));
    await exp(750, "TOOLS", "Compra de scanner automotriz actualizado", "DISBURSED", "OWNER", ed.id, ju.id, dt("2026-05-28", "14:00"));
    await exp(200, "OTHER", "Almuerzo de integración del equipo de taller", "PENDING_APPROVAL", "ADMIN", ju.id, null, dt("2026-06-02", "12:00"));
    console.log("  OK 16 gastos");
    console.log("Creando configuraciones...");
    const set = (key, value, cat) => prisma.setting.upsert({
        where: { key },
        update: { value, category: cat },
        create: { key, value, category: cat },
    });
    await set("shop_name", "Clínica Automotriz Arellan Hnos", "GENERAL");
    await set("shop_phone", "(01) 456-7890", "BUSINESS");
    await set("shop_address", "Av. República de Panamá 2345, Surquillo, Lima", "BUSINESS");
    await set("shop_email", "contacto@arellanautos.pe", "BUSINESS");
    await set("shop_ruc", "20408765432", "BUSINESS");
    await set("business_hours", "Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 8:00 AM - 1:00 PM", "BUSINESS");
    await set("attendance_schedule", JSON.stringify({ startTime: "08:00", toleranceMinutes: 60 }), "BUSINESS");
    await set("yape_account_name", "Clínica Automotriz Arellan Hnos", "BUSINESS");
    await set("yape_phone", "987654321", "BUSINESS");
    await set("yape_qr_url", "https://arellanautos.pe/yape-qr.png", "BUSINESS");
    await set("notify_low_stock", "true", "NOTIFICATIONS");
    await set("notify_order_status", "true", "NOTIFICATIONS");
    await set("default_warranty_days", "30", "GENERAL");
    console.log("  OK 13 configuraciones");
    console.log("Creando notificaciones...");
    const notCount = await prisma.notification.count();
    if (notCount === 0) {
        await prisma.notification.createMany({ data: [
                { userId: ed.id, type: "ORDER_STATUS", title: "OT-2026-0002 en progreso", body: "Reparación de frenos delanteros iniciada por Carlos Quispe", priority: "NORMAL", createdAt: dt("2026-06-02", "11:00") },
                { userId: ed.id, type: "LOW_STOCK", title: "Stock crítico: Pastillas de Freno Kia", body: "SKU FRE-005 tiene 0 unidades en stock. Mínimo requerido: 3.", priority: "HIGH", createdAt: dt("2026-06-01", "08:00") },
                { userId: ed.id, type: "LOW_STOCK", title: "Stock crítico: Filtro Combustible Hyundai/Kia", body: "SKU FIL-004 tiene 1 unidad en stock. Mínimo requerido: 5.", priority: "HIGH", createdAt: dt("2026-06-01", "08:05") },
                { userId: ed.id, type: "LOW_STOCK", title: "Stock crítico: Aceite Sintético 5W-30", body: "SKU ACE-002 tiene 2 unidades en stock. Mínimo requerido: 8.", priority: "HIGH", createdAt: dt("2026-06-01", "08:10") },
                { userId: ed.id, type: "EXPENSE_PENDING", title: "Gasto pendiente: Recarga de extintores", body: "S/ 95.00 - pendiente de aprobación", priority: "NORMAL", createdAt: dt("2026-06-02", "15:00") },
                { userId: ju.id, type: "ORDER_STATUS", title: "OT-2026-0006 emergencia activa", body: "Reparación urgente de sistema de inyección en progreso", priority: "URGENT", createdAt: dt("2026-06-01", "09:00") },
                { userId: ju.id, type: "LOW_STOCK", title: "Stock crítico: Faro Principal Nissan", body: "SKU ELE-004 tiene 1 unidad. Revisar inventario.", priority: "NORMAL", createdAt: dt("2026-06-03", "08:00") },
                { userId: an.id, type: "EXPENSE_PENDING", title: "Gasto pendiente: Material de oficina", body: "S/ 420.00 - requiere aprobación de finanzas", priority: "NORMAL", createdAt: dt("2026-06-03", "08:00") },
                { userId: an.id, type: "EXPENSE_PENDING", title: "Gasto pendiente: Almuerzo de integración", body: "S/ 200.00 - pendiente de aprobación", priority: "LOW", createdAt: dt("2026-06-02", "12:00") },
                { userId: ed.id, type: "SECURITY", title: "Acceso al sistema detectado", body: "Inicio de sesión desde IP 190.234.12.45 - Lima", isRead: true, readAt: dt("2026-06-02", "08:00"), priority: "NORMAL", createdAt: dt("2026-06-02", "08:00") },
                { userId: ju.id, type: "SECURITY", title: "Acceso al sistema detectado", body: "Inicio de sesión desde IP 190.234.12.46 - Lima", isRead: true, readAt: dt("2026-06-02", "07:30"), priority: "NORMAL", createdAt: dt("2026-06-02", "07:30") },
                { userId: an.id, type: "ORDER_STATUS", title: "3 órdenes nuevas hoy", body: "OT-2026-0003, OT-2026-0012, OT-2026-0022 recibidas", isRead: true, readAt: dt("2026-06-03", "14:45"), priority: "NORMAL", createdAt: dt("2026-06-03", "14:30") },
            ] });
        console.log("  OK 12 notificaciones");
    }
    else {
        console.log("  Notificaciones ya existentes, omitiendo");
    }
    console.log("\nSeed completado exitosamente!");
    console.log("========================================");
    console.log("Resumen:");
    console.log("  7 cuentas de usuario");
    console.log("  7 registros de personal");
    console.log("  6 proveedores");
    console.log("  6 categorías");
    console.log("  12 clientes");
    console.log("  24 vehículos");
    console.log("  32 ítems de inventario");
    console.log("  22 órdenes de trabajo");
    console.log("  " + events.length + " eventos de órdenes");
    console.log("  " + attCount + " registros de asistencia");
    console.log("  16 gastos");
    console.log("  12 configuraciones");
    console.log("  12 notificaciones");
    console.log("Creando sesión de caja...");
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const cashboxCount = await prisma.cashboxSession.count({ where: { openedAt: { gte: todayStart } } });
    if (cashboxCount === 0) {
        const cashbox = await prisma.cashboxSession.create({
            data: {
                openedById: an.id,
                openingBalance: 500,
                status: "OPEN",
                openedAt: new Date(),
            },
        });
        await prisma.financialTransaction.createMany({
            data: [
                { sessionId: cashbox.id, type: "PAYMENT", amount: 295, paymentMethod: "CASH", description: "Pago OT-2026-0001 - Roberto Gonzales", createdAt: new Date() },
                { sessionId: cashbox.id, type: "PAYMENT", amount: 580, paymentMethod: "YAPE", description: "Pago OT-2026-0005 - José Mendoza", createdAt: new Date() },
                { sessionId: cashbox.id, type: "PAYMENT", amount: 930, paymentMethod: "CASH", description: "Pago OT-2026-0015 - Diego Ríos", createdAt: new Date() },
                { sessionId: cashbox.id, type: "PAYMENT", amount: 1290, paymentMethod: "YAPE", description: "Pago OT-2026-0010 - Pedro Salazar", createdAt: new Date() },
            ],
        });
        console.log("  OK sesión de caja + 4 transacciones");
    }
    else {
        console.log("  Caja ya existe hoy, omitiendo");
    }
    console.log("Creando logs de auditoría...");
    const auditCount = await prisma.auditLog.count();
    if (auditCount === 0) {
        await prisma.auditLog.createMany({
            data: [
                { userId: an.id, userName: "Ana Arellan", role: "ADMIN", action: "LOGIN", ipAddress: "192.168.1.100", severity: "INFO", createdAt: daysAgo(0, 7, 30) },
                { userId: so.id, userName: "Sofía Arellan", role: "FINANCE", action: "EXPENSE_APPROVED", entity: "expense", entityId: "exp-1", ipAddress: "192.168.1.102", severity: "INFO", createdAt: daysAgo(1, 9, 0) },
                { userId: ed.id, userName: "Edgar Arellan", role: "OWNER", action: "CONFIG_CHANGED", entity: "setting", entityId: "yape_qr_url", ipAddress: "192.168.1.101", severity: "WARNING", createdAt: daysAgo(2, 14, 0) },
                { userId: ju.id, userName: "Juan Arellan", role: "OWNER", action: "ORDER_CANCELLED", entity: "work_order", entityId: "OT-2026-0009", ipAddress: "192.168.1.105", severity: "WARNING", createdAt: daysAgo(1, 16, 0) },
                { userId: an.id, userName: "Ana Arellan", role: "ADMIN", action: "CASHBOX_OPENED", entity: "cashbox", ipAddress: "192.168.1.100", severity: "INFO", createdAt: daysAgo(0, 7, 45) },
                { userId: ed.id, userName: "Edgar Arellan", role: "OWNER", action: "SECURITY", entity: "auth", ipAddress: "190.234.12.45", severity: "SECURITY_ALERT", createdAt: daysAgo(0, 8, 0) },
                { userId: an.id, userName: "Ana Arellan", role: "ADMIN", action: "CRITICAL_STOCK", entity: "inventory", entityId: "FIL-004", ipAddress: "192.168.1.100", severity: "CRITICAL", createdAt: daysAgo(0, 9, 30) },
                { userId: ju.id, userName: "Juan Arellan", role: "OWNER", action: "CRITICAL_STOCK", entity: "inventory", entityId: "FRE-005", ipAddress: "192.168.1.105", severity: "CRITICAL", createdAt: daysAgo(0, 10, 15) },
                { userId: ed.id, userName: "Edgar Arellan", role: "OWNER", action: "CRITICAL_STOCK", entity: "inventory", entityId: "ACE-002", ipAddress: "192.168.1.101", severity: "CRITICAL", createdAt: daysAgo(0, 11, 0) },
            ],
        });
        console.log("  OK 9 logs de auditoría");
    }
    else {
        console.log("  Logs ya existentes, omitiendo");
    }
    console.log();
}
main()
    .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map