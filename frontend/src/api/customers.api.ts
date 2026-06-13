import { api } from "@/api/client";
import type { ApiSuccess } from "@/api/types";
import type {
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerPayload,
} from "@/types/customer";

/** GET /customers — paginated, filterable, sortable list. */
export async function listCustomers(params: CustomerListParams): Promise<CustomerListResponse> {
  const { data } = await api.get<CustomerListResponse>("/customers", { params });
  return data;
}

/** GET /customers/:id — single customer with membership count. */
export async function getCustomer(id: number): Promise<Customer> {
  const { data } = await api.get<ApiSuccess<Customer>>(`/customers/${id}`);
  return data.data;
}

/** POST /customers — create a customer. */
export async function createCustomer(payload: CustomerPayload): Promise<Customer> {
  const { data } = await api.post<ApiSuccess<Customer>>("/customers", payload);
  return data.data;
}

/** PUT /customers/:id — update (partial) a customer. */
export async function updateCustomer(
  id: number,
  payload: Partial<CustomerPayload>,
): Promise<Customer> {
  const { data } = await api.put<ApiSuccess<Customer>>(`/customers/${id}`, payload);
  return data.data;
}

/** POST /customers/:id/portal-password — enable/reset the member's portal login (staff). */
export async function setPortalPassword(id: number, password: string): Promise<void> {
  await api.post(`/customers/${id}/portal-password`, { password });
}

/** GET /customers/search?phone= — quick phone lookup (3–10 digits, capped at 25). */
export async function searchCustomersByPhone(phone: string): Promise<Customer[]> {
  const { data } = await api.get<ApiSuccess<Customer[]>>("/customers/search", {
    params: { phone },
  });
  return data.data;
}
