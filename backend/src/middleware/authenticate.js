import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

/** Verifies the Bearer JWT and attaches { id, email, role, name } to req.user. */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  try {
    const payload = verifyToken(token);
    // Customer (portal) tokens must never authenticate staff endpoints.
    if (payload.type === "customer") {
      return next(ApiError.unauthorized("Invalid token for this resource"));
    }
    req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
    next();
  } catch (err) {
    next(err); // handled by errorHandler (JsonWebTokenError / TokenExpiredError)
  }
}
