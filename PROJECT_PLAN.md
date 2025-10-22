# DairyFlow Project Plan

## 📁 Reorganized Project Structure

```
DairyFlow/
├── web/                          # Web application (current codebase)
│   ├── client/                   # React frontend
│   ├── server/                   # Express backend API
│   └── shared/                   # Shared types/schemas
│
├── mobile/                       # React Native mobile app (future)
│   ├── android/
│   ├── ios/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   └── navigation/
│   └── package.json
│
├── packages/                     # Shared packages
│   ├── api-client/              # Typed API client for both web & mobile
│   ├── ui-components/           # Shared components (future)
│   └── types/                   # Shared TypeScript types
│
├── docs/                        # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── MOBILE_SETUP.md
│
└── scripts/                     # Build/deployment scripts
    ├── seed-db.ts
    └── migrate.ts
```

---

## 🎯 Development Phases

### **Phase 1: Web Application (4-6 weeks) ⭐ CURRENT FOCUS**

#### Week 1-2: Core Infrastructure
- [x] Project structure (current)
- [ ] **Switch to Supabase**
  - [ ] Setup Supabase project
  - [ ] Migrate schema to Supabase
  - [ ] Configure Supabase Auth (Phone OTP + Google)
  - [ ] Update connection strings
- [ ] **Authentication Overhaul**
  - [ ] Replace Replit Auth with Supabase Auth
  - [ ] Phone number + OTP (Twilio integration)
  - [ ] Google Sign-In
  - [ ] Role management (user/agent/admin)
- [ ] **MapmyIndia Integration**
  - [ ] API setup
  - [ ] Geocoding service
  - [ ] Map components for address selection

#### Week 3-4: Feature Completion
- [ ] Payment Gateway (Razorpay/Stripe)
- [ ] Invoice generation system
- [ ] Email notifications (Supabase Edge Functions + Resend)
- [ ] Admin dashboard enhancements
- [ ] Agent route optimization improvements
- [ ] Testing framework setup

#### Week 5-6: Polish & Launch
- [ ] UI/UX improvements
- [ ] Error handling & validation
- [ ] Performance optimization
- [ ] Documentation (README, API docs)
- [ ] Production deployment
- [ ] User testing & bug fixes

**Deliverable:** Production-ready web application

---

### **Phase 2: Mobile App Development (6-8 weeks)**

#### Week 1-2: Setup & Architecture
- [ ] React Native project setup (Expo or bare)
- [ ] Shared API client package
- [ ] Navigation structure (React Navigation)
- [ ] Authentication screens (Phone OTP, Google)
- [ ] Supabase SDK integration

#### Week 3-4: Core Features - User App
- [ ] Product catalog
- [ ] Subscription management
- [ ] Order placement
- [ ] Address management with MapmyIndia
- [ ] Profile & settings
- [ ] Push notifications (FCM)

#### Week 5-6: Agent App Features
- [ ] Daily route view
- [ ] Turn-by-turn navigation (MapmyIndia)
- [ ] Delivery status updates
- [ ] Offline support (React Native AsyncStorage)
- [ ] Camera for delivery proof
- [ ] GPS tracking

#### Week 7-8: Testing & Launch
- [ ] Beta testing (TestFlight/Internal Testing)
- [ ] Bug fixes & optimization
- [ ] Play Store listing (screenshots, description)
- [ ] App Store submission (if iOS)
- [ ] Play Store submission
- [ ] Marketing materials

**Deliverables:** 
- User app on Play Store
- Agent app on Play Store (or separate build)

---

## 🔧 Technical Stack Updates

### Current Stack (Keep)
- ✅ React + TypeScript
- ✅ Vite
- ✅ Drizzle ORM
- ✅ TanStack Query
- ✅ Tailwind CSS
- ✅ Express.js

### Stack Changes (Web)
| Component | Old | New | Reason |
|-----------|-----|-----|--------|
| **Database** | Neon Serverless | **Supabase PostgreSQL** | Auth + Realtime + Better DX |
| **Auth** | Replit Auth | **Supabase Auth** | Phone OTP + Google built-in |
| **Maps** | - | **MapmyIndia** | Indian market, better geocoding |
| **Storage** | - | **Supabase Storage** | Delivery proof images |
| **Notifications** | - | **Resend** (Email) | Transactional emails |
| **Payment** | - | **Razorpay** | Indian UPI/Cards |

