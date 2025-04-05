import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile } from '@/lib/user-service';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    const { valid, payload } = verifyToken(token);
    
    if (!valid || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Get user profile
    const user = await getUserById(DB, payload.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { DB } = request.cf.env;
    const body = await request.json();
    
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    const { valid, payload } = verifyToken(token);
    
    if (!valid || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Update user profile
    const success = await updateUserProfile(DB, payload.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      profileImage: body.profileImage
    });
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 400 }
      );
    }
    
    // Get updated user profile
    const updatedUser = await getUserById(DB, payload.id);
    
    return NextResponse.json(
      { 
        success: true, 
        user: updatedUser,
        message: 'Profile updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
