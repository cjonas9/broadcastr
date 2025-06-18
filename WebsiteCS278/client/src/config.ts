// Environment configuration
const isDevelopment = import.meta.env.DEV;

// API Configuration
export const API_CONFIG = {
  // Use environment variable if available, otherwise fallback to default URLs
  baseUrl: import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:8000' : 'https://broadcastr-backend2.onrender.com'),
  // Add other API-related configuration here
};

// Feature flags and other environment-specific settings
export const FEATURES = {
  enableMockData: isDevelopment,
  // Add other feature flags here
}; 