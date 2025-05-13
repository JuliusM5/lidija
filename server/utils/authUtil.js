// server/utils/authUtil.js - Authentication utility functions

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loadData, USERS_FILE } = require('./fileUtil');
const crypto = require('crypto');

// JWT settings - in production, these should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h';

// If JWT_SECRET wasn't provided via env var and was generated randomly, log a warning
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable not set. Using randomly generated secret.');
  console.warn('This will invalidate all existing tokens when the server restarts.');
  console.warn('For production, set a permanent JWT_SECRET environment variable.');
}

/**
 * Verify user credentials
 * @param {string} username - Username
 * @param {string} password - Password (plaintext)
 * @returns {Object|null} - User object if authenticated, null otherwise
 */
function verifyUser(username, password) {
  if (!username || !password) return null;
  
  try {
    const users = loadData(USERS_FILE);
    
    for (const user of users) {
      if (user.username === username) {
        // For testing convenience, if no password hash exists for the admin user
        // or if running in development mode, allow a "backdoor" access
        if (
          (process.env.NODE_ENV === 'development' && user.role === 'admin') ||
          (user.password === '$2y$10$YOUR_BCRYPT_HASH_HERE' && user.role === 'admin')
        ) {
          console.warn('WARNING: Using development backdoor for admin login!');
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          };
        }
        
        // Normal password verification
        if (bcrypt.compareSync(password, user.password)) {
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          };
        }
        
        // If user found but password doesn't match, return null
        return null;
      }
    }
  } catch (error) {
    console.error('Error verifying user:', error);
  }
  
  return null;
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { 
      expiresIn: TOKEN_EXPIRY,
      algorithm: 'HS256' // Explicitly set algorithm
    }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload if valid, null otherwise
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware for protected routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid token'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired token'
      });
    }
    
    // Add user info to request object
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
}

/**
 * Admin role middleware - ensures user is an admin
 * Must be used after authMiddleware
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Admin access required'
    });
  }
  
  next();
}

module.exports = {
  verifyUser,
  generateToken,
  verifyToken,
  authMiddleware,
  adminMiddleware
};