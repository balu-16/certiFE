-- Migration: Add internship and course/company fields to students table
-- This migration adds the new fields requested for student internship tracking

-- Add new columns to students table
ALTER TABLE students 
ADD COLUMN internship_start_date DATE, 
ADD COLUMN internship_end_date DATE, 
ADD COLUMN company_id INT, 
ADD COLUMN course_id INT, 
ADD COLUMN preferred_name TEXT;

-- Add foreign key constraints
ALTER TABLE students
ADD CONSTRAINT fk_company 
    FOREIGN KEY (company_id) 
    REFERENCES companies(company_id) 
    ON DELETE SET NULL;

ALTER TABLE students
ADD CONSTRAINT fk_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(course_id) 
    ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_students_company_id ON students(company_id);
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_internship_dates ON students(internship_start_date, internship_end_date);

-- Add comments for documentation
COMMENT ON COLUMN students.internship_start_date IS 'Start date of student internship';
COMMENT ON COLUMN students.internship_end_date IS 'End date of student internship';
COMMENT ON COLUMN students.company_id IS 'Foreign key reference to companies table';
COMMENT ON COLUMN students.course_id IS 'Foreign key reference to courses table';
COMMENT ON COLUMN students.preferred_name IS 'Student preferred name for certificates';