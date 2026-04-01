import { restaurants } from "../models/restaurantModel.js";

export function getRestaurants(_req, res) {
  res.json({ success: true, data: restaurants });
}

export function getRestaurantById(req, res) {
  const restaurant = restaurants.find((item) => item.id === Number(req.params.id));
  if (!restaurant) {
    return res.status(404).json({ success: false, message: "Restaurant not found." });
  }
  return res.json({ success: true, data: restaurant });
}
