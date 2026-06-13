import * as planService from "./plan.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const plan = await planService.createPlan(req.body);
  res.status(201).json({ success: true, message: "Chit plan created", data: plan });
});

export const list = asyncHandler(async (req, res) => {
  const result = await planService.listPlans(req.query);
  res.json({ success: true, data: result.data, pagination: result.pagination });
});

export const getById = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.id);
  res.json({ success: true, data: plan });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlanStatus(req.params.id, req.body.status);
  const verb = req.body.status === "CLOSED" ? "closed" : "reopened";
  res.json({ success: true, message: `Chit plan ${verb}`, data: plan });
});

export const assignMember = asyncHandler(async (req, res) => {
  const membership = await planService.assignMember(req.params.id, req.body);
  res.status(201).json({ success: true, message: "Customer assigned to plan", data: membership });
});

export const listMembers = asyncHandler(async (req, res) => {
  const members = await planService.listPlanMembers(req.params.id);
  res.json({ success: true, data: members });
});
