-- Add certificate approval system columns to students table
ALTER TABLE students 
ADD COLUMN certificate_status TEXT DEFAULT 'none',
ADD COLUMN certificate_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN certificate_requested_at TIMESTAMP;