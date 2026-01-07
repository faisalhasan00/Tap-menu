const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Restaurant name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
      // Note: unique: true creates an index automatically, so we don't need restaurantSchema.index({ slug: 1 })
    },
    logo: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'BLOCKED'],
        message: 'Status must be either ACTIVE or BLOCKED'
      },
      required: [true, 'Status is required'],
      default: 'ACTIVE'
    },
    defaultPreparationTime: {
      type: Number,
      default: 15,
      min: [1, 'Default preparation time must be at least 1 minute'],
      max: [300, 'Default preparation time cannot exceed 300 minutes']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy is required']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index for faster queries
// Note: slug index is created automatically by unique: true
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ createdBy: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;

