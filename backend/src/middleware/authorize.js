import { ApiError } from "../utils/ApiError.js";

/**
 * Role-based guard. Use after `authenticate`.
 * Example: router.post("/", authenticate, authorize("ADMIN"), handler)
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}
