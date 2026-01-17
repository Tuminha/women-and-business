import { readFile } from 'fs/promises'
import { join } from 'path'
import { getSupabaseClient, getSupabaseAdmin } from './supabase-client'

// ============================================
// Types
// ============================================

// Post type matching Supabase schema
export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  category_id: number | null
  author_id: number
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  // Legacy WordPress fields (for JSON fallback compatibility)
  date?: string
  date_gmt?: string
  comment_status?: string
  ping_status?: string
  password?: string
  modified?: string
  modified_gmt?: string
  parent?: number
  guid?: string
  type?: string
  mime_type?: string
  comment_count?: number
}

// Category type matching Supabase schema
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: string
}

// CRUD Data Types
export interface CreatePostData {
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  category_id?: number
  author_id: number
  status: 'draft' | 'published'
  published_at?: string
}

export interface UpdatePostData {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  featured_image?: string
  category_id?: number
  status?: 'draft' | 'published'
  published_at?: string
}

export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryData {
  name?: string
  slug?: string
  description?: string
}

// ============================================
// JSON Fallback (for development/migration)
// ============================================

let postsCache: Post[] | null = null
let pagesCache: Post[] | null = null

async function loadPostsFromJson(): Promise<Post[]> {
  if (postsCache) {
    return postsCache
  }

  try {
    const filePath = join(process.cwd(), 'extracted_data', 'posts.json')
    const fileContents = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(fileContents)
    postsCache = Array.isArray(parsed) ? parsed : []
    return postsCache
  } catch (error) {
    console.error('Error loading posts from JSON:', error)
    postsCache = []
    return []
  }
}

async function loadPages(): Promise<Post[]> {
  if (pagesCache) {
    return pagesCache
  }

  try {
    const filePath = join(process.cwd(), 'extracted_data', 'pages.json')
    const fileContents = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(fileContents)
    pagesCache = Array.isArray(parsed) ? parsed : []
    return pagesCache
  } catch (error) {
    console.error('Error loading pages:', error)
    pagesCache = []
    return []
  }
}

// ============================================
// Post Functions
// ============================================

export async function getAllPosts(): Promise<Post[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching posts:', error)
      throw error
    }

    if (data && data.length > 0) {
      return data as Post[]
    }

    // Fallback to JSON if Supabase returns empty (for migration period)
    console.log('No posts in Supabase, falling back to JSON')
    const jsonPosts = await loadPostsFromJson()
    return jsonPosts.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at).getTime()
      const dateB = new Date(b.date || b.created_at).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error in getAllPosts, falling back to JSON:', error)
    const jsonPosts = await loadPostsFromJson()
    return jsonPosts.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at).getTime()
      const dateB = new Date(b.date || b.created_at).getTime()
      return dateB - dateA
    })
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error fetching post by slug:', error)
      throw error
    }

    if (data) {
      return data as Post
    }

    // Fallback to JSON
    console.log('Post not found in Supabase, checking JSON fallback')
    const jsonPosts = await loadPostsFromJson()
    return jsonPosts.find((post) => post.slug === slug) || null
  } catch (error) {
    console.error('Error in getPostBySlug, falling back to JSON:', error)
    const jsonPosts = await loadPostsFromJson()
    return jsonPosts.find((post) => post.slug === slug) || null
  }
}

export async function getPostById(id: number | string): Promise<Post | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error fetching post by id:', error)
      throw error
    }

    if (data) {
      return data as Post
    }

    // Fallback to JSON
    const jsonPosts = await loadPostsFromJson()
    return jsonPosts.find((post) => post.id === Number(id)) || null
  } catch (error) {
    console.error('Error in getPostById, falling back to JSON:', error)
    const jsonPosts = await loadPostsFromJson()
    return jsonPosts.find((post) => post.id === Number(id)) || null
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  try {
    const supabase = getSupabaseClient()

    // First get the category by slug
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (categoryError && categoryError.code !== 'PGRST116') {
      throw categoryError
    }

    if (!category) {
      return []
    }

    // Then get posts by category_id
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data || []) as Post[]
  } catch (error) {
    console.error('Error in getPostsByCategory:', error)
    return []
  }
}

export async function getFeaturedPost(): Promise<Post | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (data) {
      return data as Post
    }

    // Fallback to first post from JSON
    const posts = await getAllPosts()
    return posts[0] || null
  } catch (error) {
    console.error('Error in getFeaturedPost:', error)
    const posts = await getAllPosts()
    return posts[0] || null
  }
}

export async function getPostsByPage(page: number = 1, perPage: number = 10): Promise<{
  posts: Post[]
  total: number
  totalPages: number
  currentPage: number
}> {
  const allPosts = await getAllPosts()
  const total = allPosts.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const end = start + perPage
  const posts = allPosts.slice(start, end)

  return {
    posts,
    total,
    totalPages,
    currentPage: page,
  }
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const supabase = getSupabaseAdmin()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featured_image: data.featured_image || null,
      category_id: data.category_id || null,
      author_id: data.author_id,
      status: data.status,
      published_at: data.status === 'published' ? (data.published_at || new Date().toISOString()) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    throw new Error(`Failed to create post: ${error.message}`)
  }

  return post as Post
}

export async function updatePost(id: number | string, data: UpdatePostData): Promise<Post> {
  const supabase = getSupabaseAdmin()

  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString()
  }

  // If publishing, set published_at
  if (data.status === 'published' && !data.published_at) {
    updateData.published_at = new Date().toISOString()
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', Number(id))
    .select()
    .single()

  if (error) {
    console.error('Error updating post:', error)
    throw new Error(`Failed to update post: ${error.message}`)
  }

  return post as Post
}

export async function deletePost(id: number | string): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', Number(id))

  if (error) {
    console.error('Error deleting post:', error)
    throw new Error(`Failed to delete post: ${error.message}`)
  }

  return true
}

// ============================================
// Category Functions
// ============================================

export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error fetching categories:', error)
      throw error
    }

    return (data || []) as Category[]
  } catch (error) {
    console.error('Error in getAllCategories:', error)
    return []
  }
}

export async function getCategoryById(id: number | string): Promise<Category | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data as Category | null
  } catch (error) {
    console.error('Error in getCategoryById:', error)
    return null
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data as Category | null
  } catch (error) {
    console.error('Error in getCategoryBySlug:', error)
    return null
  }
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const supabase = getSupabaseAdmin()

  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw new Error(`Failed to create category: ${error.message}`)
  }

  return category as Category
}

export async function updateCategory(id: number | string, data: UpdateCategoryData): Promise<Category> {
  const supabase = getSupabaseAdmin()

  const { data: category, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', Number(id))
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    throw new Error(`Failed to update category: ${error.message}`)
  }

  return category as Category
}

export async function deleteCategory(id: number | string): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', Number(id))

  if (error) {
    console.error('Error deleting category:', error)
    throw new Error(`Failed to delete category: ${error.message}`)
  }

  return true
}

// ============================================
// Page Functions (for static pages)
// ============================================

export async function getPageBySlug(slug: string): Promise<Post | null> {
  const pages = await loadPages()
  return pages.find((page) => page.slug === slug) || null
}

// ============================================
// Utility Functions
// ============================================

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getExcerpt(content: string, maxLength: number = 160): string {
  const text = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength).trim() + '...'
}
