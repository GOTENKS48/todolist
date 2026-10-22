# 🖥️ TaskOrbit Backend API (Node.js + Express + MongoDB)

RESTful backend API server with **JWT Authentication**, **MongoDB Mongoose** schemas, and **Smart Urgency & Priority mixing algorithm**.

## Tech Stack
- **Runtime:** Node.js (v22+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB via Mongoose (with automated fallback store for instant zero-dependency testing)
- **Security:** JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server with live watch:
   ```bash
   npm run dev
   ```
   Or build and run:
   ```bash
   npm run build
   npm start
   ```
3. (Optional) Seed sample data to MongoDB:
   ```bash
   npm run seed
   ```
