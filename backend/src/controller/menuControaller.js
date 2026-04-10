import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { MenuModel } from "../models/menuModel.js";

export const createMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant)
    throw new ApiError(404, "Restaurant not found for this admin");

  const item = await MenuModel.create({
    ...req.body,
    restaurant_id: restaurant.id,
  });

  sendResponse(res, 201, "Menu item created", item);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant)
    throw new ApiError(404, "Restaurant not found for this admin");

  const item = await MenuModel.findById(req.params.id);
  if (!item || Number(item.restaurant_id) !== Number(restaurant.id)) {
    throw new ApiError(404, "Menu item not found");
  }

  const updated = await MenuModel.update(req.params.id, req.body);
  sendResponse(res, 200, "Menu item updated", updated);
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  const item = await MenuModel.findById(req.params.id);

  if (
    !restaurant ||
    !item ||
    Number(item.restaurant_id) !== Number(restaurant.id)
  ) {
    throw new ApiError(404, "Menu item not found");
  }

  await MenuModel.remove(req.params.id);
  sendResponse(res, 200, "Menu item deleted");
});
