const serviceService = require('../services/service.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Service Controller — Handles service management HTTP endpoints
 */
const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.create(
    req.user._id,
    req.user.location,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: { service },
  });
});

const getServices = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, longitude, latitude, maxDistance, page, limit } = req.query;

  const result = await serviceService.search(
    { search, category, minPrice, maxPrice, longitude, latitude, maxDistance },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: { service },
  });
});

const getMyServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getByProvider(req.user._id);

  res.status(200).json({
    success: true,
    data: { services },
  });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.update(req.params.id, req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    data: { service },
  });
});

const deleteService = asyncHandler(async (req, res) => {
  await serviceService.delete(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully',
  });
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const service = await serviceService.toggleAvailability(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: `Service ${service.availability ? 'activated' : 'deactivated'}`,
    data: { service },
  });
});

module.exports = {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
  toggleAvailability,
};
