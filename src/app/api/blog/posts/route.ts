import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost, CreatePostData } from '@/lib/blog-service';
import { getCurrentUser } from '@/lib/auth';

// GET handler for retrieving blog posts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') as 'draft' | 'published' | 'all' || 'published';
    const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category') || '0', 10) : undefined;
    
    // Check if request is from admin (for draft posts)
    const currentUser = await getCurrentUser(request);
    const isAdmin = currentUser?.role === 'admin';
    
    // Non-admins can only see published posts
    const effectiveStatus = isAdmin ? status : 'published';
    
    // Get posts
    const { posts, total } = await getAllPosts({
      limit,
      offset,
      status: effectiveStatus,
      categoryId
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve posts' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify admin authentication
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Prepare post data
    const postData: CreatePostData = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      featuredImage: body.featuredImage,
      categoryId: body.categoryId ? parseInt(body.categoryId, 10) : undefined,
      status: body.status as 'draft' | 'published' || 'draft'
    };
    
    // Create post
    const post = await createPost(currentUser.id, postData);
    
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Failed to create post' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, post, message: 'Post created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    );
  }
}
