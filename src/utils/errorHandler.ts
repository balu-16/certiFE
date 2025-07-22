// Enhanced Error Handler Utility
// src/utils/errorHandler.ts

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  solution?: string;
}

export class ErrorHandler {
  static handleDatabaseError(error: any): ApiError {
    // Database trigger errors
    if (error.message?.includes('has no field') || error.message?.includes('column') || error.message?.includes('trigger')) {
      return {
        code: 'DB_TRIGGER_ERROR',
        message: 'Database trigger references dropped columns',
        details: error.message,
        solution: 'Remove triggers in Supabase Dashboard → Database → Triggers'
      };
    }
    
    // Column not found errors
    if (error.code === '42703') {
      return {
        code: 'DB_COLUMN_ERROR',
        message: 'Database column reference error',
        details: error.message,
        solution: 'Check database schema and remove references to dropped columns'
      };
    }
    
    // Generic database errors
    return {
      code: 'DB_ERROR',
      message: 'Database operation failed',
      details: error.message
    };
  }
  
  static handleApiError(error: any): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      code: 'API_ERROR',
      message: error.message || 'API request failed'
    };
  }
}