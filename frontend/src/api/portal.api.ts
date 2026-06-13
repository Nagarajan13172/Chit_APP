import { portalApi } from "@/api/portal-client";
import type { ApiSuccess } from "@/api/types";
import type {
  PortalChits,
  PortalCredentials,
  PortalCustomer,
  PortalDashboard,
  PortalLoginResponse,
  PortalPayment,
  PortalReceipt,
} from "@/types/portal";

/** POST /portal/login — phone + password. */
export async function login(credentials: PortalCredentials): Promise<PortalLoginResponse> {
  const { data } = await portalApi.post<ApiSuccess<PortalLoginResponse>>("/portal/login", credentials);
  return data.data;
}

export async function getMe(): Promise<PortalCustomer> {
  const { data } = await portalApi.get<ApiSuccess<PortalCustomer>>("/portal/me");
  return data.data;
}

export async function getDashboard(): Promise<PortalDashboard> {
  const { data } = await portalApi.get<ApiSuccess<PortalDashboard>>("/portal/dashboard");
  return data.data;
}

export async function getChits(): Promise<PortalChits> {
  const { data } = await portalApi.get<ApiSuccess<PortalChits>>("/portal/chits");
  return data.data;
}

export async function getPayments(): Promise<PortalPayment[]> {
  const { data } = await portalApi.get<ApiSuccess<PortalPayment[]>>("/portal/payments");
  return data.data;
}

/** POST /portal/pay — pay the next due installment of a membership. */
export async function pay(membershipId: number): Promise<PortalReceipt> {
  const { data } = await portalApi.post<ApiSuccess<PortalReceipt>>("/portal/pay", { membershipId });
  return data.data;
}
