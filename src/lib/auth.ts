import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

// Authentication utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// User types
export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  auth_id?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  profileImage?: string | null;
  createdAt: string | Date;
  lastLogin?: string | Date | null;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// JWT token utilities
export function generateToken(user: User): string {
  const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || '');
  
  // Create JWT token with user data
  const token = new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    auth_id: user.auth_id
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(jwtSecret);
  
  return token;
}

export async function verifyToken(token: string): Promise<any> {
  const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || '');
  
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Get auth token from request
export function getAuthToken(request: NextRequest): string | null {
  // Check for auth token in cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // If no cookie token, check Authorization header
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
  
  return token;
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = getAuthToken(request);
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = await verifyToken(token);
    
    if (!payload) {
      return null;
    }
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      auth_id: payload.auth_id,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
