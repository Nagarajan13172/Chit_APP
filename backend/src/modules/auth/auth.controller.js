import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, message: "Login successful", data: result });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await authService.createUser(req.body);
  res.status(201).json({ success: true, message: "User created", data: user });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ success: true, data: user });
});
