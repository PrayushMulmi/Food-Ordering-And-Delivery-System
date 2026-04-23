import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { MenuModel } from "../models/menuModel.js";
import { saveBase64Image } from "../utils/imageUpload.js";

export const createMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found for this admin");

  const item = await MenuModel.create({
    ...req.body,
    image_url: req.body.image_file ? saveBase64Image(req.body.image_file, 'menu-items', `menu-${restaurant.id}`) : (req.body.image_url || null),
    restaurant_id: restaurant.id,
  });
  sendResponse(res, 201, "Menu item created", item);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found for this admin");
  const item = await MenuModel.findById(req.params.id);
  if (!item || Number(item.restaurant_id) !== Number(restaurant.id)) throw new ApiError(404, "Menu item not found");

  const updated = await MenuModel.update(req.params.id, {
    ...item,
    ...req.body,
    image_url: req.body.image_file ? saveBase64Image(req.body.image_file, 'menu-items', `menu-${restaurant.id}-${req.params.id}`) : (req.body.image_url ?? item.image_url),
  });
  sendResponse(res, 200, "Menu item updated", updated);
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  const item = await MenuModel.findById(req.params.id);
  if (!restaurant || !item || Number(item.restaurant_id) !== Number(restaurant.id)) throw new ApiError(404, "Menu item not found");
  await MenuModel.remove(req.params.id);
  sendResponse(res, 200, "Menu item deleted");
});
//