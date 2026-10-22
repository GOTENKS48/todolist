import { Task, PriorityLevel } from '../types';

const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  URGENT: 100,
  HIGH: 70,
  MEDIUM: 40,
  LOW: 20,
};

/**
 * Calculates the Smart Score combining:
 * 1. Priority Weight (Urgent = 100, High = 70, Med = 40, Low = 20)
 * 2. Deadline Urgency (Overdue bonus up to +300 pts, <6h = +90, <24h = +60, <3d = +30)
 * 3. Completion Offset (-1000 pts)
 */
export function calculateSmartScore(task: {
  priority: PriorityLevel;
  deadline: string;
  isCompleted?: boolean;
}): number {
  if (task.isCompleted) {
    return -1000;
  }

  const priorityScore = PRIORITY_WEIGHTS[task.priority] || 40;
  const now = Date.now();
  const deadlineMs = new Date(task.deadline).getTime();
  const diffHours = (deadlineMs - now) / (1000 * 60 * 60);

  let urgencyScore = 0;

  if (diffHours < 0) {
    const hoursOverdue = Math.abs(diffHours);
    urgencyScore = 150 + Math.min(hoursOverdue * 3, 150);
  } else if (diffHours <= 6) {
    urgencyScore = 90;
  } else if (diffHours <= 24) {
    urgencyScore = 60;
  } else if (diffHours <= 72) {
    urgencyScore = 30;
  } else if (diffHours <= 168) {
    urgencyScore = 10;
  }

  return priorityScore + urgencyScore;
}

/**
 * Sorts an array of tasks according to the chosen sort strategy
 */
export function sortTasks(
  tasks: Task[],
  sortBy: 'smartScore' | 'deadline' | 'priority' | 'dateTime' | 'createdAt',
  order: 'asc' | 'desc' = 'asc'
): Task[] {
  const cloned = [...tasks];

  switch (sortBy) {
    case 'smartScore':
      return cloned.sort((a, b) => {
        const scoreA = a.smartScore ?? calculateSmartScore(a);
        const scoreB = b.smartScore ?? calculateSmartScore(b);
        return order === 'asc' ? scoreB - scoreA : scoreA - scoreB;
      });

    case 'deadline':
      return cloned.sort((a, b) => {
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        return order === 'desc' ? timeB - timeA : timeA - timeB;
      });

    case 'priority': {
      const weights: Record<PriorityLevel, number> = {
        URGENT: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      return cloned.sort((a, b) => {
        const weightA = weights[a.priority] || 0;
        const weightB = weights[b.priority] || 0;
        return order === 'desc' ? weightA - weightB : weightB - weightA;
      });
    }

    case 'dateTime':
      return cloned.sort((a, b) => {
        const timeA = new Date(a.dateTime).getTime();
        const timeB = new Date(b.dateTime).getTime();
        return order === 'desc' ? timeB - timeA : timeA - timeB;
      });

    case 'createdAt':
    default:
      return cloned.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return order === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }
}
