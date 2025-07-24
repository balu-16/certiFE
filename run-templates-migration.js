import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ekrrfkgrycqfqokrxjxe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTemplatesMigration() {
  try {
    console.log('🚀 Running templates table migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'src', 'integrations', 'supabase', 'migrations', 'add_templates_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }
    
    console.log('✅ Templates table migration completed successfully!');
    console.log('📋 Created:');
    console.log('   - templates table with columns: id, template, company_id, created_at');
    console.log('   - Inserted default templates for NighaTech Global and AddWise Tech Innovations');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

// Alternative: Direct SQL execution
async function runTemplatesMigrationDirect() {
  try {
    console.log('🚀 Running templates table migration (direct)...');
    
    // Create templates table
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS templates (
          id SERIAL PRIMARY KEY,
          template TEXT NOT NULL,
          company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error1) {
      console.error('❌ Error creating templates table:', error1);
      return;
    }
    
    // Add comments
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON TABLE templates IS 'Stores certificate templates for different companies';
        COMMENT ON COLUMN templates.template IS 'Base64 encoded image string, image URL, or file reference for the template';
        COMMENT ON COLUMN templates.company_id IS 'Foreign key reference to companies table';
      `
    });
    
    if (error2) {
      console.error('❌ Error adding comments:', error2);
      // Continue anyway, comments are not critical
    }
    
    // Insert default templates
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO templates (template, company_id) 
        SELECT 'template1.png', company_id 
        FROM companies 
        WHERE company_name = 'NighaTech Global'
        ON CONFLICT DO NOTHING;
        
        INSERT INTO templates (template, company_id) 
        SELECT 'template2.png', company_id 
        FROM companies 
        WHERE company_name = 'AddWise Tech Innovations'
        ON CONFLICT DO NOTHING;
      `
    });
    
    if (error3) {
      console.error('❌ Error inserting default templates:', error3);
      return;
    }
    
    console.log('✅ Templates table migration completed successfully!');
    console.log('📋 Created:');
    console.log('   - templates table with columns: id, template, company_id, created_at');
    console.log('   - Inserted default templates for NighaTech Global and AddWise Tech Innovations');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

// Run the migration
runTemplatesMigrationDirect();