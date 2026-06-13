import { api } from "@/api/client";
import type { ApiSuccess } from "@/api/types";
import type { CustomerHistory, CustomerPending, MembershipSchedule } from "@/types/collection";

/** GET /memberships/:id/installments — schedule + summary for one membership. */
export async function getMembershipSchedule(membershipId: number): Promise<MembershipSchedule> {
  const { data } = await api.get<ApiSuccess<MembershipSchedule>>(
    `/memberships/${membershipId}/installments`,
  );
  return data.data;
}

/** GET /customers/:id/history — all memberships, installments and payments. */
export async function getCustomerHistory(customerId: number): Promise<CustomerHistory> {
  const { data } = await api.get<ApiSuccess<CustomerHistory>>(`/customers/${customerId}/history`);
  return data.data;
}

/** GET /customers/:id/pending — pending totals + per-plan breakdown. */
export async function getCustomerPending(customerId: number): Promise<CustomerPending> {
  const { data } = await api.get<ApiSuccess<CustomerPending>>(`/customers/${customerId}/pending`);
  return data.data;
}
