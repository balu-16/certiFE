// Configuration Management
// src/config/app.config.ts

// Helper function to safely access environment variables
const getEnvVar = (key: string, defaultValue: string = '') => {
  if (typeof window !== 'undefined') {
    // Browser environment - use import.meta.env
    return (import.meta.env as any)[key] || defaultValue;
  }
  // Fallback for SSR or other environments
  return defaultValue;
};

const isDevelopment = getEnvVar('MODE') === 'development' || getEnvVar('NODE_ENV') === 'development';
const isProduction = getEnvVar('MODE') === 'production' || getEnvVar('NODE_ENV') === 'production';

export const AppConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_URL') || getEnvVar('REACT_APP_API_URL') || 'http://localhost:3001',
    timeout: 30000,
    retryAttempts: 3
  },
  
  database: {
    healthCheckInterval: 60000, // 1 minute
    connectionTimeout: 10000
  },
  
  ui: {
    toastDuration: 5000,
    loadingDebounce: 300,
    tablePageSize: 50
  },
  
  features: {
    enableDebugLogs: isDevelopment,
    enableErrorReporting: isProduction,
    enableOfflineMode: false
  }
} as const;

export type AppConfigType = typeof AppConfig;