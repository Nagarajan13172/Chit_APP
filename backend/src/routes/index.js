import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";
import planRoutes from "../modules/plans/plan.routes.js";
import collectionRoutes from "../modules/collections/collection.routes.js";
import paymentRoutes from "../modules/payments/payment.routes.js";
import reportRoutes from "../modules/reports/report.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", service: "chit-backend" });
});

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/plans", planRoutes);
router.use("/payments", paymentRoutes);
router.use("/reports", reportRoutes);
// Collection reads — /memberships/:id/installments, /customers/:id/history, /customers/:id/pending
router.use(collectionRoutes);
// router.use("/payments", paymentRoutes);
// router.use("/reports", reportRoutes);

export default router;
