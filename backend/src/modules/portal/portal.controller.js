import * as portalService from "./portal.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const result = await portalService.login(req.body);
  res.json({ success: true, message: "Login successful", data: result });
});

export const me = asyncHandler(async (req, res) => {
  const customer = await portalService.getProfile(req.customer.id);
  res.json({ success: true, data: customer });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const customer = await portalService.updateProfile(req.customer.id, req.body);
  res.json({ success: true, message: "Profile updated", data: customer });
});

export const dashboard = asyncHandler(async (req, res) => {
  const data = await portalService.getDashboard(req.customer.id);
  res.json({ success: true, data });
});

export const chits = asyncHandler(async (req, res) => {
  const data = await portalService.getChits(req.customer.id);
  res.json({ success: true, data });
});

export const payments = asyncHandler(async (req, res) => {
  const data = await portalService.getPayments(req.customer.id);
  res.json({ success: true, data });
});

export const pay = asyncHandler(async (req, res) => {
  const receipt = await portalService.pay(req.customer.id, req.body);
  res.status(201).json({ success: true, message: "Payment successful", data: receipt });
});
