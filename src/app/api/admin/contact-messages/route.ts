import { NextRequest, NextResponse } from 'next/server';
import { getAllContactMessages, updateContactMessageStatus, deleteContactMessage } from '@/lib/contact-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    const { searchParams } = new URL(request.url);
    
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
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') as 'unread' | 'read' | 'replied' | 'all' || 'all';
    
    // Get contact messages
    const { messages, total } = await getAllContactMessages(DB, {
      limit,
      offset,
      status
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve contact messages' },
      { status: 500 }
    );
  }
}
