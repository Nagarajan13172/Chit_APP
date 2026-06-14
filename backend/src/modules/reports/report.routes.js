import { Router } from "express";
import * as reportController from "./report.controller.js";
import { collectionsReportSchema, pendingReportSchema, remindersReportSchema } from "./report.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// Reports are visible to both ADMIN and AGENT.
router.use(authenticate);

router.get("/summary", reportController.summary);
router.get("/collections", validate(collectionsReportSchema, "query"), reportController.collections);
router.get("/pending", validate(pendingReportSchema, "query"), reportController.pending);
router.get("/reminders", validate(remindersReportSchema, "query"), reportController.reminders);

export default router;
