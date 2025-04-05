import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from '@/lib/blog-service';
import { verifyToken } from '@/lib/auth';

// GET handler for retrieving all categories
export async function GET(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    
    // Get all categories
    const categories = await getAllCategories(DB);
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve categories' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new category (admin only)
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
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create category
    const category = await createCategory(DB, {
      name: body.name,
      description: body.description
    });
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Failed to create category' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, category, message: 'Category created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category' },
      { status: 500 }
    );
  }
}
