const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware that checks express-validator results
 * and returns 400 with detailed error messages if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }
  next();
};

// ─── Auth Validation Rules ───────────────────────────────────────
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['USER', 'PROVIDER'])
    .withMessage('Role must be USER or PROVIDER'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Service Validation Rules ────────────────────────────────────
const createServiceRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
];

const updateServiceRules = [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isNumeric(),
];

// ─── Request Validation Rules ────────────────────────────────────
const createRequestRules = [
  body('serviceId').isMongoId().withMessage('Valid service ID is required'),
  body('description').optional().trim().isLength({ max: 2000 }),
];

const updateRequestStatusRules = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('status')
    .isIn(['ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid status value'),
];

// ─── Message Validation Rules ────────────────────────────────────
const sendMessageRules = [
  body('conversationId').isMongoId().withMessage('Valid conversation ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  createServiceRules,
  updateServiceRules,
  createRequestRules,
  updateRequestStatusRules,
  sendMessageRules,
};
