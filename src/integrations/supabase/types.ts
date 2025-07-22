export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin: {
        Row: {
          admin_id: number
          name: string
          email: string
          phone_number: string
          created_at: string
        }
        Insert: {
          admin_id?: number
          name: string
          email: string
          phone_number: string
          created_at?: string
        }
        Update: {
          admin_id?: number
          name?: string
          email?: string
          phone_number?: string
          created_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          student_id: number
          name: string
          phone_number: string
          email: string | null
          certificate: string | null
          certificate_id: string | null
          eligible: boolean
          downloaded_count: number
          deleted: boolean
          created_at: string
          year: number
          branch: string
          college_name: string
          internship_start_date: string | null
          internship_end_date: string | null
          company_id: number | null
          course_id: number | null
          preferred_name: string | null
          course_enrolled: string | null
          certificate_status: string | null
          certificate_approved: boolean
          certificate_requested_at: string | null
        }
        Insert: {
          student_id?: number
          name: string
          phone_number: string
          email?: string | null
          certificate?: string | null
          certificate_id?: string | null
          eligible?: boolean
          downloaded_count?: number
          deleted?: boolean
          created_at?: string
          year?: number
          branch?: string
          college_name?: string
          internship_start_date?: string | null
          internship_end_date?: string | null
          company_id?: number | null
          course_id?: number | null
          preferred_name?: string | null
          course_enrolled?: string | null
          certificate_status?: string | null
          certificate_approved?: boolean
          certificate_requested_at?: string | null
        }
        Update: {
          student_id?: number
          name?: string
          phone_number?: string
          email?: string | null
          certificate?: string | null
          certificate_id?: string | null
          eligible?: boolean
          downloaded_count?: number
          deleted?: boolean
          created_at?: string
          year?: number
          branch?: string
          college_name?: string
          internship_start_date?: string | null
          internship_end_date?: string | null
          company_id?: number | null
          course_id?: number | null
          preferred_name?: string | null
          course_enrolled?: string | null
          certificate_status?: string | null
          certificate_approved?: boolean
          certificate_requested_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_course"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          }
        ]
      }
      student_login_logs: {
        Row: {
          log_id: number
          student_id: number | null
          login_time: string
        }
        Insert: {
          log_id?: number
          student_id?: number | null
          login_time?: string
        }
        Update: {
          log_id?: number
          student_id?: number | null
          login_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_login_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          }
        ]
      }
      admin_login_logs: {
        Row: {
          log_id: number
          admin_id: number | null
          login_time: string
        }
        Insert: {
          log_id?: number
          admin_id?: number | null
          login_time?: string
        }
        Update: {
          log_id?: number
          admin_id?: number | null
          login_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_login_logs_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "admin"
            referencedColumns: ["admin_id"]
          }
        ]
      }
      otp_sessions: {
        Row: {
          session_id: number
          phone_number: string
          otp_code: string
          is_verified: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          session_id?: number
          phone_number: string
          otp_code: string
          is_verified?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          session_id?: number
          phone_number?: string
          otp_code?: string
          is_verified?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_id: number
          course_name: string
          created_at: string
        }
        Insert: {
          course_id?: number
          course_name: string
          created_at?: string
        }
        Update: {
          course_id?: number
          course_name?: string
          created_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_id: number
          company_name: string
          created_at: string
        }
        Insert: {
          company_id?: number
          company_name: string
          created_at?: string
        }
        Update: {
          company_id?: number
          company_name?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Admin = Database['public']['Tables']['admin']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type StudentLoginLog = Database['public']['Tables']['student_login_logs']['Row'];
export type AdminLoginLog = Database['public']['Tables']['admin_login_logs']['Row'];
export type OtpSession = Database['public']['Tables']['otp_sessions']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];

export type AdminInsert = Database['public']['Tables']['admin']['Insert'];
export type StudentInsert = Database['public']['Tables']['students']['Insert'];
export type StudentLoginLogInsert = Database['public']['Tables']['student_login_logs']['Insert'];
export type AdminLoginLogInsert = Database['public']['Tables']['admin_login_logs']['Insert'];
export type OtpSessionInsert = Database['public']['Tables']['otp_sessions']['Insert'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];

export type AdminUpdate = Database['public']['Tables']['admin']['Update'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];
export type StudentLoginLogUpdate = Database['public']['Tables']['student_login_logs']['Update'];
export type AdminLoginLogUpdate = Database['public']['Tables']['admin_login_logs']['Update'];
export type OtpSessionUpdate = Database['public']['Tables']['otp_sessions']['Update'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];