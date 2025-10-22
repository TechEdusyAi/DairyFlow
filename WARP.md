# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DairyFlow is a dairy delivery management system built as a full-stack TypeScript application. It manages milk/dairy subscriptions, orders, delivery routes, and inventory for a multi-role system (users, delivery agents, and admins).

## Commands

### Development
```bash
npm run dev
```
Starts the development server with hot-reload. Runs both Express backend and Vite frontend on port 5000.

### Type Checking
```bash
npm run check
```
Runs TypeScript compiler without emitting files. Use this to verify type correctness before committing.

### Build
```bash
npm run build
```
Builds both client (Vite) and server (esbuild). Client output goes to `dist/public`, server to `dist/index.js`.

### Production
```bash
npm run start
```
Runs the built production application.

### Database
```bash
npm run db:push
```
Pushes schema changes to the database using Drizzle Kit. Run this after modifying `shared/schema.ts`.

## Architecture

### Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Role-based pages (user, agent, admin)
│       ├── components/
│       ├── hooks/
│       └── lib/
├── server/          # Express backend
│   ├── services/    # Business logic (cron, route optimizer)
│   ├── routes.ts    # API endpoints
│   ├── storage.ts   # Database layer
│   ├── db.ts        # Drizzle DB connection
│   └── replitAuth.ts
└── shared/          # Shared types and schemas
    └── schema.ts    # Drizzle ORM schema + Zod validators
```

### Key Architectural Patterns

**Monorepo with Path Aliases:**
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

All imports must use these aliases for shared code and client code.

**Three-Layer Architecture:**
1. **Routes Layer** (`server/routes.ts`): API endpoints, request validation, auth middleware
2. **Storage Layer** (`server/storage.ts`): Database operations abstracted behind `IStorage` interface
3. **Database Layer** (`server/db.ts`): Drizzle ORM connection to PostgreSQL (Neon)

**Shared Schema Pattern:**
- Database schema defined in `shared/schema.ts` using Drizzle ORM
- Zod validators auto-generated from Drizzle schema using `drizzle-zod`
- Types exported from schema (e.g., `User`, `InsertUser`, `Order`) are used throughout both client and server

### Role-Based Access Control

Three user roles: `user`, `agent`, `admin`

**User Flow:**
- Browse products, create subscriptions, place one-time orders
- Manage delivery addresses
- View invoices and order history

**Agent Flow:**
- View daily delivery routes optimized by nearest-neighbor algorithm
- Update delivery status for each stop
- Mobile-first UI for field use

**Admin Flow:**
- Manage products and inventory
- View analytics dashboard
- Assign agents and optimize delivery routes
- Monitor all orders and subscriptions

### Database & ORM

**Stack:**
- PostgreSQL (Neon serverless)
- Drizzle ORM with Neon driver
- WebSocket connection (uses `ws` package)

**Key Tables:**
- `users` - Authentication + profile (includes role)
- `products` - Dairy products catalog
- `subscriptions` - Recurring deliveries (stores days of week as JSON)
- `subscription_deliveries` - Individual delivery instances
- `orders` - One-time orders
- `delivery_routes` - Agent routes with stops
- `addresses` - Geocoded customer addresses
- `invoices`, `ledger_entries` - Billing system

**Schema Management:**
- Schema is single source of truth in `shared/schema.ts`
- Changes require running `npm run db:push` to sync database
- Use Drizzle relations for joins (defined in schema)

### Background Services

**Cron Service** (`server/services/cronService.ts`):
- Runs every 24 hours
- Expands active subscriptions into `subscription_deliveries` for next day
- Checks subscription `daysOfWeek` JSON field to determine if delivery needed

**Route Optimizer** (`server/services/routeOptimizer.ts`):
- Implements nearest-neighbor algorithm for delivery route optimization
- Uses Haversine formula for distance calculations
- Requires address geocoding (latitude/longitude)
- Default depot: Coimbatore city center (11.0168, 76.9558)

### Authentication

Uses Replit Auth (OpenID Connect):
- Session-based authentication with PostgreSQL session store
- `isAuthenticated` middleware protects routes
- User info stored in `req.user.claims`
- Admin routes protected by additional role check

### Frontend

**Tech Stack:**
- React 18 + TypeScript
- Vite bundler
- TanStack Query (React Query) for API calls
- Wouter for routing (lightweight React Router alternative)
- Radix UI + Tailwind CSS for components
- shadcn/ui component patterns

**State Management:**
- Server state via TanStack Query (see `client/src/lib/queryClient.ts`)
- Auth state via `useAuth` hook
- No global state library - prefer React Query caching

**Routing:**
- Role-based routing in `App.tsx`
- Each role sees different routes based on `user.role`
- Unauthenticated users see landing page only

## Development Patterns

### Adding a New API Endpoint

1. Define types in `shared/schema.ts` (Drizzle table + Zod schema)
2. Add storage method to `IStorage` interface and implement in `DatabaseStorage` class (`server/storage.ts`)
3. Add route in `server/routes.ts` with appropriate auth middleware
4. Use Zod schema for request validation: `insertXSchema.parse(req.body)`
5. Return JSON responses, let error middleware handle errors

### Adding a New Feature

1. Check if new database tables needed → update `shared/schema.ts`
2. Run `npm run db:push` to sync database
3. Implement storage layer methods
4. Add API endpoints
5. Create React Query hooks in `client/src/hooks/`
6. Build UI components using existing Radix UI patterns
7. Run `npm run check` to verify types

### Working with Dates

- Database stores timestamps as PostgreSQL `timestamp` type
- Subscription deliveries use scheduled dates at 6 AM default
- Cron service calculates "tomorrow" at 11 PM each night
- Always use `Date` objects, Drizzle handles serialization

### Geocoding Addresses

Route optimization requires latitude/longitude on addresses. When creating addresses, geocode the address and store coordinates in `addresses.latitude` and `addresses.longitude` fields.

## Environment Variables

Required:
- `DATABASE_URL` - Neon PostgreSQL connection string (auto-provisioned in Replit)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - `development` or `production`

## Database Provisioning

This project requires a PostgreSQL database. In Replit, the database is auto-provisioned and `DATABASE_URL` is set automatically. For local development, set up a Neon database and configure `DATABASE_URL` in `.env`.

## Notes

- Server and client run on same port (5000) - Vite dev server proxies to Express in development
- In production, Express serves static files from `dist/public`
- WebSocket support configured for Neon serverless
- Replit-specific plugins in `vite.config.ts` only load in Replit environment
