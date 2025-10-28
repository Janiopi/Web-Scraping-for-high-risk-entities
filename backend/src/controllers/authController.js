import jwt from 'jsonwebtoken';
import databaseService from '../services/databaseService.js';

// LOGIN Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation of request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required',
      });
    }

    //Checking if user exist
    const user = await databaseService.findUserByCredentials(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Checking if password is correct
    const isValidPassword = await databaseService.verifyUserPassword(
      user,
      password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generating JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-key';
    
    // Token options - check if testing/development mode for non-expiring tokens
    const tokenOptions = {};
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    // Only add expiration if not explicitly disabled for testing
    if (expiresIn !== 'never' && process.env.NODE_ENV !== 'testing') {
      tokenOptions.expiresIn = expiresIn;
    }
    
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      tokenOptions
    );

    const userProfile = await databaseService.getUserProfile(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userProfile,
      },
    });

    console.log(`User logged in successfully: ${user.email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to process login request',
    });
  }
};

// REGISTER - Controller
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing data',
        message: 'Username, email and password are required',
      });
    }

    // Check if user already exist
    const existingUser = await databaseService.checkUserExists(email, username);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'Email or username is already registered',
      });
    }

    // Create a new user
    const newUser = await databaseService.createUser({
      username,
      email: email.toLowerCase(),
      password,
      role: 'user',
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-key';
    
    // Token options - check if testing/development mode for non-expiring tokens
    const tokenOptions = {};
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    // Only add expiration if not explicitly disabled for testing
    if (expiresIn !== 'never' && process.env.NODE_ENV !== 'testing') {
      tokenOptions.expiresIn = expiresIn;
    }
    
    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      jwtSecret,
      tokenOptions
    );

    // Get public profile
    const userProfile = await databaseService.getUserProfile(newUser._id);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: userProfile,
      },
    });

    console.log(`New user registered: ${newUser.email}`);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to process registration request',
    });
  }
};

// Profile - Controller
export const getProfile = async (req, res) => {
  try {
    const userProfile = await databaseService.getUserProfile(req.user.id);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to retrieve profile',
    });
  }
};

// Logout - Controller
export const logout = async (req, res) => {
  try {
    // Extract token from header  Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Decode token to get expiration date
      const decoded = jwt.decode(token);
      const expiresAt = new Date(decoded.exp * 1000);

      // Add token to blacklist
      await databaseService.addTokenToBlacklist(token, expiresAt, req.user.id);
    }

    res.json({
      success: true,
      message: 'Logout successful',
      data: {
        message: 'Token invalidated and session ended securely',
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`User logged out securely: ${req.user.email}`);
  } catch (error) {
    console.error('Logout error:', error);

    // Basci logout in case of failure
    res.json({
      success: true,
      message: 'Logout completed',
      data: {
        message: 'Session ended (basic logout)',
      },
    });
  }
};

// Stats - Controller
export const getStats = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can view database statistics',
      });
    }

    // Get stats
    const stats = await databaseService.getStats();

    res.json({
      success: true,
      message: 'Database statistics retrieved successfully',
      data: stats,
    });

    console.log(` Admin ${req.user.email} accessed database stats`);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to retrieve database statistics',
    });
  }
};

// VerifyToken - Controller
export const verifyToken = (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
        timestamp: new Date().toISOString(),
        tokenValid: true,
      },
    });

    console.log(`Token verified for user: ${req.user.email}`);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to verify token',
    });
  }
};
