# 🚀 Supabase Setup Guide - Step by Step

This guide will walk you through setting up Supabase for DairyFlow, from account creation to full integration.

---

## 📋 Prerequisites

- [ ] Email account (Gmail recommended)
- [ ] GitHub account (optional, for easier login)
- [ ] Internet connection

**Estimated Time:** 30-45 minutes

---

## Part 1: Create Supabase Account & Project

### Step 1: Sign Up for Supabase

1. **Open your browser** and go to: https://supabase.com

2. **Click "Start your project"** button (top right)

3. **Sign up options:**
   - **Option A (Recommended):** Click "Continue with GitHub"
     - Authorize Supabase to access your GitHub
   - **Option B:** Click "Continue with Google"
   - **Option C:** Enter email and password

4. **Verify your email** (if using email/password)
   - Check your inbox
   - Click verification link

5. **You're now logged in!** You'll see the Supabase dashboard

---

### Step 2: Create Your First Project

1. **Click "New Project"** button

2. **Fill in project details:**
   ```
   Name: dairyflow-dev
   
   Database Password: [Generate a strong password]
   ⚠️ IMPORTANT: Save this password securely!
   
   Region: Southeast Asia (Singapore) [closest to India]
   
   Pricing Plan: Free
   ```

3. **Click "Create new project"**

4. **Wait 2-3 minutes** for project provisioning
   - You'll see a progress indicator
   - Dashboard will load when ready

---

### Step 3: Get Your Project Credentials

Once your project is ready:

1. **Click on "Settings"** (gear icon in left sidebar)

2. **Click "API"** in the settings menu

3. **You'll see these important values:**
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGc....[long string]
   service_role: eyJhbGc....[long string]
   ```

4. **Copy these to a notepad** - you'll need them soon!

---

## Part 2: Configure Database

### Step 4: Create Database Schema

1. **Click "SQL Editor"** in left sidebar

2. **Click "New query"**

3. **Copy and paste this entire schema:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE role AS ENUM ('user', 'agent', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'failed');
CREATE TYPE billing_cycle AS ENUM ('weekly', 'monthly');
CREATE TYPE payment_mode AS ENUM ('prepaid', 'postpaid');
CREATE TYPE product_status AS ENUM ('active', 'inactive');

-- Sessions table (for auth)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IDX_session_expire ON sessions(expire);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE,
  phone VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role role DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR,
  line1 VARCHAR NOT NULL,
  area VARCHAR,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  pincode VARCHAR NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  unit VARCHAR NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_milk BOOLEAN DEFAULT false,
  status product_status DEFAULT 'active' NOT NULL,
  image_url VARCHAR,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_id UUID NOT NULL REFERENCES addresses(id),
  total DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  tracking_number VARCHAR,
  carrier VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  address_id UUID NOT NULL REFERENCES addresses(id),
  quantity INTEGER NOT NULL,
  days_of_week VARCHAR NOT NULL,
  start_date TIMESTAMP NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  payment_mode payment_mode NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription deliveries table
CREATE TABLE subscription_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  status delivery_status DEFAULT 'pending' NOT NULL,
  delivered_at TIMESTAMP,
  agent_id UUID REFERENCES users(id),
  proof_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery routes table
CREATE TABLE delivery_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  depot_latitude DECIMAL(10, 8),
  depot_longitude DECIMAL(11, 8),
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Route stops table
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES subscription_deliveries(id),
  order_id UUID REFERENCES orders(id),
  sequence INTEGER NOT NULL,
  address_id UUID NOT NULL REFERENCES addresses(id),
  status delivery_status DEFAULT 'pending' NOT NULL,
  delivered_at TIMESTAMP,
  estimated_minutes INTEGER,
  actual_minutes INTEGER
);

-- Agent details table
CREATE TABLE agent_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type VARCHAR,
  vehicle_number VARCHAR,
  license_number VARCHAR,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_at TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ledger entries table
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscription_deliveries_date ON subscription_deliveries(scheduled_date);
CREATE INDEX idx_subscription_deliveries_agent ON subscription_deliveries(agent_id);
CREATE INDEX idx_subscription_deliveries_status ON subscription_deliveries(status);
CREATE INDEX idx_delivery_routes_agent_date ON delivery_routes(agent_id, date);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

4. **Click "Run"** button (bottom right)

5. **Wait for success message:** "Success. No rows returned"

6. **Verify tables were created:**
   - Click "Table Editor" in left sidebar
   - You should see all 14 tables listed

---

### Step 5: Enable Row Level Security (RLS)

1. **Still in SQL Editor, create a new query**

2. **Enable RLS on all tables:**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
```

