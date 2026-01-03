const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Never return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['SUPER_ADMIN', 'RESTAURANT_ADMIN'],
        message: 'Role must be either SUPER_ADMIN or RESTAURANT_ADMIN'
      },
      required: [true, 'Role is required'],
      default: 'RESTAURANT_ADMIN'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
      // Only required for RESTAURANT_ADMIN role
      validate: {
        validator: function(value) {
          if (this.role === 'RESTAURANT_ADMIN') {
            return value != null;
          }
          return true;
        },
        message: 'Restaurant ID is required for RESTAURANT_ADMIN role'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without password
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Index for faster queries
userSchema.index({ restaurantId: 1 });
userSchema.index({ role: 1, restaurantId: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

