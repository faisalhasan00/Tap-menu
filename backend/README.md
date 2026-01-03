# D-Menu Backend API

Backend API server for the D-Menu multi-restaurant SaaS platform.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **dotenv** - Environment variables

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files (database, etc.)
│   ├── models/       # Mongoose models
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Category.js
│   │   └── MenuItem.js
│   ├── routes/       # Express routes
│   ├── controllers/  # Route controllers
│   ├── middlewares/  # Custom middleware
│   └── utils/        # Utility functions
├── server.js         # Entry point
└── package.json      # Dependencies
```

## Data Models

### User
- `username` - Unique username (lowercase)
- `password` - Hashed password
- `role` - SUPER_ADMIN or RESTAURANT_ADMIN
- `isActive` - Account status
- `restaurantId` - Restaurant reference (for RESTAURANT_ADMIN)

### Restaurant
- `name` - Restaurant name
- `slug` - Unique slug (lowercase, alphanumeric + hyphens)
- `logo` - Logo URL
- `status` - ACTIVE or BLOCKED
- `createdBy` - Super Admin reference

### Category
- `name` - Category name (unique per restaurant)
- `restaurantId` - Restaurant reference (required)
- `order` - Display order (auto-incremented if not provided)

### MenuItem
- `name` - Item name (unique per restaurant)
- `price` - Item price (positive number)
- `image` - Image URL (optional)
- `vegType` - VEG or NON_VEG
- `isAvailable` - Availability status
- `categoryId` - Category reference (required)
- `restaurantId` - Restaurant reference (required)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   
   **Option A: MongoDB Atlas (Recommended - Cloud, Free)**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a free cluster
   - Get your connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/dmenu`)
   - Update `MONGO_URI` in `.env` with your Atlas connection string
   
   **Option B: Local MongoDB**
   - Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start MongoDB service: `mongod` (or use Windows Service)
   - Use: `MONGO_URI=mongodb://localhost:27017/dmenu`

3. **Create `.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/dmenu
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dmenu
   JWT_SECRET=your-secret-key-change-in-production
   SUPER_ADMIN_USERNAME=admin
   SUPER_ADMIN_PASSWORD=your-secure-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Run the server:**
   ```bash
   # Production
   npm start
   
   # Development (with auto-reload)
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Returns API status

### Authentication
- `POST /api/auth/login` - Login user
  - Body: `{ "username": "string", "password": "string" }`
  - Returns: `{ "success": true, "data": { "user": {...}, "token": "..." } }`

### Restaurants (Super Admin Only)
All restaurant endpoints require authentication and Super Admin role.

- `POST /api/restaurants` - Create a new restaurant
  - Body: `{ "name": "string", "slug": "string", "logo": "string (optional)" }`
  - Returns: `{ "success": true, "data": {...} }`

- `GET /api/restaurants` - Get all restaurants
  - Returns: `{ "success": true, "count": number, "data": [...] }`

- `PATCH /api/restaurants/:id/block` - Block a restaurant
  - Returns: `{ "success": true, "message": "...", "data": {...} }`

- `PATCH /api/restaurants/:id/unblock` - Unblock a restaurant
  - Returns: `{ "success": true, "message": "...", "data": {...} }`

- `POST /api/restaurants/:id/create-owner` - Create restaurant owner
  - Body: `{ "username": "string", "password": "string" }`
  - Returns: `{ "success": true, "message": "...", "data": {...} }`
  - Creates a RESTAURANT_ADMIN user linked to the restaurant
  - Ensures only one owner per restaurant

### Restaurant Owner Routes
All restaurant owner endpoints require authentication and Restaurant Admin role.

- `GET /api/restaurants/me` - Get own restaurant
  - Returns: `{ "success": true, "data": {...} }`
  - Restaurant Owner can only access their own restaurant
  - Access denied if restaurant is BLOCKED

- `GET /api/restaurants/:id` - Get restaurant by ID
  - Returns: `{ "success": true, "data": {...} }`
  - Super Admin can access any restaurant
  - Restaurant Owner can only access their own restaurant
  - Access denied if restaurant is BLOCKED

### Categories (Restaurant Owner Only)
All category endpoints require authentication, Restaurant Admin role, and restaurant access check.

- `POST /api/categories` - Create a new category
  - Body: `{ "name": "string", "order": number (optional) }`
  - Returns: `{ "success": true, "message": "...", "data": {...} }`
  - Order auto-incremented if not provided

