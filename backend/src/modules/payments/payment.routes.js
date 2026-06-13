import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import { createPaymentSchema, listPaymentsQuerySchema, idParamSchema } from "./payment.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// Both ADMIN and AGENT can collect and view payments.
router.use(authenticate);

router.post("/", validate(createPaymentSchema), paymentController.record);
router.get("/", validate(listPaymentsQuerySchema, "query"), paymentController.list);
router.get("/:id/receipt", validate(idParamSchema, "params"), paymentController.receipt);

export default router;
