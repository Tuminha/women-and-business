import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { getAllExclusiveContent, getExclusiveContentById, createExclusiveContent, updateExclusiveContent, deleteExclusiveContent } from '@/lib/exclusive-content-service';

// Mock D1 database
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn()
};

describe('Exclusive Content Service', () => {
  beforeAll(() => {
    // Setup mocks
    vi.mock('@cloudflare/workers-types');
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('createExclusiveContent', () => {
    it('should create new exclusive content successfully', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const mockContent = {
        id: 1,
        title: 'Exclusive Article',
        content: 'This is exclusive content for members only',
        type: 'article',
        fileUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDb.all.mockResolvedValueOnce({ results: [mockContent] });

      // Execute
      const result = await createExclusiveContent(mockDb as any, {
        title: 'Exclusive Article',
        content: 'This is exclusive content for members only',
        type: 'article'
      });

      // Verify
      expect(result).toBeDefined();
      expect(result?.title).toBe('Exclusive Article');
      expect(result?.type).toBe('article');
    });

    it('should return null when creation fails', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: false });

      // Execute
      const result = await createExclusiveContent(mockDb as any, {
        title: 'Failed Content',
        content: 'This content will fail to create',
        type: 'article'
      });

      // Verify
      expect(result).toBeNull();
    });
  });

  describe('getExclusiveContentById', () => {
    it('should return content when it exists', async () => {
      // Setup
      const mockContent = {
        id: 1,
        title: 'Exclusive Article',
        content: 'This is exclusive content for members only',
        type: 'article',
        fileUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDb.first.mockResolvedValueOnce(mockContent);

      // Execute
      const result = await getExclusiveContentById(mockDb as any, 1);

      // Verify
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Exclusive Article');
    });

    it('should return null when content does not exist', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce(null);

      // Execute
      const result = await getExclusiveContentById(mockDb as any, 999);

      // Verify
      expect(result).toBeNull();
    });
  });

  describe('getAllExclusiveContent', () => {
    it('should return content with pagination info', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ total: 8 });
      
      const mockContent = [
        {
          id: 1,
          title: 'Article One',
          content: 'Content one',
          type: 'article',
          fileUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          title: 'Video Tutorial',
          content: 'Video description',
          type: 'video',
          fileUrl: 'https://example.com/video.mp4',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockContent });

      // Execute
      const result = await getAllExclusiveContent(mockDb as any, { limit: 10, offset: 0 });

      // Verify
      expect(result.content).toHaveLength(2);
      expect(result.total).toBe(8);
      expect(result.content[0].title).toBe('Article One');
      expect(result.content[1].type).toBe('video');
    });

    it('should filter content by type', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ total: 3 });
      
      const mockContent = [
        {
          id: 2,
          title: 'Video Tutorial',
          content: 'Video description',
          type: 'video',
          fileUrl: 'https://example.com/video.mp4',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockContent });

      // Execute
      const result = await getAllExclusiveContent(mockDb as any, { type: 'video' });

      // Verify
      expect(result.content).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.content[0].type).toBe('video');
    });
  });

  describe('updateExclusiveContent', () => {
    it('should update content successfully', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const updatedContent = {
        id: 1,
        title: 'Updated Title',
        content: 'Updated content',
        type: 'article',
        fileUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDb.first.mockResolvedValueOnce(updatedContent);

      // Execute
      const result = await updateExclusiveContent(mockDb as any, 1, {
        title: 'Updated Title',
        content: 'Updated content'
      });

      // Verify
      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.content).toBe('Updated content');
    });
  });

  describe('deleteExclusiveContent', () => {
    it('should delete content successfully', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: true });

      // Execute
      const result = await deleteExclusiveContent(mockDb as any, 1);

      // Verify
      expect(result).toBe(true);
    });

    it('should return false when deletion fails', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: false });

      // Execute
      const result = await deleteExclusiveContent(mockDb as any, 999);

      // Verify
      expect(result).toBe(false);
    });
  });
});
