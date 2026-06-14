import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// paid_at is stored as `timestamp` (UTC); convert UTC -> business tz before bucketing.
// now() is timestamptz, so it only needs a single AT TIME ZONE conversion.
const paidAtLocal = Prisma.sql`(p.paid_at AT TIME ZONE 'UTC') AT TIME ZONE ${env.businessTz}`;
const todayLocal = Prisma.sql`(now() AT TIME ZONE ${env.businessTz})::date`;
const tomorrowLocal = Prisma.sql`((now() AT TIME ZONE ${env.businessTz})::date + 1)`;

/** Dashboard KPI cards: active customers/groups, this-month collections, pending & defaults. */
export async function getSummary() {
  const [totalCustomers, activeCustomers, activeChitGroups] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { memberships: { some: { status: "ACTIVE" } } } }),
    prisma.chitPlan.count({ where: { status: "ACTIVE" } }),
  ]);

  const [month] = await prisma.$queryRaw(Prisma.sql`
    SELECT COALESCE(SUM(p.amount), 0)::float AS amount,
           COALESCE(SUM(p.late_fee), 0)::float AS late_fees,
           COUNT(*)::int AS count
    FROM payments p
    WHERE date_trunc('month', ${paidAtLocal}) = date_trunc('month', now() AT TIME ZONE ${env.businessTz})
  `);

  // No installment is ever overpaid (Module 5 caps at remaining), so totalPending = totalDue - totalPaid.
  const [totals] = await prisma.$queryRaw(Prisma.sql`
    SELECT (SELECT COALESCE(SUM(due_amount), 0)::float FROM installments) AS total_due,
           (SELECT COALESCE(SUM(amount), 0)::float FROM payments) AS total_paid
  `);

  const [pendingStats] = await prisma.$queryRaw(Prisma.sql`
    SELECT
      COUNT(*) FILTER (WHERE i.status <> 'PAID' AND i.due_date < ${todayLocal})::int AS overdue_installments,
      COUNT(DISTINCT m.customer_id) FILTER (WHERE i.status <> 'PAID' AND i.due_date < ${todayLocal})::int AS defaulters
    FROM installments i JOIN memberships m ON m.id = i.membership_id
  `);

  return {
    totalCustomers,
    activeCustomers,
    activeChitGroups,
    collectionsThisMonth: {
      amount: round2(month.amount),
      lateFees: round2(month.late_fees),
      count: month.count,
    },
    totalCollected: round2(totals.total_paid),
    pending: {
      totalPending: round2(totals.total_due - totals.total_paid),
      overdueInstallments: pendingStats.overdue_installments,
      defaulters: pendingStats.defaulters,
    },
  };
}

/** Total collection report — totals plus breakdown by payment mode and by plan. */
export async function getCollectionsReport({ from, to, planId, mode, collectedBy }) {
  const conditions = [];
  // Bucket the date window by the business-tz calendar day (matches the summary's month bucket).
  if (from) conditions.push(Prisma.sql`(${paidAtLocal})::date >= ${from}::date`);
  if (to) conditions.push(Prisma.sql`(${paidAtLocal})::date <= ${to}::date`);
  if (mode) conditions.push(Prisma.sql`p.mode::text = ${mode}`);
  if (collectedBy) conditions.push(Prisma.sql`p.collected_by = ${collectedBy}`);
  if (planId) conditions.push(Prisma.sql`m.chit_plan_id = ${planId}`);
  const whereSql = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;

  const fromJoin = Prisma.sql`
    FROM payments p
    JOIN installments i ON i.id = p.installment_id
    JOIN memberships m ON m.id = i.membership_id
  `;

  const [totals] = await prisma.$queryRaw(Prisma.sql`
    SELECT COALESCE(SUM(p.amount), 0)::float AS amount,
           COALESCE(SUM(p.late_fee), 0)::float AS late_fees,
           COUNT(*)::int AS count
    ${fromJoin} ${whereSql}
  `);

  const byMode = await prisma.$queryRaw(Prisma.sql`
    SELECT p.mode::text AS mode, COALESCE(SUM(p.amount), 0)::float AS amount, COUNT(*)::int AS count
    ${fromJoin} ${whereSql}
    GROUP BY p.mode ORDER BY amount DESC
  `);

  const byPlan = await prisma.$queryRaw(Prisma.sql`
    SELECT m.chit_plan_id AS "planId", cp.name AS "planName",
           COALESCE(SUM(p.amount), 0)::float AS amount, COUNT(*)::int AS count
    ${fromJoin}
    JOIN chit_plans cp ON cp.id = m.chit_plan_id
    ${whereSql}
    GROUP BY m.chit_plan_id, cp.name ORDER BY amount DESC
  `);

  return {
    filters: { from: from ?? null, to: to ?? null, planId: planId ?? null, mode: mode ?? null, collectedBy: collectedBy ?? null },
    totals: {
      amount: round2(totals.amount),
      lateFees: round2(totals.late_fees),
      totalCollected: round2(totals.amount + totals.late_fees),
      count: totals.count,
    },
    byMode: byMode.map((r) => ({ mode: r.mode, amount: round2(r.amount), count: r.count })),
    byPlan: byPlan.map((r) => ({ planId: r.planId, planName: r.planName, amount: round2(r.amount), count: r.count })),
  };
}

