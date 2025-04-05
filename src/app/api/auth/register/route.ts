import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/user-service';
import { RegisterData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const userData: RegisterData = {
      email: body.email,
      password: body.password,
      firstName: body.firstName || undefined,
      lastName: body.lastName || undefined
    };
    
    // Attempt registration
    const result = await registerUser(userData);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Registration failed' },
        { status: 400 }
      );
    }
    
    // Set cookie with token
    const response = NextResponse.json(
      { 
        success: true, 
        user: result.user,
        message: 'Registration successful'
      },
      { status: 201 }
    );
    
    // Set HTTP-only cookie with token
    response.cookies.set({
      name: 'auth_token',
      value: result.token || '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
