import React from 'react';
import { AppConfig } from '@/config/app.config';

const DebugInfo: React.FC = () => {
  // Only show in development mode
  const isDev = import.meta.env?.MODE === 'development';
  
  if (!isDev) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Environment: {import.meta.env?.MODE || 'unknown'}</div>
        <div>API URL: {AppConfig.api.baseUrl}</div>
        <div>React Version: {React.version}</div>
        <div>Location: {window.location.pathname}</div>
        <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
        <div>Vite API URL: {import.meta.env?.VITE_API_URL || 'not set'}</div>
      </div>
    </div>
  );
};

export default DebugInfo;