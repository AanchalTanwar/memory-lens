# 🧠 Memory Lens — Hackathon Starter Guide

> A calming mobile companion for Alzheimer's patients

---

## 📁 Folder Structure

Paste your files exactly like this:

```
memory-lens/
│
├── backend/
│   ├── package.json      ← copy backend/package.json
│   └── server.js         ← copy backend/server.js
│
└── frontend/
    ├── package.json      ← copy frontend/package.json
    ├── App.js            ← copy frontend/App.js
    └── screens/
        ├── HomeScreen.js
        ├── CameraScreen.js
        └── TimelineScreen.js
```

---

## 🚀 Step-by-Step Setup

### Step 1 – Install Node.js
Download from https://nodejs.org  (choose "LTS" version)

### Step 2 – Install Expo CLI globally
Open Terminal / Command Prompt and run:
```bash
npm install -g expo-cli
```

### Step 3 – Install Expo Go on your phone
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS:     https://apps.apple.com/app/expo-go/id982107779

---

## ▶️ Running the Backend

```bash
cd memory-lens/backend
npm install          # installs express & cors
node server.js       # starts the API on port 3000
```

You should see:
```
✅  Memory Lens backend running at http://localhost:3000
```

Test it in your browser: http://localhost:3000/recognize-face

---

## 📱 Running the Frontend

Open a **second** terminal window:

```bash
cd memory-lens/frontend
npm install          # installs React Native & Expo packages
npx expo start       # shows a QR code
```

- **On phone**: open Expo Go → scan the QR code
- **On Mac**:   press `i` for iOS simulator
- **On Windows**: press `a` for Android emulator

> ⚠️ **If testing on a real phone**, replace `localhost` with your
> computer's IP address in both HomeScreen.js and CameraScreen.js:
>
> Find your IP:
> - Mac: `ifconfig | grep "inet "` → look for 192.168.x.x
> - Windows: `ipconfig` → IPv4 Address
>
> Then change: `const API_BASE = "http://YOUR_IP:3000";`

---

## 🎨 App Screens Overview

| Screen | File | What it does |
|--------|------|--------------|
| Home | HomeScreen.js | Dashboard – location, last event, 3 big buttons |
| Camera | CameraScreen.js | Face scan → result card + voice output |
| Timeline | TimelineScreen.js | Scrollable daily event cards |

---

## 🌐 Backend API Endpoints

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | /recognize-face | `{ name, relation, lastSeen, emoji }` |
| GET | /get-summary | `{ date, location, events[] }` |
| POST | /emergency | `{ notified[], timestamp }` |

---

## 🎯 Tips for Judges

1. **Run backend first**, then frontend
2. The app works **offline** with demo data if backend isn't reachable
3. Face recognition is simulated (random from 4 people)
4. Emergency button fires a real POST request and shows family names
5. All text-to-speech works on real devices (may not work in simulator)

---

## 🏆 What Makes This Impressive

- ✅ Clean pastel UI designed for elderly users (large text, high contrast)
- ✅ Animated face recognition result card (slide-up spring animation)
- ✅ Text-to-speech reads the recognised person's name aloud
- ✅ Vertical timeline with alternating pastel cards
- ✅ Offline fallback – app never crashes without backend
- ✅ Real Express API with CORS and proper JSON responses
- ✅ Pull-to-refresh on Timeline

Good luck at the hackathon! 🚀
