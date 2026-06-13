import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = new Set(env.corsOrigins);
const isDev = env.nodeEnv !== "production";
const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * CORS origin check. Allows configured origins always, plus any localhost
 * origin (any port) in development so the Vite dev server works even when it
 * auto-bumps to a different port. Requests with no Origin (curl/Postman) pass.
 */
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.has(origin)) return callback(null, true);
  if (isDev && localhostOrigin.test(origin)) return callback(null, true);
  return callback(new Error(`Not allowed by CORS: ${origin}`));
}

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
