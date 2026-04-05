# 🎓 Learnify LMS - This is the name i have given to this project.

A full-featured mobile Learning Management System built with React Native Expo.

Important Note - 
1. make sure u run this project in expo sdk 52 only...
2. FreeAPI.app resets every few hours — re-register if login fails with 404 (other wise u fine difficulty while logging and registering the user).


## Tech Stack i used
- Framework: React Native + Expo SDK 52
- Language: TypeScript (strict mode)
- Navigation: Expo Router v4
- Styling: NativeWind v4 + StyleSheet
- State: Zustand
- Storage: Expo SecureStore + AsyncStorage
- API: [FreeAPI.app](https://api.freeapi.app)

---

## Prerequisites
- Node.js installed  **v20+** (v18 will NOT work), mine is v20.20.2.
- npm v10+
- Expo Go app on your phone — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Make sure your expo go app must be version sdk 52..
--

## Setup & Run
```bash
# 1. Clone the repo
git clone https://github.com/your-username/learnify-lms.git
cd learnify-lms

# 2. Install dependencies (legacy flag required for SDK 52)
npm install --legacy-peer-deps

# 3. Start the app
npx expo start --clear
```

Scan the QR code with Expo Go (Android) or Camera (iOS).

---

## Key Notes

- Node v20+ required** — v18 breaks metro bundler
- Use `--legacy-peer-deps` on every install
- 👉 FreeAPI.app resets every few hours — re-register if login fails with 404 (other wise u fine difficulty while logging and registering the user)
- NativeWind v4 requires `global.css` imported in `app/_layout.tsx`
- `tailwindcss` must stay pinned at `3.3.5` — v4 breaks NativeWind

---

## Features

- 🔐 Auth — Register, Login, Auto-login, Secure token storage
- 📚 Course catalog with search, filter, pull-to-refresh
- 🔖 Bookmarks with AsyncStorage persistence
- ✅ Course enrollment with progress tracking
- 🌐 WebView course content with JS bridge
- 🔔 Push notifications (5 bookmark milestone + 24h reminder)
- 📡 Offline banner with network detection
- 👤 Profile with avatar upload

