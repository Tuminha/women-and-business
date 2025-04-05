import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { getLinkedInPosts, syncLinkedInPosts, fetchLatestLinkedInPosts, saveLinkedInPosts } from '@/lib/linkedin-service';

// Mock D1 database
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn()
};

describe('LinkedIn Service', () => {
  beforeAll(() => {
    // Setup mocks
    vi.mock('@cloudflare/workers-types');
    
    // Mock console.log for fetchLatestLinkedInPosts function
    global.console.log = vi.fn();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('fetchLatestLinkedInPosts', () => {
    it('should fetch LinkedIn posts for a user (mock implementation)', async () => {
      // Execute
      const result = await fetchLatestLinkedInPosts('mariacudeiro');

      // Verify
      expect(result).toHaveLength(2);
      expect(result[0].linkedinId).toBe('post1');
      expect(result[1].linkedinId).toBe('post2');
      expect(console.log).toHaveBeenCalledWith('Fetching LinkedIn posts for user: mariacudeiro');
    });
  });

  describe('saveLinkedInPosts', () => {
    it('should save new LinkedIn posts to database', async () => {
      // Setup
      const mockPosts = [
        {
          linkedinId: 'post1',
          content: 'Post content 1',
          postUrl: 'https://linkedin.com/post1',
          publishedAt: new Date().toISOString()
        },
        {
          linkedinId: 'post2',
          content: 'Post content 2',
          postUrl: 'https://linkedin.com/post2',
          publishedAt: new Date().toISOString()
        }
      ];
      
      // First post doesn't exist yet
      mockDb.first.mockResolvedValueOnce(null);
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const savedPost1 = {
        id: 1,
        linkedinId: 'post1',
        content: 'Post content 1',
        postUrl: 'https://linkedin.com/post1',
        publishedAt: new Date(),
        fetchedAt: new Date()
      };
      
      mockDb.first.mockResolvedValueOnce(savedPost1);
      
      // Second post already exists
      mockDb.first.mockResolvedValueOnce({ id: 2 });

      // Execute
      const result = await saveLinkedInPosts(mockDb as any, mockPosts);

      // Verify
      expect(result).toHaveLength(1); // Only one new post saved
      expect(result[0].linkedinId).toBe('post1');
    });
  });

  describe('getLinkedInPosts', () => {
    it('should retrieve LinkedIn posts from database', async () => {
      // Setup
      const mockPosts = [
        {
          id: 1,
          linkedinId: 'post1',
          content: 'Post content 1',
          postUrl: 'https://linkedin.com/post1',
          publishedAt: new Date(),
          fetchedAt: new Date()
        },
        {
          id: 2,
          linkedinId: 'post2',
          content: 'Post content 2',
          postUrl: 'https://linkedin.com/post2',
          publishedAt: new Date(),
          fetchedAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockPosts });

      // Execute
      const result = await getLinkedInPosts(mockDb as any, 5);

      // Verify
      expect(result).toHaveLength(2);
      expect(result[0].linkedinId).toBe('post1');
      expect(result[1].linkedinId).toBe('post2');
    });
  });

  describe('syncLinkedInPosts', () => {
    it('should fetch and save LinkedIn posts', async () => {
      // Setup - Mock the fetchLatestLinkedInPosts and saveLinkedInPosts functions
      const mockFetchedPosts = [
        {
          linkedinId: 'post1',
          content: 'Post content 1',
          postUrl: 'https://linkedin.com/post1',
          publishedAt: new Date().toISOString()
        }
      ];
      
      const mockSavedPosts = [
        {
          id: 1,
          linkedinId: 'post1',
          content: 'Post content 1',
          postUrl: 'https://linkedin.com/post1',
          publishedAt: new Date(),
          fetchedAt: new Date()
        }
      ];
      
      // Mock the implementation of fetchLatestLinkedInPosts and saveLinkedInPosts
      vi.spyOn(global, 'fetchLatestLinkedInPosts').mockResolvedValueOnce(mockFetchedPosts);
      vi.spyOn(global, 'saveLinkedInPosts').mockResolvedValueOnce(mockSavedPosts);

      // Execute
      const result = await syncLinkedInPosts(mockDb as any, 'mariacudeiro');

      // Verify
      expect(result).toHaveLength(1);
      expect(result[0].linkedinId).toBe('post1');
    });
  });
});
