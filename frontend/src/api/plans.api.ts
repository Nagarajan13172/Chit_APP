import { api } from "@/api/client";
import type { ApiSuccess } from "@/api/types";
import type {
  AssignMemberPayload,
  AssignMemberResult,
  ChitPlan,
  PlanListParams,
  PlanListResponse,
  PlanMember,
  PlanPayload,
  PlanStatus,
} from "@/types/plan";

/** GET /plans — paginated, filterable, sortable list. */
export async function listPlans(params: PlanListParams): Promise<PlanListResponse> {
  const { data } = await api.get<PlanListResponse>("/plans", { params });
  return data;
}

/** GET /plans/:id — single plan with membership count. */
export async function getPlan(id: number): Promise<ChitPlan> {
  const { data } = await api.get<ApiSuccess<ChitPlan>>(`/plans/${id}`);
  return data.data;
}

/** GET /plans/:id/members — members with customer + installment count. */
export async function listPlanMembers(id: number): Promise<PlanMember[]> {
  const { data } = await api.get<ApiSuccess<PlanMember[]>>(`/plans/${id}/members`);
  return data.data;
}

/** POST /plans — create a plan (ADMIN only). */
export async function createPlan(payload: PlanPayload): Promise<ChitPlan> {
  const { data } = await api.post<ApiSuccess<ChitPlan>>("/plans", payload);
  return data.data;
}

/** PUT /plans/:id — update plan details (ADMIN only). */
export async function updatePlan(id: number, payload: Partial<PlanPayload>): Promise<ChitPlan> {
  const { data } = await api.put<ApiSuccess<ChitPlan>>(`/plans/${id}`, payload);
  return data.data;
}

/** PATCH /plans/:id/status — close or reopen a plan (ADMIN only). */
export async function updatePlanStatus(id: number, status: PlanStatus): Promise<ChitPlan> {
  const { data } = await api.patch<ApiSuccess<ChitPlan>>(`/plans/${id}/status`, { status });
  return data.data;
}

/** POST /plans/:id/members — assign a customer to a plan (ADMIN only). */
export async function assignMember(
  planId: number,
  payload: AssignMemberPayload,
): Promise<AssignMemberResult> {
  const { data } = await api.post<ApiSuccess<AssignMemberResult>>(
    `/plans/${planId}/members`,
    payload,
  );
  return data.data;
}
