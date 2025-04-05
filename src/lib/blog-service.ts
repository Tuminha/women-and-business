import { getSupabaseClient } from './supabase-client';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: number;
  authorId: number;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: number;
  status?: 'draft' | 'published';
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: number;
  status?: 'draft' | 'published';
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Blog post CRUD operations
export async function createPost(authorId: number, postData: CreatePostData): Promise<BlogPost | null> {
  try {
    const supabase = getSupabaseClient();
    const { title, content, excerpt, featuredImage, categoryId, status = 'draft' } = postData;
    
    // Generate slug from title
    const baseSlug = generateSlug(title);
    
    // Check if slug exists and make it unique if needed
    let slug = baseSlug;
    let counter = 1;
    let slugExists = true;
    
    while (slugExists) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!existingPost) {
        slugExists = false;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    // Prepare published_at date if status is published
    const publishedAt = status === 'published' ? new Date().toISOString() : null;
    
    // Insert post
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        category_id: categoryId || null,
        author_id: authorId,
        status,
        published_at: publishedAt
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('Create post error:', error);
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featured_image,
      categoryId: data.category_id,
      authorId: data.author_id,
      status: data.status as 'draft' | 'published',
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Create post error:', error);
    return null;
  }
}

export async function updatePost(postId: number, postData: UpdatePostData): Promise<BlogPost | null> {
  try {
    const supabase = getSupabaseClient();
    const { title, content, excerpt, featuredImage, categoryId, status } = postData;
    
    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (title !== undefined) {
      updates.title = title;
      
      // If title is updated, also update slug
      updates.slug = generateSlug(title);
    }
    
    if (content !== undefined) {
      updates.content = content;
    }
    
    if (excerpt !== undefined) {
      updates.excerpt = excerpt;
    }
    
    if (featuredImage !== undefined) {
      updates.featured_image = featuredImage;
    }
    
    if (categoryId !== undefined) {
      updates.category_id = categoryId;
    }
    
    if (status !== undefined) {
      updates.status = status;
      
      // If status is changed to published and wasn't before, set published_at
      if (status === 'published') {
        const { data: currentPost } = await supabase
          .from('blog_posts')
          .select('status')
          .eq('id', postId)
          .single();
        
        if (currentPost && currentPost.status !== 'published') {
          updates.published_at = new Date().toISOString();
        }
      }
    }
    
    if (Object.keys(updates).length === 1 && updates.updated_at) {
      // Nothing to update except updated_at
      return await getPostById(postId);
    }
    
    // Execute update
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Update post error:', error);
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featured_image,
      categoryId: data.category_id,
      authorId: data.author_id,
      status: data.status as 'draft' | 'published',
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Update post error:', error);
    return null;
  }
}

export async function getPostById(postId: number): Promise<BlogPost | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featured_image,
      categoryId: data.category_id,
      authorId: data.author_id,
      status: data.status as 'draft' | 'published',
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Get post by ID error:', error);
    return null;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featured_image,
      categoryId: data.category_id,
      authorId: data.author_id,
      status: data.status as 'draft' | 'published',
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Get post by slug error:', error);
    return null;
  }
}

export async function getAllPosts(options: {
  limit?: number;
  offset?: number;
  status?: 'draft' | 'published' | 'all';
  categoryId?: number;
  authorId?: number;
} = {}): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const supabase = getSupabaseClient();
    const {
      limit = 10,
      offset = 0,
      status = 'published',
      categoryId,
      authorId
    } = options;
    
    // Start building query
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (categoryId !== undefined) {
      query = query.eq('category_id', categoryId);
    }
    
    if (authorId !== undefined) {
      query = query.eq('author_id', authorId);
    }
    
    // Order by published_at or created_at
    query = query.order('published_at', { ascending: false, nullsFirst: false });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Get all posts error:', error);
      return { posts: [], total: 0 };
    }
    
    // Convert from snake_case to camelCase
    const posts = data.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categoryId: post.category_id,
      authorId: post.author_id,
      status: post.status as 'draft' | 'published',
      publishedAt: post.published_at ? new Date(post.published_at) : undefined,
      createdAt: new Date(post.created_at),
      updatedAt: new Date(post.updated_at)
    }));
    
    return { posts, total: count || 0 };
  } catch (error) {
    console.error('Get all posts error:', error);
    return { posts: [], total: 0 };
  }
}

export async function deletePost(postId: number): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    // Delete post
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    return !error;
  } catch (error) {
    console.error('Delete post error:', error);
    return false;
  }
}

// Category CRUD operations
export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error || !data) {
      return [];
    }
    
    // Convert from snake_case to camelCase
    return data.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: new Date(category.created_at)
    }));
  } catch (error) {
    console.error('Get all categories error:', error);
    return [];
  }
}

export async function getCategoryById(categoryId: number): Promise<Category | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Get category by ID error:', error);
    return null;
  }
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category | null> {
  try {
    const supabase = getSupabaseClient();
    const { name, description } = data;
    
    // Generate slug
    const slug = generateSlug(name);
    
    // Insert category
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null
      })
      .select()
      .single();
    
    if (error || !newCategory) {
      console.error('Create category error:', error);
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: newCategory.id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      createdAt: new Date(newCategory.created_at)
    };
  } catch (error) {
    console.error('Create category error:', error);
    return null;
  }
}

export async function updateCategory(categoryId: number, data: { name?: string; description?: string }): Promise<Category | null> {
  try {
    const supabase = getSupabaseClient();
    const { name, description } = data;
    
    // Build update object
    const updates: any = {};
    
    if (name !== undefined) {
      updates.name = name;
      
      // If name is updated, also update slug
      updates.slug = generateSlug(name);
    }
    
    if (description !== undefined) {
      updates.description = description;
    }
    
    if (Object.keys(updates).length === 0) {
      // Nothing to update
      return await getCategoryById(categoryId);
    }
    
    // Execute update
    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error || !updatedCategory) {
      console.error('Update category error:', error);
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,
      createdAt: new Date(updatedCategory.created_at)
    };
  } catch (error) {
    console.error('Update category error:', error);
    return null;
  }
}

export async function deleteCategory(categoryId: number): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    // First update any posts with this category to have null category
    await supabase
      .from('blog_posts')
      .update({ category_id: null })
      .eq('category_id', categoryId);
    
    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    return !error;
  } catch (error) {
    console.error('Delete category error:', error);
    return false;
  }
}
