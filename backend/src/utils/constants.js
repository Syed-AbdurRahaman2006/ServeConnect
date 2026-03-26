/**
 * Service categories used across the application
 */
const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Painting',
  'Carpentry',
  'Gardening',
  'Tutoring',
  'Fitness',
  'Beauty',
  'Cooking',
  'Moving',
  'Repair',
  'Other',
];

/**
 * Request lifecycle states
 */
const REQUEST_STATES = {
  CREATED: 'CREATED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

/**
 * User roles
 */
const ROLES = {
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
};

/**
 * Socket.io event names
 */
const SOCKET_EVENTS = {
  REQUEST_CREATED: 'request:created',
  REQUEST_ACCEPTED: 'request:accepted',
  REQUEST_CANCELLED: 'request:cancelled',
  REQUEST_UPDATED: 'request:updated',
  NEW_MESSAGE: 'message:new',
  TYPING: 'message:typing',
  STOP_TYPING: 'message:stopTyping',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_SEEN: 'message:seen',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
};

/**
 * Default search radius in meters (10 km)
 */
const DEFAULT_SEARCH_RADIUS = 10000;

module.exports = {
  CATEGORIES,
  REQUEST_STATES,
  ROLES,
  SOCKET_EVENTS,
  DEFAULT_SEARCH_RADIUS,
};
