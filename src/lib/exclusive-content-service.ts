import { D1Database } from '@cloudflare/workers-types';

export interface ExclusiveContent {
  id: number;
  title: string;
  content: string;
  type: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExclusiveContentData {
  title: string;
  content: string;
  type: string;
  fileUrl?: string;
}

export interface UpdateExclusiveContentData {
  title?: string;
  content?: string;
  type?: string;
  fileUrl?: string;
}

// Exclusive content CRUD operations
export async function createExclusiveContent(db: D1Database, data: CreateExclusiveContentData): Promise<ExclusiveContent | null> {
  try {
    const { title, content, type, fileUrl } = data;
    
    // Insert exclusive content
    const result = await db.prepare(`
      INSERT INTO exclusive_content (title, content, type, file_url)
      VALUES (?, ?, ?, ?)
    `)
      .bind(title, content, type, fileUrl || null)
      .run();
    
    if (!result.success) {
      return null;
    }
    
    // Get the newly created content
    const { results } = await db.prepare(`
      SELECT 
        id, title, content, type, file_url as fileUrl,
        created_at as createdAt, updated_at as updatedAt
      FROM exclusive_content
      ORDER BY created_at DESC
      LIMIT 1
    `).all<ExclusiveContent>();
    
    return results[0] || null;
  } catch (error) {
    console.error('Create exclusive content error:', error);
    return null;
  }
}

export async function getExclusiveContentById(db: D1Database, contentId: number): Promise<ExclusiveContent | null> {
  try {
    const content = await db.prepare(`
      SELECT 
        id, title, content, type, file_url as fileUrl,
        created_at as createdAt, updated_at as updatedAt
      FROM exclusive_content
      WHERE id = ?
    `)
      .bind(contentId)
      .first<ExclusiveContent>();
    
    return content || null;
  } catch (error) {
    console.error('Get exclusive content by ID error:', error);
    return null;
  }
}

export async function getAllExclusiveContent(db: D1Database, options: {
  limit?: number;
  offset?: number;
  type?: string;
} = {}): Promise<{ content: ExclusiveContent[]; total: number }> {
  try {
    const {
      limit = 10,
      offset = 0,
      type
    } = options;
    
    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    
    if (type) {
      conditions.push('type = ?');
      values.push(type);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM exclusive_content ${whereClause}`;
    const countResult = await db.prepare(countQuery).bind(...values).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // Get content
    const query = `
      SELECT 
        id, title, content, type, file_url as fileUrl,
        created_at as createdAt, updated_at as updatedAt
      FROM exclusive_content
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const { results } = await db.prepare(query)
      .bind(...values, limit, offset)
      .all<ExclusiveContent>();
    
    return { content: results, total };
  } catch (error) {
    console.error('Get all exclusive content error:', error);
    return { content: [], total: 0 };
  }
}

export async function updateExclusiveContent(db: D1Database, contentId: number, data: UpdateExclusiveContentData): Promise<ExclusiveContent | null> {
  try {
    const { title, content, type, fileUrl } = data;
    
    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    
    if (fileUrl !== undefined) {
      updates.push('file_url = ?');
      values.push(fileUrl);
    }
    
    if (updates.length === 0) {
      // Nothing to update
      return await getExclusiveContentById(db, contentId);
    }
    
    // Add updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add contentId for WHERE clause
    values.push(contentId);
    
    // Execute update
    const query = `UPDATE exclusive_content SET ${updates.join(', ')} WHERE id = ?`;
    const result = await db.prepare(query).bind(...values).run();
    
    if (!result.success) {
      return null;
    }
    
    // Get the updated content
    return await getExclusiveContentById(db, contentId);
  } catch (error) {
    console.error('Update exclusive content error:', error);
    return null;
  }
}

export async function deleteExclusiveContent(db: D1Database, contentId: number): Promise<boolean> {
  try {
    const result = await db.prepare('DELETE FROM exclusive_content WHERE id = ?')
      .bind(contentId)
      .run();
    
    return result.success;
  } catch (error) {
    console.error('Delete exclusive content error:', error);
    return false;
  }
}