- `GET /api/categories` - Get all categories for restaurant
  - Returns: `{ "success": true, "count": number, "data": [...] }`
  - Sorted by order, then creation date

### Menu Items (Restaurant Owner Only)
All menu item endpoints require authentication, Restaurant Admin role, and restaurant access check.

- `POST /api/menu-items` - Create a new menu item
  - Body: `{ "name": "string", "price": number, "categoryId": "string", "image": "string (optional)", "vegType": "VEG|NON_VEG (optional)", "isAvailable": boolean (optional) }`
  - Returns: `{ "success": true, "message": "...", "data": {...} }`
  - Validates category belongs to restaurant

- `GET /api/menu-items` - Get all menu items for restaurant
  - Query params: `categoryId` (optional), `isAvailable` (optional)
  - Returns: `{ "success": true, "count": number, "data": [...] }`
  - Populates category information

- `PATCH /api/menu-items/:id/toggle` - Toggle menu item availability
  - Returns: `{ "success": true, "message": "...", "data": {...} }`
  - Toggles isAvailable field

### Tables (Restaurant Owner Only)
All table endpoints require authentication, Restaurant Admin role, and restaurant access check.

- `POST /api/tables` - Create a new table
  - Body: `{ "tableNumber": number }`
  - Returns: `{ "success": true, "message": "...", "data": { ..., "menuUrl": "...", "qrCodeUrl": "..." } }`
  - Auto-generates QR code for the table
  - QR code contains menu URL with table number

- `GET /api/tables` - Get all tables for restaurant
  - Returns: `{ "success": true, "count": number, "data": [...] }`
  - Each table includes qrCodeUrl and menuUrl
  - Sorted by table number

### Orders
- `POST /api/orders` - Create a new order (Public)
  - Body: `{ "restaurantId": "string", "tableNumber": number, "items": [{ "menuItemId": "string", "quantity": number }] }`
  - Returns: `{ "success": true, "message": "...", "data": {...} }`
  - Validates menu items exist and are available
  - Checks restaurant is not BLOCKED
  - Auto-calculates total amount

- `GET /api/orders` - Get all orders for restaurant (Restaurant Owner only)
  - Query params: `status` (optional), `tableNumber` (optional)
  - Returns: `{ "success": true, "count": number, "data": [...] }`
  - Sorted by creation date (newest first)

- `PATCH /api/orders/:id/status` - Update order status (Restaurant Owner only)
  - Body: `{ "status": "PENDING|ACCEPTED|REJECTED|READY" }`
  - Returns: `{ "success": true, "message": "...", "data": {...} }`
  - Validates order belongs to restaurant

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `SUPER_ADMIN_USERNAME` | Username for Super Admin seed | Optional |
| `SUPER_ADMIN_PASSWORD` | Password for Super Admin seed | Optional |
| `FRONTEND_URL` | Frontend URL for QR code generation | `http://localhost:3000` |

## Authentication

### Super Admin Seeding
On server start, a Super Admin user is automatically created if:
- `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` are set in `.env`
- No Super Admin with that username already exists

### Middleware

- **authMiddleware**: Verifies JWT token and attaches user to `req.user`
  - Usage: `router.get('/protected', authMiddleware, controller)`
  
- **superAdminOnly**: Allows only SUPER_ADMIN role
  - Usage: `router.get('/admin-only', authMiddleware, superAdminOnly, controller)`

- **checkRestaurantStatus**: Checks if restaurant is blocked (for restaurant-specific APIs)
  - Usage: `router.post('/menu', authMiddleware, checkRestaurantStatus, controller)`
  - Rejects requests if restaurant status is BLOCKED

- **restaurantAdminOnly**: Allows only RESTAURANT_ADMIN role
  - Usage: `router.get('/me', authMiddleware, restaurantAdminOnly, controller)`
  - Ensures user has RESTAURANT_ADMIN role and restaurantId

- **ensureRestaurantAccess**: Ensures restaurant owners can only access their own restaurant
  - Usage: `router.get('/:id/menu', authMiddleware, ensureRestaurantAccess, controller)`
  - RESTAURANT_ADMIN users can only access resources for their restaurant
  - SUPER_ADMIN can access all restaurants
  - Automatically checks if restaurant is BLOCKED and denies access
  - Attaches restaurant object to `req.restaurant` for use in controllers


