import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables (you'll need to set these)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running certificate approval system migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'src', 'integrations', 'supabase', 'migrations', 'add_certificate_approval_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Added columns:');
    console.log('   - certificate_status (TEXT, default: "none")');
    console.log('   - certificate_approved (BOOLEAN, default: FALSE)');
    console.log('   - certificate_requested_at (TIMESTAMP)');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

// Alternative: Direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Running certificate approval system migration (direct)...');
    
    // Add certificate_status column
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE students ADD COLUMN IF NOT EXISTS certificate_status TEXT DEFAULT 'none';`
    });
    
    if (error1) {
      console.error('❌ Error adding certificate_status:', error1);
      return;
    }
    
    // Add certificate_approved column
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE students ADD COLUMN IF NOT EXISTS certificate_approved BOOLEAN DEFAULT FALSE;`
    });
    
    if (error2) {
      console.error('❌ Error adding certificate_approved:', error2);
      return;
    }
    
    // Add certificate_requested_at column
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE students ADD COLUMN IF NOT EXISTS certificate_requested_at TIMESTAMP;`
    });
    
    if (error3) {
      console.error('❌ Error adding certificate_requested_at:', error3);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Added columns:');
    console.log('   - certificate_status (TEXT, default: "none")');
    console.log('   - certificate_approved (BOOLEAN, default: FALSE)');
    console.log('   - certificate_requested_at (TIMESTAMP)');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

// Run the migration
runMigrationDirect();