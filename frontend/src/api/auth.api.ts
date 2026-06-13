import { api } from "@/api/client";
import type { ApiSuccess } from "@/api/types";
import type { LoginCredentials, LoginResponse, User } from "@/types/auth";

/** POST /auth/login — exchange credentials for a JWT + user. */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<ApiSuccess<LoginResponse>>("/auth/login", credentials);
  return data.data;
}

/** GET /auth/me — fetch the current authenticated user (validates the token). */
export async function getMe(): Promise<User> {
  const { data } = await api.get<ApiSuccess<User>>("/auth/me");
  return data.data;
}
