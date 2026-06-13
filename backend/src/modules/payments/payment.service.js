import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { tempReceiptNumber, formatReceiptNumber } from "../../utils/receipt.js";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Assemble the receipt response from a payment + its installment/membership context. */
function buildReceipt(payment, installment, { installmentStatus, membershipStatus, pendingAfter }, collector) {
  const membership = installment.membership;
  const amount = Number(payment.amount);
  const lateFee = Number(payment.lateFee);
  return {
    receiptNumber: payment.receiptNumber,
    paymentId: payment.id,
    paidAt: payment.paidAt,
    customer: {
      id: membership.customer.id,
      name: membership.customer.name,
      phone: membership.customer.phone,
    },
    plan: { id: membership.plan.id, name: membership.plan.name },
    membership: {
      id: membership.id,
      ticketNumber: membership.ticketNumber,
      status: membershipStatus ?? membership.status,
    },
    installment: {
      id: installment.id,
      monthNumber: installment.monthNumber,
      dueDate: installment.dueDate,
      dueAmount: Number(installment.dueAmount),
      status: installmentStatus,
      pendingAfter,
    },
    payment: {
      mode: payment.mode,
      referenceNumber: payment.referenceNumber,
      notes: payment.notes,
      amount,
      lateFee,
      totalCollected: round2(amount + lateFee),
    },
    collectedBy: collector ? { id: collector.id, name: collector.name } : null,
  };
}

/**
 * Record a payment against an installment, atomically:
 * locks the installment, rejects over/duplicate payment, writes the payment,
 * updates the cached installment status, completes the membership when fully paid,
 * and returns a receipt.
 */
export async function recordPayment(input, user) {
  const { installmentId, amount, lateFee = 0, mode, referenceNumber, notes } = input;

  return prisma.$transaction(async (tx) => {
    // Serialize concurrent payments against the same installment.
    const locked = await tx.$queryRaw`SELECT id FROM installments WHERE id = ${installmentId} FOR UPDATE`;
    if (locked.length === 0) throw ApiError.notFound("Installment not found");

    const installment = await tx.installment.findUnique({
      where: { id: installmentId },
      include: {
        payments: { select: { amount: true } },
        membership: { include: { plan: true, customer: true } },
      },
    });

    // Lifecycle guard: a closed plan no longer accepts collections.
    // (DEFAULTED memberships are intentionally still collectable for recovery.)
    if (installment.membership.plan.status === "CLOSED") {
      throw ApiError.conflict("Cannot record a payment for a closed chit plan");
    }

    const dueAmount = Number(installment.dueAmount);
    const paidSoFar = round2(installment.payments.reduce((s, p) => s + Number(p.amount), 0));
    const remaining = round2(dueAmount - paidSoFar);

    if (remaining <= 0) throw ApiError.conflict("This installment is already fully paid");
    if (round2(amount) > remaining) {
      throw ApiError.badRequest(`Amount ${round2(amount)} exceeds the pending amount ${remaining} for this installment`);
    }

    // Insert with a placeholder receipt, then finalize using the generated id.
    const created = await tx.payment.create({
      data: {
        installmentId,
        amount,
        lateFee,
        mode,
        referenceNumber: referenceNumber ?? null,
        notes: notes ?? null,
        receiptNumber: tempReceiptNumber(),
        collectedBy: user.id,
      },
    });
    const payment = await tx.payment.update({
      where: { id: created.id },
      data: { receiptNumber: formatReceiptNumber(created.paidAt, created.id) },
    });

    // Maintain the cached installment status (OVERDUE stays a read-time, date-derived concept).
    const newPaid = round2(paidSoFar + Number(amount));
    const installmentStatus = newPaid >= dueAmount ? "PAID" : "PARTIAL";
    await tx.installment.update({ where: { id: installmentId }, data: { status: installmentStatus } });

    // Complete the membership once every installment is fully paid.
    let membershipStatus = installment.membership.status;
    if (installmentStatus === "PAID") {
      // Lock the membership row so concurrent payments on *different* installments of the
      // same membership serialize their completion check (avoids a lost-update under Read Committed).
      await tx.$queryRaw`SELECT id FROM memberships WHERE id = ${installment.membershipId} FOR UPDATE`;
      const unpaid = await tx.installment.count({
        where: { membershipId: installment.membershipId, status: { not: "PAID" } },
      });
      if (unpaid === 0 && membershipStatus === "ACTIVE") {
        await tx.membership.update({ where: { id: installment.membershipId }, data: { status: "COMPLETED" } });
        membershipStatus = "COMPLETED";
      }
    }

    return buildReceipt(
      payment,
      installment,
      { installmentStatus, membershipStatus, pendingAfter: round2(remaining - Number(amount)) },
      { id: user.id, name: user.name }
    );
  });
}

/** Paginated payment list with optional customer/membership/mode/date filters. */
export async function listPayments({ page, limit, mode, customerId, membershipId, from, to, sortOrder }) {
  const where = {};
  if (mode) where.mode = mode;
  if (from || to) {
    where.paidAt = { ...(from && { gte: from }), ...(to && { lte: to }) };
  }
  const instWhere = {};
  if (membershipId) instWhere.membershipId = membershipId;
  if (customerId) instWhere.membership = { customerId };
  if (Object.keys(instWhere).length) where.installment = instWhere;

  const skip = (page - 1) * limit;

  const [total, payments] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paidAt: sortOrder },
      include: {
        collector: { select: { id: true, name: true } },
        installment: {
          select: {
            id: true,
            monthNumber: true,
            membership: {
              select: {
                id: true,
                ticketNumber: true,
                customer: { select: { id: true, name: true, phone: true } },
                plan: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const data = payments.map((p) => ({
    id: p.id,
    receiptNumber: p.receiptNumber,
    amount: Number(p.amount),
    lateFee: Number(p.lateFee),
    totalCollected: round2(Number(p.amount) + Number(p.lateFee)),
    mode: p.mode,
    referenceNumber: p.referenceNumber,
    paidAt: p.paidAt,
    monthNumber: p.installment.monthNumber,
    installmentId: p.installment.id,
    membershipId: p.installment.membership.id,
    customer: p.installment.membership.customer,
    plan: p.installment.membership.plan,
    collectedBy: p.collector,
  }));

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

/** Rebuild the receipt for a stored payment. */
export async function getReceipt(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      collector: { select: { id: true, name: true } },
      installment: {
        include: {
          payments: { select: { amount: true } },
          membership: { include: { plan: true, customer: true } },
        },
      },
    },
  });
  if (!payment) throw ApiError.notFound("Payment not found");

  const installment = payment.installment;
  const dueAmount = Number(installment.dueAmount);
  const paidSoFar = round2(installment.payments.reduce((s, p) => s + Number(p.amount), 0));

  return buildReceipt(
    payment,
    installment,
    {
      installmentStatus: installment.status,
      membershipStatus: installment.membership.status,
      pendingAfter: round2(Math.max(0, dueAmount - paidSoFar)),
    },
    payment.collector
  );
}
