import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMonths } from "../src/utils/date.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Users (Auth module) ---
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const agentHash = await bcrypt.hash("Agent@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@chit.com" },
    update: {},
    create: { name: "Admin User", email: "admin@chit.com", passwordHash: adminHash, role: "ADMIN" },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@chit.com" },
    update: {},
    create: { name: "Agent User", email: "agent@chit.com", passwordHash: agentHash, role: "AGENT" },
  });

  console.log(`  Users: ${admin.email} (ADMIN), ${agent.email} (AGENT)`);

  // --- Sample customers (used by later modules) ---
  const customerSeed = [
    { name: "Rajesh Kumar Verma", phone: "9876500001", area: "T. Nagar" },
    { name: "Ananya Kulkarni", phone: "9876500002", area: "Adyar" },
    { name: "Suresh Raina", phone: "9876500003", area: "Velachery" },
    { name: "Priyanka Mishra", phone: "9876500004", area: "Anna Nagar" },
    { name: "Manoj Kumar", phone: "9876500005", area: "Mylapore" },
  ];

  const customers = [];
  for (const c of customerSeed) {
    const customer = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: { ...c, createdBy: admin.id },
    });
    customers.push(customer);
  }
  console.log(`  Customers: ${customers.length}`);

  // --- Sample chit plans ---
  const goldPlan = await prisma.chitPlan.create({
    data: {
      name: "Gold Monthly - G24",
      chitValue: 500000,
      installmentAmount: 20833.33,
      durationMonths: 24,
      totalMembers: 24,
      startDate: new Date("2025-01-01"),
      status: "ACTIVE",
    },
  });

  const silverPlan = await prisma.chitPlan.create({
    data: {
      name: "Silver Savings - S50",
      chitValue: 100000,
      installmentAmount: 8333.33,
      durationMonths: 12,
      totalMembers: 50,
      startDate: new Date("2025-03-01"),
      status: "ACTIVE",
    },
  });
  console.log(`  Chit plans: ${goldPlan.name}, ${silverPlan.name}`);

  // --- Assign two customers to the Gold plan + generate installment schedule ---
  for (let i = 0; i < 2; i++) {
    const customer = customers[i];
    const membership = await prisma.membership.create({
      data: {
        chitPlanId: goldPlan.id,
        customerId: customer.id,
        ticketNumber: i + 1,
      },
    });

    const installments = Array.from({ length: goldPlan.durationMonths }, (_, m) => ({
      membershipId: membership.id,
      monthNumber: m + 1,
      dueDate: addMonths(goldPlan.startDate, m),
      dueAmount: goldPlan.installmentAmount,
    }));
    await prisma.installment.createMany({ data: installments });
    console.log(`  Membership: ${customer.name} -> ${goldPlan.name} (${installments.length} installments)`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
