import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { OrderModel } from "../models/orderModel.js";
import { RestaurantModel } from "../models/restaurantModel.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await OrderModel.placeOrder(req.user.id, req.body);
  sendResponse(res, 201, "Order placed successfully", order);
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.listByUser(req.user.id);
  sendResponse(res, 200, "Orders fetched", orders);
});

export const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order || Number(order.user_id) !== Number(req.user.id)) {
    throw new ApiError(404, "Order not found");
  }

  sendResponse(res, 200, "Order fetched", order);
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await OrderModel.cancelOrderByUser(req.params.id, req.user.id);
  sendResponse(res, 200, "Order cancelled", order);
});

export const restaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const orders = await OrderModel.listByRestaurant(restaurant.id);
  sendResponse(res, 200, "Restaurant orders fetched", orders);
});

export const updateRestaurantOrderStatus = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const order = await OrderModel.updateStatusByRestaurant(
    req.params.id,
    restaurant.id,
    req.body.status,
    req.user.id,
  );

  sendResponse(res, 200, "Order status updated", order);
});
