import { Platform } from 'react-native';

// Centralized API base URL. Adjust the LAN IP if using a physical device.
export const API_BASE_URL = (() => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
})();
