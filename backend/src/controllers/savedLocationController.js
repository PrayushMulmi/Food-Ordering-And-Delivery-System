import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';
import { SavedLocationModel } from '../models/savedLocationModel.js';

export const listMySavedLocations = asyncHandler(async (req, res) => {
  const locations = await SavedLocationModel.listByUser(req.user.id);
  sendResponse(res, 200, 'Saved locations fetched', locations);
});

export const createMySavedLocation = asyncHandler(async (req, res) => {
  const location = await SavedLocationModel.create(req.user.id, req.body || {});
  sendResponse(res, 201, 'Saved location created', location);
});

export const updateMySavedLocation = asyncHandler(async (req, res) => {
  const location = await SavedLocationModel.update(req.params.id, req.user.id, req.body || {});
  sendResponse(res, 200, 'Saved location updated', location);
});

export const deleteMySavedLocation = asyncHandler(async (req, res) => {
  await SavedLocationModel.remove(req.params.id, req.user.id);
  sendResponse(res, 200, 'Saved location deleted');
});
