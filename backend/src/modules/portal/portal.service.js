import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import * as collectionService from "../collections/collection.service.js";
import * as paymentService from "../payments/payment.service.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Strip the password hash before returning a customer to the client. */
function toPublic(customer) {
  const { passwordHash, ...rest } = customer;
  return rest;
}

/** Customer portal login by phone + password. */
export async function login({ phone, password }) {
  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer || !customer.passwordHash) {
    throw ApiError.unauthorized("Invalid phone or password");
  }
  const ok = await comparePassword(password, customer.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid phone or password");

  const token = signToken({ sub: customer.id, type: "customer", name: customer.name, phone: customer.phone });
  return { token, customer: toPublic(customer) };
}

export async function getProfile(customerId) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw ApiError.notFound("Customer not found");
  return toPublic(customer);
}

/** Member self-service profile update (name/email/address/area only). */
export async function updateProfile(customerId, data) {
  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) throw ApiError.notFound("Customer not found");
  const customer = await prisma.customer.update({ where: { id: customerId }, data });
  return toPublic(customer);
}

/** Member dashboard: investment summary, per-chit progress, next due, recent payments. */
export async function getDashboard(customerId) {
  const history = await collectionService.getCustomerHistory(customerId);

  let nextDue = null;
  const chits = history.memberships.map((m) => {
    const paidMonths = m.installments.filter((i) => i.status === "PAID").length;
    const firstUnpaid = m.installments.find((i) => i.pending > 0);
    const due = firstUnpaid
      ? {
          installmentId: firstUnpaid.id,
          monthNumber: firstUnpaid.monthNumber,
          dueDate: firstUnpaid.dueDate,
          amount: firstUnpaid.pending,
          isOverdue: firstUnpaid.isOverdue,
        }
      : null;

    if (due && (!nextDue || due.dueDate < nextDue.dueDate)) {
      nextDue = { membershipId: m.membershipId, planName: m.plan.name, ...due };
    }

    return {
      membershipId: m.membershipId,
      planName: m.plan.name,
      ticketNumber: m.ticketNumber,
      status: m.status,
      totalMonths: m.summary.installmentCount,
      paidMonths,
      progress: m.summary.totalDue > 0 ? Math.round((m.summary.totalPaid / m.summary.totalDue) * 100) : 0,
      totalValue: m.summary.totalDue,
      paid: m.summary.totalPaid,
      pending: m.summary.totalPending,
      overdueCount: m.summary.overdueCount,
      nextDue: due,
    };
  });

  const recentPayments = [];
  for (const m of history.memberships) {
    for (const inst of m.installments) {
      for (const p of inst.payments ?? []) {
        recentPayments.push({
          id: p.id,
          planName: m.plan.name,
          monthNumber: inst.monthNumber,
          amount: p.amount,
          mode: p.mode,
          receiptNumber: p.receiptNumber,
          paidAt: p.paidAt,
        });
      }
    }
  }
  recentPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  // Total still owed on installments whose due date has already passed.
  const overdueAmount = round2(
    history.memberships
      .flatMap((m) => m.installments)
      .filter((i) => i.isOverdue)
      .reduce((s, i) => s + i.pending, 0),
  );

  return {
    customer: history.customer,
    summary: {
      totalInvested: history.summary.totalPaid,
      totalValue: history.summary.totalDue,
      totalPending: history.summary.totalPending,
      overdueCount: history.summary.overdueCount,
      overdueAmount,
      activeChits: history.memberships.filter((m) => m.status === "ACTIVE").length,
    },
    nextDue,
    chits,
    recentPayments: recentPayments.slice(0, 6),
  };
}

/** Full chits + installment schedules for the customer (My Chits page). */
export async function getChits(customerId) {
  const history = await collectionService.getCustomerHistory(customerId);
  return { customer: history.customer, summary: history.summary, memberships: history.memberships };
}

/** Payment history for the customer. */
export async function getPayments(customerId) {
  const result = await paymentService.listPayments({
    page: 1,
    limit: 100,
    customerId,
    sortOrder: "desc",
  });
  return result.data;
}

/**
 * Self-service "Pay Now": records an online (UPI) payment for the next pending
 * installment of one of the customer's memberships, returning the receipt.
 */
export async function pay(customerId, { membershipId }) {
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, customerId } });
  if (!membership) throw ApiError.notFound("Chit membership not found");

  const installments = await prisma.installment.findMany({
    where: { membershipId },
    orderBy: { monthNumber: "asc" },
    include: { payments: { select: { amount: true } } },
  });

  let target = null;
  for (const inst of installments) {
    const paid = inst.payments.reduce((s, p) => s + Number(p.amount), 0);
    const pending = round2(Number(inst.dueAmount) - paid);
    if (pending > 0) {
      target = { id: inst.id, pending };
      break;
    }
  }
  if (!target) throw ApiError.badRequest("All installments for this chit are already paid");

  // The collector FK requires a staff user — attribute the online payment to the onboarding agent.
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { createdBy: true, name: true },
  });

  return paymentService.recordPayment(
    {
      installmentId: target.id,
      amount: target.pending,
      lateFee: 0,
      mode: "UPI",
      referenceNumber: `ONLINE-${Date.now()}`,
      notes: "Online self-service payment (member portal)",
    },
    { id: customer.createdBy, name: customer.name },
  );
}
