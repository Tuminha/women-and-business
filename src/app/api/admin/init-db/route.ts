import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

// Log for debugging
console.log('Loading init-db API route');

export async function GET() {
  console.log('init-db API route called');
  
  try {
    // Get the admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check database initialization status
    console.log('Checking if tables exist...');
    
    // Check if users table exists and has the admin user
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', 'cudeiromaria@gmail.com')
      .maybeSingle();
    
    if (userError) {
      console.error('Error checking admin user:', userError);
      if (userError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          message: 'Database tables not created. Please run the SQL script in supabase-schema.sql through the Supabase SQL Editor.' 
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Error accessing database', 
        error: userError.message 
      });
    }
    
    if (adminUser) {
      // Check if categories exist
      const { data: categories, error: categoriesError } = await supabaseAdmin
        .from('categories')
        .select('count')
        .limit(1);
      
      if (categoriesError) {
        console.error('Error checking categories:', categoriesError);
        return NextResponse.json({ 
          success: false, 
          message: 'Admin user exists but error checking categories', 
          error: categoriesError.message 
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully', 
        admin: adminUser,
        tablesCreated: true,
        categoriesCreated: categories && categories.length > 0
      });
    }
    
    // Admin user not found
    return NextResponse.json({ 
      success: false, 
      message: 'Admin user not found. Please run the SQL script in supabase-schema.sql through the Supabase SQL Editor.' 
    });
  } catch (error) {
    console.error('Database initialization check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check database initialization', 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 