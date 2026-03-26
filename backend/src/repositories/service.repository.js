const Service = require('../models/Service');

/**
 * Service Repository — Data access layer for Service model.
 */
class ServiceRepository {
  async create(data) {
    return Service.create(data);
  }

  async findById(id) {
    return Service.findById(id).populate('provider', 'name email avatar location');
  }

  async findByProviderId(providerId) {
    return Service.find({ providerId }).sort({ createdAt: -1 });
  }

  async update(id, data) {
    return Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Service.findByIdAndDelete(id);
  }

  /**
   * Search services with filters: text, category, price range, geo-distance
   */
  async search(filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const query = { availability: true };

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) query.price.$lte = Number(filters.maxPrice);
    }

    // Geo-spatial filter: find services within a radius
    if (filters.longitude && filters.latitude) {
      const maxDistance = filters.maxDistance || 10000; // default 10km
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(filters.longitude), Number(filters.latitude)],
          },
          $maxDistance: Number(maxDistance),
        },
      };
    }

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('provider', 'name email avatar location')
        .skip(skip)
        .limit(limit)
        .sort(filters.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 }),
      Service.countDocuments(query),
    ]);

    return { services, total, page, pages: Math.ceil(total / limit) };
  }

  async toggleAvailability(id) {
    const service = await Service.findById(id);
    if (!service) return null;
    service.availability = !service.availability;
    return service.save();
  }
}

module.exports = new ServiceRepository();
