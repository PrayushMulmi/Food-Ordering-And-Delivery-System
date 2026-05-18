import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { MenuModel } from "../models/menuModel.js";
import { ReviewModel } from "../models/reviewModel.js";

export const listRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await RestaurantModel.list(req.query);
  sendResponse(res, 200, "Restaurants fetched", restaurants);
});

export const getRestaurantByCode = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findByPublicCode(req.params.code);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const menu = await MenuModel.listByRestaurant(restaurant.id);
  const reviews = await ReviewModel.listByRestaurant(restaurant.id);
  sendResponse(res, 200, "Restaurant details fetched", { restaurant, menu, reviews });
});

export const getRestaurantImage = asyncHandler(async (req, res) => {
  const kind = req.params.kind === 'cover' ? 'cover' : 'logo';
  const image = await RestaurantModel.getImageByCode(req.params.code, kind);
  if (!image) throw new ApiError(404, 'Image not found');
  res.setHeader('Content-Type', image.mime);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(image.buffer);
});

export const getRestaurantSections = asyncHandler(async (_req, res) => {
  const [highestRated, fastDelivery, bestQuality] = await Promise.all([
    RestaurantModel.list({ sort: 'top_rated' }),
    RestaurantModel.list({ sort: 'fast_delivery', open_now: 1 }),
    RestaurantModel.list({ sort: 'best_quality', min_rating: 4 }),
  ]);
  sendResponse(res, 200, 'Restaurant sections fetched', {
    highestRated: highestRated.slice(0, 8),
    fastDelivery: fastDelivery.slice(0, 8),
    bestQuality: bestQuality.slice(0, 8),
  });
});

export const getRecommendedRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await RestaurantModel.recommendForUser(req.user.id, 8);
  sendResponse(res, 200, 'Recommended restaurants fetched', restaurants);
});

export const getRestaurantFilters = asyncHandler(async (_req, res) => {
  const filters = await RestaurantModel.listFilterOptions();
  sendResponse(res, 200, "Restaurant filters fetched", filters);
});
