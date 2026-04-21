const requestService = require('../services/request.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { SOCKET_EVENTS } = require('../utils/constants');

/**
 * Request Controller — Handles service request lifecycle endpoints.
 * Integrates with Socket.io for real-time broadcasting.
 */
const createRequest = asyncHandler(async (req, res) => {
  const { request, nearbyProviders } = await requestService.create(
    req.user._id,
    req.body
  );

  // Broadcast to nearby providers via Socket.io
  const io = req.app.get('io');
  if (io && nearbyProviders.length > 0) {
    nearbyProviders.forEach((provider) => {
      io.to(`user:${provider._id}`).emit(SOCKET_EVENTS.REQUEST_CREATED, {
        request,
        message: 'New service request nearby!',
      });
    });
  }

  res.status(201).json({
    success: true,
    message: `Request created. Broadcasted to ${nearbyProviders.length} nearby providers.`,
    data: { request, broadcastCount: nearbyProviders.length },
  });
});

const acceptRequest = asyncHandler(async (req, res) => {
  const request = await requestService.accept(req.params.id, req.user._id);

  // Notify requester that request was accepted
  const io = req.app.get('io');
  if (io) {
    // Notify the requester
    io.to(`user:${request.requesterId._id || request.requesterId}`).emit(
      SOCKET_EVENTS.REQUEST_ACCEPTED,
      { request, message: 'Your request has been accepted!' }
    );

    // Cancel the request for other broadcasted providers
    if (request.broadcastedTo) {
      request.broadcastedTo.forEach((providerId) => {
        if (providerId.toString() !== req.user._id.toString()) {
          io.to(`user:${providerId}`).emit(SOCKET_EVENTS.REQUEST_CANCELLED, {
            requestId: request._id,
            message: 'Request has been taken by another provider.',
          });
        }
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Request accepted successfully',
    data: { request },
  });
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, note, rating, feedback } = req.body;
  
  // Prepare metadata for completion confirmation
  const metadata = {};
  if (rating) metadata.rating = rating;
  if (feedback) metadata.feedback = feedback;
  
  const request = await requestService.updateStatus(
    req.params.id,
    status,
    req.user._id,
    note,
    metadata
  );

  // Notify relevant parties of status change
  const io = req.app.get('io');
  if (io) {
    const recipientId =
      req.user._id.toString() ===
      (request.requesterId._id || request.requesterId).toString()
        ? request.providerId._id || request.providerId
        : request.requesterId._id || request.requesterId;

    // Determine the message based on completion confirmation status
    let message = `Request status changed to ${status}`;
    if (status === 'COMPLETED' && request.completionConfirmation) {
      const bothConfirmed = 
        request.completionConfirmation.userConfirmed && 
        request.completionConfirmation.providerConfirmed;
      
      if (!bothConfirmed) {
        // One party confirmed, waiting for the other
        const isUserConfirming = req.user._id.toString() === (request.requesterId._id || request.requesterId).toString();
        message = isUserConfirming 
          ? 'User marked service as complete. Please confirm completion.'
          : 'Provider marked service as complete. Please confirm completion.';
      } else {
        message = 'Service completed successfully!';
      }
    }

    io.to(`user:${recipientId}`).emit(SOCKET_EVENTS.REQUEST_UPDATED, {
      request,
      message,
    });
  }

  res.status(200).json({
    success: true,
    message: request.status === 'COMPLETED' 
      ? 'Service marked as completed!' 
      : `Request status updated to ${status}`,
    data: { request },
  });
});

const getRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const requests = await requestService.getByUser(
    req.user._id,
    req.user.role,
    status
  );

  res.status(200).json({
    success: true,
    data: { requests: Array.isArray(requests) ? requests : requests.requests || [] },
  });
});

const getRequestById = asyncHandler(async (req, res) => {
  const request = await requestService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: { request },
  });
});

const getBroadcastedRequests = asyncHandler(async (req, res) => {
  const requests = await requestService.getBroadcastedRequests(req.user._id);

  res.status(200).json({
    success: true,
    data: { requests },
  });
});

module.exports = {
  createRequest,
  acceptRequest,
  updateRequestStatus,
  getRequests,
  getRequestById,
  getBroadcastedRequests,
};
