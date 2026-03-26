const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateLocation } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { signupRules, loginRules, validate } = require('../middlewares/validate.middleware');

// Public routes
router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/location', authenticate, updateLocation);

module.exports = router;
