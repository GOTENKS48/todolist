import bcrypt from 'bcryptjs';
import { PriorityLevel, TaskCategory } from '../models/Task.js';

export interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export interface InMemoryTask {
  _id: string;
  user: string;
  title: string;
  description: string;
  dateTime: Date;
  deadline: Date;
  priority: PriorityLevel;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

class InMemoryDatabase {
  private users: InMemoryUser[] = [];
  private tasks: InMemoryTask[] = [];

  constructor() {
    this.initSeedData();
  }

  private async initSeedData() {
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);

    const demoUser: InMemoryUser = {
      id: 'demo-user-123',
      email: 'test@example.com',
      passwordHash: hash,
      name: 'Alex Mercer',
      createdAt: new Date(),
    };
    this.users.push(demoUser);

    const now = Date.now();
    this.tasks = [
      {
        _id: 'task-1',
        user: demoUser.id,
        title: 'Complete React Native Assignment & Backend',
        description: 'Implement full CRUD with smart sorting algorithm, Redux Toolkit, and MongoDB.',
        dateTime: new Date(now - 2 * 60 * 60 * 1000),
        deadline: new Date(now + 4 * 60 * 60 * 1000), // In 4 hours (Urgent)
        priority: 'URGENT',
        category: 'WORK',
        isCompleted: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now - 2 * 60 * 60 * 1000),
      },
      {
        _id: 'task-2',
        user: demoUser.id,
        title: 'Review Machine Learning Paper for Seminar',
        description: 'Read the transformer attention architecture paper and highlight key formulas.',
        dateTime: new Date(now - 24 * 60 * 60 * 1000),
        deadline: new Date(now - 2 * 60 * 60 * 1000), // Overdue by 2 hours
        priority: 'HIGH',
        category: 'STUDY',
        isCompleted: false,
        createdAt: new Date(now - 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 24 * 60 * 60 * 1000),
      },
      {
        _id: 'task-3',
        user: demoUser.id,
        title: 'Quarterly Team Sync & Sprint Retro',
        description: 'Prepare slide deck for deliverables, blockers, and next quarter KPIs.',
        dateTime: new Date(now + 10 * 60 * 60 * 1000),
        deadline: new Date(now + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'HIGH',
        category: 'WORK',
        isCompleted: false,
        createdAt: new Date(now - 1 * 60 * 60 * 1000),
        updatedAt: new Date(now - 1 * 60 * 60 * 1000),
      },
      {
        _id: 'task-4',
        user: demoUser.id,
        title: 'Morning 5km Run & Core Workout',
        description: 'Hit the outdoor track for cardio session and stretching.',
        dateTime: new Date(now - 12 * 60 * 60 * 1000),
        deadline: new Date(now - 4 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        category: 'HEALTH',
        isCompleted: true,
        completedAt: new Date(now - 5 * 60 * 60 * 1000),
        createdAt: new Date(now - 12 * 60 * 60 * 1000),
        updatedAt: new Date(now - 5 * 60 * 60 * 1000),
      },
      {
        _id: 'task-5',
        user: demoUser.id,
        title: 'Pay Monthly Utilities & Internet Bill',
        description: 'Check electricity bill and renew fiber optic broadband subscription.',
        dateTime: new Date(now + 2 * 24 * 60 * 60 * 1000),
        deadline: new Date(now + 5 * 24 * 60 * 60 * 1000), // In 5 days
        priority: 'LOW',
        category: 'FINANCE',
        isCompleted: false,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
      {
        _id: 'task-6',
        user: demoUser.id,
        title: 'Plan Weekend Trip Itinerary',
        description: 'Look up hiking trails and reserve hotel rooms.',
        dateTime: new Date(now + 3 * 24 * 60 * 60 * 1000),
        deadline: new Date(now + 6 * 24 * 60 * 60 * 1000),
        priority: 'LOW',
        category: 'PERSONAL',
        isCompleted: false,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    ];
  }

  // User methods
  async findUserByEmail(email: string): Promise<InMemoryUser | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<InMemoryUser | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async createUser(user: { email: string; password: string; name: string }): Promise<InMemoryUser> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);

    const newUser: InMemoryUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      email: user.email.toLowerCase(),
      passwordHash,
      name: user.name,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Task methods
  async getTasks(userId: string): Promise<InMemoryTask[]> {
    return this.tasks.filter((t) => t.user === userId);
  }

  async getTaskById(taskId: string, userId: string): Promise<InMemoryTask | undefined> {
    return this.tasks.find((t) => t._id === taskId && t.user === userId);
  }

  async createTask(taskData: {
    user: string;
    title: string;
    description: string;
    dateTime: Date;
    deadline: Date;
    priority: PriorityLevel;
    category: TaskCategory;
  }): Promise<InMemoryTask> {
    const newTask: InMemoryTask = {
      _id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      user: taskData.user,
      title: taskData.title,
      description: taskData.description,
      dateTime: taskData.dateTime,
      deadline: taskData.deadline,
      priority: taskData.priority,
      category: taskData.category,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(
    taskId: string,
    userId: string,
    updates: Partial<InMemoryTask>
  ): Promise<InMemoryTask | null> {
    const taskIndex = this.tasks.findIndex((t) => t._id === taskId && t.user === userId);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.tasks[taskIndex];
  }

  async toggleTask(taskId: string, userId: string): Promise<InMemoryTask | null> {
    const taskIndex = this.tasks.findIndex((t) => t._id === taskId && t.user === userId);
    if (taskIndex === -1) return null;

    const current = this.tasks[taskIndex];
    const newStatus = !current.isCompleted;

    this.tasks[taskIndex] = {
      ...current,
      isCompleted: newStatus,
      completedAt: newStatus ? new Date() : null,
      updatedAt: new Date(),
    };
    return this.tasks[taskIndex];
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => !(t._id === taskId && t.user === userId));
    return this.tasks.length < initialLen;
  }
}

export const inMemoryDB = new InMemoryDatabase();
