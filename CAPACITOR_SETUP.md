# Capacitor Setup Guide (For App Store Launch)

## What is Capacitor?

Capacitor wraps your React web app as a native mobile app, allowing you to:
- ✅ Publish to iOS App Store
- ✅ Publish to Google Play Store
- ✅ Access native device features
- ✅ Use the same React codebase

## When to Use

After you've:
1. ✅ Launched PWA and got user feedback
2. ✅ Validated your app idea
3. ✅ Ready for app store launch

## Installation (When Ready)

```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Install Capacitor core
npm install @capacitor/core @capacitor/cli

# Install platform packages
npm install @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Sync your web app
npx cap sync
```

## Configuration

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bringora.app',
  appName: 'Bringora',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

## Native Features to Add

### 1. Push Notifications
```bash
npm install @capacitor/push-notifications
```

### 2. Camera (for ID uploads)
```bash
npm install @capacitor/camera
```

### 3. Geolocation (enhanced)
```bash
npm install @capacitor/geolocation
```

### 4. App Launcher (for external links)
```bash
npm install @capacitor/app-launcher
```

## Building for Production

### iOS:
```bash
# Build web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build and submit from Xcode
```

### Android:
```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build and submit from Android Studio
```

## App Store Requirements

### iOS:
- Apple Developer Account ($99/year)
- Xcode (Mac only)
- App Store Connect account
- Privacy policy URL
- App screenshots
- App description

### Android:
- Google Play Developer Account ($25 one-time)
- Android Studio
- Google Play Console account
- Privacy policy URL
- App screenshots
- App description

## Timeline

1. **Week 1**: Install Capacitor, configure
2. **Week 2**: Add native features, test
3. **Week 3**: Prepare app store assets
4. **Week 4**: Submit to stores, wait for approval

## Cost

- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **Total**: ~$124 first year

---

**Start with PWA first, then move to Capacitor when ready!** 🚀

