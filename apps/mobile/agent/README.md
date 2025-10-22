# 🚚 DairyFlow Agent App

React Native mobile application for DairyFlow delivery agents to manage routes and deliveries.

## 🎯 Features

- **Authentication:** Phone OTP login
- **Daily Routes:** View optimized delivery routes
- **Navigation:** Turn-by-turn directions with MapmyIndia
- **Delivery Management:** Update delivery status
- **Photo Proof:** Capture delivery confirmation photos
- **Offline Support:** Work offline with sync
- **GPS Tracking:** Real-time location updates

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** React Navigation + MapmyIndia
- **State:** TanStack Query + Context
- **Maps:** MapmyIndia React Native SDK
- **Auth:** Supabase JS Client
- **Camera:** Expo Camera
- **Storage:** AsyncStorage + FileSystem

## 🚀 Quick Start

```bash
# Install dependencies
cd apps/mobile/agent
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
apps/mobile/agent/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens/pages
│   │   ├── auth/       # Authentication screens
│   │   ├── routes/     # Route management
│   │   ├── deliveries/ # Delivery management
│   │   ├── navigation/ # Navigation screens
│   │   └── profile/    # Agent profile
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services & utilities
│   │   ├── api.ts      # API client
│   │   ├── location.ts # GPS services
│   │   ├── camera.ts   # Camera utilities
│   │   └── offline.ts  # Offline sync
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

Create `.env` file in the agent app directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_MAPMYINDIA_API_KEY=your_mapmyindia_key
EXPO_PUBLIC_MAPMYINDIA_CLIENT_ID=your_client_id
EXPO_PUBLIC_MAPMYINDIA_CLIENT_SECRET=your_client_secret
```

### Permissions

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location for delivery navigation."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access camera for delivery proof photos."
        }
      ]
    ]
  }
}
```

## 📱 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React Native and Expo best practices
- Implement proper error handling and loading states
- Use meaningful component and function names

### State Management
- **Server State:** TanStack Query for API data
- **Local State:** Context API for app-wide state
- **Offline State:** AsyncStorage for cached data
- **Location State:** GPS tracking and route data

### Navigation
- Stack navigation for authentication
- Tab navigation for main app sections
- Modal screens for delivery details
- Deep linking support

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (future)
npm run test:e2e
```

## 📦 Build & Deployment

### Development Build
```bash
npx expo build:development
```

### Production Build
```bash
# Android APK
npx expo build:android

# iOS IPA (requires Apple Developer account)
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

### Endpoints Used
- `GET /api/agent/route` - Get daily route
- `PATCH /api/agent/delivery/:id/status` - Update delivery status
- `PATCH /api/agent/route-stop/:id/status` - Update route stop status
- `POST /api/agent/delivery/:id/proof` - Upload delivery proof

### Offline Strategy
1. **Download Route:** Cache route data at start of day
2. **Queue Updates:** Store status changes locally
3. **Sync on Connect:** Upload queued updates when online
4. **Conflict Resolution:** Server state takes precedence

## 🚗 GPS & Navigation

### Location Services
- Request location permissions on app start
- Track location in background during deliveries
- Calculate distance and ETA to next stop
- Handle location accuracy and battery optimization

### Map Integration
- MapmyIndia SDK for maps and navigation
- Offline map tiles for poor connectivity
- Custom markers for delivery stops
- Route visualization with traffic data

## 📋 TODO

### Phase 1: MVP
- [ ] Project setup with Expo
- [ ] Authentication with phone OTP
- [ ] Basic route display
- [ ] Delivery status updates

### Phase 2: Core Features
- [ ] Turn-by-turn navigation
- [ ] Photo capture for deliveries
- [ ] Offline functionality
- [ ] GPS tracking

### Phase 3: Polish
- [ ] Performance optimization
- [ ] Battery optimization
- [ ] Comprehensive testing
- [ ] Play Store preparation

## 🔐 Security Considerations

- **Data Encryption:** Sensitive data encrypted at rest
- **API Security:** JWT tokens with short expiry
- **Location Privacy:** Location data only used for navigation
- **Photo Storage:** Secure upload to Supabase Storage
- **Offline Security:** Local data encrypted

---

**Status:** Planned - Development begins after web app completion