import { NextRequest, NextResponse } from 'next/server';
import { getAllExclusiveContent, createExclusiveContent, CreateExclusiveContentData } from '@/lib/exclusive-content-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving exclusive content (authenticated users only)
export async function GET(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    const { searchParams } = new URL(request.url);
    
    // Verify authentication
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
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    const type = searchParams.get('type') || undefined;
    
    // Get exclusive content
    const { content, total } = await getAllExclusiveContent(DB, {
      limit,
      offset,
      type
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      content,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get exclusive content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve exclusive content' },
      { status: 500 }
    );
  }
}

// POST handler for creating exclusive content (admin only)
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
    
    // Validate required fields
    if (!body.title || !body.content || !body.type) {
      return NextResponse.json(
        { success: false, message: 'Title, content, and type are required' },
        { status: 400 }
      );
    }
    
    // Prepare content data
    const contentData: CreateExclusiveContentData = {
      title: body.title,
      content: body.content,
      type: body.type,
      fileUrl: body.fileUrl
    };
    
    // Create exclusive content
    const content = await createExclusiveContent(DB, contentData);
    
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Failed to create exclusive content' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, content, message: 'Exclusive content created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create exclusive content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create exclusive content' },
      { status: 500 }
    );
  }
}
