import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";

/** 404 handler for unmatched routes. */
export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Central error handler — normalizes all errors into a consistent JSON shape. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Validation errors from Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  // Known Prisma errors (e.g. unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // Postgres returns `target` as an array of column names for some indexes and the
      // index name (a string) for composite ones — handle both without leaking the raw name.
      const target = err.meta?.target;
      const message = Array.isArray(target)
        ? `A record with this ${target.join(", ")} already exists`
        : "A record with these details already exists";
      return res.status(409).json({ success: false, message });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }

  // Our own operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, ...(err.details && { errors: err.details }) });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
