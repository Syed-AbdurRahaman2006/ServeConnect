const userRepository = require('../repositories/user.repository');
const requestRepository = require('../repositories/request.repository');
const { AppError } = require('../middlewares/error.middleware');
const User = require('../models/User');
const Service = require('../models/Service');

/**
 * Admin Service — Business logic for admin operations
 */
class AdminService {
  /**
   * Get all users with pagination and optional filters
   */
  async getUsers(filters = {}, options = {}) {
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;
    return userRepository.findAll(query, options);
  }

  /**
   * Block or unblock a user
   */
  async toggleBlockUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.role === 'ADMIN') {
      throw new AppError('Cannot block an admin user', 400);
    }

    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    return userRepository.updateById(userId, { status: newStatus });
  }

  /**
   * Get platform analytics
   */
  async getStats() {
    const [
      totalUsers,
      totalProviders,
      totalServices,
      requestStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'PROVIDER' }),
      Service.countDocuments(),
      requestRepository.getStats(),
    ]);

    return {
      users: totalUsers,
      providers: totalProviders,
      services: totalServices,
      requests: requestStats,
    };
  }
}

module.exports = new AdminService();
