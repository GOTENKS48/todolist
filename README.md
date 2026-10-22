# 🚀 TaskOrbit - To-Do List Application (React Native CLI + Node.js/MongoDB Backend)

<p align="center">
  <img src="./assets/thumbnail.jpg" alt="TaskOrbit App Thumbnail" width="180" style="border-radius: 36px;" />
  <br/>
  <em><strong>TaskOrbit</strong> - Aesthetic, Smart Task Priority & Deadline Management</em>
  <br/><br/>
  <a href="https://gofile.io/d/8xCkEu75"><strong>⬇ Download Android APK on GoFile (Latest Build)</strong></a>
</p>

---

## 🌟 Key Highlights & Feature Matrix

| Feature | Requirement Status | Implementation Details |
|---|---|---|
| **User Registration** | ✅ Required | Email, password hashing (bcrypt), name, input validation |
| **User Login** | ✅ Required | JWT authentication token generation and secure session |
| **Add Tasks** | ✅ Required | Title, description, date-time, deadline, priority, category |
| **Mark as Completed** | ✅ Required | Instant interactive checkbox toggle with strike-through |
| **Delete Tasks** | ✅ Required | Swipe/tap delete action with confirmation modal |
| **View Task Status** | ✅ Required | Status filters (All, Pending, Completed), counts, badges |
| **Node.js / MongoDB Backend** | ✅ Required | REST API with Mongoose, hybrid in-memory fallback for testing |
| **React Native CLI + TypeScript** | ✅ Required | React Native 0.88 with strict TypeScript typing |
| **State Management** | ✅ Required | Redux Toolkit (`authSlice`, `taskSlice`) with typed hooks |
| **Smart Mix Algorithm** | 🌟 Bonus | Blends Priority weight + Deadline countdown + Overdue penalties |
| **Task Due Dates & Relative Countdown** | 🌟 Bonus | Displays "Due in 4h", "Overdue by 2h", "Due tomorrow" |
| **Task Categories & Tags** | 🌟 Bonus | WORK, PERSONAL, STUDY, URGENT, HEALTH, FINANCE, OTHER |
| **Search & Filtering** | 🌟 Bonus | Instant title/description search, category scroll pills |
| **Neo-Glass Dark UI** | 🌟 Bonus | Cyberpunk dark aesthetic, glowing tags, progress bar, stats |

---

## 🧮 Smart Mix Algorithm (Bonus Feature)

The application features a dynamic urgency & priority calculation algorithm implemented both on the **backend** (`backend/src/utils/smartSort.ts`) and **client** (`mobile/src/utils/smartAlgorithm.ts`):

$$\text{Smart Score} = \text{Priority Weight} + \text{Urgency Factor} - \text{Completion Offset}$$

- **Priority Weights:**
  - `URGENT`: 100 points
  - `HIGH`: 70 points
  - `MEDIUM`: 40 points
  - `LOW`: 20 points
- **Urgency Factor (Based on remaining hours to deadline):**
  - **Overdue:** $+150\text{ pts} + (\text{hours overdue} \times 3)$, capped at $+300\text{ pts}$ (overdue tasks demand immediate action!)
  - **Due within 6 hours:** $+90\text{ pts}$
  - **Due within 24 hours:** $+60\text{ pts}$
  - **Due within 3 days:** $+30\text{ pts}$
  - **Due within 7 days:** $+10\text{ pts}$
- **Completed Tasks:** $-1000\text{ pts}$ (sinks completed tasks to the bottom while preserving history)

---

## 📁 Repository Structure

```
todo list/
├── backend/                    # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/             # Database connection & hybrid resilience mode
│   │   ├── controllers/        # authController & taskController
│   │   ├── middleware/         # JWT authentication & request validation
│   │   ├── models/             # Mongoose User and Task schemas
│   │   ├── routes/             # authRoutes and taskRoutes
│   │   ├── store/              # Resilient fallback memory store
│   │   ├── utils/              # Smart sorting algorithm
│   │   ├── seed.ts             # Database seeding script
│   │   └── server.ts           # Express server entry point
│   ├── .env                    # Environment configuration
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                     # React Native CLI Application (TypeScript)
    ├── android/                # Native Android project configuration
    ├── ios/                    # Native iOS project configuration
    ├── src/
    │   ├── components/         # Header, TaskCard, StatsOverview, SearchBar, etc.
    │   ├── redux/              # Redux Toolkit store and slices (auth, tasks)
    │   ├── screens/            # AuthScreen (Login/Register) & HomeScreen
    │   ├── services/           # Axios API client (10.0.2.2 emulator-ready), AsyncStorage
    │   ├── theme/              # Neo-Glass Dark color tokens & styles
    │   ├── types/              # Comprehensive TypeScript interfaces
    │   └── utils/              # Date formatters & smart mix algorithm
    ├── App.tsx                 # Root component with Redux Provider & Navigation
    ├── index.js
    ├── package.json
    └── tsconfig.json
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

*The server will listen at `http://localhost:5000` (and `http://10.0.2.2:5000` for Android emulators).*

> **Note on MongoDB:**
> - If you have a local MongoDB daemon running, the backend connects automatically to `mongodb://127.0.0.1:27017/todo_app`.
> - If MongoDB is not currently installed or running, the server automatically activates its **Hybrid Resilient Store** pre-seeded with sample tasks so you can test immediately with zero setup!
> - To re-seed sample data on a live MongoDB instance, run: `npm run seed`.

### 2. Run the React Native Mobile App

```bash
cd mobile
npm install

# Start Metro bundler:
npm start

# In a separate terminal, launch on Android emulator or connected device:
npm run android
```

---

## 🔑 Demo Account Credentials

A pre-configured demo account is available for immediate testing:
- **Email:** `test@example.com`
- **Password:** `password123`

*(On the mobile Auth screen, you can also tap the **"Fill Demo Credentials"** button to auto-populate these credentials in one tap!)*

---

## 📡 Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account (`email`, `password`, `name`)
- `POST /api/auth/login` - Authenticate and receive JWT token (`email`, `password`)
- `GET /api/auth/me` - Fetch profile of currently authenticated user

### Tasks (Protected with `Authorization: Bearer <token>`)
- `GET /api/tasks` - List tasks with query parameters:
  - `status`: `all` | `pending` | `completed`
  - `category`: `WORK` | `PERSONAL` | `STUDY` | `URGENT` | `HEALTH` | `FINANCE` | `OTHER`
  - `priority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  - `search`: Search keyword matching title or description
  - `sortBy`: `smartScore` | `deadline` | `priority` | `dateTime` | `createdAt`
- `GET /api/tasks/stats` - Dashboard metrics (total, pending, completed, overdue, highPriority, completionRate)
- `POST /api/tasks` - Create task (`title`, `description`, `dateTime`, `deadline`, `priority`, `category`)
- `GET /api/tasks/:id` - Fetch single task details
- `PUT /api/tasks/:id` - Update task details
- `PATCH /api/tasks/:id/toggle` - Toggle completion status
- `DELETE /api/tasks/:id` - Remove task
