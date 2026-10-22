import { ITask, PriorityLevel } from '../models/Task.js';

/**
 * Weights assigned to each priority level
 */
const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  URGENT: 100,
  HIGH: 70,
  MEDIUM: 40,
  LOW: 20,
};

/**
 * Calculates a dynamic "Smart Score" for a task.
 * 
 * Algorithm Concept:
 * 1. Base Score = Priority Weight (Low: 20 -> Urgent: 100)
 * 2. Urgency Score = Proximity to deadline.
 *    - Overdue: massive penalty/urgency boost (+150 pts + 3 pts per hour overdue, capped at 300)
 *    - < 6 hours remaining: +90 pts
 *    - < 24 hours remaining: +60 pts
 *    - < 72 hours remaining: +30 pts
 *    - < 7 days remaining: +10 pts
 * 3. Completion adjustment: Completed tasks receive a -1000 score offset so they sink to the bottom.
 * 
 * Higher smart score indicates higher immediate action required.
 */
export function calculateSmartScore(task: {
  priority: PriorityLevel;
  deadline: Date | string;
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
    // Task is overdue! The older it is overdue, the higher the urgency
    const hoursOverdue = Math.abs(diffHours);
    urgencyScore = 150 + Math.min(hoursOverdue * 3, 150);
  } else if (diffHours <= 6) {
    // Due in less than 6 hours
    urgencyScore = 90;
  } else if (diffHours <= 24) {
    // Due today
    urgencyScore = 60;
  } else if (diffHours <= 72) {
    // Due within 3 days
    urgencyScore = 30;
  } else if (diffHours <= 168) {
    // Due within 7 days
    urgencyScore = 10;
  } else {
    urgencyScore = 0;
  }

  return priorityScore + urgencyScore;
}

/**
 * Sorts an array of tasks using the Smart Mix Algorithm
 */
export function sortTasksBySmartScore<T extends { priority: PriorityLevel; deadline: Date | string; isCompleted?: boolean }>(
  tasks: T[]
): (T & { smartScore: number })[] {
  return tasks
    .map((task) => ({
      ...task,
      smartScore: calculateSmartScore(task),
    }))
    .sort((a, b) => b.smartScore - a.smartScore);
}
