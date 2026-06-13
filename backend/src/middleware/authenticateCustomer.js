import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Verifies a customer (portal) Bearer JWT and attaches { id, name, phone } to
 * req.customer. Rejects staff tokens — the portal is customer-only.
 */
export function authenticateCustomer(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  try {
    const payload = verifyToken(token);
    if (payload.type !== "customer") {
      return next(ApiError.unauthorized("Customer token required"));
    }
    req.customer = { id: payload.sub, name: payload.name, phone: payload.phone };
    next();
  } catch (err) {
    next(err);
  }
}
