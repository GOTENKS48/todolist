import axios from 'axios';
import { Platform } from 'react-native';
import { StorageService } from './storage';

/**
 * Dynamic API host based on platform:
 * - When using `adb reverse tcp:5000 tcp:5000` on physical USB device or emulator: `http://localhost:5000/api`
 * - Android Emulator direct loopback without adb reverse: `http://10.0.2.2:5000/api`
 */
const ANDROID_HOSTS = [
  'https://fashion-kay-dist-costume.trycloudflare.com/api', // Cloudflare Public Tunnel: Works globally on any phone
  'http://localhost:5000/api',                             // Local USB device via adb reverse
  'http://10.0.2.2:5000/api',                              // Android Emulator fallback
];

let currentHostIndex = 0;

const DEFAULT_BASE_URL = Platform.select({
  android: ANDROID_HOSTS[0],
  ios: 'https://fashion-kay-dist-costume.trycloudflare.com/api',
  default: 'https://fashion-kay-dist-costume.trycloudflare.com/api',
});

export const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

/**
 * Request Interceptor:
 * Automatically injects the JWT token from AsyncStorage into the Authorization header
 */
api.interceptors.request.use(
  async (config) => {
    const token = await StorageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Handles network failure auto-fallback (localhost <-> 10.0.2.2) and 401 Unauthorized cleanly
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If network connection failed (e.g. ECONNREFUSED or Network Error) on Android, try alternate host once
    if (Platform.OS === 'android' && !error.response && error.config && !(error.config as any)._isRetry) {
      (error.config as any)._isRetry = true;
      currentHostIndex = (currentHostIndex + 1) % ANDROID_HOSTS.length;
      const nextBaseUrl = ANDROID_HOSTS[currentHostIndex];
      console.log(`[API Network Fallback] Retrying request with alternate host: ${nextBaseUrl}`);
      api.defaults.baseURL = nextBaseUrl;
      error.config.baseURL = nextBaseUrl;
      return api(error.config);
    }

    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      console.warn('Session expired or unauthorized request. Clearing session.');
      await StorageService.clearSession();
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to update base URL dynamically (e.g., if testing on physical Android device with WiFi IP)
 */
export function setApiBaseUrl(customUrl: string) {
  api.defaults.baseURL = customUrl;
}
