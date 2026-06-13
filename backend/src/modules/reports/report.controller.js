import * as reportService from "./report.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const summary = asyncHandler(async (req, res) => {
  const data = await reportService.getSummary();
  res.json({ success: true, data });
});

export const collections = asyncHandler(async (req, res) => {
  const data = await reportService.getCollectionsReport(req.query);
  res.json({ success: true, data });
});

export const pending = asyncHandler(async (req, res) => {
  const result = await reportService.getPendingReport(req.query);
  res.json({ success: true, data: result.data, pagination: result.pagination });
});
