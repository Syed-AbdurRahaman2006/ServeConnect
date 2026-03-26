const serviceRepository = require('../repositories/service.repository');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Service Management Service — Business logic for provider services
 */
class ServiceService {
  /**
   * Create a new service (PROVIDER only)
   */
  async create(providerId, providerLocation, data) {
    return serviceRepository.create({
      ...data,
      providerId,
      // Set service location to provider's location for geo-queries
      location: providerLocation || { type: 'Point', coordinates: [0, 0] },
    });
  }

  /**
   * Get service by ID
   */
  async getById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    return service;
  }

  /**
   * Search services with filters
   */
  async search(filters, options) {
    return serviceRepository.search(filters, options);
  }

  /**
   * Get services by provider
   */
  async getByProvider(providerId) {
    return serviceRepository.findByProviderId(providerId);
  }

  /**
   * Update a service (only by owning provider)
   */
  async update(serviceId, providerId, data) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    if (service.providerId.toString() !== providerId.toString()) {
      throw new AppError('Not authorized to update this service', 403);
    }
    return serviceRepository.update(serviceId, data);
  }

  /**
   * Delete a service (only by owning provider)
   */
  async delete(serviceId, providerId) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    if (service.providerId.toString() !== providerId.toString()) {
      throw new AppError('Not authorized to delete this service', 403);
    }
    return serviceRepository.delete(serviceId);
  }

  /**
   * Toggle service availability
   */
  async toggleAvailability(serviceId, providerId) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    if (service.providerId.toString() !== providerId.toString()) {
      throw new AppError('Not authorized to modify this service', 403);
    }
    return serviceRepository.toggleAvailability(serviceId);
  }
}

module.exports = new ServiceService();
