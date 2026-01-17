// Database Schema Check Script
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('========================================');
console.log('Database Schema Check');
console.log('========================================\n');

// Expected tables from supabase-schema.sql
const expectedTables = {
  'users': ['id', 'auth_id', 'email', 'password_hash', 'first_name', 'last_name', 'role', 'profile_image', 'created_at', 'last_login'],
  'categories': ['id', 'name', 'slug', 'description', 'created_at'],
  'blog_posts': ['id', 'title', 'slug', 'content', 'excerpt', 'featured_image', 'category_id', 'author_id', 'status', 'published_at', 'created_at', 'updated_at'],
  'comments': ['id', 'post_id', 'user_id', 'name', 'email', 'content', 'status', 'created_at'],
  'linkedin_posts': ['id', 'linkedin_id', 'content', 'post_url', 'published_at', 'fetched_at'],
  'contact_messages': ['id', 'name', 'email', 'message', 'status', 'created_at'],
  'exclusive_content': ['id', 'title', 'content', 'type', 'file_url', 'created_at', 'updated_at'],
  'access_logs': ['id', 'user_id', 'ip', 'path', 'user_agent', 'accessed_at']
};

async function checkSchema() {
  console.log('Checking table structure...\n');

  for (const [tableName, expectedColumns] of Object.entries(expectedTables)) {
    try {
      // Try to get one row to see the structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${tableName}: TABLE DOES NOT EXIST`);
        } else {
          console.log(`⚠️ ${tableName}: ${error.message}`);
        }
      } else {
        // Check row count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
      }
    } catch (e) {
      console.log(`❌ ${tableName}: ERROR - ${e.message}`);
    }
  }

  // Check RLS policies
  console.log('\n----------------------------------------');
  console.log('Checking Row Level Security...');
  console.log('----------------------------------------');

  // We can't directly query RLS status without special permissions
  // But we can test if RLS is blocking access
  console.log('Note: RLS status cannot be verified directly.');
  console.log('The schema file enables RLS on all tables.\n');
}

checkSchema()
  .then(() => {
    console.log('========================================');
    console.log('Schema check complete');
    console.log('========================================');
  })
  .catch(err => {
    console.error('Check failed:', err);
    process.exit(1);
  });
