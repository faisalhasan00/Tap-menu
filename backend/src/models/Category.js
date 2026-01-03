const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required']
      // Note: restaurantId is included in compound indexes below, so no need for separate index
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      default: 0,
      min: [0, 'Order must be a positive number']
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

// Compound index: restaurantId + order for efficient sorting
categorySchema.index({ restaurantId: 1, order: 1 });

// Compound index: restaurantId + name for unique category names per restaurant
categorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

// Pre-save hook to ensure order is set if not provided
categorySchema.pre('save', async function (next) {
  if (this.isNew && this.order === undefined) {
    // Get the maximum order value for this restaurant
    const maxOrder = await mongoose.model('Category')
      .findOne({ restaurantId: this.restaurantId })
      .sort({ order: -1 })
      .select('order')
      .lean();
    
    this.order = maxOrder ? maxOrder.order + 1 : 0;
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

