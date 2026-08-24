# 🌿 Venlea — Open Source & De-Googled Personal Productivity

> **Your life, organized beautifully. 100% Local-first, zero telemetry, no paywalls, progressive unlocks.**

Venlea is a modern, privacy-first personal productivity and mindful journaling application. Designed to help you balance your professional priorities with your personal well-being through dual **Work** and **Myself** modes.

---

## Venlea has been Discontinued. There are few issues that have not been resolved. If you want to fork this project or just use this code, you 100% can.



## ✨ Key Features

- 🔒 **100% De-Googled & Privacy First**
  - Zero Google Play Services dependencies.
  - Zero third-party trackers or telemetry (no PostHog, no analytics).
  - No external Google Fonts CDN calls — typography uses local system font stacks.
  - Complete local offline data storage by default.
- 🎯 **Dual Life Modes (Work & Myself)**
  - **Work Mode**: Tasks, Calendar scheduling, Project folders, Markdown Notes, and Quick Inbox.
  - **Myself Mode**: Daily Journaling, Dream logs, Wins celebration, Habit tracking, and Life countdowns.
- 🎮 **Progressive Feature Unlocks (No Paid Paywalls)**
  - There are **no subscriptions or paid tiers**. All features are free.
  - Earn XP naturally by completing tasks, sticking to habits, and writing journal entries.
  - Unlock new visual themes (*Ocean Vibe, Deep Forest, Sunset Glow, Midnight Neon*), deep analytics (*Year in Pixels*), and extra personalization as you level up.
  - **Open Source Freedom Mode**: Want everything unlocked immediately? Simply toggle "Open Source Freedom Mode" in Settings.
- ☕ **Support via PayPal**
  - Venlea is funded by the community. You can support continuous development with a voluntary donation via PayPal.
- 🌐 **Optional Self-Hosted Sync Server**
  - Run your own lightweight Python/FastAPI sync backend on your private server or local network.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Production Build & Capacitor Sync

```bash
# Build optimized frontend
cd frontend
npm run build

# Sync web assets to Android
cd ..
npx cap sync
```

---

## 🛠️ Self-Hosted Sync Backend (Optional)

If you want to sync your tasks and notes across devices using your own private server:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

In the Venlea app, open **Profile → Settings → Server address** and enter your server URL (e.g. `http://192.168.1.50:8000`).

---

## 🏆 Progression & Unlocks

| Level | Title | Required XP | Perks & Unlocks |
| :--- | :--- | :--- | :--- |
| **Level 1** | 🌱 Novice Explorer | 0 XP | Default Dark & Light Themes, Work & Myself modes |
| **Level 2** | 🌊 Mindful Organizer | 100 XP | Ocean Vibe Theme, Year in Pixels Insights matrix |
| **Level 3** | 🌲 Focus Strategist | 250 XP | Deep Forest Theme, Advanced Tag filtering |
| **Level 4** | 🌅 Habit Master | 500 XP | Sunset Glow Theme, Full JSON Data Backup |
| **Level 5** | 🌌 Zen Luminary | 900 XP | Midnight Neon Theme, Self-Hosted Sync Server |
| **Level 6** | 👑 Venlea Grandmaster | 1500 XP | Grandmaster Crown Badge & Infinite Customization |

---

## 💙 Support & Donations

Venlea is free and open source. If you find Venlea useful and want to help support development and future features:

- ☕ **[Donate via PayPal](https://paypal.me/Plawro)** (or use the in-app PayPal donate button in Settings)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
