import { Platform } from 'react-native';

// Centralized API base URL. Adjust based on environment.
export const API_BASE_URL = (() => {
  // For Docker development, manually change this to 'http://host.docker.internal:8080'
  // or use your computer's IP address like 'http://192.168.1.100:8080'
  
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  // Change this to your computer's actual IP address to test on physical devices
  return 'http://localhost:8080';
})();
