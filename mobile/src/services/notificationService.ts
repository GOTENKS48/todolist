import { Vibration, Platform } from 'react-native';
import { Task, DeadlineNotification } from '../types';
import { NativeNotificationService } from './nativeNotification';

type NotificationListener = (notification: DeadlineNotification) => void;

class NotificationService {
  private notifiedTaskMap: Map<string, number> = new Map(); // taskId -> timestamp of notification
  private scheduledTaskKeys: Set<string> = new Set();
  private listeners: Set<NotificationListener> = new Set();
  private activeNotifications: DeadlineNotification[] = [];

  /**
   * Request notification permission on Android 13+
   */
  public async initPermissions(): Promise<boolean> {
    return await NativeNotificationService.requestPermission();
  }

  /**
   * Schedule a quick test notification to verify background alerts
   */
  public testBackgroundNotification(secondsDelay = 5): void {
    const triggerTime = Date.now() + secondsDelay * 1000;
    NativeNotificationService.schedule(
      `test_${Date.now()}`,
      'TaskOrbit Alert 🔔',
      'Background notifications are working smoothly even when closed!',
      triggerTime
    );
  }

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
    NativeNotificationService.cancel(`${taskId}_start`);
    NativeNotificationService.cancel(`${taskId}_1h`);
    NativeNotificationService.cancel(`${taskId}_due`);
    this.scheduledTaskKeys.delete(`${taskId}_start`);
    this.scheduledTaskKeys.delete(`${taskId}_1h`);
    this.scheduledTaskKeys.delete(`${taskId}_due`);
  }

  /**
   * Scan tasks and schedule exact notifications for the 3 user-specified triggers:
   * 1. When scheduled start date has occurred (task.dateTime)
   * 2. When there is 1 hour left in deadline (task.deadline - 1 hour)
   * 3. When the target deadline has appeared / arrived (task.deadline)
   * Works whether the app is open, minimized, or closed!
   */
  public checkDeadlines(tasks: Task[]): DeadlineNotification[] {
    const now = Date.now();
    const newNotifications: DeadlineNotification[] = [];

    // Filter active, non-completed tasks
    const activeTasks = tasks.filter((t) => !t.isCompleted);

    for (const task of activeTasks) {
      // ---------------------------------------------------------
      // TRIGGER 1: SCHEDULED START DATE & TIME HAS OCCURRED
      // ---------------------------------------------------------
      if (task.dateTime) {
        const startMs = new Date(task.dateTime).getTime();
        if (!isNaN(startMs)) {
          // Schedule background alarm if start time is in the future
          const startKey = `${task._id}_start`;
          if (startMs > now && !this.scheduledTaskKeys.has(startKey)) {
            this.scheduledTaskKeys.add(startKey);
            NativeNotificationService.schedule(
              startKey,
              'Task Scheduled Start 🚀',
              `Scheduled start time has arrived for "${task.title}".`,
              startMs
            );
          }

          // In-app real-time notification if start time arrived within the last 15 minutes
          const startDiffMin = Math.floor((now - startMs) / (1000 * 60));
          if (startDiffMin >= 0 && startDiffMin < 15) {
            const startNotifKey = `${task._id}_start_realtime`;
            const lastNotified = this.notifiedTaskMap.get(startNotifKey);
            if (!lastNotified || now - lastNotified > 30 * 60 * 1000) {
              this.notifiedTaskMap.set(startNotifKey, now);

              const notifItem: DeadlineNotification = {
                id: `${task._id}_start_${now}`,
                taskId: task._id,
                title: task.title,
                deadline: task.deadline,
                urgency: 'UPCOMING',
                minutesRemaining: 0,
                message: `Scheduled start time has arrived for "${task.title}".`,
                timestamp: now,
              };

              newNotifications.push(notifItem);
              this.activeNotifications = [
                notifItem,
                ...this.activeNotifications.filter((n) => n.taskId !== task._id),
              ].slice(0, 20);

              NativeNotificationService.showNow(
                notifItem.id,
                'Task Scheduled Start 🚀',
                notifItem.message
              );

              this.listeners.forEach((listener) => {
                try { listener(notifItem); } catch {}
              });
            }
          }
        }
      }

      // ---------------------------------------------------------
      // TRIGGERS 2 & 3: 1 HOUR LEFT & DEADLINE HAS APPEARED
      // ---------------------------------------------------------
      if (task.deadline) {
        const deadlineMs = new Date(task.deadline).getTime();
        if (isNaN(deadlineMs)) continue;

        const diffMs = deadlineMs - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        // Background Trigger 2: Exactly 1 hour before deadline
        const oneHourBeforeMs = deadlineMs - 60 * 60 * 1000;
        const oneHourKey = `${task._id}_1h`;
        if (oneHourBeforeMs > now && !this.scheduledTaskKeys.has(oneHourKey)) {
          this.scheduledTaskKeys.add(oneHourKey);
          NativeNotificationService.schedule(
            oneHourKey,
            '1 Hour Left ⏳',
            `Only 1 hour left before deadline for "${task.title}"!`,
            oneHourBeforeMs
          );
        }

        // Background Trigger 3: Exact Deadline Reached
        const dueKey = `${task._id}_due`;
        if (deadlineMs > now && !this.scheduledTaskKeys.has(dueKey)) {
          this.scheduledTaskKeys.add(dueKey);
          NativeNotificationService.schedule(
            dueKey,
            'Deadline Reached 🚨',
            `Target deadline has arrived for "${task.title}". Complete it now!`,
            deadlineMs
          );
        }

        // Real-time In-App & Status Bar Checks
        let urgency: 'OVERDUE' | 'CRITICAL' | null = null;
        let message = '';

        if (diffMinutes <= 0 && diffMinutes > -1440) {
          // Trigger 3 in real-time: Deadline has appeared
          urgency = 'OVERDUE';
          message = diffMinutes === 0
            ? `Deadline has arrived for "${task.title}". Complete it now!`
            : `Deadline has appeared! "${task.title}" is overdue.`;
        } else if (diffMinutes <= 60 && diffMinutes > 0) {
          // Trigger 2 in real-time: 1 hour left
          urgency = 'CRITICAL';
          message = `1 hour left before deadline for "${task.title}" (${diffMinutes}m remaining)!`;
        }

        if (urgency) {
          const notifKey = `${task._id}_${urgency}`;
          const lastNotified = this.notifiedTaskMap.get(notifKey);
          const cooldown = 30 * 60 * 1000;

          if (!lastNotified || now - lastNotified > cooldown) {
            this.notifiedTaskMap.set(notifKey, now);

            const notifItem: DeadlineNotification = {
              id: `${task._id}_${urgency}_${Math.floor(now / (5 * 60 * 1000))}`,
              taskId: task._id,
              title: task.title,
              deadline: task.deadline,
              urgency,
              minutesRemaining: diffMinutes,
              message,
              timestamp: now,
            };

            newNotifications.push(notifItem);
            this.activeNotifications = [
              notifItem,
              ...this.activeNotifications.filter((n) => n.taskId !== task._id),
            ].slice(0, 20);

            NativeNotificationService.showNow(
              notifItem.id,
              urgency === 'OVERDUE' ? 'Deadline Reached 🚨' : '1 Hour Left ⏳',
              message
            );

            // Vibrate device
            try {
              if (Vibration && typeof Vibration.vibrate === 'function') {
                if (Platform.OS === 'android') {
                  Vibration.vibrate([0, 250, 150, 250]);
                } else {
                  Vibration.vibrate(400);
                }
              }
            } catch {}

            // Notify UI listeners
            this.listeners.forEach((listener) => {
              try { listener(notifItem); } catch {}
            });
          }
        }
      }
    }

    return newNotifications;
  }
}

export const notificationService = new NotificationService();
