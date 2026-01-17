import { NextRequest, NextResponse } from 'next/server';
import { getPostById, getPostBySlug, updatePost, deletePost, UpdatePostData } from '@/lib/blog-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving a single blog post by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let post;

    // Check if id is numeric (post ID) or string (slug)
    if (/^\d+$/.test(id)) {
      post = await getPostById(parseInt(id, 10));
    } else {
      post = await getPostBySlug(id);
    }

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if post is draft and user is not admin
    if (post.status === 'draft') {
      const token = request.cookies.get('auth_token')?.value;
      let isAdmin = false;

      if (token) {
        const { valid, payload } = verifyToken(token);
        if (valid && payload && payload.role === 'admin') {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        return NextResponse.json(
          { success: false, message: 'Post not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve post' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const postId = parseInt(id, 10);

    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { valid, payload } = verifyToken(token);

    if (!valid || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Check if post exists
    const existingPost = await getPostById(postId);

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: UpdatePostData = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.featuredImage !== undefined) updateData.featured_image = body.featuredImage;
    if (body.categoryId !== undefined) updateData.category_id = body.categoryId ? parseInt(body.categoryId, 10) : undefined;
    if (body.status !== undefined) updateData.status = body.status as 'draft' | 'published';

    // Update post
    const updatedPost = await updatePost(postId, updateData);

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, message: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { valid, payload } = verifyToken(token);

    if (!valid || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Check if post exists
    const existingPost = await getPostById(postId);

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete post
    const success = await deletePost(postId);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
