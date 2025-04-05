import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/user-service';
import { LoginCredentials } from '@/lib/auth';

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
    
    const credentials: LoginCredentials = {
      email: body.email,
      password: body.password
    };
    
    // Attempt login
    const result = await loginUser(credentials);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // Set cookie with token
    const response = NextResponse.json(
      { 
        success: true, 
        user: result.user,
        message: 'Login successful'
      },
      { status: 200 }
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
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
