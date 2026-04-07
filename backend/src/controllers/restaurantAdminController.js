import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { CouponModel } from "../models/couponModel.js";
import { DashboardModel } from "../models/dashboardModel.js";

export const createMyRestaurant = asyncHandler(async (req, res) => {
  const existing = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (existing) throw new ApiError(400, "This admin already has a restaurant");

  const restaurant = await RestaurantModel.create({
    ...req.body,
    owner_user_id: req.user.id,
  });

  sendResponse(res, 201, "Restaurant created", restaurant);
});

export const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  sendResponse(res, 200, "Restaurant fetched", restaurant);
});

export const updateMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const updated = await RestaurantModel.update(restaurant.id, req.body);
  sendResponse(res, 200, "Restaurant updated", updated);
});

export const getRestaurantDashboard = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const dashboard = await DashboardModel.restaurantDashboard(restaurant.id);
  sendResponse(res, 200, "Restaurant dashboard fetched", dashboard);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const coupon = await CouponModel.create({
    ...req.body,
    restaurant_id: restaurant.id,
  });

  sendResponse(res, 201, "Coupon created", coupon);
});

export const listCoupons = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const coupons = await CouponModel.listByRestaurant(restaurant.id);
  sendResponse(res, 200, "Coupons fetched", coupons);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  const coupon = await CouponModel.findById(req.params.id);

  if (
    !restaurant ||
    !coupon ||
    Number(coupon.restaurant_id) !== Number(restaurant.id)
  ) {
    throw new ApiError(404, "Coupon not found");
  }

  const updated = await CouponModel.update(req.params.id, req.body);
  sendResponse(res, 200, "Coupon updated", updated);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  const coupon = await CouponModel.findById(req.params.id);

  if (
    !restaurant ||
    !coupon ||
    Number(coupon.restaurant_id) !== Number(restaurant.id)
  ) {
    throw new ApiError(404, "Coupon not found");
  }

  await CouponModel.remove(req.params.id);
  sendResponse(res, 200, "Coupon deleted");
});
