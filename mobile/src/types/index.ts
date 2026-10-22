export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskCategory =
  | 'WORK'
  | 'PERSONAL'
  | 'STUDY'
  | 'URGENT'
  | 'HEALTH'
  | 'FINANCE'
  | 'OTHER';

export type FilterStatus = 'ALL' | 'PENDING' | 'COMPLETED';

export type SortOption =
  | 'smartScore'
  | 'deadline'
  | 'priority'
  | 'dateTime'
  | 'createdAt';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface DeadlineNotification {
  id: string;
  taskId: string;
  title: string;
  deadline: string;
  urgency: 'OVERDUE' | 'CRITICAL' | 'UPCOMING';
  minutesRemaining: number;
  message: string;
  timestamp: number;
}

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: PriorityLevel;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  smartScore?: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  highPriority: number;
  completionRate: number;
}
