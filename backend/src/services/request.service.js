const requestRepository = require('../repositories/request.repository');
const serviceRepository = require('../repositories/service.repository');
const userRepository = require('../repositories/user.repository');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Request Service — Business logic for request lifecycle management.
 * Implements the broadcasting system and atomic assignment.
 */
class RequestService {
  /**
   * Create a new service request and trigger provider broadcasting.
   * Returns the created request and list of nearby providers to broadcast to.
   */
  async create(requesterId, data) {
    // Verify service exists and is available
    const service = await serviceRepository.findById(data.serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    if (!service.availability) {
      throw new AppError('Service is currently unavailable', 400);
    }

    // Get requester's location for broadcasting
    const requester = await userRepository.findById(requesterId);
    const location = data.location || requester.location;

    // Create the request
    const request = await requestRepository.create({
      serviceId: data.serviceId,
      requesterId,
      description: data.description,
      location,
      scheduledDate: data.scheduledDate,
    });

    // Find nearby providers for broadcasting (within 10km)
    const nearbyProviders = await userRepository.findNearbyProviders(
      location.coordinates,
      data.maxDistance || 10000
    );

    // Store broadcast list on request
    if (nearbyProviders.length > 0) {
      request.broadcastedTo = nearbyProviders.map((p) => p._id);
      await request.save();
    }

    return {
      request,
      nearbyProviders,
    };
  }

  /**
   * Accept a request (PROVIDER).
   * Uses atomic locking to prevent race conditions.
   */
  async accept(requestId, providerId) {
    const result = await requestRepository.atomicAccept(requestId, providerId);
    if (!result) {
      throw new AppError(
        'Request has already been accepted by another provider or is no longer available',
        409
      );
    }
    return result;
  }

  /**
   * Update request status with FSM validation.
   */
  async updateStatus(requestId, newStatus, actorId, note) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('Request not found', 404);
    }

    // Verify actor has permission for this transition
    this._validateActor(request, newStatus, actorId);

    return requestRepository.updateStatus(requestId, newStatus, actorId, note);
  }

  /**
   * Get requests for a user based on their role
   */
  async getByUser(userId, role, status) {
    if (role === 'USER') {
      return requestRepository.findByRequesterId(userId, status);
    }
    if (role === 'PROVIDER') {
      return requestRepository.findByProviderId(userId, status);
    }
    // Admin can see all
    return requestRepository.findAll(status ? { status } : {});
  }

  /**
   * Get a single request by ID
   */
  async getById(requestId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('Request not found', 404);
    }
    return request;
  }

  /**
   * Get broadcast requests for a provider (requests in CREATED state,
   * where this provider was in the broadcast list)
   */
  async getBroadcastedRequests(providerId) {
    const Request = require('../models/Request');
    return Request.find({
      broadcastedTo: providerId,
      status: 'CREATED',
      providerId: null,
    })
      .populate('serviceId', 'title category price')
      .populate('requesterId', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * Validate that the actor has permission for a state transition.
   * - USER can: CANCEL
   * - PROVIDER can: ACCEPT, REJECT, COMPLETE
   * - ADMIN can: any transition
   */
  _validateActor(request, newStatus, actorId) {
    const actorStr = actorId.toString();
    const requesterId = request.requesterId._id
      ? request.requesterId._id.toString()
      : request.requesterId.toString();
    const providerId = request.providerId
      ? request.providerId._id
        ? request.providerId._id.toString()
        : request.providerId.toString()
      : null;

    // Requester can only cancel
    if (actorStr === requesterId && newStatus !== 'CANCELLED') {
      throw new AppError('Users can only cancel their requests', 403);
    }

    // Provider must be assigned or it must be an accept
    if (
      actorStr !== requesterId &&
      providerId &&
      actorStr !== providerId &&
      newStatus !== 'ACCEPTED'
    ) {
      throw new AppError('Not authorized to modify this request', 403);
    }
  }
}

module.exports = new RequestService();
