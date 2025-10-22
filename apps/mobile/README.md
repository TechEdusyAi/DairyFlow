# 🥛 DairyFlow Mobile Apps

This directory will contain the React Native mobile applications for DairyFlow.

## 📱 Planned Applications

### Customer App (`apps/mobile/customer/`)
- Product browsing and subscriptions
- Order management
- Address management with MapmyIndia
- Push notifications
- Offline support

### Agent App (`apps/mobile/agent/`)
- Daily route management
- Turn-by-turn navigation
- Delivery status updates
- Photo proof capture
- GPS tracking

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation
- **State Management:** TanStack Query
- **Maps:** MapmyIndia React Native SDK
- **Auth:** Supabase JS Client
- **Notifications:** Firebase Cloud Messaging
- **Camera:** Expo Camera

## 🚀 Development Setup

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Create customer app
npx create-expo-app@latest apps/mobile/customer --template blank-typescript

# Create agent app
npx create-expo-app@latest apps/mobile/agent --template blank-typescript

# Install shared dependencies
npm install @dairyflow/types @supabase/supabase-js @tanstack/react-query
```

## 📁 Structure

```
apps/mobile/
├── customer/           # Customer mobile app
│   ├── src/
│   │   ├── screens/    # App screens
│   │   ├── components/ # Reusable components
│   │   ├── navigation/ # Navigation setup
│   │   └── services/   # API services
│   └── package.json
├── agent/             # Delivery agent app
│   ├── src/
│   │   ├── screens/   # App screens
│   │   ├── components/# Reusable components
│   │   ├── navigation/# Navigation setup
│   │   └── services/  # API services
│   └── package.json
└── README.md          # This file
```

## 🔄 Shared Code

Mobile apps will use shared packages:
- `@dairyflow/types` - TypeScript types and schemas
- `@dairyflow/ui` - Shared UI components (future)

## 📋 Development Phases

### Phase 1: Setup & Architecture
- [ ] React Native project setup
- [ ] Navigation structure
- [ ] Authentication screens
- [ ] Supabase integration

### Phase 2: Core Features
- [ ] Customer app MVP
- [ ] Agent app MVP
- [ ] Offline functionality
- [ ] Push notifications

### Phase 3: Polish & Launch
- [ ] Testing and bug fixes
- [ ] Play Store optimization
- [ ] App store submissions

---

*Mobile apps development will begin after web application completion and testing.*