# D-Menu Frontend

Super Admin dashboard frontend for the D-Menu multi-restaurant SaaS platform.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI library

## Project Structure

```
frontend/
├── app/
│   ├── super-admin/
│   │   ├── login/          # Login page
│   │   └── dashboard/      # Dashboard pages
│   │       ├── restaurants/ # Restaurants page
│   │       └── layout.tsx   # Dashboard layout
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── layouts/            # Layout components
│   │   └── SuperAdminLayout.tsx
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
└── package.json
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## Features

### Super Admin Login Page
- Centered card design
- Username and password fields
- Clean error message display
- Loading states

### Dashboard Layout
- **Fixed Sidebar** (`#1E293B`)
  - Logo: "D-Menu"
  - Menu items (Restaurants, etc.)
  - Active item highlight (`#22C55E`)
  - Logout button
  - Collapsible sidebar

- **Top Header**
  - Dynamic page title
  - Profile icon
  - Sidebar toggle button

- **Main Content Area**
  - Background color: `#F8FAFC`
  - Responsive padding and spacing

## Color Scheme

- **Sidebar**: `#1E293B` (slate-800)
- **Active Item**: `#22C55E` (green-500)
- **Background**: `#F8FAFC` (slate-50)

## Pages

- `/super-admin/login` - Login page
- `/super-admin/dashboard` - Main dashboard
- `/super-admin/dashboard/restaurants` - Restaurants management

## Components

### UI Components
- `Button` - Reusable button with variants (primary, secondary, danger)
- `Input` - Form input with label and error handling
- `Card` - Container component with shadow

### Layout Components
- `SuperAdminLayout` - Main dashboard layout with sidebar and header

## Development

- Uses Next.js App Router
- Client components marked with `'use client'`
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design (desktop first)


