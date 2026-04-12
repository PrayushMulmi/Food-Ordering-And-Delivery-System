import { orders } from "../models/orderModel.js";

export function getOrders(_req, res) {
  res.json({ success: true, data: orders });
}

export function createOrder(req, res) {
  const order = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  orders.push(order);
  res.status(201).json({ success: true, data: order });
}
