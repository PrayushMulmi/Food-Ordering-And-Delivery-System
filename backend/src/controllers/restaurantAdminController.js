import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { CouponModel } from "../models/couponModel.js";
import { DashboardModel } from "../models/dashboardModel.js";
import { OrderModel } from "../models/orderModel.js";
import { ReviewModel } from "../models/reviewModel.js";
import { MenuModel } from "../models/menuModel.js";
import { saveBase64Image } from "../utils/imageUpload.js";

const normalizeGallery = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  try { return JSON.parse(input); } catch { return []; }
};

export const createMyRestaurant = asyncHandler(async (req, res) => {
  const existing = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (existing) throw new ApiError(400, "This admin already has a restaurant");
  const restaurant = await RestaurantModel.create({ ...req.body, owner_user_id: req.user.id });
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

  const next = { ...restaurant, ...req.body };
  if (req.body.cover_photo_file) next.cover_photo_url = saveBase64Image(req.body.cover_photo_file, 'restaurants', `cover-${restaurant.id}`) || next.cover_photo_url;
  if (req.body.logo_file) next.image_url = saveBase64Image(req.body.logo_file, 'restaurants', `logo-${restaurant.id}`) || next.image_url;
  const appended = Array.isArray(req.body.gallery_files) ? req.body.gallery_files.map((file, index) => saveBase64Image(file, 'restaurants', `gallery-${restaurant.id}-${index}`)).filter(Boolean) : [];
  next.gallery_images = [...normalizeGallery(req.body.gallery_images || restaurant.gallery_images), ...appended];

  const updated = await RestaurantModel.update(restaurant.id, next);
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
  const coupon = await CouponModel.create({ ...req.body, restaurant_id: restaurant.id });
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
  if (!restaurant || !coupon || Number(coupon.restaurant_id) !== Number(restaurant.id)) throw new ApiError(404, "Coupon not found");
  const updated = await CouponModel.update(req.params.id, req.body);
  sendResponse(res, 200, "Coupon updated", updated);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  const coupon = await CouponModel.findById(req.params.id);
  if (!restaurant || !coupon || Number(coupon.restaurant_id) !== Number(restaurant.id)) throw new ApiError(404, "Coupon not found");
  await CouponModel.remove(req.params.id);
  sendResponse(res, 200, "Coupon deleted");
});

export const listRestaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const orders = await OrderModel.listByRestaurant(restaurant.id);
  sendResponse(res, 200, "Restaurant orders fetched", orders);
});

export const getRestaurantOrderDetail = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const order = await OrderModel.findByRestaurantOrderId(req.params.id, restaurant.id);
  if (!order) throw new ApiError(404, 'Order not found');
  sendResponse(res, 200, 'Restaurant order detail fetched', order);
});

export const updateRestaurantOrderStatus = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const updated = await OrderModel.updateStatusByRestaurant(req.params.id, restaurant.id, req.body.status, req.user.id);
  sendResponse(res, 200, "Order status updated", updated);
});

export const listRestaurantReviews = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const reviews = await ReviewModel.listByRestaurant(restaurant.id);
  sendResponse(res, 200, "Restaurant reviews fetched", reviews);
});

export const listRestaurantMenu = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const items = await MenuModel.listByRestaurant(restaurant.id);
  sendResponse(res, 200, "Restaurant menu fetched", items);
});
