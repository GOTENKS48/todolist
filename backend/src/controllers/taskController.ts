import { Response } from 'express';
import { Task, PriorityLevel, TaskCategory } from '../models/Task.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { calculateSmartScore } from '../utils/smartSort.js';
import { isConnectedToMongo } from '../config/db.js';
import { inMemoryDB } from '../store/inMemoryStore.js';

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, description, dateTime, deadline, priority, category } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
      return;
    }

    if (!deadline) {
      res.status(400).json({
        success: false,
        message: 'Task deadline date-time is required.',
      });
      return;
    }

    const taskPayload = {
      user: req.userId!,
      title: title.trim(),
      description: description ? description.trim() : '',
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      deadline: new Date(deadline),
      priority: (priority || 'MEDIUM') as PriorityLevel,
      category: (category || 'WORK') as TaskCategory,
    };

    let savedTask: any;

    if (isConnectedToMongo) {
      const newTask = await Task.create({
        ...taskPayload,
        isCompleted: false,
      });
      savedTask = newTask.toObject();
    } else {
      savedTask = await inMemoryDB.createTask(taskPayload);
    }

    const taskWithScore = {
      ...savedTask,
      smartScore: calculateSmartScore(savedTask),
    };

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      data: {
        task: taskWithScore,
      },
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating task.',
    });
  }
}

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for current user with filtering, search, and sorting
 * @access  Private
 */
export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, category, priority, search, sortBy = 'smartScore', order = 'asc' } = req.query;

    let tasks: any[] = [];

    if (isConnectedToMongo) {
      const filter: any = { user: req.userId };

      if (status === 'completed') {
        filter.isCompleted = true;
      } else if (status === 'pending') {
        filter.isCompleted = false;
      }

      if (category && category !== 'ALL') {
        filter.category = (category as string).toUpperCase();
      }

      if (priority && priority !== 'ALL') {
        filter.priority = (priority as string).toUpperCase();
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      tasks = await Task.find(filter).lean();
    } else {
      // In-Memory store
      tasks = await inMemoryDB.getTasks(req.userId!);

      if (status === 'completed') {
        tasks = tasks.filter((t) => t.isCompleted);
      } else if (status === 'pending') {
        tasks = tasks.filter((t) => !t.isCompleted);
      }

      if (category && category !== 'ALL') {
        tasks = tasks.filter((t) => t.category.toUpperCase() === (category as string).toUpperCase());
      }

      if (priority && priority !== 'ALL') {
        tasks = tasks.filter((t) => t.priority.toUpperCase() === (priority as string).toUpperCase());
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        tasks = tasks.filter(
          (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
        );
      }
    }

    // Attach dynamic smart score to all tasks
    let enrichedTasks = tasks.map((task) => ({
      ...task,
      smartScore: calculateSmartScore(task),
    }));

    // Sorting handling
    if (sortBy === 'smartScore') {
      enrichedTasks.sort((a, b) => {
        return order === 'asc' ? b.smartScore - a.smartScore : a.smartScore - b.smartScore;
      });
    } else if (sortBy === 'deadline') {
      enrichedTasks.sort((a, b) => {
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        return order === 'desc' ? timeB - timeA : timeA - timeB;
      });
    } else if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      enrichedTasks.sort((a, b) => {
        const weightA = pWeights[a.priority] || 0;
        const weightB = pWeights[b.priority] || 0;
        return order === 'desc' ? weightA - weightB : weightB - weightA;
      });
    } else if (sortBy === 'dateTime') {
      enrichedTasks.sort((a, b) => {
        const timeA = new Date(a.dateTime).getTime();
        const timeB = new Date(b.dateTime).getTime();
        return order === 'desc' ? timeB - timeA : timeA - timeB;
      });
    } else {
      // Default: createdAt
      enrichedTasks.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return order === 'asc' ? timeA - timeB : timeB - timeA;
      });
    }

    res.status(200).json({
      success: true,
      count: enrichedTasks.length,
      data: {
        tasks: enrichedTasks,
      },
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching tasks.',
    });
  }
}

/**
 * @route   GET /api/tasks/stats
 * @desc    Get dashboard metrics (total, pending, completed, overdue, high priority)
 * @access  Private
 */
export async function getTaskStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let tasks: any[] = [];
    if (isConnectedToMongo) {
      tasks = await Task.find({ user: req.userId }).lean();
    } else {
      tasks = await inMemoryDB.getTasks(req.userId!);
    }

    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => !t.isCompleted && new Date(t.deadline) < now).length;
    const highPriority = tasks.filter((t) => !t.isCompleted && (t.priority === 'HIGH' || t.priority === 'URGENT')).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        overdue,
        highPriority,
        completionRate,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching task statistics.',
    });
  }
}

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
export async function getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let task: any;
    if (isConnectedToMongo) {
      task = await Task.findOne({ _id: req.params.id, user: req.userId }).lean();
    } else {
      task = await inMemoryDB.getTaskById(req.params.id, req.userId!);
    }

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        task: {
          ...task,
          smartScore: calculateSmartScore(task),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching task.',
    });
  }
}

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details
 * @access  Private
 */
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, description, dateTime, deadline, priority, category } = req.body;

    let updatedTask: any;

    if (isConnectedToMongo) {
      const task = await Task.findOne({ _id: req.params.id, user: req.userId });
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found.' });
        return;
      }

      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (dateTime !== undefined) task.dateTime = new Date(dateTime);
      if (deadline !== undefined) task.deadline = new Date(deadline);
      if (priority !== undefined) task.priority = priority as PriorityLevel;
      if (category !== undefined) task.category = category as TaskCategory;

      await task.save();
      updatedTask = task.toObject();
    } else {
      const updates: any = {};
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();
      if (dateTime !== undefined) updates.dateTime = new Date(dateTime);
      if (deadline !== undefined) updates.deadline = new Date(deadline);
      if (priority !== undefined) updates.priority = priority as PriorityLevel;
      if (category !== undefined) updates.category = category as TaskCategory;

      updatedTask = await inMemoryDB.updateTask(req.params.id, req.userId!, updates);
      if (!updatedTask) {
        res.status(404).json({ success: false, message: 'Task not found.' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      data: {
        task: {
          ...updatedTask,
          smartScore: calculateSmartScore(updatedTask),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating task.',
    });
  }
}

/**
 * @route   PATCH /api/tasks/:id/toggle
 * @desc    Toggle completion status of task
 * @access  Private
 */
export async function toggleTaskCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let task: any;

    if (isConnectedToMongo) {
      const mongoTask = await Task.findOne({ _id: req.params.id, user: req.userId });
      if (!mongoTask) {
        res.status(404).json({ success: false, message: 'Task not found.' });
        return;
      }

      mongoTask.isCompleted = !mongoTask.isCompleted;
      mongoTask.completedAt = mongoTask.isCompleted ? new Date() : null;
      await mongoTask.save();
      task = mongoTask.toObject();
    } else {
      task = await inMemoryDB.toggleTask(req.params.id, req.userId!);
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found.' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: task.isCompleted ? 'Task marked as completed! Great job!' : 'Task reopened.',
      data: {
        task: {
          ...task,
          smartScore: calculateSmartScore(task),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling task completion.',
    });
  }
}

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let deleted = false;

    if (isConnectedToMongo) {
      const result = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
      deleted = !!result;
    } else {
      deleted = await inMemoryDB.deleteTask(req.params.id, req.userId!);
    }

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting task.',
    });
  }
}
