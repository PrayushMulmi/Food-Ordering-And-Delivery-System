import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { RiderModel } from "../models/riderModel.js";
import { areValidCoordinates, normalizeCoordinate } from "../utils/location.js";

export const getRiderDashboard = asyncHandler(async (req, res) => {
  const dashboard = await RiderModel.getDashboard(req.user.id);
  sendResponse(res, 200, "Rider dashboard fetched", dashboard);
});

export const listMyAssignedOrders = asyncHandler(async (req, res) => {
  const orders = await RiderModel.listOrders(req.user.id);
  sendResponse(res, 200, "Rider orders fetched", orders);
});

export const getMyAssignedOrderDetail = asyncHandler(async (req, res) => {
  const order = await RiderModel.getOrderDetail(req.params.id, req.user.id);
  if (!order) throw new ApiError(404, "Order not found");
  sendResponse(res, 200, "Rider order detail fetched", order);
});

export const updateMyLocation = asyncHandler(async (req, res) => {
  const latitude = normalizeCoordinate(req.body.latitude);
  const longitude = normalizeCoordinate(req.body.longitude);
  const activeOrderId = req.body.active_order_id ? Number(req.body.active_order_id) : null;
  const accuracyMeters = req.body.accuracy_meters == null ? null : Number(req.body.accuracy_meters);

  if (!areValidCoordinates(latitude, longitude)) {
    throw new ApiError(400, "Valid latitude and longitude are required");
  }

  if (accuracyMeters != null && (!Number.isFinite(accuracyMeters) || accuracyMeters < 0)) {
    throw new ApiError(400, "Accuracy must be a positive number");
  }

  const result = await RiderModel.updateLocation(req.user.id, {
    latitude,
    longitude,
    activeOrderId,
    accuracyMeters,
  });
  sendResponse(res, 200, result.updated ? "Rider location updated" : "Rider location unchanged", result);
});

export const updateMyAvailability = asyncHandler(async (req, res) => {
  const nextStatus = String(req.body.availability_status || '').trim();
  if (!['available', 'assigned', 'offline'].includes(nextStatus)) {
    throw new ApiError(400, "Invalid availability status");
  }

  const profile = await RiderModel.updateAvailability(req.user.id, nextStatus);
  sendResponse(res, 200, "Rider availability updated", profile);
});
