import { NextRequest, NextResponse } from 'next/server';
import { getContactMessageById, updateContactMessageStatus, deleteContactMessage } from '@/lib/contact-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving a single contact message (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messageId = parseInt(id, 10);

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

    // Get message
    const message = await getContactMessageById(messageId);

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Get contact message error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve contact message' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a contact message's status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const messageId = parseInt(id, 10);

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

    // Validate request body
    if (!body.status || !['unread', 'read', 'replied'].includes(body.status)) {
      return NextResponse.json(
        { success: false, message: 'Valid status (unread, read, or replied) is required' },
        { status: 400 }
      );
    }

    // Check if message exists
    const message = await getContactMessageById(messageId);

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Update message status
    const success = await updateContactMessageStatus(messageId, body.status);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to update message status' },
        { status: 500 }
      );
    }

    // Get updated message
    const updatedMessage = await getContactMessageById(messageId);

    return NextResponse.json({
      success: true,
      message: updatedMessage,
      statusMessage: 'Message status updated successfully'
    });
  } catch (error) {
    console.error('Update contact message status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update message status' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a contact message (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messageId = parseInt(id, 10);

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

    // Check if message exists
    const message = await getContactMessageById(messageId);

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Delete message
    const success = await deleteContactMessage(messageId);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
