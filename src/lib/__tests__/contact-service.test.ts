import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createContactMessage, getAllContactMessages, updateContactMessageStatus, sendEmail } from '@/lib/contact-service';

// Mock D1 database
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn()
};

describe('Contact Service', () => {
  beforeAll(() => {
    // Setup mocks
    vi.mock('@cloudflare/workers-types');
    
    // Mock console.log for sendEmail function
    global.console.log = vi.fn();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('createContactMessage', () => {
    it('should create a new contact message successfully', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const mockNewMessage = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        status: 'unread',
        createdAt: new Date()
      };
      
      mockDb.all.mockResolvedValueOnce({ results: [mockNewMessage] });

      // Execute
      const result = await createContactMessage(mockDb as any, {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      });

      // Verify
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test User');
      expect(result?.email).toBe('test@example.com');
      expect(result?.status).toBe('unread');
    });

    it('should return null when creation fails', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: false });

      // Execute
      const result = await createContactMessage(mockDb as any, {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      });

      // Verify
      expect(result).toBeNull();
    });
  });

  describe('getAllContactMessages', () => {
    it('should return messages with pagination info', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ total: 10 });
      
      const mockMessages = [
        {
          id: 1,
          name: 'User One',
          email: 'user1@example.com',
          message: 'Message one',
          status: 'unread',
          createdAt: new Date()
        },
        {
          id: 2,
          name: 'User Two',
          email: 'user2@example.com',
          message: 'Message two',
          status: 'read',
          createdAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockMessages });

      // Execute
      const result = await getAllContactMessages(mockDb as any, { limit: 10, offset: 0 });

      // Verify
      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.messages[0].name).toBe('User One');
      expect(result.messages[1].name).toBe('User Two');
    });

    it('should filter messages by status', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ total: 5 });
      
      const mockMessages = [
        {
          id: 3,
          name: 'User Three',
          email: 'user3@example.com',
          message: 'Message three',
          status: 'unread',
          createdAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockMessages });

      // Execute
      const result = await getAllContactMessages(mockDb as any, { status: 'unread' });

      // Verify
      expect(result.messages).toHaveLength(1);
      expect(result.total).toBe(5);
      expect(result.messages[0].status).toBe('unread');
    });
  });

  describe('updateContactMessageStatus', () => {
    it('should update message status successfully', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: true });

      // Execute
      const result = await updateContactMessageStatus(mockDb as any, 1, 'read');

      // Verify
      expect(result).toBe(true);
    });

    it('should return false when update fails', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: false });

      // Execute
      const result = await updateContactMessageStatus(mockDb as any, 999, 'read');

      // Verify
      expect(result).toBe(false);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully (mock implementation)', async () => {
      // Execute
      const result = await sendEmail(
        'cudeiromaria@gmail.com',
        'Test Subject',
        'Test Body'
      );

      // Verify
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Sending email to: cudeiromaria@gmail.com');
      expect(console.log).toHaveBeenCalledWith('Subject: Test Subject');
      expect(console.log).toHaveBeenCalledWith('Body: Test Body');
    });
  });
});