3. **Click "Run"**

4. **Create RLS policies:**

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own addresses
CREATE POLICY "Users can manage addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Everyone can view active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create subscriptions
CREATE POLICY "Users can create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agents can view their assigned deliveries
CREATE POLICY "Agents can view assigned deliveries" ON subscription_deliveries
  FOR SELECT USING (
    auth.uid() = agent_id 
    OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Agents can update their delivery status
CREATE POLICY "Agents can update deliveries" ON subscription_deliveries
  FOR UPDATE USING (auth.uid() = agent_id);

-- Agents can view their routes
CREATE POLICY "Agents can view routes" ON delivery_routes
  FOR SELECT USING (
    auth.uid() = agent_id
    OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Admins can do everything (create separate policies per table)
CREATE POLICY "Admins full access users" ON users FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins full access products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins full access inventory" ON inventory FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins full access orders" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins full access subscriptions" ON subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins full access deliveries" ON subscription_deliveries FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admins full access routes" ON delivery_routes FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
```

5. **Click "Run"**

---

## Part 3: Configure Authentication

### Step 6: Enable Phone Authentication

1. **Click "Authentication"** in left sidebar

2. **Click "Providers"** tab

3. **Find "Phone"** in the list

4. **Toggle ON** the Phone provider

5. **You'll see options:**
   ```
   Phone OTP via Supabase (Recommended)
   - Uses Twilio behind the scenes
   - No additional setup needed
   - Free tier includes SMS
   ```

6. **Keep defaults and Save**

---

### Step 7: Enable Google OAuth

1. **Still in Providers, find "Google"**

2. **Toggle ON** Google provider

3. **For now, leave default settings** (we'll configure properly later)

4. **Click "Save"**

---

### Step 8: Configure Site URL

1. **Click "Authentication" → "URL Configuration"**

2. **Set Site URL:**
   ```
   Development: http://localhost:5000
   Production: https://yourdomain.com (add later)
   ```

3. **Add Redirect URLs:**
   ```
   http://localhost:5000/auth/callback
   http://localhost:5000/**
   ```

4. **Click "Save"**

---

## Part 4: Seed Initial Data

### Step 9: Add Sample Products

1. **Go to SQL Editor**

2. **Run this to add sample products:**

```sql
-- Insert sample dairy products
INSERT INTO products (name, unit, price, is_milk, status, description) VALUES
('Full Cream Milk', '1 Liter', 60.00, true, 'active', 'Fresh full cream milk delivered daily'),
('Toned Milk', '1 Liter', 50.00, true, 'active', 'Low-fat toned milk'),
('Skimmed Milk', '500 ml', 28.00, true, 'active', 'Fat-free skimmed milk'),
('Curd', '500 grams', 35.00, false, 'active', 'Fresh homemade style curd'),
('Paneer', '250 grams', 80.00, false, 'active', 'Fresh cottage cheese'),
('Butter', '100 grams', 55.00, false, 'active', 'Pure milk butter'),
('Ghee', '500 ml', 450.00, false, 'active', 'Pure cow ghee');

-- Create inventory for products
INSERT INTO inventory (product_id, quantity)
SELECT id, 100 FROM products;
```

3. **Click "Run"**

4. **Verify:** Go to Table Editor → products table
   - You should see 7 products

---

### Step 10: Create Admin User

1. **Go to SQL Editor**

2. **Create an admin user:**

```sql
-- Insert admin user (using your email)
INSERT INTO users (id, email, first_name, last_name, role, is_active)
VALUES (
  uuid_generate_v4(),
  'your-email@gmail.com',  -- ⚠️ CHANGE THIS to your email
  'Admin',
  'User',
  'admin',
  true
);
```

3. **Replace 'your-email@gmail.com' with your actual email**

4. **Click "Run"**

---

## Part 5: Update Your Project

### Step 11: Install Supabase Client

1. **Open terminal in your project directory**

2. **Install Supabase:**

```powershell
npm install @supabase/supabase-js
```

---

### Step 12: Create Environment File

1. **Create `.env` file in project root:**

```powershell
cp .env.example .env
```

2. **Open `.env` in your editor**

3. **Add your Supabase credentials:**

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...  # Your anon public key
SUPABASE_SERVICE_KEY=eyJhbGc...  # Your service_role key

# Server
PORT=5000
NODE_ENV=development
```

4. **Replace with your actual values from Step 3**

5. **Save the file**

---

### Step 13: Create Supabase Client

1. **Create new file:** `client/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

2. **Update `drizzle.config.ts`:**

```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

3. **Update `server/db.ts`:**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from "@shared/schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set")
}

