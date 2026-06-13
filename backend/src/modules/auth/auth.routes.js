import { Router } from "express";
import * as authController from "./auth.controller.js";
import { loginSchema, createUserSchema } from "./auth.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

// Public
router.post("/login", validate(loginSchema), authController.login);

// Authenticated
router.get("/me", authenticate, authController.me);

// Admin only — create agents/admins
router.post("/users", authenticate, authorize("ADMIN"), validate(createUserSchema), authController.createUser);

export default router;
