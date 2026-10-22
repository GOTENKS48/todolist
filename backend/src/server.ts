import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow all origins for mobile app testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health & API documentation endpoints (supports / and /api)
app.get(['/', '/api'], (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 React Native Todo Backend API is running smoothly!',
    databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/standby',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      tasks: {
        list: 'GET /api/tasks?status=all|pending|completed&priority=LOW|MEDIUM|HIGH|URGENT&category=WORK...&sortBy=smartScore|deadline|priority',
        stats: 'GET /api/tasks/stats',
        create: 'POST /api/tasks',
        getOne: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        toggle: 'PATCH /api/tasks/:id/toggle',
        delete: 'DELETE /api/tasks/:id',
      },
    },
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dbReadyState: mongoose.connection.readyState,
  });
});

// Direct APK Download Endpoint
app.get(['/download', '/download/apk'], (req: Request, res: Response) => {
  const apkPath = path.resolve('..', 'mobile', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, 'TaskOrbit.apk');
  } else {
    res.status(404).send('APK build not found.');
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Server listening on http://localhost:${PORT}`);
  console.log(` For Android Emulator access: http://10.0.2.2:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

export default app;
