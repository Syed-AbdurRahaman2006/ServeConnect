const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../middlewares/auth.middleware');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Auth Service — Business logic for authentication
 */
class AuthService {
  /**
   * Register a new user
   */
  async signup({ name, email, password, role, location }) {
    // Check if user already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    // Only allow USER and PROVIDER roles via signup (ADMIN is seeded)
    const allowedRoles = ['USER', 'PROVIDER'];
    const userRole = allowedRoles.includes(role) ? role : 'USER';

    const user = await userRepository.create({
      name,
      email,
      password,
      role: userRole,
      location: location || { type: 'Point', coordinates: [0, 0] },
    });

    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      token,
    };
  }

  /**
   * Login an existing user
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('Your account has been blocked', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Update user location
   */
  async updateLocation(userId, coordinates) {
    return userRepository.updateLocation(userId, coordinates);
  }
}

module.exports = new AuthService();
