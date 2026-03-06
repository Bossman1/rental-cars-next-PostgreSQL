import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@carrental.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@carrental.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash("staff123", 12);
  await prisma.user.upsert({
    where: { email: "staff@carrental.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@carrental.com",
      password: staffPassword,
      role: "STAFF",
    },
  });

  // Create sample cars
  await prisma.car.createMany({
    data: [
      {
        make: "Toyota",
        model: "Camry",
        year: 2023,
        licensePlate: "ABC-001",
        color: "White",
        category: "SEDAN",
        pricePerDay: 75.00,
        mileage: 12000,
      },
      {
        make: "BMW",
        model: "X5",
        year: 2024,
        licensePlate: "XYZ-002",
        color: "Black",
        category: "SUV",
        pricePerDay: 150.00,
        mileage: 5000,
      },
      {
        make: "Toyota",
        model: "Yaris",
        year: 2022,
        licensePlate: "DEF-003",
        color: "Blue",
        category: "ECONOMY",
        pricePerDay: 45.00,
        mileage: 28000,
      },
      {
        make: "Mercedes",
        model: "E-Class",
        year: 2024,
        licensePlate: "MRC-004",
        color: "Silver",
        category: "LUXURY",
        pricePerDay: 200.00,
        mileage: 3000,
      },
    ],
    skipDuplicates: true,
  });

  // Create sample customer
  await prisma.customer.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+995599123456",
      driverLicense: "DL123456",
      licenseExpiry: new Date("2027-01-01"),
      city: "Tbilisi",
      country: "GE",
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());