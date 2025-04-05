import { D1Database } from '@cloudflare/workers-types';

export interface LinkedInPost {
  id: number;
  linkedinId: string;
  content: string;
  postUrl?: string;
  publishedAt?: Date;
  fetchedAt: Date;
}

// Mock function to fetch LinkedIn posts
// In a real implementation, this would use LinkedIn API or a scraping service
export async function fetchLatestLinkedInPosts(username: string): Promise<any[]> {
  try {
    // This is a mock implementation
    // In a real implementation, this would call LinkedIn API
    console.log(`Fetching LinkedIn posts for user: ${username}`);
    
    // Return mock data
    return [
      {
        linkedinId: 'post1',
        content: 'Excited to share my latest thoughts on female leadership in the corporate world!',
        postUrl: 'https://www.linkedin.com/in/mariacudeiro/post/1',
        publishedAt: new Date().toISOString()
      },
      {
        linkedinId: 'post2',
        content: 'Just published a new article on work-life balance for executive mothers.',
        postUrl: 'https://www.linkedin.com/in/mariacudeiro/post/2',
        publishedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];
  } catch (error) {
    console.error('Fetch LinkedIn posts error:', error);
    return [];
  }
}

// Save LinkedIn posts to database
export async function saveLinkedInPosts(db: D1Database, posts: any[]): Promise<LinkedInPost[]> {
  try {
    const savedPosts: LinkedInPost[] = [];
    
    for (const post of posts) {
      // Check if post already exists
      const existingPost = await db.prepare('SELECT id FROM linkedin_posts WHERE linkedin_id = ?')
        .bind(post.linkedinId)
        .first<{ id: number }>();
      
      if (existingPost) {
        // Post already exists, skip
        continue;
      }
      
      // Insert new post
      const result = await db.prepare(`
        INSERT INTO linkedin_posts (linkedin_id, content, post_url, published_at)
        VALUES (?, ?, ?, ?)
      `)
        .bind(
          post.linkedinId,
          post.content,
          post.postUrl || null,
          post.publishedAt || null
        )
        .run();
      
      if (result.success) {
        // Get the newly inserted post
        const newPost = await db.prepare(`
          SELECT 
            id, linkedin_id as linkedinId, content, post_url as postUrl,
            published_at as publishedAt, fetched_at as fetchedAt
          FROM linkedin_posts
          WHERE linkedin_id = ?
        `)
          .bind(post.linkedinId)
          .first<LinkedInPost>();
        
        if (newPost) {
          savedPosts.push(newPost);
        }
      }
    }
    
    return savedPosts;
  } catch (error) {
    console.error('Save LinkedIn posts error:', error);
    return [];
  }
}

// Get LinkedIn posts from database
export async function getLinkedInPosts(db: D1Database, limit: number = 5): Promise<LinkedInPost[]> {
  try {
    const { results } = await db.prepare(`
      SELECT 
        id, linkedin_id as linkedinId, content, post_url as postUrl,
        published_at as publishedAt, fetched_at as fetchedAt
      FROM linkedin_posts
      ORDER BY published_at DESC, fetched_at DESC
      LIMIT ?
    `)
      .bind(limit)
      .all<LinkedInPost>();
    
    return results;
  } catch (error) {
    console.error('Get LinkedIn posts error:', error);
    return [];
  }
}

// Sync LinkedIn posts (fetch and save)
export async function syncLinkedInPosts(db: D1Database, username: string): Promise<LinkedInPost[]> {
  try {
    // Fetch latest posts
    const latestPosts = await fetchLatestLinkedInPosts(username);
    
    // Save posts to database
    const savedPosts = await saveLinkedInPosts(db, latestPosts);
    
    // Return saved posts
    return savedPosts;
  } catch (error) {
    console.error('Sync LinkedIn posts error:', error);
    return [];
  }
}
