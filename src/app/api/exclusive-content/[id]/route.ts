import { NextRequest, NextResponse } from 'next/server';
import { getExclusiveContentById, updateExclusiveContent, deleteExclusiveContent, UpdateExclusiveContentData } from '@/lib/exclusive-content-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving a single exclusive content item (authenticated users only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { DB } = request.cf.env;
    const contentId = parseInt(params.id, 10);
    
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
    
    // Get exclusive content
    const content = await getExclusiveContentById(DB, contentId);
    
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Get exclusive content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve content' },
      { status: 500 }
    );
  }
}

// PUT handler for updating exclusive content (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { DB } = request.cf.env;
    const body = await request.json();
    const contentId = parseInt(params.id, 10);
    
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
    
    // Check if content exists
    const existingContent = await getExclusiveContentById(DB, contentId);
    
    if (!existingContent) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: UpdateExclusiveContentData = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl;
    
    // Update content
    const updatedContent = await updateExclusiveContent(DB, contentId, updateData);
    
    if (!updatedContent) {
      return NextResponse.json(
        { success: false, message: 'Failed to update content' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      content: updatedContent,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Update exclusive content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting exclusive content (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { DB } = request.cf.env;
    const contentId = parseInt(params.id, 10);
    
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
    
    // Check if content exists
    const existingContent = await getExclusiveContentById(DB, contentId);
    
    if (!existingContent) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Delete content
    const success = await deleteExclusiveContent(DB, contentId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete content' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete exclusive content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
