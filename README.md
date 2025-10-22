# 🥛 DairyFlow - Dairy Delivery Management System

A comprehensive dairy delivery management platform for managing milk and dairy product subscriptions, orders, and delivery operations.

## 🎯 Project Overview

DairyFlow is a full-stack TypeScript application that helps dairy businesses manage:
- 👥 **Customer subscriptions** - Recurring dairy product deliveries
- 📦 **One-time orders** - Ad-hoc product purchases
- 🚚 **Delivery routes** - Optimized agent routes with navigation
- 📊 **Admin dashboard** - Analytics, inventory, and management
- 💳 **Billing system** - Invoices and payment processing

## 🏗️ Architecture

**Current Status:** Production-ready web application with Supabase backend
**Planned:** Mobile apps for customers and delivery agents

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TanStack Query (React Query)
- Tailwind CSS + Radix UI
- Wouter (routing)

**Backend:**
- Express.js + TypeScript
- Drizzle ORM
- Supabase PostgreSQL + Auth

**Services:**
- ✅ Supabase (Database + Auth + Storage)
- 🔜 MapmyIndia (Maps + Geocoding + Navigation)
- 🔜 Twilio (SMS OTP)
- 🔜 Razorpay (Payments)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase account
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/TechEdusyAi/DairyFlow.git
cd DairyFlow

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase configuration

# Push database schema
npm run db:push

# Start development servers
npm run dev          # Web app at http://localhost:5173
npm run dev:api      # API server at http://localhost:5000
```

## 📁 Project Structure (Monorepo)

```
├── apps/             # Applications
│   ├── web/         # React frontend application
│   │   ├── src/    # Source code
│   │   └── package.json
│   └── api/         # Express backend API
│       └── src/     # API source code
├── packages/        # Shared packages
│   └── types/       # Shared TypeScript types & schemas
├── docs/           # Documentation
└── package.json    # Root package.json with workspaces
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server
PORT=5000
NODE_ENV=development

# Authentication (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# MapmyIndia
MAPMYINDIA_API_KEY=your_mapmyindia_key
MAPMYINDIA_CLIENT_ID=your_client_id
MAPMYINDIA_CLIENT_SECRET=your_client_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🛠️ Development Commands

```bash
# Development servers
npm run dev          # Start web app (http://localhost:5173)
npm run dev:api      # Start API server (http://localhost:5000)

# Build commands
npm run build        # Build all workspaces
npm run check        # Type checking across workspaces

# Database operations
npm run db:push      # Push schema changes to Supabase
```

## 👥 User Roles

1. **Customer (User)**
   - Browse products
   - Create subscriptions
   - Place orders
   - Manage addresses
   - View invoices

2. **Delivery Agent**
   - View daily routes
   - Update delivery status
   - Upload delivery proof
   - Navigate to addresses

3. **Admin**
   - Manage products & inventory
   - View analytics
   - Manage agents
   - Optimize delivery routes
   - Monitor orders

## 📱 Mobile App (Coming Soon)

React Native apps are planned for:
- **DairyFlow** - Customer app for orders and subscriptions
- **DairyFlow Agent** - Delivery agent app with navigation

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for development roadmap.

## 🗺️ Current Status & Roadmap

### ✅ Phase 1: Web Application (COMPLETED)
- [x] Monorepo structure with workspaces
- [x] Supabase database & authentication
- [x] Phone OTP + Google OAuth
- [x] Role-based access control
- [ ] MapmyIndia integration
- [ ] Payment gateway (Razorpay)
- [ ] Production deployment

### 🔄 Phase 2: Mobile Apps (NEXT)
- [ ] React Native setup
- [ ] Customer mobile app
- [ ] Agent mobile app
- [ ] Play Store launch

### 🔮 Phase 3: Advanced Features (FUTURE)
- [ ] Real-time tracking
- [ ] AI-powered route optimization
- [ ] Predictive analytics
- [ ] Multi-language support

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@dairyflow.com or create an issue in the repository.

---

**Built with ❤️ by TechEdusy Team**
