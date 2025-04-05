import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createPost, updatePost, getPostById, getPostBySlug, getAllPosts, deletePost } from '@/lib/blog-service';

// Mock D1 database
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn()
};

describe('Blog Service', () => {
  beforeAll(() => {
    // Setup mocks
    vi.mock('@cloudflare/workers-types');
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a new blog post successfully', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce(null); // Slug doesn't exist yet
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const mockNewPost = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        featuredImage: 'image.jpg',
        categoryId: 1,
        authorId: 1,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDb.first.mockResolvedValueOnce(mockNewPost);

      // Execute
      const result = await createPost(mockDb as any, 1, {
        title: 'Test Post',
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        featuredImage: 'image.jpg',
        categoryId: 1
      });

      // Verify
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Post');
      expect(result?.slug).toBe('test-post');
      expect(result?.status).toBe('draft');
    });

    it('should generate a unique slug when one already exists', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ id: 1 }); // Slug exists
      mockDb.first.mockResolvedValueOnce(null); // Second attempt is unique
      mockDb.run.mockResolvedValueOnce({ success: true });
      
      const mockNewPost = {
        id: 2,
        title: 'Test Post',
        slug: 'test-post-1',
        content: 'This is another test post',
        authorId: 1,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDb.first.mockResolvedValueOnce(mockNewPost);

      // Execute
      const result = await createPost(mockDb as any, 1, {
        title: 'Test Post',
        content: 'This is another test post'
      });

      // Verify
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Post');
      expect(result?.slug).toBe('test-post-1');
    });
  });

  describe('getPostById', () => {
    it('should return a post when it exists', async () => {
      // Setup
      const mockPost = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Content',
        authorId: 1,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDb.first.mockResolvedValueOnce(mockPost);

      // Execute
      const result = await getPostById(mockDb as any, 1);

      // Verify
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Test Post');
    });

    it('should return null when post does not exist', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce(null);

      // Execute
      const result = await getPostById(mockDb as any, 999);

      // Verify
      expect(result).toBeNull();
    });
  });

  describe('getAllPosts', () => {
    it('should return posts with pagination info', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ total: 15 });
      
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          content: 'Content 1',
          authorId: 1,
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          content: 'Content 2',
          authorId: 1,
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockPosts });

      // Execute
      const result = await getAllPosts(mockDb as any, { limit: 10, offset: 0 });

      // Verify
      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(15);
      expect(result.posts[0].title).toBe('Post 1');
      expect(result.posts[1].title).toBe('Post 2');
    });

    it('should filter posts by status', async () => {
      // Setup
      mockDb.first.mockResolvedValueOnce({ total: 5 });
      
      const mockPosts = [
        {
          id: 3,
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Draft content',
          authorId: 1,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockDb.all.mockResolvedValueOnce({ results: mockPosts });

      // Execute
      const result = await getAllPosts(mockDb as any, { status: 'draft' });

      // Verify
      expect(result.posts).toHaveLength(1);
      expect(result.total).toBe(5);
      expect(result.posts[0].status).toBe('draft');
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      // Setup
      const originalPost = {
        id: 1,
        title: 'Original Title',
        slug: 'original-title',
        content: 'Original content',
        authorId: 1,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedPost = {
        ...originalPost,
        title: 'Updated Title',
        slug: 'updated-title',
        content: 'Updated content'
      };
      
      mockDb.run.mockResolvedValueOnce({ success: true });
      mockDb.first.mockResolvedValueOnce(updatedPost);

      // Execute
      const result = await updatePost(mockDb as any, 1, {
        title: 'Updated Title',
        content: 'Updated content'
      });

      // Verify
      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.content).toBe('Updated content');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: true });

      // Execute
      const result = await deletePost(mockDb as any, 1);

      // Verify
      expect(result).toBe(true);
    });

    it('should return false when deletion fails', async () => {
      // Setup
      mockDb.run.mockResolvedValueOnce({ success: false });

      // Execute
      const result = await deletePost(mockDb as any, 999);

      // Verify
      expect(result).toBe(false);
    });
  });
});
