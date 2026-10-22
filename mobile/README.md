# 📱 TaskOrbit Mobile App (React Native CLI + TypeScript)

This is the Android mobile application frontend built using **React Native CLI (version 0.88)** with strict **TypeScript** and **Redux Toolkit**.

## Tech Stack
- **Framework:** React Native CLI 0.88
- **Language:** TypeScript
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` and `react-redux`)
- **Networking:** Axios with JWT Bearer Token Request Interceptor & Android Emulator Host Mapping (`http://10.0.2.2:5000`)
- **Storage:** `@react-native-async-storage/async-storage` for token and offline task caching
- **Design System:** Custom Dark Neo-Glass Theme with color-coded priority and category badges

## How to Run

1. Make sure your Android emulator is running or an Android phone is connected via USB with USB Debugging enabled.
2. In this directory, start the Metro development server:
   ```bash
   npm start
   ```
3. In another terminal, run:
   ```bash
   npm run android
   ```
