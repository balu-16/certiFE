import { supabase } from '@/integrations/supabase/client';
import type { Student, Course, Company } from '@/integrations/supabase/types';

/**
 * Database utility functions for student internship management
 */

export interface StudentWithDetails extends Student {
  course_name?: string;
  company_name?: string;
}

/**
 * Fetch all students with their course and company details
 */
export const fetchStudentsWithDetails = async (): Promise<StudentWithDetails[]> => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        courses:course_id(course_name),
        companies:company_id(company_name)
      `)
      .order('student_id', { ascending: true });

    if (error) {
      console.error('Error fetching students with details:', error);
      throw error;
    }

    // Transform the data to include course_name and company_name at the top level
    const studentsWithDetails = students?.map(student => ({
      ...student,
      course_name: (student.courses as any)?.course_name || null,
      company_name: (student.companies as any)?.company_name || null
    })) || [];

    return studentsWithDetails;
  } catch (error) {
    console.error('Error in fetchStudentsWithDetails:', error);
    throw error;
  }
};

/**
 * Update student internship details
 */
export const updateStudentInternshipDetails = async (
  studentId: number,
  details: {
    internship_start_date?: string | null;
    internship_end_date?: string | null;
    company_id?: number | null;
    course_id?: number | null;
    preferred_name?: string | null;
  }
) => {
  try {
    const { error } = await supabase
      .from('students')
      .update(details)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error updating student internship details:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateStudentInternshipDetails:', error);
    throw error;
  }
};

/**
 * Fetch all courses
 */
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('course_name');

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    return courses || [];
  } catch (error) {
    console.error('Error in fetchCourses:', error);
    throw error;
  }
};

/**
 * Fetch all companies
 */
export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('company_name');

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    return companies || [];
  } catch (error) {
    console.error('Error in fetchCompanies:', error);
    throw error;
  }
};

/**
 * Create a new course
 */
export const createCourse = async (courseName: string): Promise<Course> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert({ course_name: courseName })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
};

/**
 * Create a new company
 */
export const createCompany = async (companyName: string): Promise<Company> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({ company_name: companyName })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCompany:', error);
    throw error;
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    throw error;
  }
};

/**
 * Delete a company
 */
export const deleteCompany = async (companyId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('company_id', companyId);

    if (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCompany:', error);
    throw error;
  }
};