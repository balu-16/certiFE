import React from 'react';
import { Button } from '@/components/ui/button';

const FallbackPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden mb-6">
          <img 
            src="/logo.jpg" 
            alt="NIGHA TECH Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">NIGHA TECH</h1>
        <p className="text-gray-600 mb-6">Certificate Portal</p>
        <p className="text-sm text-gray-500 mb-4">
          The application is loading. If this persists, please refresh the page.
        </p>
        <Button 
          onClick={() => window.location.href = '/login'}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default FallbackPage;