import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInPosts, syncLinkedInPosts } from '@/lib/linkedin-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving LinkedIn posts
export async function GET(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    // Get LinkedIn posts
    const posts = await getLinkedInPosts(DB, limit);
    
    return NextResponse.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Get LinkedIn posts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve LinkedIn posts' },
      { status: 500 }
    );
  }
}

// POST handler for syncing LinkedIn posts (admin only)
export async function POST(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    const body = await request.json();
    
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
    
    // Get LinkedIn username
    const username = body.username || 'mariacudeiro';
    
    // Sync LinkedIn posts
    const savedPosts = await syncLinkedInPosts(DB, username);
    
    return NextResponse.json({
      success: true,
      posts: savedPosts,
      message: `Successfully synced ${savedPosts.length} LinkedIn posts`
    });
  } catch (error) {
    console.error('Sync LinkedIn posts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync LinkedIn posts' },
      { status: 500 }
    );
  }
}
