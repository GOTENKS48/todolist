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
        title: 'Complete React Native Assignment & Backend',
        description: 'Implement full CRUD with smart sorting algorithm, Redux Toolkit, and MongoDB.',
        dateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000), // In 4 hours (Urgent)
        priority: 'URGENT',
        category: 'WORK',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'Review Machine Learning Paper for Seminar',
        description: 'Read the transformer attention architecture paper and highlight key formulas.',
        dateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours overdue!
        priority: 'HIGH',
        category: 'STUDY',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'Quarterly Team Sync & Sprint Retro',
        description: 'Prepare slide deck for deliverables, blockers, and next quarter KPIs.',
        dateTime: new Date(now.getTime() + 10 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'HIGH',
        category: 'WORK',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'Morning 5km Run & Core Workout',
        description: 'Hit the outdoor track for cardio session and stretching.',
        dateTime: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        category: 'HEALTH',
        isCompleted: true,
        completedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        title: 'Pay Monthly Utilities & Internet Bill',
        description: 'Check electricity bill and renew fiber optic broadband subscription.',
        dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        priority: 'LOW',
        category: 'FINANCE',
        isCompleted: false,
      },
      {
        user: demoUser._id,
        title: 'Call Family & Plan Weekend Dinner',
        description: 'Catch up with parents and decide on the restaurant reservation.',
        dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        priority: 'LOW',
        category: 'PERSONAL',
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
