-- Migration: Add templates table for storing certificate templates
-- This migration creates a new table to store templates for different companies

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  template TEXT NOT NULL,  -- can be a base64 string, image URL, or file reference
  company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment to document the table
COMMENT ON TABLE templates IS 'Stores certificate templates for different companies';
COMMENT ON COLUMN templates.template IS 'Base64 encoded image string, image URL, or file reference for the template';
COMMENT ON COLUMN templates.company_id IS 'Foreign key reference to companies table';

-- Insert default templates for existing companies
-- Insert template1.png for NighaTech Global (assuming company_id 1)
INSERT INTO templates (template, company_id) 
SELECT 'template1.png', company_id 
FROM companies 
WHERE company_name = 'NighaTech Global' 
ON CONFLICT DO NOTHING;

-- Insert template2.png for AddWise Tech Innovations (assuming company_id 2)
INSERT INTO templates (template, company_id) 
SELECT 'template2.png', company_id 
FROM companies 
WHERE company_name = 'AddWise Tech Innovations' 
ON CONFLICT DO NOTHING;