#!/usr/bin/env node
/**
 * Extract all WordPress data from SQL dump
 * Extracts: posts, pages, users, categories, tags, comments, post_meta
 * 
 * Usage: node scripts/extract-wordpress-data.js backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql
 */

const fs = require('fs');
const path = require('path');

const TABLE_PREFIX = '_3YO_';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'extracted_data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Parse SQL VALUES row
 */
function parseSQLValues(rowStr) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
    } else if (char === '\\' && inString) {
      if (i + 1 < rowStr.length) {
        const next = rowStr[i + 1];
        if (next === "'" || next === '"' || next === '\\' || next === 'n' || next === 'r' || next === 't') {
          escapeNext = true;
          continue;
        }
      }
      current += char;
    } else if (char === "'" && !inString) {
      inString = true;
    } else if (char === "'" && inString) {
      // Check for escaped quote
      if (i + 1 < rowStr.length && rowStr[i + 1] === "'") {
        current += "'";
        i++; // Skip next quote
      } else {
        inString = false;
      }
    } else if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    values.push(current.trim());
  }
  
  return values;
}

/**
 * Clean content - remove quotes, unescape
 */
function cleanContent(content) {
  if (!content || content === 'NULL' || content === 'null') {
    return '';
  }
  
  // Remove outer quotes
  if ((content.startsWith("'") && content.endsWith("'")) ||
      (content.startsWith('"') && content.endsWith('"'))) {
    content = content.slice(1, -1);
  }
  
  // Unescape SQL strings
  content = content.replace(/\\'/g, "'");
  content = content.replace(/\\"/g, '"');
  content = content.replace(/\\\\/g, '\\');
  content = content.replace(/\\n/g, '\n');
  content = content.replace(/\\r/g, '\r');
  content = content.replace(/\\t/g, '\t');
  
  return content;
}

/**
 * Extract data from INSERT statements
 * Handles both formats:
 * - INSERT INTO `table` VALUES (...)
 * - INSERT INTO `table` (`col1`, `col2`) VALUES (...)
 */
function extractTableData(sqlContent, tableName) {
  const data = [];
  // Match INSERT INTO with optional column list, then VALUES
  // Use [\s\S] instead of . to match newlines, and make it non-greedy until semicolon
  const pattern = new RegExp(
    `INSERT INTO \\\`${TABLE_PREFIX}${tableName}\\\`[\\s\\S]*?VALUES\\s*([\\s\\S]*?);`,
    'gi'
  );
  
  const matches = sqlContent.matchAll(pattern);
  
  for (const match of matches) {
    const valuesBlock = match[1];
    
    // Split into rows - handle nested parentheses
    const rows = [];
    let currentRow = '';
    let parenDepth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < valuesBlock.length; i++) {
      const char = valuesBlock[i];
      
      if (escapeNext) {
        currentRow += char;
        escapeNext = false;
      } else if (char === '\\' && inString) {
        escapeNext = true;
        currentRow += char;
      } else if (char === "'" && !escapeNext) {
        inString = !inString;
        currentRow += char;
      } else if (char === '(' && !inString) {
        if (parenDepth === 0) {
          currentRow = '(';
        } else {
          currentRow += char;
        }
        parenDepth++;
      } else if (char === ')' && !inString) {
        currentRow += char;
        parenDepth--;
        if (parenDepth === 0) {
          rows.push(currentRow);
          currentRow = '';
        }
      } else if (char === ',' && parenDepth === 0 && !inString) {
        // Skip commas between rows
        continue;
      } else {
        currentRow += char;
      }
    }
    
    // Parse each row
    for (const rowStr of rows) {
      if (!rowStr.trim()) continue;
      
      try {
        let cleanRow = rowStr.trim();
        if (cleanRow.startsWith('(') && cleanRow.endsWith(')')) {
          cleanRow = cleanRow.slice(1, -1);
        }
        
        const values = parseSQLValues(cleanRow);
        
        if (tableName === 'posts') {
          // WordPress posts: ID, post_author, post_date, post_date_gmt, post_content, post_title,
          // post_excerpt, post_status, comment_status, ping_status, post_password,
          // post_name, to_ping, pinged, post_modified, post_modified_gmt,
          // post_content_filtered, post_parent, guid, menu_order, post_type,
          // post_mime_type, comment_count
          if (values.length < 23) continue;
          
          const postType = cleanContent(values[20] || 'post');
          const postStatus = cleanContent(values[7] || 'draft');
          
          // Only published content
          if (postStatus !== 'publish') continue;
          
          data.push({
            id: parseInt(cleanContent(values[0])) || 0,
            author_id: parseInt(cleanContent(values[1])) || 0,
            date: cleanContent(values[2]) || '',
            date_gmt: cleanContent(values[3]) || '',
            content: cleanContent(values[4]) || '',
            title: cleanContent(values[5]) || '',
            excerpt: cleanContent(values[6]) || '',
            status: postStatus,
            comment_status: cleanContent(values[8]) || 'open',
            ping_status: cleanContent(values[9]) || 'open',
            password: cleanContent(values[10]) || '',
            slug: cleanContent(values[11]) || '',
            modified: cleanContent(values[14]) || '',
            modified_gmt: cleanContent(values[15]) || '',
            parent: parseInt(cleanContent(values[17])) || 0,
            guid: cleanContent(values[18]) || '',
            type: postType,
            mime_type: cleanContent(values[21]) || '',
            comment_count: parseInt(cleanContent(values[22])) || 0,
          });
        } else if (tableName === 'users') {
          // WordPress users: ID, user_login, user_pass, user_nicename, user_email,
          // user_url, user_registered, user_activation_key, user_status, display_name
          if (values.length < 10) continue;
          
          data.push({
            id: parseInt(cleanContent(values[0])) || 0,
            login: cleanContent(values[1]) || '',
            password: cleanContent(values[2]) || '', // We won't use this
            nicename: cleanContent(values[3]) || '',
            email: cleanContent(values[4]) || '',
            url: cleanContent(values[5]) || '',
            registered: cleanContent(values[6]) || '',
            activation_key: cleanContent(values[7]) || '',
            status: parseInt(cleanContent(values[8])) || 0,
            display_name: cleanContent(values[9]) || '',
          });
        } else if (tableName === 'comments') {
          // WordPress comments: comment_ID, comment_post_ID, comment_author, comment_author_email,
          // comment_author_url, comment_author_IP, comment_date, comment_date_gmt, comment_content,
          // comment_karma, comment_approved, comment_agent, comment_type, comment_parent, user_id
          if (values.length < 15) continue;
          
          const approved = cleanContent(values[10]) || '0';
          
          // Only approved comments
          if (approved !== '1') continue;
          
          data.push({
            id: parseInt(cleanContent(values[0])) || 0,
            post_id: parseInt(cleanContent(values[1])) || 0,
            author: cleanContent(values[2]) || '',
            author_email: cleanContent(values[3]) || '',
            author_url: cleanContent(values[4]) || '',
            author_ip: cleanContent(values[5]) || '',
            date: cleanContent(values[6]) || '',
            date_gmt: cleanContent(values[7]) || '',
            content: cleanContent(values[8]) || '',
            karma: parseInt(cleanContent(values[9])) || 0,
            approved: approved === '1',
            agent: cleanContent(values[11]) || '',
            type: cleanContent(values[12]) || 'comment',
            parent: parseInt(cleanContent(values[13])) || 0,
            user_id: parseInt(cleanContent(values[14])) || 0,
          });
        } else if (tableName === 'terms') {
          // WordPress terms: term_id, name, slug, term_group
          if (values.length < 4) continue;
          
          data.push({
            id: parseInt(cleanContent(values[0])) || 0,
            name: cleanContent(values[1]) || '',
            slug: cleanContent(values[2]) || '',
            group: parseInt(cleanContent(values[3])) || 0,
          });
        } else if (tableName === 'term_taxonomy') {
          // WordPress term_taxonomy: term_taxonomy_id, term_id, taxonomy, description, parent, count
          if (values.length < 6) continue;
          
          data.push({
            taxonomy_id: parseInt(cleanContent(values[0])) || 0,
            term_id: parseInt(cleanContent(values[1])) || 0,
            taxonomy: cleanContent(values[2]) || '',
            description: cleanContent(values[3]) || '',
            parent: parseInt(cleanContent(values[4])) || 0,
            count: parseInt(cleanContent(values[5])) || 0,
          });
        } else if (tableName === 'term_relationships') {
          // WordPress term_relationships: object_id, term_taxonomy_id, term_order
          if (values.length < 3) continue;
          
          data.push({
            object_id: parseInt(cleanContent(values[0])) || 0,
            term_taxonomy_id: parseInt(cleanContent(values[1])) || 0,
            term_order: parseInt(cleanContent(values[2])) || 0,
          });
        } else if (tableName === 'postmeta') {
          // WordPress postmeta: meta_id, post_id, meta_key, meta_value
          if (values.length < 4) continue;
          
          data.push({
            meta_id: parseInt(cleanContent(values[0])) || 0,
            post_id: parseInt(cleanContent(values[1])) || 0,
            meta_key: cleanContent(values[2]) || '',
            meta_value: cleanContent(values[3]) || '',
          });
        }
      } catch (error) {
        // Skip problematic rows
        continue;
      }
    }
  }
  
  return data;
}

/**
 * Main extraction function
 */
function extractAllData(sqlFilePath) {
  console.log(`Reading SQL file: ${sqlFilePath}`);
  
  let sqlContent;
  try {
    sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
  
  console.log(`File size: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nExtracting data...\n');
  
  // Extract all tables
  const posts = extractTableData(sqlContent, 'posts');
  const users = extractTableData(sqlContent, 'users');
  const comments = extractTableData(sqlContent, 'comments');
  const terms = extractTableData(sqlContent, 'terms');
  const termTaxonomy = extractTableData(sqlContent, 'term_taxonomy');
  const termRelationships = extractTableData(sqlContent, 'term_relationships');
  const postMeta = extractTableData(sqlContent, 'postmeta');
  
  // Separate posts and pages
  const blogPosts = posts.filter(p => p.type === 'post');
  const pages = posts.filter(p => p.type === 'page');
  
  // Build categories and tags from terms + taxonomy
  const categories = [];
  const tags = [];
  
  for (const tt of termTaxonomy) {
    const term = terms.find(t => t.id === tt.term_id);
    if (!term) continue;
    
    if (tt.taxonomy === 'category') {
      categories.push({
        id: term.id,
        name: term.name,
        slug: term.slug,
        description: tt.description,
        parent: tt.parent,
        count: tt.count,
      });
    } else if (tt.taxonomy === 'post_tag') {
      tags.push({
        id: term.id,
        name: term.name,
        slug: term.slug,
        description: tt.description,
        count: tt.count,
      });
    }
  }
  
  // Save all data to JSON files
  const outputFiles = {
    posts: blogPosts,
    pages: pages,
    users: users,
    categories: categories,
    tags: tags,
    comments: comments,
    term_relationships: termRelationships,
    post_meta: postMeta,
  };
  
  console.log('Extraction Summary:');
  console.log(`  Posts: ${blogPosts.length}`);
  console.log(`  Pages: ${pages.length}`);
  console.log(`  Users: ${users.length}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Tags: ${tags.length}`);
  console.log(`  Comments: ${comments.length}`);
  console.log(`  Post Meta: ${postMeta.length}`);
  console.log(`  Term Relationships: ${termRelationships.length}\n`);
  
  // Write JSON files
  for (const [filename, data] of Object.entries(outputFiles)) {
    const filePath = path.join(OUTPUT_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Saved ${data.length} items to ${filePath}`);
  }
  
  // Print samples
  if (blogPosts.length > 0) {
    console.log('\nSample post titles:');
    blogPosts.slice(0, 5).forEach(post => {
      console.log(`  - ${post.title.substring(0, 60)}...`);
    });
  }
  
  if (pages.length > 0) {
    console.log('\nSample page titles:');
    pages.slice(0, 5).forEach(page => {
      console.log(`  - ${page.title.substring(0, 60)}...`);
    });
  }
  
  if (categories.length > 0) {
    console.log('\nCategories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });
  }
  
  console.log('\n✓ Extraction complete!');
}

// Main
if (require.main === module) {
  const sqlFile = process.argv[2];
  
  if (!sqlFile) {
    console.error('Usage: node extract-wordpress-data.js <sql_file_path>');
    console.error('Example: node extract-wordpress-data.js backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql');
    process.exit(1);
  }
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`Error: File not found: ${sqlFile}`);
    process.exit(1);
  }
  
  extractAllData(sqlFile);
}

module.exports = { extractAllData, extractTableData };