const client = postgres(process.env.DATABASE_URL)
export const db = drizzle(client, { schema })
```

---

### Step 14: Update Vite Config for Environment Variables

1. **Open `vite.config.ts`**

2. **Add environment variable configuration:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Add environment variable prefix
  envPrefix: 'VITE_',
});
```

3. **Create `.env.local` for frontend:**

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

### Step 15: Test Database Connection

1. **Create test file:** `server/test-connection.ts`

```typescript
import { db } from './db'
import { products } from '@shared/schema'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    const allProducts = await db.select().from(products)
    
    console.log('✅ Connection successful!')
    console.log(`Found ${allProducts.length} products:`)
    allProducts.forEach(p => console.log(`  - ${p.name}`))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

testConnection()
```

2. **Run the test:**

```powershell
npx tsx server/test-connection.ts
```

3. **Expected output:**
```
Testing database connection...
✅ Connection successful!
Found 7 products:
  - Full Cream Milk
  - Toned Milk
  - Skimmed Milk
  - Curd
  - Paneer
  - Butter
  - Ghee
```

---

## Part 6: Test Authentication

### Step 16: Test Phone OTP Login

1. **Start your dev server:**

```powershell
npm run dev
```

2. **Open browser:** http://localhost:5000

3. **Try to sign up/login with phone:**
   - Enter your phone number
   - You should receive OTP via SMS
   - Enter OTP to verify

4. **Check if user was created:**
   - Go to Supabase Dashboard
   - Click "Authentication" → "Users"
   - You should see your phone number listed

---

## 🎉 Success Checklist

- [x] ✅ Supabase account created
- [x] ✅ Project created (dairyflow-dev)
- [x] ✅ Database schema deployed (14 tables)
- [x] ✅ RLS policies enabled
- [x] ✅ Phone auth configured
- [x] ✅ Google OAuth enabled
- [x] ✅ Sample data seeded
- [x] ✅ Admin user created
- [x] ✅ Supabase client installed
- [x] ✅ Environment variables configured
- [x] ✅ Database connection tested
- [x] ✅ Authentication tested

---

## 🔧 Troubleshooting

### Issue: "relation does not exist"

**Solution:** Run the schema creation SQL again in SQL Editor

### Issue: "Invalid API key"

**Solution:** 
1. Check `.env` file has correct keys
2. Make sure you're using `VITE_` prefix for frontend variables
3. Restart dev server after changing .env

### Issue: "Connection timeout"

**Solution:**
1. Check your internet connection
2. Verify DATABASE_URL is correct
3. Check if Supabase project is paused (free tier pauses after 1 week of inactivity)

### Issue: "Authentication failed"

**Solution:**
1. Verify Phone provider is enabled in Supabase
2. Check Site URL and Redirect URLs are configured
3. Make sure user exists in database

---

## 📚 Next Steps

Now that Supabase is set up, proceed to:

1. **[AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md)** - Implement Phone OTP and Google login
2. **[MAPMYINDIA_SETUP.md](./MAPMYINDIA_SETUP.md)** - Set up maps and geocoding
3. **[RAZORPAY_SETUP.md](./RAZORPAY_SETUP.md)** - Configure payment gateway

---

## 🆘 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **GitHub Issues:** https://github.com/TechEdusyAi/DairyFlow/issues

---

**Last Updated:** January 2025  
**Version:** 1.0
