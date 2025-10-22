# ⚡ DairyFlow Quick Start Guide

Get DairyFlow up and running in 1 hour!

---

## 🎯 What You'll Accomplish

By the end of this guide:
- ✅ Supabase account & database ready
- ✅ Authentication working (Phone OTP)
- ✅ Sample products loaded
- ✅ App running locally
- ✅ Ready to start development

---

## 📋 Before You Start

Have ready:
- [ ] Gmail or GitHub account
- [ ] Your phone number (for testing OTP)
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/PowerShell access

---

## 🚀 Part 1: Supabase Setup (15 minutes)

### 1. Create Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub or Google
4. Wait for dashboard to load

### 2. Create Project

1. Click "New Project"
2. Fill details:
   - Name: `dairyflow-dev`
   - Password: Generate strong password ⚠️ SAVE THIS!
   - Region: Southeast Asia (Singapore)
   - Plan: Free
3. Click "Create"
4. Wait 2-3 minutes for provisioning

### 3. Get Credentials

1. Go to Settings → API
2. Copy and save:
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGc...`
   - service_role key: `eyJhbGc...`

---

## 💾 Part 2: Database Setup (10 minutes)

### 4. Create Schema

1. Click "SQL Editor" in sidebar
2. Click "New query"
3. **Copy the ENTIRE schema from `docs/SUPABASE_SETUP.md` Step 4**
   - Or get it directly from: [Schema SQL](./SUPABASE_SETUP.md#step-4-create-database-schema)
4. Paste into SQL Editor
5. Click "Run"
6. Verify: Click "Table Editor" - you should see 14 tables

### 5. Enable Security

1. SQL Editor → New query
2. **Copy RLS enable commands from `docs/SUPABASE_SETUP.md` Step 5**
3. Click "Run"
4. SQL Editor → New query
5. **Copy RLS policies from `docs/SUPABASE_SETUP.md` Step 5**
6. Click "Run"

### 6. Seed Data

1. SQL Editor → New query
2. **Copy product insert from `docs/SUPABASE_SETUP.md` Step 9**
3. Click "Run"
4. Verify: Table Editor → products (should see 7 products)

---

## 🔐 Part 3: Enable Auth (5 minutes)

### 7. Phone Authentication

1. Click "Authentication" → "Providers"
2. Find "Phone"
3. Toggle ON
4. Keep defaults
5. Save

### 8. Google OAuth

1. Same page, find "Google"
2. Toggle ON
3. Save (we'll configure properly later)

### 9. URLs

1. Authentication → URL Configuration
2. Site URL: `http://localhost:5000`
3. Redirect URLs: `http://localhost:5000/**`
4. Save

---

## 💻 Part 4: Local Project Setup (15 minutes)

### 10. Install Dependencies

```powershell
# Make sure you're in project directory
cd C:\Users\Naresh\Downloads\TechEdusy\TechedusyAI\DairyFlow\DairyFlow

# Install Supabase client
npm install @supabase/supabase-js

# Install postgres client (for Drizzle)
npm install postgres
```

### 11. Configure Environment

1. Copy example env file:
```powershell
copy .env.example .env
```

2. Edit `.env` with your Supabase credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000
NODE_ENV=development
```

3. Create `.env.local` for frontend:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 12. Update Database Connection

1. Open `server/db.ts`
2. Replace content with:

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

### 13. Create Supabase Client

1. Create file: `client/src/lib/supabase.ts`

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

---

## 🧪 Part 5: Test Everything (10 minutes)

### 14. Test Database Connection

1. Create `server/test-connection.ts`:

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

2. Run test:
```powershell
npx tsx server/test-connection.ts
```

3. Should see:
```
✅ Connection successful!
Found 7 products:
  - Full Cream Milk
  - Toned Milk
  ...
```

### 15. Start Development Server

```powershell
npm run dev
```

Should start on http://localhost:5000

### 16. Test in Browser

1. Open http://localhost:5000
2. Try to sign up/login
3. You should see landing page

---

## ✅ Success Checklist

- [ ] Supabase account created
- [ ] Project created (dairyflow-dev)
- [ ] 14 database tables created
- [ ] RLS policies enabled
- [ ] 7 sample products added
- [ ] Phone auth enabled
- [ ] Supabase client installed
- [ ] .env files configured
- [ ] Database connection tested (7 products found)
- [ ] Dev server running on port 5000
- [ ] App loads in browser

---

## 🎉 You're Ready!

If all checkboxes are ticked, you're ready to start development!

### What's Next?

**Recommended order:**

1. **Week 1:** Authentication Implementation
   - Follow: `docs/AUTHENTICATION_IMPLEMENTATION.md`
   - Implement Phone OTP login
   - Implement Google OAuth
   - Test with real users

2. **Week 2:** MapmyIndia Integration
   - Follow: `docs/MAPMYINDIA_SETUP.md`
   - Set up geocoding
   - Add map components
   - Test address entry

3. **Week 3:** Complete Features
   - Payment gateway (Razorpay)
   - Subscriptions CRUD
   - Orders functionality
   - Admin dashboard

4. **Week 4-6:** Polish & Launch
   - Testing
   - Bug fixes
   - Documentation
   - Deploy to production

---

## 🆘 Having Issues?

### Common Problems

**"relation does not exist"**
→ Run the schema SQL again in Supabase SQL Editor

**"Invalid API key"**
→ Double-check your `.env` file keys match Supabase dashboard

**"Connection timeout"**
→ Check internet connection and verify DATABASE_URL

**"Cannot find module"**
→ Run `npm install` again

**Port 5000 already in use**
→ Kill other processes or change PORT in .env

---

## 📚 Full Documentation

For detailed explanations:
- **Complete Setup:** `docs/SUPABASE_SETUP.md`
- **System Design:** `SYSTEM_DESIGN.md`
- **Technical Report:** `TECHNICAL_REPORT.md`
- **Project Plan:** `PROJECT_PLAN.md`

---

## 💬 Get Help

- **GitHub Issues:** https://github.com/TechEdusyAi/DairyFlow/issues
- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com

---

**Estimated Total Time:** 55 minutes  
**Difficulty:** Beginner-friendly

**Last Updated:** January 2025
