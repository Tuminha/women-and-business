-- Function to create a table if it doesn't exist
-- This function should be run in the Supabase SQL editor first
CREATE OR REPLACE FUNCTION create_table_if_not_exists(
  table_name text,
  schema text
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = create_table_if_not_exists.table_name
  ) INTO table_exists;
  
  -- Create table if it doesn't exist
  IF NOT table_exists THEN
    EXECUTE format('CREATE TABLE %I (%s)', 
                  create_table_if_not_exists.table_name, 
                  create_table_if_not_exists.schema);
  END IF;
END;
$$;

-- Function to execute arbitrary SQL
-- This function should be run in the Supabase SQL editor first
CREATE OR REPLACE FUNCTION execute_sql(
  sql_query text,
  params jsonb DEFAULT '[]'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Using security definer to run with the privileges of the function creator
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Execute the SQL query
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_table_if_not_exists TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;

-- Grant execute permission to anon users (be cautious with this in production)
GRANT EXECUTE ON FUNCTION create_table_if_not_exists TO anon;
GRANT EXECUTE ON FUNCTION execute_sql TO anon;

-- Row Level Security setup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusive_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users table: Admin can read all users, users can read their own data
CREATE POLICY "Admin can access all users" ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- More policies would be needed for other tables 