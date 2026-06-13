import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";
import { startOfBusinessDay } from "../../utils/businessTime.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export async function createCustomer(data, userId) {
  return prisma.customer.create({
    data: { ...data, createdBy: userId },
  });
}

export async function updateCustomer(id, data) {
  // Explicit existence check for a clear 404 message.
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Customer not found");
  }
  return prisma.customer.update({ where: { id }, data });
}

export async function listCustomers({ page, limit, search, area, planId, status, withSummary, sortBy, sortOrder }) {
  const wantSummary = withSummary === "true";
  const today = startOfBusinessDay();
  const overdueInstallments = {
    some: { installments: { some: { status: { not: "PAID" }, dueDate: { lt: today } } } },
  };

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }
  if (area) where.area = { equals: area, mode: "insensitive" };

  // planId + status are AND-ed so they don't collide on the memberships relation.
  const and = [];
  if (planId) and.push({ memberships: { some: { chitPlanId: planId } } });
  if (status === "OVERDUE") and.push({ memberships: overdueInstallments });
  if (status === "UP_TO_DATE") and.push({ NOT: { memberships: overdueInstallments } });
  if (and.length) where.AND = and;

  const skip = (page - 1) * limit;
  const include = wantSummary
    ? {
        _count: { select: { memberships: true } },
        memberships: {
          include: {
            plan: { select: { id: true, name: true, chitValue: true } },
            installments: {
              select: {
                dueAmount: true,
                status: true,
                dueDate: true,
                payments: { select: { amount: true } },
              },
            },
          },
        },
      }
    : { _count: { select: { memberships: true } } };

  const [total, customers] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, include }),
  ]);

  const data = wantSummary ? customers.map((c) => withCustomerSummary(c, today)) : customers;

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Collapse a customer's memberships → a flat financial summary for the list view. */
function withCustomerSummary(customer, today) {
  const { memberships, ...rest } = customer;
  let totalValue = 0;
  let totalDue = 0;
  let amountPaid = 0;
  let overdueCount = 0;

  for (const m of memberships) {
    totalValue += Number(m.plan.chitValue);
    for (const inst of m.installments) {
      totalDue += Number(inst.dueAmount);
      amountPaid += inst.payments.reduce((s, p) => s + Number(p.amount), 0);
      if (inst.status !== "PAID" && inst.dueDate < today) overdueCount += 1;
    }
  }

  return {
    ...rest,
    summary: {
      groupName: memberships[0]?.plan.name ?? null,
      groupCount: memberships.length,
      totalValue: round2(totalValue),
      amountPaid: round2(amountPaid),
      totalDue: round2(totalDue),
      progress: totalDue > 0 ? Math.round((amountPaid / totalDue) * 100) : 0,
      overdueCount,
    },
  };
}

export async function searchByPhone(phone) {
  // Capped result set — a phone lookup, not a bulk export endpoint.
  return prisma.customer.findMany({
    where: { phone: { contains: phone } },
    orderBy: { name: "asc" },
    take: 25,
  });
}

/** Set/replace a customer's self-service portal password (staff action). */
export async function setPortalPassword(id, password) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Customer not found");
  const passwordHash = await hashPassword(password);
  await prisma.customer.update({ where: { id }, data: { passwordHash } });
  return { id, portalEnabled: true };
}

export async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { memberships: true } } },
  });
  if (!customer) {
    throw ApiError.notFound("Customer not found");
  }
  return customer;
}
