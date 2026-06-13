/** Domain types for authentication, mirroring the backend User model. */

export type Role = "ADMIN" | "AGENT";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Shape of `data` returned by POST /auth/login. */
export interface LoginResponse {
  token: string;
  user: User;
}
