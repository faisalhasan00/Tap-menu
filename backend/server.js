const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/database');
const seedSuperAdmin = require('./src/utils/seedSuperAdmin');

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`\n📥 [REQUEST] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/health', require('./src/routes/health'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/restaurants', require('./src/routes/restaurants'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/menu-items', require('./src/routes/menu-items'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/customer/menu', require('./src/routes/customerMenu'));
app.use('/api/contact', require('./src/routes/contact'));

// Error handling middleware (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // Seed Super Admin after database connection
    await seedSuperAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 D-Menu API server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

module.exports = app;


