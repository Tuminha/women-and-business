import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/blog-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving a single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { DB } = request.cf.env;
    const categoryId = parseInt(params.id, 10);
    
    // Get category
    const category = await getCategoryById(DB, categoryId);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve category' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { DB } = request.cf.env;
    const body = await request.json();
    const categoryId = parseInt(params.id, 10);
    
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
    
    // Check if category exists
    const existingCategory = await getCategoryById(DB, categoryId);
    
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Update category
    const updatedCategory = await updateCategory(DB, categoryId, {
      name: body.name,
      description: body.description
    });
    
    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, message: 'Failed to update category' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { DB } = request.cf.env;
    const categoryId = parseInt(params.id, 10);
    
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
    
    // Check if category exists
    const existingCategory = await getCategoryById(DB, categoryId);
    
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Delete category
    const success = await deleteCategory(DB, categoryId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete category' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
