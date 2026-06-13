import dotenv from "dotenv";

dotenv.config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  // Accept a comma-separated list of allowed origins (e.g. "http://localhost:5173,http://localhost:5178").
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || "development",
  // Business timezone used to decide the "today" boundary for overdue installments.
  businessTz: process.env.BUSINESS_TZ || "Asia/Kolkata",
};
