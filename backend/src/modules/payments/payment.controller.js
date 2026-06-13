import * as paymentService from "./payment.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const record = asyncHandler(async (req, res) => {
  const receipt = await paymentService.recordPayment(req.body, req.user);
  res.status(201).json({ success: true, message: "Payment recorded", data: receipt });
});

export const list = asyncHandler(async (req, res) => {
  const result = await paymentService.listPayments(req.query);
  res.json({ success: true, data: result.data, pagination: result.pagination });
});

export const receipt = asyncHandler(async (req, res) => {
  const data = await paymentService.getReceipt(req.params.id);
  res.json({ success: true, data });
});
