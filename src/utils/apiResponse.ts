// API Response Utility
// src/utils/apiResponse.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string;
  timestamp: string;
}

export class ApiResponseBuilder {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
  
  static error(error: string, details?: string): ApiResponse {
    return {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString()
    };
  }
  
  static validationError(field: string, message: string): ApiResponse {
    return {
      success: false,
      error: 'Validation Error',
      details: `${field}: ${message}`,
      timestamp: new Date().toISOString()
    };
  }
}