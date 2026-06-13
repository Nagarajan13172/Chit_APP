import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * The current calendar day in the business timezone, expressed as a UTC-midnight Date
 * so it compares cleanly against @db.Date dueDate values (also UTC midnight).
 */
function startOfBusinessDay() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: env.businessTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
}

// Full include — used where the response surfaces individual receipts (schedule, history).
const installmentsIncludeFull = {
  orderBy: { monthNumber: "asc" },
  include: {
    payments: {
      orderBy: { paidAt: "asc" },
      select: { id: true, amount: true, lateFee: true, mode: true, receiptNumber: true, paidAt: true },
    },
  },
};

// Light include — only the columns needed to compute sums (pending/summary path).
const installmentsIncludeLight = {
  orderBy: { monthNumber: "asc" },
  include: { payments: { select: { amount: true, lateFee: true } } },
};

/**
 * Derive an installment's paid/pending/status from its payment ledger.
 * Money is rounded to cents BEFORE comparisons so status and pending never disagree.
 * `isOverdue` is orthogonal to status so a partially-paid past-due installment still counts as overdue.
 * Late fees are tracked separately and do NOT count toward the principal due.
 */
function viewInstallment(inst, today, { withPaymentDetails = true } = {}) {
  const dueAmount = round2(Number(inst.dueAmount));
  const paidAmount = round2(inst.payments.reduce((s, p) => s + Number(p.amount), 0));
  const lateFeePaid = round2(inst.payments.reduce((s, p) => s + Number(p.lateFee), 0));
  const pending = round2(Math.max(0, dueAmount - paidAmount));
  const isOverdue = pending > 0 && inst.dueDate < today;

  let status;
  if (paidAmount >= dueAmount) status = "PAID";
  else if (paidAmount > 0) status = "PARTIAL";
  else status = inst.dueDate < today ? "OVERDUE" : "PENDING";

  const view = {
    id: inst.id,
    monthNumber: inst.monthNumber,
    dueDate: inst.dueDate,
    dueAmount,
    paidAmount,
    lateFeePaid,
    pending,
    status,
    isOverdue,
  };
  if (withPaymentDetails) {
    view.payments = inst.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      lateFee: Number(p.lateFee),
      mode: p.mode,
      receiptNumber: p.receiptNumber,
      paidAt: p.paidAt,
    }));
  }
  return view;
}

/** Aggregate a list of installment views into a summary block. */
function summarize(views) {
  return {
    installmentCount: views.length,
    totalDue: round2(views.reduce((s, v) => s + v.dueAmount, 0)),
    totalPaid: round2(views.reduce((s, v) => s + v.paidAmount, 0)),
    totalPending: round2(views.reduce((s, v) => s + v.pending, 0)),
    // Sum of amounts paid beyond an installment's due; lets clients reconcile:
    // totalDue - totalPaid + overpaid === totalPending.
    overpaid: round2(views.reduce((s, v) => s + Math.max(0, v.paidAmount - v.dueAmount), 0)),
    lateFeesPaid: round2(views.reduce((s, v) => s + v.lateFeePaid, 0)),
    paidCount: views.filter((v) => v.status === "PAID").length,
    partialCount: views.filter((v) => v.status === "PARTIAL").length,
    pendingCount: views.filter((v) => v.status === "PENDING").length,
    // Counts both fully-unpaid and partially-paid past-due installments.
    overdueCount: views.filter((v) => v.isOverdue).length,
  };
}

/** Installment schedule + summary for a single membership. */
export async function getMembershipSchedule(membershipId) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      plan: { select: { id: true, name: true, installmentAmount: true, durationMonths: true, chitValue: true } },
      customer: { select: { id: true, name: true, phone: true } },
      installments: installmentsIncludeFull,
    },
  });
  if (!membership) throw ApiError.notFound("Membership not found");

  const today = startOfBusinessDay();
  const installments = membership.installments.map((i) => viewInstallment(i, today));

  return {
    membership: {
      id: membership.id,
      ticketNumber: membership.ticketNumber,
      status: membership.status,
      plan: membership.plan,
      customer: membership.customer,
    },
    summary: summarize(installments),
    installments,
  };
}

/** Build per-membership views for a customer (shared by history + pending). */
async function buildCustomerMembershipViews(customerId, { withPaymentDetails = true } = {}) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw ApiError.notFound("Customer not found");

  const memberships = await prisma.membership.findMany({
    where: { customerId },
    orderBy: { id: "asc" },
    include: {
      plan: { select: { id: true, name: true, installmentAmount: true, durationMonths: true } },
      installments: withPaymentDetails ? installmentsIncludeFull : installmentsIncludeLight,
    },
  });

  const today = startOfBusinessDay();
  const views = memberships.map((m) => {
    const installments = m.installments.map((i) => viewInstallment(i, today, { withPaymentDetails }));
    return {
      membershipId: m.id,
      ticketNumber: m.ticketNumber,
      status: m.status,
      plan: m.plan,
      summary: summarize(installments),
      installments,
    };
  });

  const allInstallments = views.flatMap((v) => v.installments);
  return { customer, views, overall: summarize(allInstallments) };
}

/** Full collection history for a customer (all memberships, installments, and payments). */
export async function getCustomerHistory(customerId) {
  const { customer, views, overall } = await buildCustomerMembershipViews(customerId, { withPaymentDetails: true });
  return {
    customer: { id: customer.id, name: customer.name, phone: customer.phone, area: customer.area },
    summary: overall,
    memberships: views,
  };
}

/** Pending-amount breakdown for a customer (totals + per-plan). Skips loading full payment rows. */
export async function getCustomerPending(customerId) {
  const { customer, views, overall } = await buildCustomerMembershipViews(customerId, { withPaymentDetails: false });
  return {
    customerId: customer.id,
    customerName: customer.name,
    totalDue: overall.totalDue,
    totalPaid: overall.totalPaid,
    totalPending: overall.totalPending,
    overdueCount: overall.overdueCount,
    byPlan: views.map((v) => ({
      membershipId: v.membershipId,
      planId: v.plan.id,
      planName: v.plan.name,
      totalDue: v.summary.totalDue,
      totalPaid: v.summary.totalPaid,
      pending: v.summary.totalPending,
      overdueCount: v.summary.overdueCount,
    })),
  };
}
