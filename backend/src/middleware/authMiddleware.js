import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import databaseService from '../services/databaseService.js';

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    // Extract token from header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required',
        message: 'Please provide an authorization token',
      });
    }

    // Check if header have the correct format "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format',
        message: 'Authorization header must be in format: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token not provided',
        message: 'Please provide a valid token',
      });
    }

    // Check if token is in blacklist
    const isBlacklisted = await databaseService.isTokenBlacklisted(token);

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Token invalidated',
        message: 'This session has been terminated. Please login again.',
      });
    }

    // check token JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-key';
    const decoded = jwt.verify(token, jwtSecret);

    //Add user info to request
    req.user = decoded;

    console.log(
      ` Authentication successful for user: ${
        decoded.email || decoded.username || 'Unknown'
      }`
    );
    next();
  } catch (error) {
    console.error(' Authentication error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is malformed or invalid',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to authenticate user',
    });
  }
};
