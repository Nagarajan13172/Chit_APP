import { Router } from "express";
import * as collectionController from "./collection.controller.js";
import { idParamSchema } from "./collection.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

// Full sub-paths are declared here and the router is mounted at the API root,
// so these read endpoints live alongside /memberships and /customers.
const router = Router();

router.use(authenticate);

router.get(
  "/memberships/:id/installments",
  validate(idParamSchema, "params"),
  collectionController.membershipInstallments
);

router.get(
  "/customers/:id/history",
  validate(idParamSchema, "params"),
  collectionController.customerHistory
);

router.get(
  "/customers/:id/pending",
  validate(idParamSchema, "params"),
  collectionController.customerPending
);

export default router;
