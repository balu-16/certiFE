// Enhanced Type Definitions
// src/types/api.types.ts

export interface Student {
  student_id: number;
  name: string;
  phone_number: string;
  email?: string;
  year?: string;
  branch?: string;
  college_name?: string;
  eligible: boolean;
  certificate?: string;
  certificate_id?: string;
  downloaded_count: number;
  deleted: boolean;
  created_at: string;
}

export interface Course {
  course_id: number;
  course_name: string;
  created_at?: string;
}

export interface Company {
  company_id: number;
  company_name: string;
  created_at?: string;
}

export interface EligibilityUpdateRequest {
  eligible: boolean;
}

export interface EligibilityUpdateResponse {
  success: boolean;
  message: string;
  data: {
    studentId: number;
    studentName: string;
    eligible: boolean;
  };
}

export interface CertificateGenerationRequest {
  studentId: number;
}

export interface CertificateGenerationResponse {
  success: boolean;
  message: string;
  data: {
    certificateId: string;
    studentName: string;
    generatedAt: string;
  };
}

// API Endpoint Types
export type ApiEndpoints = {
  students: {
    list: '/v1/students';
    eligibility: (id: number) => string;
  };
  certificates: {
    generate: (id: number) => string;
    download: (id: number) => string;
    status: (id: number) => string;
  };
  courses: '/v1/courses';
  companies: '/v1/companies';
};