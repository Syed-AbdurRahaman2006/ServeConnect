const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
  toggleAvailability,
} = require('../controllers/service.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { rbac } = require('../middlewares/rbac.middleware');
const { createServiceRules, updateServiceRules, validate } = require('../middlewares/validate.middleware');

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Provider-only routes
router.post('/', authenticate, rbac('PROVIDER'), createServiceRules, validate, createService);
router.get('/provider/me', authenticate, rbac('PROVIDER'), getMyServices);
router.put('/:id', authenticate, rbac('PROVIDER'), updateServiceRules, validate, updateService);
router.delete('/:id', authenticate, rbac('PROVIDER'), deleteService);
router.patch('/:id/availability', authenticate, rbac('PROVIDER'), toggleAvailability);

module.exports = router;
