import { Router } from "express";
import * as planController from "./plan.controller.js";
import {
  createPlanSchema,
  listPlansQuerySchema,
  assignMemberSchema,
  idParamSchema,
} from "./plan.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

// Read — ADMIN + AGENT
router.get("/", validate(listPlansQuerySchema, "query"), planController.list);
router.get("/:id", validate(idParamSchema, "params"), planController.getById);
router.get("/:id/members", validate(idParamSchema, "params"), planController.listMembers);

// Write — ADMIN only
router.post("/", authorize("ADMIN"), validate(createPlanSchema), planController.create);
router.post(
  "/:id/members",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(assignMemberSchema),
  planController.assignMember
);

export default router;
