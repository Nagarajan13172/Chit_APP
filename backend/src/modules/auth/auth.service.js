import { prisma } from "../../config/prisma.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/ApiError.js";

/** Strip the password hash before returning a user to clients. */
function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
  return { token, user: toPublicUser(user) };
}

export async function createUser({ name, email, password, role }) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });
  return toPublicUser(user);
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return toPublicUser(user);
}
