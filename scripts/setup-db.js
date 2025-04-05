const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Read schema file successfully');
    
    // Split the SQL into statements (simple approach)
    const sqlStatements = schemaSql.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${sqlStatements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const stmt = sqlStatements[i];
      
      // Skip comments-only statements
      if (stmt.startsWith('--')) {
        continue;
      }
      
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
      
      // Execute the statement using the RPC function
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: stmt
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        // Continue with other statements
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('Database setup completed');
    
    // Verify database setup by checking for admin user
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'cudeiromaria@gmail.com')
      .single();
    
    if (userError || !adminUser) {
      console.error('Verification failed: Admin user not found', userError);
      process.exit(1);
    }
    
    console.log('Verification successful. Admin user:');
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    
    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log(`\nInitialized with ${categories.length} categories:`);
      categories.forEach(category => {
        console.log(`- ${category.name} (${category.slug})`);
      });
    }
    
    console.log('\nDatabase is ready to use!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 