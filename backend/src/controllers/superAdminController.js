import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/response.js";
import { DashboardModel } from "../models/dashboardModel.js";
import { UserModel } from "../models/userModel.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { AdminActionLogModel } from "../models/adminActionLogModel.js";
import { sendEmail } from "../services/emailService.js";

const randomTempPassword = () => {
  return `Temp@${Math.random().toString(36).slice(2, 10)}1`;
};

export const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const dashboard = await DashboardModel.superAdminDashboard();
  sendResponse(res, 200, "Super admin dashboard fetched", dashboard);
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.listAll();
  sendResponse(res, 200, "Users fetched", users);
});

export const listRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await RestaurantModel.listAllForSuperAdmin();
  sendResponse(res, 200, "Restaurants fetched", restaurants);
});

export const suspendUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const updated = await UserModel.updateStatus(req.params.id, "suspended");

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "user",
    target_id: req.params.id,
    action_type: "suspend",
    reason: req.body.reason || null,
  });

  sendResponse(res, 200, "User suspended", updated);
});

export const restoreUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const updated = await UserModel.updateStatus(req.params.id, "active");

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "user",
    target_id: req.params.id,
    action_type: "restore",
    reason: req.body.reason || null,
  });

  sendResponse(res, 200, "User restored", updated);
});

export const permanentlyDeleteUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  await UserModel.permanentDelete(req.params.id);

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "user",
    target_id: req.params.id,
    action_type: "permanent_delete",
    reason: req.body.reason || null,
  });

  sendResponse(res, 200, "User permanently deleted");
});

export const suspendRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findById(req.params.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const updated = await RestaurantModel.updateStatus(
    req.params.id,
    "suspended",
  );

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "restaurant",
    target_id: req.params.id,
    action_type: "suspend",
    reason: req.body.reason || null,
  });

  sendResponse(res, 200, "Restaurant suspended", updated);
});

export const restoreRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findById(req.params.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const updated = await RestaurantModel.updateStatus(req.params.id, "active");

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "restaurant",
    target_id: req.params.id,
    action_type: "restore",
    reason: req.body.reason || null,
  });

  sendResponse(res, 200, "Restaurant restored", updated);
});

export const permanentlyDeleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findById(req.params.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  await RestaurantModel.permanentDelete(req.params.id);

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "restaurant",
    target_id: req.params.id,
    action_type: "permanent_delete",
    reason: req.body.reason || null,
  });

  sendResponse(res, 200, "Restaurant permanently deleted");
});

export const resetUserPasswordByAdmin = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const tempPassword = randomTempPassword();
  await UserModel.updatePassword(req.params.id, tempPassword, true);

  await AdminActionLogModel.create({
    action_by_user_id: req.user.id,
    target_type: "user",
    target_id: req.params.id,
    action_type: "password_reset",
    reason: req.body.reason || "Password reset by super admin",
  });

  await sendEmail({
    to: user.email,
    subject: "Temporary Password Issued",
    html: `<p>Hello ${user.full_name},</p>
           <p>Your password was reset by platform administration.</p>
           <p>Temporary password: <strong>${tempPassword}</strong></p>
           <p>Please change it after login.</p>`,
  });

  sendResponse(
    res,
    200,
    "Temporary password issued and email notification sent",
    {
      tempPassword,
    },
  );
});
