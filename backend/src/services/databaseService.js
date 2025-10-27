import mongoose from 'mongoose';
import User from '../models/User.js';
import BlacklistedToken from '../models/BlacklistedToken.js';

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.connectionString = null;
  }

  // Connection to mongodb
  async connect() {
    try {
      this.connectionString =
        process.env.MONGO_URI || 'mongodb://localhost:27017/web-scraping-auth';

      console.log(' Connecting to MongoDB...');
      console.log(
        'Connection string:',
        this.connectionString.replace(/\/\/.*:.*@/, '//***:***@')
      );

      // Connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maximum number of open sockets (connections) that the driver will keep open to a specific MongoDB server.
        serverSelectionTimeoutMS: 5000, // How long the driver will attempt to find a suitable server to execute an operation before throwing an error
        socketTimeoutMS: 45000, // Close sockets after 45 secs of inactivity
        family: 4, // Use IPv4
      };

      await mongoose.connect(this.connectionString, options);

      this.isConnected = true;
      console.log('MongoDB connected successfully');

      await this.createDefaultUsers();
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('MongoDB disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  // Check status
  isHealthy() {
    return mongoose.connection.readyState === 1 && this.isConnected;
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }

  async createDefaultUsers() {
    try {
      await User.createDefaultAdmin();

      // Create test user
      const testUserExists = await User.findOne({ email: 'user@example.com' });

      if (!testUserExists) {
        const testUser = new User({
          username: 'user',
          email: 'user@example.com',
          password: 'user123',
          role: 'user',
        });

        await testUser.save();
        console.log('Default test user created');
      }
    } catch (error) {
      console.warn('Warning creating default users:', error.message);
    }
  }

  async clearDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production');
    }

    try {
      await User.deleteMany({});
      console.log(' Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const userStats = await User.getStats();
      const dbStats = await mongoose.connection.db.stats();

      return {
        users: userStats,
        database: {
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024) + ' KB',
          indexSize: Math.round(dbStats.indexSize / 1024) + ' KB',
          objects: dbStats.objects,
        },
        connection: this.getConnectionInfo(),
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  async findUserByCredentials(emailOrUsername) {
    try {
      return await User.findByCredentials(emailOrUsername);
    } catch (error) {
      console.error('Error finding user by credentials:', error);
      throw error;
    }
  }

  async verifyUserPassword(user, password) {
    try {
      return await user.comparePassword(password);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const newUser = new User(userData);
      await newUser.save();
      return newUser;
    } catch (error) {
      console.error(' Error creating user:', error);
      throw error;
    }
  }

  async checkUserExists(email, username) {
    try {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username }],
      });
      return existingUser;
    } catch (error) {
      console.error(' Error checking user existence:', error);
      throw error;
    }
  }

  async findUserById(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.findUserById(userId);
      return user ? user.toPublicJSON() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error(' Error deleting user:', error);
      throw error;
    }
  }

  async addTokenToBlacklist(token, expiresAt, userId) {
    try {
      const blacklistedToken = new BlacklistedToken({
        token: token,
        userId: userId,
        expiresAt: expiresAt,
      });

      await blacklistedToken.save();
      console.log('Token added to blacklist');
      return true;
    } catch (error) {
      console.error('Error blacklisting token: ', error);
      throw error;
    }
  }

  async isTokenBlacklisted(token) {
    try {
      const blacklistedToken = await BlacklistedToken.findOne({ token });
      return !!blacklistedToken;
    } catch (error) {
      console.error(' Error checking blacklist:', error);
      return false;
    }
  }
}

// Unique instance of the service
const databaseService = new DatabaseService();

export default databaseService;
