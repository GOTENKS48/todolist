import { Vibration, Platform } from 'react-native';
import { Task, DeadlineNotification } from '../types';

type NotificationListener = (notification: DeadlineNotification) => void;

class NotificationService {
  private notifiedTaskMap: Map<string, number> = new Map(); // taskId -> timestamp of notification
  private listeners: Set<NotificationListener> = new Set();
  private activeNotifications: DeadlineNotification[] = [];

  /**
   * Subscribe to real-time deadline push alerts
   */
  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all currently active deadline alerts sorted by urgency
   */
  public getActiveNotifications(): DeadlineNotification[] {
    return [...this.activeNotifications];
  }

  /**
   * Dismiss an active notification
   */
  public dismissNotification(id: string): void {
    this.activeNotifications = this.activeNotifications.filter((n) => n.id !== id);
  }

  /**
   * Clear all notifications
   */
  public clearAll(): void {
    this.activeNotifications = [];
  }

  /**
   * Scan tasks and trigger notifications for impending deadlines
   */
  public checkDeadlines(tasks: Task[]): DeadlineNotification[] {
    const now = Date.now();
    const newNotifications: DeadlineNotification[] = [];

    // Filter active, non-completed tasks
    const activeTasks = tasks.filter((t) => !t.isCompleted && t.deadline);

    for (const task of activeTasks) {
      const deadlineMs = new Date(task.deadline).getTime();
      if (isNaN(deadlineMs)) continue;

      const diffMs = deadlineMs - now;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      let urgency: 'OVERDUE' | 'CRITICAL' | 'UPCOMING' | null = null;
      let message = '';

      if (diffMinutes < 0) {
        // Overdue (within last 48 hours to avoid indefinite spam of very old tasks)
        if (diffMinutes > -2880) {
          urgency = 'OVERDUE';
          const overdueHours = Math.abs(Math.floor(diffMinutes / 60));
          message = overdueHours > 0
            ? `Deadline passed ${overdueHours}h ago for "${task.title}". Immediate action required!`
            : `Deadline just passed for "${task.title}". Complete it now!`;
        }
      } else if (diffMinutes <= 60) {
        // Due within 1 hour
        urgency = 'CRITICAL';
        message = diffMinutes === 0
          ? `Urgent: "${task.title}" is due right now!`
          : `Urgent: "${task.title}" is due in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}!`;
      } else if (diffMinutes <= 180) {
        // Due within 3 hours
        urgency = 'UPCOMING';
        const hours = Math.round(diffMinutes / 60);
        message = `Approaching: "${task.title}" is due in ~${hours} hour${hours === 1 ? '' : 's'}.`;
      }

      if (urgency) {
        // Prevent notification spam: don't notify same task for same urgency within 30 minutes
        const lastNotified = this.notifiedTaskMap.get(`${task._id}_${urgency}`);
        const notificationCooldown = 30 * 60 * 1000; // 30 minutes

        const notificationItem: DeadlineNotification = {
          id: `${task._id}_${urgency}_${Math.floor(now / (5 * 60 * 1000))}`,
          taskId: task._id,
          title: task.title,
          deadline: task.deadline,
          urgency,
          minutesRemaining: diffMinutes,
          message,
          timestamp: now,
        };

        if (!lastNotified || now - lastNotified > notificationCooldown) {
          this.notifiedTaskMap.set(`${task._id}_${urgency}`, now);
          newNotifications.push(notificationItem);

          // Update active notification list
          this.activeNotifications = [
            notificationItem,
            ...this.activeNotifications.filter((n) => n.taskId !== task._id),
          ].slice(0, 20);

          // Trigger physical device vibration for critical alerts
          if (urgency === 'CRITICAL' || urgency === 'OVERDUE') {
            try {
              if (Platform.OS === 'android') {
                Vibration.vibrate([0, 250, 100, 250]);
              } else {
                Vibration.vibrate();
              }
            } catch (err) {
              // ignore vibration error
            }
          }

          // Emit to all registered listeners
          this.listeners.forEach((listener) => {
            try {
              listener(notificationItem);
            } catch (err) {
              console.warn('Notification listener error:', err);
            }
          });
        }
      }
    }

    return newNotifications;
  }
}

export const notificationService = new NotificationService();
