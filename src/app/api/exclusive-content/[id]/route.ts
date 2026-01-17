import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { verifyToken } from '@/lib/auth';

interface ExclusiveContent {
  id: number;
  title: string;
  content: string;
  type: string;
  file_url: string | null;
  created_at: string;
}

// GET handler for retrieving a single exclusive content item (authenticated users only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentId = parseInt(id, 10);

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

    // Get exclusive content from Supabase
    const supabase = getSupabaseClient();
    const { data: content, error } = await supabase
      .from('exclusive_content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error || !content) {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const contentId = parseInt(id, 10);

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

    const supabase = getSupabaseClient();

    // Check if content exists
    const { data: existingContent, error: fetchError } = await supabase
      .from('exclusive_content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (fetchError || !existingContent) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Partial<ExclusiveContent> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.fileUrl !== undefined) updateData.file_url = body.fileUrl;

    // Update content
    const { data: updatedContent, error: updateError } = await supabase
      .from('exclusive_content')
      .update(updateData)
      .eq('id', contentId)
      .select()
      .single();

    if (updateError || !updatedContent) {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentId = parseInt(id, 10);

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

    const supabase = getSupabaseClient();

    // Check if content exists
    const { data: existingContent, error: fetchError } = await supabase
      .from('exclusive_content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (fetchError || !existingContent) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    // Delete content
    const { error: deleteError } = await supabase
      .from('exclusive_content')
      .delete()
      .eq('id', contentId);

    if (deleteError) {
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
