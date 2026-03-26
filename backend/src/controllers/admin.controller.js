const adminService = require('../services/admin.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Admin Controller — Handles admin panel HTTP endpoints
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, page, limit } = req.query;

  const result = await adminService.getUsers(
    { role, status },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await adminService.toggleBlockUser(req.params.id);

  res.status(200).json({
    success: true,
    message: `User ${user.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
    data: { user },
  });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

module.exports = { getUsers, toggleBlockUser, getStats };
