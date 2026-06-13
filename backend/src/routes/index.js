import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";
import planRoutes from "../modules/plans/plan.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", service: "chit-backend" });
});

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/plans", planRoutes);
// Future modules mount here:
// router.use("/payments", paymentRoutes);
// router.use("/reports", reportRoutes);

export default router;
