import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true, // For quick searches
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete when expire
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for better queries
blacklistedTokenSchema.index({ token: 1, expiresAt: 1 });

blacklistedTokenSchema.statics.cleanExpiredTokens = async function () {
  try {
    const result = await this.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    console.log(` Cleaned ${result.deletedCount} expired tokens`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
    throw error;
  }
};

const BlacklistedToken = mongoose.model(
  'BlacklistedToken',
  blacklistedTokenSchema
);

export default BlacklistedToken;
