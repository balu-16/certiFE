-- Migration: Change certificate column from BYTEA to TEXT
-- This migration changes the certificate storage from binary data to text (base64 image strings)

-- First, backup any existing certificate data (optional, for safety)
-- CREATE TABLE IF NOT EXISTS certificate_backup AS 
-- SELECT student_id, certificate FROM students WHERE certificate IS NOT NULL;

-- Alter the certificate column type from BYTEA to TEXT
ALTER TABLE students 
ALTER COLUMN certificate TYPE TEXT;

-- Add a comment to document the change
COMMENT ON COLUMN students.certificate IS 'Base64 encoded image string of the certificate. Converted to PDF on download.';