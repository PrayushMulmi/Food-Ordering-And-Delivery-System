// v4
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

export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await RestaurantModel.findById(req.params.id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const menu = await MenuModel.listByRestaurant(req.params.id);
  const reviews = await ReviewModel.listByRestaurant(req.params.id);

  sendResponse(res, 200, "Restaurant details fetched", {
    restaurant,
    menu,
    reviews,
  });
});
