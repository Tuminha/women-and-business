import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { loginUser, registerUser } from '@/lib/user-service';
import { hashPassword } from '@/lib/auth';

// Mock D1 database
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn()
};

describe('Authentication Service', () => {
  beforeAll(() => {
    // Setup mocks
    vi.mock('@cloudflare/workers-types');
    vi.mock('@/lib/auth', async () => {
      const actual = await vi.importActual('@/lib/auth');
      return {
        ...actual,
        hashPassword: vi.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
        verifyPassword: vi.fn().mockImplementation((password, hashedPassword) => {
          return Promise.resolve(hashedPassword === `hashed_${password}`);
        }),
        generateToken: vi.fn().mockReturnValue('mock_token')
      };
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should return success and user data when credentials are valid', async () => {
      // Setup
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: null
      };

      mockDb.first.mockResolvedValueOnce(mockUser);
      mockDb.run.mockResolvedValueOnce({ success: true });

      // Execute
      const result = await loginUser(mockDb as any, {
        email: 'test@example.com',
        password: 'password123'
      });

      // Verify
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.token).toBe('mock_token');
    });

    it('should return failure when user does not exist', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce(null);

      // Execute
      const result = await loginUser(mockDb as any, {
        email: 'nonexistent@example.com',
        password: 'password123'
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid email or password');
    });

    it('should return failure when password is incorrect', async () => {
      // Setup
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashed_correctpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: null
      };

      mockDb.first.mockResolvedValueOnce(mockUser);

      // Execute
      const result = await loginUser(mockDb as any, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid email or password');
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce(null); // User doesn't exist yet
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const mockNewUser = {
        id: 2,
        email: 'new@example.com',
        passwordHash: 'hashed_newpassword',
        firstName: 'New',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: null
      };
      
      mockDb.first.mockResolvedValueOnce(mockNewUser);

      // Execute
      const result = await registerUser(mockDb as any, {
        email: 'new@example.com',
        password: 'newpassword',
        firstName: 'New',
        lastName: 'User'
      });

      // Verify
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('new@example.com');
      expect(result.token).toBe('mock_token');
      expect(hashPassword).toHaveBeenCalledWith('newpassword');
    });

    it('should return failure when user already exists', async () => {
      // Setup
      const existingUser = {
        id: 1,
        email: 'existing@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Existing',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: null
      };
      
      mockDb.first.mockResolvedValueOnce(existingUser);

      // Execute
      const result = await registerUser(mockDb as any, {
        email: 'existing@example.com',
        password: 'password',
        firstName: 'Existing',
        lastName: 'User'
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('Email already in use');
    });
  });
});