/**
 * Collection reminders for staff. Returns unpaid installments split into two buckets:
 *   - dueSoon: due today or tomorrow (business tz) — "collect soon"
 *   - overdue: due date already passed and still unpaid
 * Each row carries the customer's name, address and the pending amount so the UI can
 * alert agents with who to collect from and how much. Only ACTIVE plans are included
 * (closed plans no longer accept collections). One query; bucketed in JS.
 */
export async function getReminders({ planId } = {}) {
  const planFilter = planId ? Prisma.sql`AND m.chit_plan_id = ${planId}` : Prisma.empty;

  const rows = await prisma.$queryRaw(Prisma.sql`
    SELECT
      i.id            AS "installmentId",
      i.month_number  AS "monthNumber",
      i.due_date      AS "dueDate",
      (i.due_amount - COALESCE(paid.amt, 0))::float AS pending,
      (${todayLocal} - i.due_date)::int             AS days_overdue,
      m.id            AS "membershipId",
      m.ticket_number AS "ticketNumber",
      c.id            AS "customerId",
      c.name          AS "customerName",
      c.phone         AS phone,
      c.address       AS address,
      c.area          AS area,
      cp.id           AS "planId",
      cp.name         AS "planName",
      CASE WHEN i.due_date < ${todayLocal} THEN 'OVERDUE' ELSE 'DUE_SOON' END AS bucket
    FROM installments i
    JOIN memberships m ON m.id = i.membership_id
    JOIN customers c   ON c.id = m.customer_id
    JOIN chit_plans cp ON cp.id = m.chit_plan_id
    LEFT JOIN (SELECT installment_id, SUM(amount) AS amt FROM payments GROUP BY installment_id) paid
      ON paid.installment_id = i.id
    WHERE cp.status = 'ACTIVE'
      AND i.due_date <= ${tomorrowLocal}
      AND (i.due_amount - COALESCE(paid.amt, 0)) > 0
      ${planFilter}
    ORDER BY i.due_date ASC, pending DESC
  `);

  const toRow = (r) => ({
    installmentId: r.installmentId,
    monthNumber: r.monthNumber,
    dueDate: r.dueDate,
    pending: round2(r.pending),
    daysOverdue: r.days_overdue,
    membershipId: r.membershipId,
    ticketNumber: r.ticketNumber,
    customer: { id: r.customerId, name: r.customerName, phone: r.phone, address: r.address, area: r.area },
    plan: { id: r.planId, name: r.planName },
  });

  const dueSoon = rows.filter((r) => r.bucket === "DUE_SOON").map(toRow);
  const overdue = rows.filter((r) => r.bucket === "OVERDUE").map(toRow);

  return { counts: { dueSoon: dueSoon.length, overdue: overdue.length }, dueSoon, overdue };
}

/** Pending collections report — memberships with outstanding dues, worst first. */
export async function getPendingReport({ page, limit, planId }) {
  const skip = (page - 1) * limit;
  const planFilter = planId ? Prisma.sql`WHERE m.chit_plan_id = ${planId}` : Prisma.empty;
  const overdueFilter = Prisma.sql`i.status <> 'PAID' AND i.due_date < ${todayLocal}`;
  // Per-installment paid totals, joined once so the membership-level SUMs don't double count.
  const paidJoin = Prisma.sql`
    LEFT JOIN (SELECT installment_id, SUM(amount) AS amt FROM payments GROUP BY installment_id) paid
      ON paid.installment_id = i.id
  `;
  const havingOutstanding = Prisma.sql`HAVING (COALESCE(SUM(i.due_amount), 0) - COALESCE(SUM(paid.amt), 0)) > 0`;

  // Single pass: COUNT(*) OVER() yields the full match count (computed before LIMIT) alongside the page.
  const rows = await prisma.$queryRaw(Prisma.sql`
    WITH outstanding AS (
      SELECT m.id AS "membershipId", c.id AS "customerId", c.name, c.phone, c.area,
             cp.id AS "planId", cp.name AS "planName",
             COALESCE(SUM(i.due_amount), 0)::float AS due,
             COALESCE(SUM(paid.amt), 0)::float AS paid,
             (COALESCE(SUM(i.due_amount), 0) - COALESCE(SUM(paid.amt), 0))::float AS pending,
             COUNT(*) FILTER (WHERE ${overdueFilter})::int AS overdue_count,
             MIN(i.due_date) FILTER (WHERE ${overdueFilter}) AS oldest_overdue
      FROM memberships m
      JOIN customers c ON c.id = m.customer_id
      JOIN chit_plans cp ON cp.id = m.chit_plan_id
      JOIN installments i ON i.membership_id = m.id
      ${paidJoin}
      ${planFilter}
      GROUP BY m.id, c.id, c.name, c.phone, c.area, cp.id, cp.name
      ${havingOutstanding}
    )
    SELECT *, COUNT(*) OVER()::int AS total_count
    FROM outstanding
    ORDER BY pending DESC, overdue_count DESC
    LIMIT ${limit} OFFSET ${skip}
  `);

  const total = rows[0]?.total_count ?? 0;

  return {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: rows.map((r) => ({
      membershipId: r.membershipId,
      customer: { id: r.customerId, name: r.name, phone: r.phone, area: r.area },
      plan: { id: r.planId, name: r.planName },
      totalDue: round2(r.due),
      totalPaid: round2(r.paid),
      pending: round2(r.pending),
      overdueCount: r.overdue_count,
      oldestOverdueDate: r.oldest_overdue,
    })),
  };
}
