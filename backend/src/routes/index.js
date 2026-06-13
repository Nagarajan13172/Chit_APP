import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", service: "chit-backend" });
});

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
// Future modules mount here:
// router.use("/plans", planRoutes);
// router.use("/payments", paymentRoutes);
// router.use("/reports", reportRoutes);

export default router;
