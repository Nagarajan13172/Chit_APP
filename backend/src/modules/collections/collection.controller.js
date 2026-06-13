import * as collectionService from "./collection.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const membershipInstallments = asyncHandler(async (req, res) => {
  const data = await collectionService.getMembershipSchedule(req.params.id);
  res.json({ success: true, data });
});

export const customerHistory = asyncHandler(async (req, res) => {
  const data = await collectionService.getCustomerHistory(req.params.id);
  res.json({ success: true, data });
});

export const customerPending = asyncHandler(async (req, res) => {
  const data = await collectionService.getCustomerPending(req.params.id);
  res.json({ success: true, data });
});
