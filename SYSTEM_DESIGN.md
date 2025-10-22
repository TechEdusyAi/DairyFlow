# 🏗️ DairyFlow System Design & Architecture

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Authentication Flow](#authentication-flow)
7. [User Workflows](#user-workflows)
8. [Security Architecture](#security-architecture)
9. [Scalability Strategy](#scalability-strategy)

---

## 🎯 System Overview

### **Purpose**
DairyFlow is a comprehensive dairy delivery management system that connects customers, delivery agents, and administrators through a web and mobile platform.

### **Key Components**

```
┌─────────────────────────────────────────────────────────────┐
│                     DairyFlow Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │  Agent App   │      │
│  │  (Customers) │  │  (Customers) │  │  (Delivery)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │   REST API     │                       │
│                    │  (Express.js)  │                       │
│                    └───────┬────────┘                       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐            │
│         │                  │                  │             │
│    ┌────▼─────┐     ┌─────▼──────┐    ┌─────▼──────┐     │
│    │ Supabase │     │ MapmyIndia │    │ Razorpay   │     │
│    │  DB+Auth │     │    Maps    │    │  Payments  │     │
│    └──────────┘     └────────────┘    └────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **User Roles**

1. **Customer** - Orders dairy products, manages subscriptions
2. **Delivery Agent** - Delivers orders, updates delivery status
3. **Administrator** - Manages system, products, agents, analytics

---

## 🏛️ Architecture Diagrams

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├──────────────────┬──────────────────┬──────────────────────────┤
│   Web Frontend   │  Mobile App      │  Agent Mobile App        │
│   (React/Vite)   │  (React Native)  │  (React Native)          │
│   • Customer UI  │  • Customer UI   │  • Route View            │
│   • Admin Panel  │  • Subscriptions │  • Navigation            │
│   • Agent Portal │  • Orders        │  • Status Updates        │
└────────┬─────────┴────────┬─────────┴──────────┬───────────────┘
         │                  │                    │
         │                  │                    │
┌────────▼──────────────────▼────────────────────▼───────────────┐
│                     API GATEWAY LAYER                            │
│                   (Express.js REST API)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes: /auth, /products, /orders, /subscriptions,      │  │
│  │          /deliveries, /analytics, /admin                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware: Auth, Validation, Rate Limiting, CORS       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────┬──────────────┬──────────────┬──────────┘
         │              │              │              │
         │              │              │              │
┌────────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐ ┌────▼──────────┐
│  Business     │ │  Services  │ │ External  │ │  Background   │
│  Logic Layer  │ │   Layer    │ │ APIs      │ │    Jobs       │
│               │ │            │ │           │ │               │
│ • Storage     │ │ • Route    │ │ • Supabase│ │ • Cron        │
│ • Validation  │ │   Optimizer│ │   Auth    │ │ • Delivery    │
│ • Auth Logic  │ │ • Geocoding│ │ • MapmyIn │ │   Expansion   │
│               │ │ • Invoicing│ │   dia     │ │ • Invoice Gen │
└───────┬───────┘ └────────────┘ │ • Razorpay│ └───────────────┘
        │                        └───────────┘
        │
┌───────▼─────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Supabase PostgreSQL Database                  │ │
│  │  Tables: users, products, orders, subscriptions,          │ │
│  │          deliveries, routes, invoices, addresses          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Supabase Storage (File Storage)               │ │
│  │  Buckets: product-images, delivery-proofs, user-avatars  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend (Web)**

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.3.1 | UI library |
| Build Tool | Vite | 5.4.20 | Fast bundler |
| Language | TypeScript | 5.6.3 | Type safety |
| Styling | Tailwind CSS | 3.4.17 | Utility CSS |
| UI Components | Radix UI | Latest | Accessible components |
| State Management | TanStack Query | 5.60.5 | Server state |
| Routing | Wouter | 3.3.5 | Client routing |
| Forms | React Hook Form | 7.55.0 | Form handling |
| Validation | Zod | 3.24.2 | Schema validation |

### **Backend (API)**

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 20+ | JavaScript runtime |
| Framework | Express.js | 4.21.2 | Web framework |
| Language | TypeScript | 5.6.3 | Type safety |
| ORM | Drizzle ORM | 0.39.1 | Database queries |
| Database | PostgreSQL | 16+ | Primary database |
| Validation | Zod | 3.24.2 | Input validation |

### **Mobile (React Native)**

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React Native | Cross-platform mobile |
| Wrapper | Expo (recommended) | Easy development |
| Navigation | React Navigation | App navigation |
| State | TanStack Query | Server state |
| Auth | Supabase JS | Authentication |
| Maps | MapmyIndia SDK | Navigation & geocoding |
| Storage | AsyncStorage | Local persistence |
| Camera | Expo Camera | Delivery proof photos |
| Notifications | Firebase FCM | Push notifications |

### **Third-Party Services**

| Service | Purpose | Cost Model |
|---------|---------|------------|
| **Supabase** | Database, Auth, Storage | Free tier → $25/mo |
| **MapmyIndia** | Maps, Geocoding, Navigation | Free 3K requests/day |
| **Razorpay** | Payment processing | 2% per transaction |
| **Vercel** | Web hosting | Free tier |
| **Firebase** | Push notifications (mobile) | Free tier |
| **Resend** | Email notifications | Free 100/day |

---

## 🗄️ Database Design

### **Entity Relationship Diagram**

```
┌──────────────┐         ┌──────────────┐
│    USERS     │         │   PRODUCTS   │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ email        │         │ name         │
│ phone        │◄───┐    │ price        │
│ role         │    │    │ unit         │
│ first_name   │    │    │ is_milk      │
│ last_name    │    │    │ status       │
└──────┬───────┘    │    │ image_url    │
       │            │    └──────┬───────┘
       │            │           │
       │            │           │
┌──────▼───────┐   │    ┌──────▼────────┐
│  ADDRESSES   │   │    │  INVENTORY    │
├──────────────┤   │    ├───────────────┤
│ id (PK)      │   │    │ id (PK)       │
│ user_id (FK) ├───┘    │ product_id(FK)│
│ line1        │        │ quantity      │
│ city         │        └───────────────┘
│ latitude     │
│ longitude    │                ┌──────────────────┐
└──────┬───────┘                │  SUBSCRIPTIONS   │
       │                        ├──────────────────┤
       │                        │ id (PK)          │
       │                   ┌────┤ user_id (FK)     │
       │                   │    │ product_id (FK)  │
       │                   │    │ address_id (FK)  │
       │                   │    │ quantity         │
┌──────▼───────┐          │    │ days_of_week     │
│    ORDERS    │          │    │ start_date       │
├──────────────┤          │    │ status           │
│ id (PK)      │          │    │ billing_cycle    │
│ user_id (FK) ├──────────┘    │ payment_mode     │
│ address_id   │               └──────┬───────────┘
│ total        │                      │
│ status       │                      │
└──────┬───────┘               ┌──────▼──────────────────┐
       │                       │ SUBSCRIPTION_DELIVERIES │
       │                       ├─────────────────────────┤
       │                       │ id (PK)                 │
┌──────▼───────┐              │ subscription_id (FK)    │
│ ORDER_ITEMS  │              │ scheduled_date          │
├──────────────┤              │ status                  │
│ id (PK)      │              │ agent_id (FK)           │
│ order_id(FK) │              │ delivered_at            │
│ product_id   │              │ proof_image_url         │
│ quantity     │              └──────┬──────────────────┘
│ price        │                     │
└──────────────┘                     │
                              ┌──────▼───────────┐
                              │ DELIVERY_ROUTES  │
┌──────────────┐              ├──────────────────┤
│ AGENT_DETAILS│              │ id (PK)          │
├──────────────┤         ┌────┤ agent_id (FK)    │
│ id (PK)      │         │    │ date             │
│ user_id (FK) ├─────────┘    │ depot_lat        │
│ vehicle_type │              │ depot_long       │
│ vehicle_num  │              │ status           │
│ is_available │              └──────┬───────────┘
└──────────────┘                     │
                              ┌──────▼────────┐
                              │  ROUTE_STOPS  │
                              ├───────────────┤
                              │ id (PK)       │
                              │ route_id (FK) │
                              │ delivery_id   │
                              │ sequence      │
                              │ address_id    │
                              │ status        │
                              └───────────────┘

┌──────────────┐              ┌──────────────┐
│   INVOICES   │              │LEDGER_ENTRIES│
├──────────────┤              ├──────────────┤
│ id (PK)      │              │ id (PK)      │
│ user_id (FK) │              │ user_id (FK) │
│ sub_id (FK)  │              │ invoice_id   │
│ period_start │              │ type         │
│ period_end   │              │ amount       │
│ amount       │              │ description  │
│ status       │              └──────────────┘
│ due_date     │
└──────────────┘
```

### **Key Tables**

#### **users**
- Primary user table for all roles (customer, agent, admin)
- Managed by Supabase Auth
- Phone and email authentication

#### **subscriptions**
- Recurring delivery schedules
- `days_of_week`: JSON array ["mon", "wed", "fri"]
- `billing_cycle`: weekly or monthly
- `payment_mode`: prepaid or postpaid

#### **subscription_deliveries**
- Individual delivery instances generated from subscriptions
- Created by nightly cron job
- Assigned to agents for route optimization

#### **delivery_routes**
- Daily routes for each agent
- Contains optimized sequence of stops
- Depot location for route calculation

#### **route_stops**
- Individual stops in a delivery route
- Ordered by sequence number
- Links to either subscription_delivery or order

---

## 🔌 API Design

### **API Structure**

```
Base URL: https://api.dairyflow.com/api
or Development: http://localhost:5000/api
```

### **Authentication Endpoints**

```
POST   /auth/signup/phone           - Register with phone OTP
POST   /auth/signup/google          - Register with Google
POST   /auth/login/phone            - Login with phone OTP
POST   /auth/login/google           - Login with Google
POST   /auth/verify-otp             - Verify OTP code
POST   /auth/logout                 - Logout user
GET    /auth/user                   - Get current user
PUT    /auth/user                   - Update user profile
```

### **Customer Endpoints**

```
# Products
GET    /products                    - List all active products
GET    /products/:id                - Get product details

# Addresses
GET    /user/addresses              - List user addresses
POST   /user/addresses              - Create address
PUT    /user/addresses/:id          - Update address
DELETE /user/addresses/:id          - Delete address

# Subscriptions
GET    /user/subscriptions          - List user subscriptions
POST   /user/subscriptions          - Create subscription
PUT    /user/subscriptions/:id      - Update subscription
PATCH  /user/subscriptions/:id/pause  - Pause subscription
PATCH  /user/subscriptions/:id/resume - Resume subscription
DELETE /user/subscriptions/:id      - Cancel subscription

# Orders
GET    /user/orders                 - List user orders
POST   /user/orders                 - Place new order
GET    /user/orders/:id             - Get order details

# Invoices & Payments
GET    /user/invoices               - List user invoices
GET    /user/invoices/:id           - Get invoice details
POST   /user/invoices/:id/pay       - Initiate payment
GET    /user/ledger                 - Get ledger entries
```

### **Agent Endpoints**

```
GET    /agent/route                 - Get today's delivery route
GET    /agent/route?date=YYYY-MM-DD - Get route for specific date
PATCH  /agent/delivery/:id/status   - Update delivery status
POST   /agent/delivery/:id/proof    - Upload delivery proof
GET    /agent/stats                 - Get agent statistics
```

### **Admin Endpoints**

```
# Analytics
GET    /admin/analytics             - Dashboard analytics
GET    /admin/analytics/revenue     - Revenue metrics
GET    /admin/analytics/deliveries  - Delivery metrics

# Product Management
GET    /admin/products              - List all products (including inactive)
POST   /admin/products              - Create product
PUT    /admin/products/:id          - Update product
DELETE /admin/products/:id          - Deactivate product

# Inventory Management
GET    /admin/inventory             - List inventory
PATCH  /admin/inventory/:productId  - Update stock level

# Order Management
GET    /admin/orders                - List all orders
PATCH  /admin/orders/:id/status     - Update order status

# Agent Management
GET    /admin/agents                - List all agents
POST   /admin/agents                - Create agent
PUT    /admin/agents/:id            - Update agent details
POST   /admin/agents/:id/details    - Set agent vehicle details

# Route Optimization
POST   /admin/optimize-routes       - Trigger route optimization
GET    /admin/routes?date=YYYY-MM-DD - View routes for date

# Customer Management
GET    /admin/customers             - List all customers
GET    /admin/customers/:id         - Get customer details
PATCH  /admin/customers/:id/status  - Activate/deactivate customer
```

### **Request/Response Examples**

#### **Create Subscription**

```http
POST /api/user/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "prod_123",
  "addressId": "addr_456",
  "quantity": 2,
  "daysOfWeek": ["mon", "wed", "fri"],
  "startDate": "2025-01-01T06:00:00Z",
  "billingCycle": "monthly",
  "paymentMode": "prepaid"
}

Response:
{
  "id": "sub_789",
  "userId": "user_001",
  "productId": "prod_123",
  "addressId": "addr_456",
  "quantity": 2,
  "daysOfWeek": "[\"mon\",\"wed\",\"fri\"]",
  "startDate": "2025-01-01T06:00:00.000Z",
  "billingCycle": "monthly",
  "paymentMode": "prepaid",
  "status": "active",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### **Get Agent Route**

```http
GET /api/agent/route?date=2025-01-15
Authorization: Bearer <token>

Response:
{
  "route": {
    "id": "route_001",
    "agentId": "agent_001",
    "date": "2025-01-15",
    "depotLatitude": "11.0168",
    "depotLongitude": "76.9558",
    "status": "active",
    "stops": [
      {
        "id": "stop_001",
        "sequence": 1,
        "address": {
          "line1": "123 Main St",
          "city": "Coimbatore",
          "latitude": "11.0189",
          "longitude": "76.9619"
        },
        "delivery": {
          "id": "del_001",
          "subscriptionId": "sub_789",
          "scheduledDate": "2025-01-15T06:00:00.000Z",
          "status": "pending",
          "subscription": {
            "quantity": 2,
            "product": {
              "name": "Full Cream Milk",
              "unit": "1 Liter"
            }
          }
        },
        "status": "pending"
      }
    ]
  },
  "metrics": {
    "totalStops": 15,
    "totalDistance": 25.5,
    "estimatedTime": 180
  }
}
```

---

## 🔐 Authentication Flow

### **Phone OTP Authentication Flow**

```
┌──────────┐                                              ┌──────────┐
│          │  1. Enter Phone Number                       │          │
│  Client  ├─────────────────────────────────────────────►│  Server  │
│  (Web/   │                                              │  (API)   │
│  Mobile) │                                              │          │
│          │                                              │          │
└─────┬────┘                                              └────┬─────┘
      │                                                        │
      │                                                        │
      │                                       2. Generate OTP  │
      │                                          Store in DB   │
      │                                                        │
      │                                              ┌─────────▼────────┐
      │                                              │                  │
      │                                              │  Supabase Auth   │
      │                                              │                  │
      │                                              │  • Generate OTP  │
      │                                              │  • Send via SMS  │
      │                                              │  • Set expiry    │
      │               3. OTP sent via SMS            │                  │
      │  ◄──────────────────────────────────────────┤                  │
      │                                              └──────────────────┘
      │
      │  4. User enters OTP
      │
      │  5. Submit OTP for verification
      ├─────────────────────────────────────────────►
      │                                                        │
      │                                       6. Verify OTP    │
      │                                          Check expiry  │
      │                                                        │
      │                                              ┌─────────▼────────┐
      │                                              │                  │
      │                                              │  Supabase Auth   │
      │                                              │                  │
      │                                              │  • Verify OTP    │
      │                                              │  • Create session│
      │               7. JWT Token + Session         │  • Generate JWT  │
      │  ◄──────────────────────────────────────────┤                  │
      │                                              └──────────────────┘
      │
      │  8. Store token, redirect to dashboard
      │
┌─────▼────┐
│          │
│  Client  │
│ (Auth)   │
│          │
└──────────┘
```

### **Google OAuth Flow**

```
┌──────────┐                                    ┌─────────────┐
│          │  1. Click "Sign in with Google"    │             │
│  Client  ├───────────────────────────────────►│   Server    │
│          │                                    │             │
└────┬─────┘                                    └──────┬──────┘
     │                                                 │
     │         2. Redirect to Google OAuth             │
     │  ◄──────────────────────────────────────────────┤
     │                                                 │
┌────▼───────────┐                                    │
│                │  3. User authenticates              │
│  Google OAuth  │                                    │
│                │  4. Grant permissions               │
└────┬───────────┘                                    │
     │                                                 │
     │         5. Redirect with auth code              │
     ├────────────────────────────────────────────────►│
     │                                                 │
     │                                    ┌────────────▼─────────┐
     │                                    │   Supabase Auth      │
     │                                    │                      │
     │                                    │  • Exchange code     │
     │                                    │  • Get user info     │
     │                                    │  • Create/update user│
     │         6. JWT Token + Session     │  • Generate session  │
     │  ◄─────────────────────────────────┤                      │
     │                                    └──────────────────────┘
     │
┌────▼─────┐
│          │
│  Client  │
│  (Auth)  │
│          │
└──────────┘
```

### **Session Management**

- **JWT Tokens** stored in HTTP-only cookies (web) or secure storage (mobile)
- **Access Token** - Valid for 1 hour
- **Refresh Token** - Valid for 30 days
- **Automatic refresh** handled by Supabase client
- **Role-based** access control via JWT claims

---

## 👥 User Workflows

### **Customer Journey: Create Subscription**

```
START
  │
  ├─► 1. User logs in (Phone OTP or Google)
  │
  ├─► 2. Browse products
  │      • View product list
  │      • See prices, descriptions
  │      • Filter by type (milk/other)
  │
  ├─► 3. Select product
  │      • Click "Subscribe"
  │
  ├─► 4. Configure subscription
  │      │
  │      ├─► Select quantity
  │      ├─► Choose delivery days (Mon, Wed, Fri)
  │      ├─► Set start date
  │      ├─► Choose billing cycle (weekly/monthly)
  │      └─► Select payment mode (prepaid/postpaid)
  │
  ├─► 5. Select/Add delivery address
  │      │
  │      ├─► Use existing address
  │      │   OR
  │      └─► Add new address
  │          ├─► Enter address details
  │          ├─► Auto-geocode via MapmyIndia
  │          └─► Confirm location on map
  │
  ├─► 6. Review subscription
  │      • Confirm details
  │      • See total cost
  │
  ├─► 7. Payment (if prepaid)
  │      ├─► Redirect to Razorpay
  │      ├─► Complete payment
  │      └─► Return to app
  │
  ├─► 8. Subscription created
  │      • Show confirmation
  │      • Send email/SMS notification
  │      • Add to "My Subscriptions"
  │
END
```

### **Agent Journey: Daily Deliveries**

```
START (Morning)
  │
  ├─► 1. Agent logs in
  │      • Phone OTP authentication
  │
  ├─► 2. View today's route
  │      • See list of delivery stops
  │      • Stops sorted by optimized sequence
  │      • See total distance & estimated time
  │
  ├─► 3. Start navigation
  │      • Open MapmyIndia navigation
  │      • Turn-by-turn directions
  │
  ├─► 4. Arrive at first stop
  │      │
  │      ├─► 5. View customer details
  │      │      • Name, phone, address
  │      │      • Product & quantity
  │      │
  │      ├─► 6. Deliver product
  │      │      • Hand over to customer
  │      │
  │      ├─► 7. Update status
  │      │      ├─► Mark as "Delivered"
  │      │      ├─► Take photo proof (optional)
  │      │      └─► Add notes if any
  │      │
  │      └─► 8. Proceed to next stop
  │
  ├─► 9. Complete all deliveries
  │      • All stops marked delivered/failed
  │
  ├─► 10. End of day
  │       • Route marked complete
  │       • Deliveries synced to server
  │
END
```

### **Admin Journey: Route Optimization**

```
START
  │
  ├─► 1. Admin logs in
  │      • Access admin dashboard
  │
  ├─► 2. View analytics
  │      • Today's delivery stats
  │      • Pending subscriptions
  │      • Agent availability
  │
  ├─► 3. Navigate to Route Optimizer
  │
  ├─► 4. Select date for optimization
  │      • Tomorrow's deliveries
  │
  ├─► 5. View unassigned deliveries
  │      • List of subscription deliveries
  │      • List of one-time orders
  │      • Customer addresses on map
  │
  ├─► 6. Select agents
  │      • Choose available agents
  │      • See agent capacity
  │
  ├─► 7. Set depot location
  │      • Default: Company warehouse
  │      • Or custom location
  │
  ├─► 8. Run optimization algorithm
  │      ├─► Group deliveries by proximity
  │      ├─► Assign to agents
  │      ├─► Calculate optimal sequence
  │      └─► Estimate time & distance
  │
  ├─► 9. Review proposed routes
  │      • See each agent's route
  │      • View on map
  │      • Check balance of work
  │
  ├─► 10. Confirm or adjust
  │       ├─► Manual adjustments if needed
  │       └─► Confirm routes
  │
  ├─► 11. Routes published
  │       • Agents notified
  │       • Routes visible in agent app
  │
END
```

---

## 🛡️ Security Architecture

### **Security Layers**

```
┌───────────────────────────────────────────────────────────┐
│                   APPLICATION SECURITY                     │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         1. AUTHENTICATION LAYER                  │    │
│  │  ┌────────────────────────────────────────┐     │    │
│  │  │ • Supabase Auth (JWT tokens)           │     │    │
│  │  │ • Phone OTP (6-digit, 5min expiry)    │     │    │
│  │  │ • Google OAuth 2.0                     │     │    │
│  │  │ • Refresh token rotation               │     │    │
│  │  └────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         2. AUTHORIZATION LAYER                   │    │
│  │  ┌────────────────────────────────────────┐     │    │
│  │  │ • Role-Based Access Control (RBAC)     │     │    │
│  │  │ • Supabase Row Level Security (RLS)    │     │    │
│  │  │ • API endpoint guards                  │     │    │
│  │  │ • Resource ownership validation        │     │    │
│  │  └────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         3. INPUT VALIDATION LAYER                │    │
│  │  ┌────────────────────────────────────────┐     │    │
│  │  │ • Zod schema validation                │     │    │
│  │  │ • SQL injection prevention (Drizzle)   │     │    │
│  │  │ • XSS protection                       │     │    │
│  │  │ • CSRF tokens                          │     │    │
│  │  └────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         4. RATE LIMITING LAYER                   │    │
│  │  ┌────────────────────────────────────────┐     │    │
│  │  │ • API rate limiting (100 req/15min)    │     │    │
│  │  │ • OTP rate limiting (3 attempts/hour)  │     │    │
│  │  │ • Login rate limiting                  │     │    │
│  │  └────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         5. DATA PROTECTION LAYER                 │    │
│  │  ┌────────────────────────────────────────┐     │    │
│  │  │ • HTTPS/TLS encryption in transit      │     │    │
│  │  │ • Database encryption at rest          │     │    │
│  │  │ • Secure file upload validation        │     │    │
│  │  │ • PII data handling                    │     │    │
│  │  └────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### **Supabase Row Level Security (RLS) Policies**

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create subscriptions for themselves
CREATE POLICY "Users can create subscriptions"
ON subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Agents can view deliveries assigned to them
CREATE POLICY "Agents can view assigned deliveries"
ON subscription_deliveries FOR SELECT
USING (
  auth.uid() = agent_id 
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Agents can update status of their deliveries
CREATE POLICY "Agents can update delivery status"
ON subscription_deliveries FOR UPDATE
USING (auth.uid() = agent_id);

-- Admins can view all data
CREATE POLICY "Admins have full access"
ON ALL TABLES FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

---

## 📈 Scalability Strategy

### **Current Architecture (MVP - 0-1000 users)**

```
┌─────────────┐
│   Vercel    │  Web hosting (Free tier)
│  (Frontend) │  Global CDN
└──────┬──────┘
       │
┌──────▼──────┐
│   Vercel    │  API hosting (Free tier)
│  (Backend)  │  Serverless functions
└──────┬──────┘
       │
┌──────▼──────┐
│  Supabase   │  Database (Free tier)
│  (Database) │  Up to 500MB
└─────────────┘
```

**Capacity:** ~1,000 users, 100 daily deliveries
**Cost:** ~₹500/month

---

### **Phase 2 (1,000-10,000 users)**

```
┌─────────────┐
│   Vercel    │  Upgraded plan ($20/mo)
│  (Frontend) │  Better performance
└──────┬──────┘
       │
┌──────▼──────┐
│   Railway   │  API hosting ($5-20/mo)
│  or Render  │  Dedicated instance
│  (Backend)  │  Auto-scaling
└──────┬──────┘
       │
┌──────▼──────┐
│  Supabase   │  Pro plan ($25/mo)
│  (Database) │  8GB database
│             │  50GB bandwidth
└─────────────┘
```

**Capacity:** ~10,000 users, 1,000 daily deliveries
**Cost:** ~₹4,000-5,000/month

---

### **Phase 3 (10,000+ users)**

```
┌────────────────┐
│   Vercel Pro   │  Advanced CDN
│   (Frontend)   │  Edge functions
└───────┬────────┘
        │
┌───────▼────────┐
│  Load Balancer │  Distribute traffic
└───────┬────────┘
        │
   ┌────┴────┐
   │         │
┌──▼───┐ ┌──▼───┐
│ API  │ │ API  │  Multiple instances
│ Node │ │ Node │  Horizontal scaling
└──┬───┘ └──┬───┘
   │         │
   └────┬────┘
        │
┌───────▼───────┐
│   Supabase    │  Team/Enterprise
│   (Database)  │  Dedicated resources
│               │  Read replicas
└───────────────┘

┌───────────────┐
│   Redis       │  Caching layer
│   (Optional)  │  Session storage
└───────────────┘
```

**Capacity:** 50,000+ users, 5,000+ daily deliveries
**Cost:** ~₹20,000-50,000/month

---

### **Optimization Strategies**

1. **Database**
   - Add indexes on frequently queried fields
   - Use database connection pooling
   - Implement read replicas for reports
   - Archive old data (>1 year)

2. **API**
   - Implement Redis caching for product catalog
   - Use CDN for static assets
   - Implement API response compression
   - Add database query optimization

3. **Mobile**
   - Implement offline-first architecture
   - Cache data locally with AsyncStorage
   - Sync in background
   - Optimize image sizes

4. **Route Optimization**
   - Pre-compute routes night before
   - Cache geocoding results
   - Use spatial database queries
   - Consider advanced algorithms (Genetic Algorithm, OR-Tools)

---

## 📊 Monitoring & Observability

### **Key Metrics to Track**

**Application Metrics:**
- API response time (target: <500ms p95)
- Error rate (target: <1%)
- Request throughput
- Database query performance

**Business Metrics:**
- Daily active users
- Subscriptions created/cancelled
- Delivery success rate
- Revenue per day
- Agent efficiency (deliveries/hour)

**Infrastructure Metrics:**
- CPU/Memory usage
- Database connections
- API rate limit hits
- Storage usage

### **Tools**

- **Application Monitoring:** Vercel Analytics, Sentry
- **Database Monitoring:** Supabase Dashboard
- **Uptime Monitoring:** UptimeRobot (free)
- **Error Tracking:** Sentry (free tier)
- **Logging:** Console + File logs

---

## 🎯 Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Page Load Time | <2s | <5s |
| API Response Time (p95) | <500ms | <2s |
| Mobile App Launch | <3s | <5s |
| Delivery Route Calculation | <10s | <30s |
| Database Query Time | <100ms | <500ms |
| Uptime | 99.9% | 99% |
| Error Rate | <0.5% | <2% |

---

## 📝 Summary

This system design provides:
- ✅ Scalable architecture from MVP to enterprise
- ✅ Cost-effective technology choices
- ✅ Security-first approach
- ✅ Clear separation of concerns
- ✅ Mobile-first considerations
- ✅ Real-time capabilities via Supabase
- ✅ Extensible for future features

**Next Steps:** See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed implementation instructions.
