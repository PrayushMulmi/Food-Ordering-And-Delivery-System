import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import { ReviewModel } from "../models/reviewModel.js";

export const createReview = asyncHandler(async (req, res) => {
  const review = await ReviewModel.createForDeliveredOrder(req.user.id, req.body);
  sendResponse(res, 201, "Review submitted", review);
});

export const getRestaurantReviews = asyncHandler(async (req, res) => {
  const reviews = await ReviewModel.listByRestaurant(req.params.restaurantId);
  sendResponse(res, 200, "Reviews fetched", reviews);
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await ReviewModel.listByUser(req.user.id);
  sendResponse(res, 200, "Your reviews fetched", reviews);
});

export const getMyReviewableItems = asyncHandler(async (req, res) => {
  const items = await ReviewModel.listReviewableItemsByUser(req.user.id);
  sendResponse(res, 200, "Reviewable items fetched", items);
});
