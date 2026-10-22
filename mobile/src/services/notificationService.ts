import { Vibration, Platform } from 'react-native';
import { Task, DeadlineNotification } from '../types';
import { NativeNotificationService } from './nativeNotification';

type NotificationListener = (notification: DeadlineNotification) => void;

class NotificationService {
  private notifiedTaskMap: Map<string, number> = new Map(); // taskId -> timestamp of notification
  private scheduledTaskIds: Set<string> = new Set();
  private listeners: Set<NotificationListener> = new Set();
  private activeNotifications: DeadlineNotification[] = [];

  /**
   * Subscribe to real-time deadline alerts
   */
  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all currently active deadline alerts
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
   * Cancel background notifications for a specific task
   */
  public cancelForTask(taskId: string): void {
    NativeNotificationService.cancel(`${taskId}_1h`);
    NativeNotificationService.cancel(`${taskId}_15m`);
    NativeNotificationService.cancel(`${taskId}_due`);
    this.scheduledTaskIds.delete(taskId);
  }

  /**
   * Scan tasks, trigger status bar notifications, and schedule background alarms
   * that fire even when the app is completely minimized or closed!
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

      // 1. Schedule background alarms for tasks with future deadlines (works when app is closed)
      if (diffMs > 0 && !this.scheduledTaskIds.has(task._id)) {
        this.scheduledTaskIds.add(task._id);

        // Schedule 1 hour before
        const oneHourBefore = deadlineMs - 60 * 60 * 1000;
        if (oneHourBefore > now) {
          NativeNotificationService.schedule(
            `${task._id}_1h`,
            'Approaching Deadline ⏳',
            `"${task.title}" is due in 1 hour.`,
            oneHourBefore
          );
        }

        // Schedule 15 minutes before
        const fifteenMinBefore = deadlineMs - 15 * 60 * 1000;
        if (fifteenMinBefore > now) {
          NativeNotificationService.schedule(
            `${task._id}_15m`,
            'Urgent Deadline Alert ⚠️',
            `"${task.title}" is due in 15 minutes!`,
            fifteenMinBefore
          );
        }

        // Schedule at exact deadline
        NativeNotificationService.schedule(
          `${task._id}_due`,
          'Deadline Passed 🚨',
          `Deadline just arrived for "${task.title}". Complete it now!`,
          deadlineMs
        );
      }

      // 2. Real-time in-app and status bar notification check
      let urgency: 'OVERDUE' | 'CRITICAL' | 'UPCOMING' | null = null;
      let message = '';

      if (diffMinutes < 0) {
        if (diffMinutes > -2880) {
          urgency = 'OVERDUE';
          const overdueHours = Math.abs(Math.floor(diffMinutes / 60));
          message = overdueHours > 0
            ? `Deadline passed ${overdueHours}h ago for "${task.title}".`
            : `Deadline passed for "${task.title}".`;
        }
      } else if (diffMinutes <= 60) {
        urgency = 'CRITICAL';
        message = diffMinutes === 0
          ? `Urgent: "${task.title}" is due right now!`
          : `Urgent: "${task.title}" is due in ${diffMinutes}m!`;
      } else if (diffMinutes <= 180) {
        urgency = 'UPCOMING';
        const hours = Math.round(diffMinutes / 60);
        message = `Approaching: "${task.title}" is due in ~${hours}h.`;
      }

      if (urgency) {
        const lastNotified = this.notifiedTaskMap.get(`${task._id}_${urgency}`);
        const notificationCooldown = 30 * 60 * 1000; // 30 minutes cooldown

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

          this.activeNotifications = [
            notificationItem,
            ...this.activeNotifications.filter((n) => n.taskId !== task._id),
          ].slice(0, 20);

          // Trigger system status bar notification immediately
          NativeNotificationService.showNow(
            notificationItem.id,
            urgency === 'OVERDUE' ? '🚨 Overdue Task' : '⏳ Task Deadline Alert',
            message
          );

          // Trigger physical device vibration
          if (urgency === 'CRITICAL' || urgency === 'OVERDUE') {
            try {
              if (Vibration && typeof Vibration.vibrate === 'function') {
                if (Platform.OS === 'android') {
                  Vibration.vibrate([0, 200, 100, 200]);
                } else {
                  Vibration.vibrate(400);
                }
              }
            } catch {
              // Gracefully handle if vibration is restricted
            }
          }

          // Emit to UI listeners
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
