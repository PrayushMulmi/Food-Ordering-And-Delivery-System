import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import { BasketModel } from "../models/basketModel.js";

export const getMyBasket = asyncHandler(async (req, res) => {
  const basket = await BasketModel.getDetailedBasket(req.user.id);
  sendResponse(res, 200, "Basket fetched", basket);
});

export const addToBasket = asyncHandler(async (req, res) => {
  const basket = await BasketModel.addItem(
    req.user.id,
    req.body.menu_item_id,
    Number(req.body.quantity || 1),
  );

  sendResponse(res, 200, "Item added to basket", basket);
});

export const updateBasketItem = asyncHandler(async (req, res) => {
  const basket = await BasketModel.updateItemQuantity(
    req.user.id,
    req.params.itemId,
    Number(req.body.quantity),
  );

  sendResponse(res, 200, "Basket item updated", basket);
});

export const removeBasketItem = asyncHandler(async (req, res) => {
  const basket = await BasketModel.removeItem(req.user.id, req.params.itemId);
  sendResponse(res, 200, "Basket item removed", basket);
});

export const clearMyBasket = asyncHandler(async (req, res) => {
  await BasketModel.clearBasket(req.user.id);
  sendResponse(res, 200, "Basket cleared");
});
