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

// Direct APK Download Endpoint & Landing Page
app.get('/download/apk', (req: Request, res: Response) => {
  const apkPath = path.resolve('..', 'mobile', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.download(apkPath, 'TaskOrbit.apk');
  } else {
    res.status(404).send('APK build not found.');
  }
});

app.get('/download', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download TaskOrbit APK</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F6ECE1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #FFFDF9;
      max-width: 420px;
      width: 100%;
      border-radius: 28px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 12px 30px rgba(122, 97, 70, 0.15);
      border: 1.5px solid #ECE3D4;
    }
    .badge {
      display: inline-block;
      background: #F2E3CF;
      color: #936B3C;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    h1 {
      color: #2B2521;
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    p {
      color: #7A6E61;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .btn {
      display: block;
      background: #C59158;
      color: #FFFDF9;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      padding: 14px 24px;
      border-radius: 20px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(197, 145, 88, 0.35);
    }
    .btn:hover {
      background: #B37F47;
      transform: translateY(-1px);
    }
    .meta {
      margin-top: 20px;
      font-size: 12px;
      color: #A39688;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">LATEST BUILD</div>
    <h1>TaskOrbit for Android</h1>
    <p>Background notifications (even when closed), Apple Notes warm paper aesthetic, clean sort button, and precision date-time picker.</p>
    <a href="/download/apk" class="btn" download="TaskOrbit.apk">⬇ Download APK (126 MB)</a>
    <div class="meta">Target: Android 8.0+ &bull; Package: com.mobileapp</div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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
