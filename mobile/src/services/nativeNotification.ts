import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { TaskNotificationModule } = NativeModules;

export class NativeNotificationService {
  /**
   * Request notification permission on Android 13+ (API 33+)
   */
  public static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  }

  /**
   * Schedule a background alarm notification that fires even when app is closed / minimised!
   */
  public static schedule(id: string, title: string, message: string, timestampMs: number): void {
    if (Platform.OS === 'android' && TaskNotificationModule?.scheduleNotification) {
      try {
        TaskNotificationModule.scheduleNotification(id, title, message, timestampMs);
      } catch (err) {
        console.warn('Could not schedule native background notification:', err);
      }
    }
  }

  /**
   * Immediately post a system notification to the Android status bar tray
   */
  public static showNow(id: string, title: string, message: string): void {
    if (Platform.OS === 'android' && TaskNotificationModule?.showNotificationNow) {
      try {
        TaskNotificationModule.showNotificationNow(id, title, message);
      } catch (err) {
        console.warn('Could not show native status bar notification:', err);
      }
    }
  }

  /**
   * Cancel a scheduled notification
   */
  public static cancel(id: string): void {
    if (Platform.OS === 'android' && TaskNotificationModule?.cancelNotification) {
      try {
        TaskNotificationModule.cancelNotification(id);
      } catch (err) {
        // ignore
      }
    }
  }
}
