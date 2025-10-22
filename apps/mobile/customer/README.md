# 📱 DairyFlow Customer App

React Native mobile application for DairyFlow customers to manage subscriptions and orders.

## 🎯 Features

- **Authentication:** Phone OTP + Google Sign-In
- **Product Catalog:** Browse dairy products
- **Subscriptions:** Create and manage recurring deliveries
- **Orders:** Place one-time orders
- **Addresses:** Manage delivery addresses with MapmyIndia
- **Profile:** User account management
- **Notifications:** Push notifications for deliveries

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State:** TanStack Query + Context
- **Maps:** MapmyIndia React Native SDK
- **Auth:** Supabase JS Client
- **Storage:** AsyncStorage for offline data

## 🚀 Quick Start

```bash
# Install dependencies
cd apps/mobile/customer
npm install

# Start development server
npx expo start

# Run on device/simulator
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app
```

## 📁 Project Structure

```
apps/mobile/customer/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens/pages
│   │   ├── auth/       # Authentication screens
│   │   ├── products/   # Product browsing
│   │   ├── subscriptions/ # Subscription management
│   │   ├── orders/     # Order management
│   │   ├── profile/    # User profile
│   │   └── settings/   # App settings
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services & utilities
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts
│   ├── types/          # App-specific types
│   └── constants/      # App constants
├── assets/             # Images, icons, fonts
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the customer app directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_MAPMYINDIA_API_KEY=your_mapmyindia_key
```

### Supabase Setup

1. Enable Phone authentication in Supabase dashboard
2. Configure Google OAuth provider
3. Set up Row Level Security policies

## 📱 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React Native and Expo best practices
- Use functional components with hooks
- Implement proper error handling

### State Management
- Use TanStack Query for server state
- Use Context API for global app state
- Use local state for component-specific data

### Navigation
- Use React Navigation v6
- Implement proper deep linking
- Handle authentication state in navigation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (future)
npm run test:e2e
```

## 📦 Build & Deployment

### Development Build
```bash
npx expo build:development
```

### Production Build
```bash
# For Android APK
npx expo build:android

# For iOS (requires Apple Developer account)
npx expo build:ios
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform android
eas build --platform ios
```

## 🔄 API Integration

The app integrates with the DairyFlow API:

- **Base URL:** `https://api.dairyflow.com/api` (production)
- **Development:** `http://localhost:5000/api`
- **Authentication:** Bearer tokens via Supabase

## 📋 TODO

### Phase 1: MVP
- [ ] Project setup with Expo
- [ ] Authentication screens
- [ ] Basic navigation structure
- [ ] Product catalog display

### Phase 2: Core Features
- [ ] Subscription management
- [ ] Order placement
- [ ] Address management with maps
- [ ] Profile management

### Phase 3: Polish
- [ ] Offline support
- [ ] Push notifications
- [ ] Performance optimization
- [ ] Testing and bug fixes

---

**Status:** Planned - Development begins after web app completion