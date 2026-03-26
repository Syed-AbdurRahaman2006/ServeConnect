const User = require('../models/User');

/**
 * User Repository — Data access layer for User model.
 * All database queries are centralized here.
 */
class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email) {
    return User.findOne({ email }).select('+password');
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return { users, total, page, pages: Math.ceil(total / limit) };
  }

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updateLocation(id, coordinates) {
    return User.findByIdAndUpdate(
      id,
      { location: { type: 'Point', coordinates } },
      { new: true }
    );
  }

  /**
   * Find nearby providers within a radius using 2dsphere index.
   * @param {[Number, Number]} coordinates - [longitude, latitude]
   * @param {Number} maxDistance - in meters
   */
  async findNearbyProviders(coordinates, maxDistance = 10000) {
    return User.find({
      role: 'PROVIDER',
      status: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistance,
        },
      },
    });
  }

  async setOnlineStatus(id, isOnline) {
    return User.findByIdAndUpdate(
      id,
      { isOnline, lastSeen: new Date() },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