### New Stack (Mobile)
- **Framework:** React Native (Expo recommended)
- **Navigation:** React Navigation
- **State:** TanStack Query (same as web)
- **Maps:** MapmyIndia React Native SDK
- **Auth:** Supabase JS Client
- **Storage:** React Native AsyncStorage
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Camera:** Expo Camera / React Native Vision Camera

---

## 🚀 Immediate Action Items (Next 3 Days)

### Day 1: Supabase Migration
1. Create Supabase project
2. Copy schema from `shared/schema.ts` to Supabase SQL editor
3. Update `drizzle.config.ts` with Supabase connection
4. Test database connection
5. Run `npm run db:push`

### Day 2: Authentication Setup
1. Configure Supabase Auth providers (Phone, Google)
2. Setup Twilio for SMS OTP
3. Update `server/replitAuth.ts` → `server/supabaseAuth.ts`
4. Update frontend auth hooks
5. Test login flows

### Day 3: MapmyIndia Integration
1. Get MapmyIndia API keys
2. Create geocoding service in `server/services/geocoding.ts`
3. Add map component in `client/src/components/maps/`
4. Update address creation flow
5. Test geocoding

---

## 📦 Package Management Strategy

### Monorepo Setup (Optional but Recommended)
Use **Turborepo** or **pnpm workspaces** to share code:

```json
{
  "name": "dairyflow-monorepo",
  "workspaces": [
    "web",
    "mobile",
    "packages/*"
  ]
}
```

### Shared Packages
1. **@dairyflow/api-client** - Typed API wrapper
2. **@dairyflow/types** - Shared TypeScript types
3. **@dairyflow/utils** - Common utilities

---

## 💰 Cost Estimation (Monthly)

### Development Phase
- Supabase: Free tier
- MapmyIndia: ₹0 (3,000 free requests/day)
- Twilio: ~₹500 (100 SMS)
- Vercel: Free tier
- **Total: ~₹500/month**

### Production (100 daily users)
- Supabase: Free tier
- MapmyIndia: ₹0 (within free tier)
- Twilio: ~₹5,000 (1000 SMS)
- Razorpay: 2% transaction fee
- Vercel: Free tier
- **Total: ~₹5,000/month**

---

## 📱 Mobile App Strategy

### Two Options:

**Option A: Single App with Role Selection**
- Users and Agents use same app
- Role selection after login
- Simpler maintenance
- Larger app size

**Option B: Separate Apps** ⭐ RECOMMENDED
- User app: "DairyFlow" (Customers)
- Agent app: "DairyFlow Agent" (Delivery partners)
- Focused UX per role
- Smaller app sizes
- Better Play Store optimization

---

## 🎯 Success Metrics

### Web App Launch
- 50 registered users in first month
- 10 active subscriptions
- <2s page load time
- <5% error rate

### Mobile App Launch
- 4.0+ rating on Play Store
- 100 downloads in first month
- 60% day-7 retention
- <1% crash rate

---

## 🔐 Security Considerations

- [ ] Supabase Row Level Security (RLS) policies
- [ ] API rate limiting
- [ ] Input validation (Zod schemas)
- [ ] Secure file uploads
- [ ] HTTPS everywhere
- [ ] Environment variable management
- [ ] SQL injection prevention (Drizzle handles this)

---

## 📝 Next Steps Summary

**IMMEDIATE (This Week):**
1. ✅ Create this plan document
2. 🔄 Setup Supabase project
3. 🔄 Migrate database
4. 🔄 Implement Supabase Auth

**SHORT TERM (2-4 Weeks):**
5. MapmyIndia integration
6. Payment gateway
7. Complete web features
8. Testing & deployment

**MEDIUM TERM (2-3 Months):**
9. Start mobile app
10. User app development
11. Agent app development
12. Play Store launch

---

## 🤝 Team Requirements

- **Full-stack Developer** (1) - Web app completion
- **Mobile Developer** (1) - React Native app (Phase 2)
- **UI/UX Designer** (0.5) - Design systems & mobile screens
- **QA Tester** (0.5) - Testing both platforms

**OR Solo Development:** ~4-5 months total
