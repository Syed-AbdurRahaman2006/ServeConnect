const express = require('express');
const router = express.Router();
const { getUsers, toggleBlockUser, getStats } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { rbac } = require('../middlewares/rbac.middleware');

// All admin routes require ADMIN role
router.use(authenticate, rbac('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.get('/stats', getStats);

module.exports = router;
