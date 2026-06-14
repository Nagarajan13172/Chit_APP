import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { addMonths } from "../../utils/date.js";

export async function createPlan(data) {
  const installmentAmount =
    data.installmentAmount ?? Number((Number(data.chitValue) / data.durationMonths).toFixed(2));

  return prisma.chitPlan.create({
    data: {
      name: data.name,
      chitValue: data.chitValue,
      installmentAmount,
      durationMonths: data.durationMonths,
      totalMembers: data.totalMembers,
      startDate: data.startDate,
      status: data.status,
    },
  });
}

/**
 * Update a chit plan. Name, total members and status can always change.
 * The financial/structural terms (chit value, installment, duration, start date)
 * are locked once members are assigned, because each membership already has a
 * generated installment schedule derived from them — changing them would silently
 * desync those schedules. Total members can never drop below the assigned count.
 */
export async function updatePlan(id, data) {
  const existing = await prisma.chitPlan.findUnique({
    where: { id },
    include: { _count: { select: { memberships: true } } },
  });
  if (!existing) throw ApiError.notFound("Chit plan not found");

  const memberCount = existing._count.memberships;

  if (data.totalMembers != null && data.totalMembers < memberCount) {
    throw ApiError.badRequest(
      `Total members cannot be below the ${memberCount} member(s) already assigned`
    );
  }

  const update = {};
  if (data.name != null) update.name = data.name;
  if (data.totalMembers != null) update.totalMembers = data.totalMembers;
  if (data.status != null) update.status = data.status;

  if (memberCount === 0) {
    if (data.chitValue != null) update.chitValue = data.chitValue;
    if (data.durationMonths != null) update.durationMonths = data.durationMonths;
    if (data.startDate != null) update.startDate = data.startDate;
    // Re-derive the installment when omitted (mirrors createPlan).
    const chitValue = data.chitValue ?? Number(existing.chitValue);
    const durationMonths = data.durationMonths ?? existing.durationMonths;
    update.installmentAmount =
      data.installmentAmount ?? Number((Number(chitValue) / durationMonths).toFixed(2));
  } else {
    const lockedChanged =
      (data.chitValue != null && Number(data.chitValue) !== Number(existing.chitValue)) ||
      (data.installmentAmount != null &&
        Number(data.installmentAmount) !== Number(existing.installmentAmount)) ||
      (data.durationMonths != null && data.durationMonths !== existing.durationMonths) ||
      (data.startDate != null &&
        new Date(data.startDate).getTime() !== new Date(existing.startDate).getTime());
    if (lockedChanged) {
      throw ApiError.badRequest(
        "Chit value, installment, duration and start date cannot be changed after members are assigned"
      );
    }
  }

  return prisma.chitPlan.update({
    where: { id },
    data: update,
    include: { _count: { select: { memberships: true } } },
  });
}

export async function listPlans({ page, limit, search, status, sortBy, sortOrder }) {
  const where = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [total, plans] = await prisma.$transaction([
    prisma.chitPlan.count({ where }),
    prisma.chitPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { memberships: true } } },
    }),
  ]);

  return {
    data: plans,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Set a plan's lifecycle status (ACTIVE/CLOSED). Idempotent. */
export async function updatePlanStatus(id, status) {
  const existing = await prisma.chitPlan.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Chit plan not found");
  return prisma.chitPlan.update({
    where: { id },
    data: { status },
    include: { _count: { select: { memberships: true } } },
  });
}

export async function getPlanById(id) {
  const plan = await prisma.chitPlan.findUnique({
    where: { id },
    include: { _count: { select: { memberships: true } } },
  });
  if (!plan) throw ApiError.notFound("Chit plan not found");
  return plan;
}

/**
 * Build the monthly installment schedule for a membership.
 * When the installment amount is the derived/balanced value (installment * months ≈ chitValue),
 * the final installment absorbs the rounding remainder so the schedule sums exactly to chitValue.
 */
function buildInstallments(plan, membershipId) {
  const base = Number(plan.installmentAmount);
  const total = Number(plan.chitValue);
  const n = plan.durationMonths;
  const balanced = Math.abs(total - base * n) < 0.01 * n + 0.001;
  const lastAmount = balanced ? Number((total - base * (n - 1)).toFixed(2)) : base;

  return Array.from({ length: n }, (_, m) => ({
    membershipId,
    monthNumber: m + 1,
    dueDate: addMonths(plan.startDate, m),
    dueAmount: m === n - 1 ? lastAmount : base,
  }));
}

/**
 * Assign a customer to a plan and generate the full monthly installment schedule
 * (one row per month) atomically. A row lock on the plan serializes concurrent
 * assigns so capacity and ticket-number allocation are race-safe.
 */
export async function assignMember(planId, { customerId, ticketNumber }) {
  const plan = await prisma.chitPlan.findUnique({ where: { id: planId } });
  if (!plan) throw ApiError.notFound("Chit plan not found");
  if (plan.status !== "ACTIVE") throw ApiError.badRequest("Cannot assign members to a closed plan");

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw ApiError.notFound("Customer not found");

  if (ticketNumber != null && ticketNumber > plan.totalMembers) {
    throw ApiError.badRequest(`Ticket number must be between 1 and ${plan.totalMembers}`);
  }

  return prisma.$transaction(async (tx) => {
    // Serialize concurrent assigns to this plan (capacity + ticket allocation below depend on a consistent read).
    await tx.$queryRaw`SELECT id FROM chit_plans WHERE id = ${planId} FOR UPDATE`;

    const members = await tx.membership.findMany({
      where: { chitPlanId: planId },
      select: { customerId: true, ticketNumber: true },
    });

    if (members.some((m) => m.customerId === customerId)) {
      throw ApiError.conflict("Customer is already assigned to this plan");
    }
    if (members.length >= plan.totalMembers) {
      throw ApiError.conflict("Chit plan has reached its member capacity");
    }

    // Allocate a ticket number: validate an explicit one, else pick the lowest free slot.
    const taken = new Set(members.map((m) => m.ticketNumber).filter((t) => t != null));
    let ticket = ticketNumber ?? null;
    if (ticket == null) {
      for (let i = 1; i <= plan.totalMembers; i++) {
        if (!taken.has(i)) {
          ticket = i;
          break;
        }
      }
    } else if (taken.has(ticket)) {
      throw ApiError.conflict(`Ticket number ${ticket} is already taken in this plan`);
    }

    const membership = await tx.membership.create({
      data: { chitPlanId: planId, customerId, ticketNumber: ticket },
    });

    const installments = buildInstallments(plan, membership.id);
    await tx.installment.createMany({ data: installments });

    return { ...membership, installmentsGenerated: installments.length };
  });
}

export async function listPlanMembers(planId) {
  const plan = await prisma.chitPlan.findUnique({ where: { id: planId } });
  if (!plan) throw ApiError.notFound("Chit plan not found");

  return prisma.membership.findMany({
    where: { chitPlanId: planId },
    orderBy: [{ ticketNumber: "asc" }, { id: "asc" }],
    include: {
      customer: { select: { id: true, name: true, phone: true, area: true } },
      _count: { select: { installments: true } },
    },
  });
}
