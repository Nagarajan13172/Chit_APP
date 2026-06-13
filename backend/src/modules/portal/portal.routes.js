import { Router } from "express";
import * as portalController from "./portal.controller.js";
import { loginSchema, paySchema } from "./portal.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticateCustomer } from "../../middleware/authenticateCustomer.js";

const router = Router();

// Public
router.post("/login", validate(loginSchema), portalController.login);

// Customer-authenticated (portal) routes
router.get("/me", authenticateCustomer, portalController.me);
router.get("/dashboard", authenticateCustomer, portalController.dashboard);
router.get("/chits", authenticateCustomer, portalController.chits);
router.get("/payments", authenticateCustomer, portalController.payments);
router.post("/pay", authenticateCustomer, validate(paySchema), portalController.pay);

export default router;
