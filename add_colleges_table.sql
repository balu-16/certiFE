-- Migration: Add colleges table
-- Description: Creates a colleges table for managing college information

-- Create colleges table
CREATE TABLE IF NOT EXISTS public.colleges (
  college_id SERIAL PRIMARY KEY,
  college_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Kolkata', now())
);

-- Add comments to the table and columns
COMMENT ON TABLE public.colleges IS 'Table to store college information';
COMMENT ON COLUMN public.colleges.college_id IS 'Unique identifier for each college';
COMMENT ON COLUMN public.colleges.college_name IS 'Name of the college (must be unique)';
COMMENT ON COLUMN public.colleges.created_at IS 'Timestamp when the college record was created';

-- Insert some default colleges
INSERT INTO public.colleges (college_name) VALUES 
  ('Government Engineering College'),
  ('Private Engineering College'),
  ('Technical Institute'),
  ('Polytechnic College')
ON CONFLICT (college_name) DO NOTHING;

-- Update templates table to store base64 images instead of file names
ALTER TABLE public.templates 
ALTER COLUMN template TYPE TEXT;

-- Add comment for the updated template column
COMMENT ON COLUMN public.templates.template IS 'Base64 encoded image data or image URL';