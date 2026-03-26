const Request = require('../models/Request');

/**
 * Request Repository — Data access layer for Request model.
 * Implements atomic operations for request assignment.
 */
class RequestRepository {
  async create(data) {
    const request = await Request.create({
      ...data,
      lifecycleHistory: [
        {
          toState: 'CREATED',
          actor: data.requesterId,
          timestamp: new Date(),
        },
      ],
    });
    return request.populate([
      { path: 'serviceId', select: 'title category price' },
      { path: 'requesterId', select: 'name email' },
    ]);
  }

  async findById(id) {
    return Request.findById(id)
      .populate('serviceId', 'title category price description providerId')
      .populate('requesterId', 'name email avatar')
      .populate('providerId', 'name email avatar');
  }

  async findByRequesterId(requesterId, status) {
    const query = { requesterId };
    if (status) query.status = status;
    return Request.find(query)
      .populate('serviceId', 'title category price')
      .populate('providerId', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  async findByProviderId(providerId, status) {
    const query = { providerId };
    if (status) query.status = status;
    return Request.find(query)
      .populate('serviceId', 'title category price')
      .populate('requesterId', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * Atomic request acceptance with optimistic locking.
   * Uses findOneAndUpdate with lockVersion check to prevent
   * race conditions when multiple providers try to accept simultaneously.
   *
   * @param {string} requestId - Request ID
   * @param {string} providerId - Provider accepting the request
   * @returns {Object|null} Updated request, or null if already assigned
   */
  async atomicAccept(requestId, providerId) {
    const request = await Request.findOneAndUpdate(
      {
        _id: requestId,
        status: 'CREATED',
        providerId: null, // Only accept if no provider assigned yet
      },
      {
        $set: {
          status: 'ACCEPTED',
          providerId: providerId,
        },
        $push: {
          lifecycleHistory: {
            fromState: 'CREATED',
            toState: 'ACCEPTED',
            actor: providerId,
            timestamp: new Date(),
          },
        },
        $inc: { lockVersion: 1 },
      },
      { new: true }
    );

    if (request) {
      await request.populate([
        { path: 'serviceId', select: 'title category price' },
        { path: 'requesterId', select: 'name email avatar' },
        { path: 'providerId', select: 'name email avatar' },
      ]);
    }

    return request;
  }

  /**
   * Update request status with FSM validation and lifecycle recording.
   */
  async updateStatus(requestId, newStatus, actorId, note) {
    const request = await Request.findById(requestId);
    if (!request) return null;

    // Check FSM validity
    if (!Request.isValidTransition(request.status, newStatus)) {
      const error = new Error(
        `Invalid transition from ${request.status} to ${newStatus}`
      );
      error.statusCode = 400;
      throw error;
    }

    request.status = newStatus;
    request.lifecycleHistory.push({
      fromState: request.status,
      toState: newStatus,
      actor: actorId,
      timestamp: new Date(),
      note,
    });

    const updated = await request.save();
    return updated.populate([
      { path: 'serviceId', select: 'title category price' },
      { path: 'requesterId', select: 'name email avatar' },
      { path: 'providerId', select: 'name email avatar' },
    ]);
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .populate('serviceId', 'title category price')
        .populate('requesterId', 'name email')
        .populate('providerId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Request.countDocuments(filter),
    ]);

    return { requests, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Get stats for admin dashboard
   */
  async getStats() {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    return stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  }
}

module.exports = new RequestRepository();
