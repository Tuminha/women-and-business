#!/usr/bin/env node

/**
 * Quick SQL Analysis Script
 * Analyzes WordPress SQL dump to count content
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'backup-1.5.2026_09-05-37_womanao0', 'mysql', 'womanao0_WP3YO.sql');

console.log('Reading SQL file...');
const sqlContent = fs.readFileSync(DB_FILE, 'utf8');

// Count post types - WordPress uses single quotes in SQL
const postTypeMatches = sqlContent.match(/post_type','([^']+)'/g) || [];
const postTypes = {};
postTypeMatches.forEach(match => {
  const typeMatch = match.match(/post_type','([^']+)'/);
  if (typeMatch) {
    const type = typeMatch[1];
    postTypes[type] = (postTypes[type] || 0) + 1;
  }
});

console.log('\nPost Types Found:');
Object.entries(postTypes).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

// Count users
const userMatches = sqlContent.match(/INSERT INTO `_3YO_users`/gi) || [];
console.log(`\nUser INSERT statements: ${userMatches.length}`);

// Count comments
const commentMatches = sqlContent.match(/INSERT INTO `_3YO_comments`/gi) || [];
console.log(`Comment INSERT statements: ${commentMatches.length}`);

// Sample a post to see structure
const firstPostMatch = sqlContent.match(/INSERT INTO `_3YO_posts`[^;]+;/);
if (firstPostMatch) {
  const firstPost = firstPostMatch[0].substring(0, 500);
  console.log('\nSample post (first 500 chars):');
  console.log(firstPost);
}
