const express = require('express');
const router = express.Router();
const {
  createRequest,
  acceptRequest,
  updateRequestStatus,
  getRequests,
  getRequestById,
  getBroadcastedRequests,
} = require('../controllers/request.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { rbac } = require('../middlewares/rbac.middleware');
const { createRequestRules, updateRequestStatusRules, validate } = require('../middlewares/validate.middleware');

// All request routes require authentication
router.use(authenticate);

// USER creates a request
router.post('/', rbac('USER'), createRequestRules, validate, createRequest);

// PROVIDER accepts a request
router.put('/:id/accept', rbac('PROVIDER'), acceptRequest);

// Update request status (both USER and PROVIDER can perform allowed transitions)
router.put('/:id/status', updateRequestStatusRules, validate, updateRequestStatus);

// Get requests (filtered by role automatically)
router.get('/', getRequests);

// Provider: get broadcasted requests
router.get('/broadcasted', rbac('PROVIDER'), getBroadcastedRequests);

// Get single request
router.get('/:id', getRequestById);

module.exports = router;
