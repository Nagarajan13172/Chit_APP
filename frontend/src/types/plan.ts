/** Chit plan + membership domain types, mirroring the backend models. */
import type { ListResponse, SortOrder } from "./common";

export type PlanStatus = "ACTIVE" | "CLOSED";
export type MembershipStatus = "ACTIVE" | "COMPLETED" | "DEFAULTED";

export interface ChitPlan {
  id: number;
  name: string;
  /** Prisma Decimal — serialized as a string. */
  chitValue: string;
  installmentAmount: string;
  durationMonths: number;
  totalMembers: number;
  /** ISO date (date-only on the backend). */
  startDate: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { memberships: number };
}

export type PlanSortBy = "name" | "startDate" | "createdAt";

export interface PlanListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlanStatus;
  sortBy?: PlanSortBy;
  sortOrder?: SortOrder;
}

export type PlanListResponse = ListResponse<ChitPlan>;

export interface PlanPayload {
  name: string;
  chitValue: number;
  installmentAmount?: number;
  durationMonths: number;
  totalMembers: number;
  /** "yyyy-MM-dd". */
  startDate: string;
  status: PlanStatus;
}

/** A plan member as returned by GET /plans/:id/members. */
export interface PlanMember {
  id: number;
  chitPlanId: number;
  customerId: number;
  ticketNumber: number | null;
  status: MembershipStatus;
  joinDate: string;
  customer: { id: number; name: string; phone: string; area: string | null };
  _count?: { installments: number };
  createdAt: string;
  updatedAt: string;
}

export interface AssignMemberPayload {
  customerId: number;
  ticketNumber?: number;
}

/** Result of POST /plans/:id/members. */
export interface AssignMemberResult {
  id: number;
  chitPlanId: number;
  customerId: number;
  ticketNumber: number | null;
  status: MembershipStatus;
  installmentsGenerated: number;
}
