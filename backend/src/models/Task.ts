import mongoose, { Document, Schema, Types } from 'mongoose';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskCategory = 'WORK' | 'PERSONAL' | 'STUDY' | 'URGENT' | 'HEALTH' | 'FINANCE' | 'OTHER';

/**
 * Interface representing a Task document in MongoDB
 */
export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  dateTime: Date;       // Start or creation date-time
  deadline: Date;       // Task completion deadline
  priority: PriorityLevel;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Please provide a task date and time'],
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline for the task'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    category: {
      type: String,
      enum: ['WORK', 'PERSONAL', 'STUDY', 'URGENT', 'HEALTH', 'FINANCE', 'OTHER'],
      default: 'WORK',
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying by user, status, priority, and deadline
TaskSchema.index({ user: 1, isCompleted: 1, deadline: 1 });
TaskSchema.index({ user: 1, priority: 1 });
TaskSchema.index({ user: 1, category: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
