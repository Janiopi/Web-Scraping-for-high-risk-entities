import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // It manages automatically createdAt and updatedAt
    versionKey: false, // Desactive __v field
  }
);

// Index for performance performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// pre-save Middleware  for hashing password
userSchema.pre('save', async function (next) {
  // Only hash if it has been modified
  if (!this.isModified('password')) return next();

  try {
    // Hash with 12 salt rounds
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// pre-update Middleware for updating
userSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  this.set({ updatedAt: new Date() });
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    profilePicture: this.profilePicture,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Find user by email o username
userSchema.statics.findByCredentials = async function (emailOrUsername) {
  const user = await this.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername },
    ],
  });

  return user;
};

userSchema.statics.createDefaultAdmin = async function () {
  try {
    //Check if admin already exists
    const adminExists = await this.findOne({ role: 'admin' });

    if (!adminExists) {
      const defaultAdmin = new this({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });

      await defaultAdmin.save();
      console.log(' Default admin user created');
      return defaultAdmin;
    }

    return adminExists;
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

// Users stats
userSchema.statics.getStats = async function () {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalUsers = await this.countDocuments({ isActive: true });
    const recentUsers = await this.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    return {
      totalUsers,
      recentUsers,
      roleDistribution: stats,
    };
  } catch (error) {
    console.error(' Error getting user stats:', error);
    throw error;
  }
};

// Unique instance of model
const User = mongoose.model('User', userSchema);

export default User;
