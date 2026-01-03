const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [200, 'Menu item name cannot exceed 200 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number']
    },
    image: {
      type: String,
      default: null,
      trim: true
    },
    vegType: {
      type: String,
      enum: {
        values: ['VEG', 'NON_VEG'],
        message: 'Veg type must be either VEG or NON_VEG'
      },
      required: [true, 'Veg type is required'],
      default: 'VEG'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required']
      // Note: categoryId is included in compound indexes below
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required']
      // Note: restaurantId is included in compound indexes below
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

// Indexes for efficient queries
// Compound indexes cover single-field queries efficiently
menuItemSchema.index({ restaurantId: 1, categoryId: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ categoryId: 1 }); // Keep for category lookups
// Compound index: restaurantId + name for unique menu item names per restaurant
menuItemSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

// Pre-save hook to validate category belongs to the same restaurant
menuItemSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('categoryId') || this.isModified('restaurantId')) {
    const Category = mongoose.model('Category');
    const category = await Category.findById(this.categoryId);
    
    if (!category) {
      return next(new Error('Category not found'));
    }
    
    if (category.restaurantId.toString() !== this.restaurantId.toString()) {
      return next(new Error('Category does not belong to the specified restaurant'));
    }
  }
  next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;

