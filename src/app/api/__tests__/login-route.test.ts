import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/auth/login/route';

describe('Login API Route', () => {
  let mockRequest: NextRequest;
  let mockEnv: any;
  let mockCookies: any;
  let mockLoginUser: any;
  
  beforeEach(() => {
    // Mock the request object
    mockCookies = {
      set: vi.fn()
    };
    
    mockRequest = {
      json: vi.fn(),
      cookies: {
        get: vi.fn(),
        set: vi.fn()
      },
      cf: {
        env: {
          DB: {}
        }
      }
    } as unknown as NextRequest;
    
    // Mock the NextResponse
    vi.mock('next/server', async () => {
      const actual = await vi.importActual('next/server');
      return {
        ...actual,
        NextResponse: {
          json: vi.fn().mockImplementation((body, options) => {
            return {
              cookies: mockCookies,
              body,
              status: options?.status
            };
          })
        }
      };
    });
    
    // Mock the user service
    vi.mock('@/lib/user-service', async () => {
      return {
        loginUser: vi.fn()
      };
    });
    
    // Import after mocking
    const userService = await import('@/lib/user-service');
    mockLoginUser = userService.loginUser;
  });
  
  it('should return 400 if email or password is missing', async () => {
    // Setup
    mockRequest.json.mockResolvedValueOnce({});
    
    // Execute
    const response = await POST(mockRequest);
    
    // Verify
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Email and password are required');
  });
  
  it('should return 401 if login fails', async () => {
    // Setup
    mockRequest.json.mockResolvedValueOnce({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    mockLoginUser.mockResolvedValueOnce({
      success: false,
      message: 'Invalid email or password'
    });
    
    // Execute
    const response = await POST(mockRequest);
    
    // Verify
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid email or password');
  });
  
  it('should return 200 and set cookie if login succeeds', async () => {
    // Setup
    mockRequest.json.mockResolvedValueOnce({
      email: 'test@example.com',
      password: 'correctpassword'
    });
    
    mockLoginUser.mockResolvedValueOnce({
      success: true,
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'user'
      },
      token: 'mock_token'
    });
    
    // Execute
    const response = await POST(mockRequest);
    
    // Verify
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(mockCookies.set).toHaveBeenCalledWith(expect.objectContaining({
      name: 'auth_token',
      value: 'mock_token'
    }));
  });
});
