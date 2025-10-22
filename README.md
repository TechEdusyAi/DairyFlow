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

**Current Status:** Web application (React + Express)
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
- PostgreSQL (migrating to Supabase)

**Services:**
- 🔜 Supabase (Database + Auth + Storage)
- 🔜 MapmyIndia (Maps + Geocoding + Navigation)
- 🔜 Twilio (SMS OTP)
- 🔜 Razorpay (Payments)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or Supabase account)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/TechEdusyAi/DairyFlow.git
cd DairyFlow

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Role-based pages (user, agent, admin)
│       ├── components/
│       ├── hooks/
│       └── lib/
├── server/           # Express backend
│   ├── services/     # Business logic
│   ├── routes.ts     # API endpoints
│   ├── storage.ts    # Database layer
│   └── db.ts         # DB connection
└── shared/           # Shared types/schemas
    └── schema.ts     # Drizzle ORM schema
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
# Development with hot-reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npm run db:push        # Push schema changes
npm run db:generate    # Generate migrations
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

## 🗺️ Roadmap

### Phase 1: Web Application ⭐ CURRENT
- [x] Basic structure and schema
- [ ] Supabase migration
- [ ] Phone OTP + Google auth
- [ ] MapmyIndia integration
- [ ] Payment gateway
- [ ] Production deployment

### Phase 2: Mobile Apps
- [ ] React Native setup
- [ ] Customer mobile app
- [ ] Agent mobile app
- [ ] Play Store launch

### Phase 3: Advanced Features
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
