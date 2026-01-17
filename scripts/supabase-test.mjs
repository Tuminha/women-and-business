// Supabase Connection Test Script
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('========================================');
console.log('Supabase Connection Test');
console.log('========================================\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('✅ Environment variables found\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Required tables
const requiredTables = ['users', 'blog_posts', 'categories', 'comments', 'contact_messages'];

async function testConnection() {
  console.log('Testing connection...\n');

  try {
    // Test connection by querying pg_catalog for tables
    const { data: tables, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) {
      // Try alternative method - query each table directly
      console.log('Checking tables individually...\n');

      const tableStatus = {};
      for (const table of requiredTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (tableError) {
            tableStatus[table] = { exists: false, error: tableError.message };
          } else {
            tableStatus[table] = { exists: true, count: data?.length || 0 };
          }
        } catch (e) {
          tableStatus[table] = { exists: false, error: e.message };
        }
      }

      console.log('Table Status:');
      console.log('----------------------------------------');
      let allExist = true;
      for (const [table, status] of Object.entries(tableStatus)) {
        if (status.exists) {
          console.log(`✅ ${table}: EXISTS`);
        } else {
          console.log(`❌ ${table}: MISSING - ${status.error}`);
          allExist = false;
        }
      }

      console.log('\n----------------------------------------');
      if (allExist) {
        console.log('✅ All required tables exist');
      } else {
        console.log('⚠️ Some tables are missing');
      }

      // Check RLS status
      console.log('\nChecking RLS status...');
      const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_enabled');
      if (rlsError) {
        console.log('⚠️ Could not check RLS status (function may not exist)');
      } else {
        console.log('RLS Data:', rlsData);
      }

      return;
    }

    const tableNames = tables?.map(t => t.tablename) || [];
    console.log('Found tables:', tableNames.join(', '));

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

// Run test
testConnection()
  .then(() => {
    console.log('\n========================================');
    console.log('Connection test complete');
    console.log('========================================');
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
