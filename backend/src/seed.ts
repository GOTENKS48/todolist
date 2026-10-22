import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { connectDB } from './config/db.js';

dotenv.config();

async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  try {
    // Clean old demo data
    const demoEmail = 'test@example.com';
    await Task.deleteMany({});
    await User.deleteMany({ email: demoEmail });

    console.log('[Seed] Creating demo user...');
    const demoUser = await User.create({
      email: demoEmail,
      password: 'password123',
      name: 'Alex Mercer',
    });

    console.log(`[Seed] Demo user created: ${demoUser.email} / password123`);

    const now = new Date();

    const sampleTasks = [
      {
        user: demoUser._id,
        title: 'Submit Quarterly Performance Review ⚡',
        description: 'Finalize KPI deliverables and submit report before team cutoff.',
        dateTime: new Date(now.getTime() - 30 * 60 * 1000),
        deadline: new Date(now.getTime() + 25 * 60 * 1000), // Due in 25 minutes! (Triggers urgent push notification)
        priority: 'URGENT',
        category: 'WORK',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'laundry, candles, and comfort shows 🧺',
        description: 'Wash blankets, light vanilla candle, and watch new episode.',
        dateTime: new Date(now.getTime()),
        deadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        category: 'PERSONAL',
        isCompleted: true,
        completedAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
      {
        user: demoUser._id,
        title: 'nighttime skincare in a matching pj set 🧴',
        description: 'Double cleanse, hydrating toner, retinol, and silk pillowcase.',
        dateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        priority: 'LOW',
        category: 'PERSONAL',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'Sunday grocery run in an oversized sweatshirt 🛒',
        description: 'Oat milk, sourdough, fresh berries, matcha, and Greek yogurt.',
        dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 36 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        category: 'PERSONAL',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'morning coffee & podcast walk 🎧',
        description: 'Iced latte and episode 42 of Huberman Lab around the park.',
        dateTime: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        priority: 'LOW',
        category: 'HEALTH',
        isCompleted: true,
        completedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        title: 'Review Machine Learning Research Paper 📚',
        description: 'Read the transformer attention architecture paper and highlight key formulas.',
        dateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours overdue!
        priority: 'HIGH',
        category: 'STUDY',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'Pay Fiber Internet & Utility Bills 💳',
        description: 'Check electricity bill and renew fiber optic broadband subscription.',
        dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        priority: 'LOW',
        category: 'FINANCE',
        isCompleted: false,
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[Seed] Successfully inserted ${sampleTasks.length} rich sample tasks!`);

    await mongoose.disconnect();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
