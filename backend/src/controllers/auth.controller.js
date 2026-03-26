const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Auth Controller — Handles authentication HTTP endpoints
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, location } = req.body;
  const result = await authService.signup({ name, email, password, role, location });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

const updateLocation = asyncHandler(async (req, res) => {
  const { coordinates } = req.body;
  const user = await authService.updateLocation(req.user._id, coordinates);

  res.status(200).json({
    success: true,
    message: 'Location updated',
    data: { user },
  });
});

module.exports = { signup, login, getProfile, updateLocation };
