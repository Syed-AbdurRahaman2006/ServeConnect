/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specific roles.
 *
 * Usage: rbac('ADMIN', 'PROVIDER') — only ADMIN and PROVIDER can access
 *
 * @param  {...string} roles - Allowed roles
 */
const rbac = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { rbac };
