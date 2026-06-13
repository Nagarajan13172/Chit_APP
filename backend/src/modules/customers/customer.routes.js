import { Router } from "express";
import * as customerController from "./customer.controller.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  listQuerySchema,
  searchQuerySchema,
  idParamSchema,
} from "./customer.validation.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// All customer routes require authentication (ADMIN or AGENT).
router.use(authenticate);

router.get("/", validate(listQuerySchema, "query"), customerController.list);

// NOTE: /search must be registered before /:id so it isn't captured as an id.
router.get("/search", validate(searchQuerySchema, "query"), customerController.search);

router.post("/", validate(createCustomerSchema), customerController.create);

router.get("/:id", validate(idParamSchema, "params"), customerController.getById);

router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateCustomerSchema),
  customerController.update
);

export default router;
