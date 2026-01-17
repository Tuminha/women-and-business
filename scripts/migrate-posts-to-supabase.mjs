// Migration Script: Posts from JSON to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('========================================');
  console.log('Post Migration: JSON → Supabase');
  console.log('========================================\n');

  // 1. Load posts from JSON
  console.log('📁 Loading posts from JSON...');
  const postsPath = join(projectRoot, 'extracted_data', 'posts.json');
  const postsContent = await readFile(postsPath, 'utf-8');
  const posts = JSON.parse(postsContent);
  console.log(`   Found ${posts.length} posts\n`);

  // 2. Check existing posts in Supabase
  console.log('🔍 Checking existing posts in Supabase...');
  const { data: existingPosts, error: fetchError } = await supabase
    .from('blog_posts')
    .select('slug');

  if (fetchError) {
    console.error('Error fetching existing posts:', fetchError);
    process.exit(1);
  }

  const existingSlugs = new Set((existingPosts || []).map(p => p.slug));
  console.log(`   Found ${existingSlugs.size} existing posts\n`);

  // 3. Get the admin user (author_id = 1)
  const { data: adminUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .single();

  if (userError || !adminUser) {
    console.error('Error finding admin user:', userError);
    console.log('Using author_id = 1 as fallback');
  }

  const authorId = adminUser?.id || 1;
  console.log(`📝 Using author_id: ${authorId}\n`);

  // 4. Get default category
  const { data: defaultCategory } = await supabase
    .from('categories')
    .select('id')
    .limit(1)
    .single();

  const defaultCategoryId = defaultCategory?.id || null;
  console.log(`📂 Default category_id: ${defaultCategoryId}\n`);

  // 5. Migrate posts
  console.log('🚀 Starting migration...\n');

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    // Skip if already exists
    if (existingSlugs.has(post.slug)) {
      console.log(`   ⏭️  Skipped (exists): ${post.slug}`);
      skipped++;
      continue;
    }

    // Transform WordPress post to Supabase format
    const transformedPost = {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || null,
      featured_image: null, // Would need to extract from content if needed
      category_id: defaultCategoryId,
      author_id: authorId,
      status: post.status === 'publish' ? 'published' : 'draft',
      published_at: post.status === 'publish' ? post.date : null,
      created_at: post.date,
      updated_at: post.modified || post.date
    };

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(transformedPost)
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Failed: ${post.slug} - ${error.message}`);
        failed++;
      } else {
        console.log(`   ✅ Migrated: ${post.slug}`);
        migrated++;
      }
    } catch (err) {
      console.log(`   ❌ Failed: ${post.slug} - ${err.message}`);
      failed++;
    }
  }

  // 6. Summary
  console.log('\n========================================');
  console.log('Migration Complete!');
  console.log('========================================');
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`📊 Total:    ${posts.length}`);

  // 7. Verify
  console.log('\n🔍 Verifying...');
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });

  console.log(`   Posts in database: ${count}`);
  console.log('========================================\n');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
