import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types for mock client interfaces
type MockSupabaseReturn = { data: null; error: Error };
type MockSupabaseClient = {
  from: (table: string) => any;
  rpc: (fn: string, params?: any) => { data: null; error: Error };
};

// Singleton pattern for clients
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Create "safe" function that returns a mock client during build/without env vars
function createSafeClient(url?: string, key?: string, options?: any): SupabaseClient | MockSupabaseClient {
  // Prevent initialization during build or without correct env vars
  if (!url || !key || process.env.NODE_ENV === 'test') {
    // Return mock interface to prevent runtime errors
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: new Error('Supabase client not initialized') })
          }),
          order: () => ({ limit: () => ({ data: null, error: new Error('Supabase client not initialized') }) }),
          maybeSingle: () => ({ data: null, error: new Error('Supabase client not initialized') })
        }),
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: new Error('Supabase client not initialized') })
          })
        }),
        update: () => ({
          eq: () => ({ data: null, error: new Error('Supabase client not initialized') })
        })
      }),
      rpc: () => ({ data: null, error: new Error('Supabase client not initialized') })
    };
  }

  // Real client
  return createClient(url, key, options);
}

// Safe getter for the normal client (anon key)
export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if already created
  if (supabaseInstance) return supabaseInstance;

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Create new instance
  supabaseInstance = createSafeClient(supabaseUrl, supabaseAnonKey) as SupabaseClient;
  return supabaseInstance;
}

// Safe getter for the admin client (service role key)
export function getSupabaseAdmin(): SupabaseClient {
  // Use server-side only
  if (typeof window !== 'undefined') {
    console.error('Attempted to use admin client in browser context');
    return getSupabaseClient(); // Fall back to normal client in browser
  }

  // Return existing instance if already created
  if (supabaseAdminInstance) return supabaseAdminInstance;

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Create new instance
  supabaseAdminInstance = createSafeClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) as SupabaseClient;

  return supabaseAdminInstance;
}

// Export default client for convenience
export default getSupabaseClient();

// Helper function to execute SQL directly using service role
export async function executeSql(sql: string, params: any[] = []): Promise<any> {
  try {
    const adminClient = getSupabaseAdmin();

    const { data, error } = await adminClient.rpc('execute_sql', { 
      sql_query: sql,
      params: params
    });
    
    if (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
}

// Helper function for standard database operations
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    // This is a simplified example - in a real app, you'd parse the query
    // and use the appropriate Supabase methods
    if (query.toLowerCase().startsWith('select')) {
      const { data, error } = await getSupabaseAdmin().from(extractTableName(query)).select();
      if (error) throw error;
      return data;
    } else {
      // For other operations, use the RPC method
      return await executeSql(query, params);
    }
  } catch (error) {
    console.error(`Query execution error for: ${query}`, error);
    throw new Error(`Query execution error: ${(error as Error).message}`);
  }
}

// Helper function to extract table name from a simple SELECT query
// This is very simplistic and would need to be improved for real use
function extractTableName(query: string): string {
  const fromPattern = /\s+from\s+([^\s,;]+)/i;
  const match = query.match(fromPattern);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '');
  }
  throw new Error('Could not extract table name from query');
} 