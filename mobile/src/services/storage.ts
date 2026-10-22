import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task } from '../types';

const TOKEN_KEY = '@todo_app_auth_token';
const USER_KEY = '@todo_app_auth_user';
const CACHED_TASKS_KEY = '@todo_app_cached_tasks';

export const StorageService = {
  // Token
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Error saving auth token:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error reading auth token:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error removing auth token:', e);
    }
  },

  // User
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Error saving user data:', e);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Error reading user data:', e);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Error removing user data:', e);
    }
  },

  // Cached Tasks for offline continuity
  async saveCachedTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Error caching tasks:', e);
    }
  },

  async getCachedTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(CACHED_TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Clear all session data on logout
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Error clearing session:', e);
    }
  },
};
