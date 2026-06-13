import * as customerService from "./customer.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body, req.user.id);
  res.status(201).json({ success: true, message: "Customer created", data: customer });
});

export const update = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.json({ success: true, message: "Customer updated", data: customer });
});

export const list = asyncHandler(async (req, res) => {
  const result = await customerService.listCustomers(req.query);
  res.json({ success: true, data: result.data, pagination: result.pagination });
});

export const search = asyncHandler(async (req, res) => {
  const customers = await customerService.searchByPhone(req.query.phone);
  res.json({ success: true, data: customers });
});

export const getById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
});
