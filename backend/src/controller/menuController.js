import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { MenuModel } from "../models/menuModel.js";
import { parseBase64Image } from "../utils/imageUpload.js";

const imagePayload = (dataUrl) => {
  const parsed = parseBase64Image(dataUrl);
  if (!parsed) return {};
  return { image_blob: parsed.buffer, image_mime: parsed.mime, image_url: null };
};

function validateMenuPayload(body = {}) {
  if (!String(body.name || '').trim()) throw new ApiError(400, 'Item name is required');
  if (!String(body.category || '').trim()) throw new ApiError(400, 'Category is required');
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) throw new ApiError(400, 'Price must be greater than 0');
}

function assertRestaurantManageable(restaurant) {
  if (String(restaurant?.status || '').toLowerCase() === 'suspended') {
    throw new ApiError(403, 'Restaurant is suspended. Menu management is disabled until a SuperAdmin restores the restaurant.');
  }
}

export const createMenuItem = asyncHandler(async (req, res) => {
  validateMenuPayload(req.body);
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found for this admin");
  assertRestaurantManageable(restaurant);

  const item = await MenuModel.create({
    ...req.body,
    ...imagePayload(req.body.image_file),
    restaurant_id: restaurant.id,
  });
  sendResponse(res, 201, "Menu item created", item);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  validateMenuPayload(req.body);
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found for this admin");
  assertRestaurantManageable(restaurant);
  const item = await MenuModel.findRawById(req.params.id);
  if (!item || Number(item.restaurant_id) !== Number(restaurant.id)) throw new ApiError(404, "Menu item not found");

  const updated = await MenuModel.update(req.params.id, {
    ...item,
    ...req.body,
    ...imagePayload(req.body.image_file),
    image_url: req.body.image_file ? null : (req.body.image_url ?? item.image_url),
  });
  sendResponse(res, 200, "Menu item updated", updated);
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByOwnerUserId(req.user.id);
  const item = await MenuModel.findRawById(req.params.id);
  if (!restaurant || !item || Number(item.restaurant_id) !== Number(restaurant.id)) throw new ApiError(404, "Menu item not found");
  assertRestaurantManageable(restaurant);
  await MenuModel.remove(req.params.id);
  sendResponse(res, 200, "Menu item deleted");
});

export const getMenuItemImage = asyncHandler(async (req, res) => {
  const item = await MenuModel.findRawById(req.params.id);
  if (!item || !item.image_blob) throw new ApiError(404, 'Image not found');
  res.setHeader('Content-Type', item.image_mime || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(item.image_blob);
});
