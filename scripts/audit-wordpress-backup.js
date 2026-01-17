#!/usr/bin/env node

/**
 * WordPress Backup Audit Script
 * Analyzes the WordPress backup to create a comprehensive inventory
 * for migration to Next.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '..', 'backup-1.5.2026_09-05-37_womanao0');
const WP_DIR = path.join(BACKUP_DIR, 'homedir', 'public_html');
const UPLOADS_DIR = path.join(WP_DIR, 'wp-content', 'uploads');
const DB_FILE = path.join(BACKUP_DIR, 'mysql', 'womanao0_WP3YO.sql');
const OUTPUT_DIR = path.join(__dirname, '..', 'audit-results');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const report = {
  timestamp: new Date().toISOString(),
  backupLocation: BACKUP_DIR,
  checks: {
    backupExists: false,
    wordpressExists: false,
    databaseExists: false,
    uploadsExist: false,
  },
  stats: {
    uploads: {
      totalFiles: 0,
      totalSize: 0,
      byType: {},
      byYear: {},
    },
    database: {
      tables: [],
      posts: 0,
      pages: 0,
      categories: 0,
      tags: 0,
      authors: 0,
      comments: 0,
      media: 0,
    },
  },
  issues: [],
  recommendations: [],
};

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file size recursively
 */
function getDirSize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  const fileTypes = {};
  const byYear = {};

  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        const subDir = getDirSize(filePath);
        totalSize += subDir.size;
        fileCount += subDir.count;
        Object.keys(subDir.types).forEach(type => {
          fileTypes[type] = (fileTypes[type] || 0) + subDir.types[type];
        });
        Object.keys(subDir.byYear).forEach(year => {
          byYear[year] = (byYear[year] || 0) + subDir.byYear[year];
        });
      } else {
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fileCount++;

          const ext = path.extname(file.name).toLowerCase() || 'no-extension';
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;

          // Try to extract year from path (WordPress uploads are organized by year/month)
          const yearMatch = filePath.match(/\/(\d{4})\//);
          if (yearMatch) {
            const year = yearMatch[1];
            byYear[year] = (byYear[year] || 0) + 1;
          }
        } catch (err) {
          report.issues.push(`Error reading file ${filePath}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    report.issues.push(`Error reading directory ${dirPath}: ${err.message}`);
  }

  return { size: totalSize, count: fileCount, types: fileTypes, byYear };
}

/**
 * Analyze database SQL file
 */
function analyzeDatabase() {
  console.log('📊 Analyzing database...');
  
  if (!fs.existsSync(DB_FILE)) {
    report.issues.push('Database SQL file not found');
    return;
  }

  report.checks.databaseExists = true;

  try {
    // Read a portion of the SQL file to analyze structure
    const sqlContent = fs.readFileSync(DB_FILE, 'utf8');

    // Extract table names
    const tableMatches = sqlContent.match(/CREATE TABLE `[^`]+`/g);
    if (tableMatches) {
      report.stats.database.tables = tableMatches.map(match => {
        const tableMatch = match.match(/`([^`]+)`/);
        return tableMatch ? tableMatch[1] : null;
      }).filter(Boolean);
    }

    // Count posts (wp_posts table - WordPress uses table prefix)
    const postPrefix = '_3YO_'; // Based on the SQL structure we saw
    const postsMatch = sqlContent.match(new RegExp(`INSERT INTO \`${postPrefix}posts\``, 'gi'));
    if (postsMatch) {
      // Count INSERT statements for posts
      const postInserts = sqlContent.match(new RegExp(`INSERT INTO \`${postPrefix}posts\`[^;]+;`, 'g'));
      if (postInserts) {
        // Count individual post records (rough estimate)
        const allPostValues = postInserts.join(' ');
        const valueMatches = allPostValues.match(/VALUES\s*\(/g);
        report.stats.database.posts = valueMatches ? valueMatches.length : 0;
      }
    }

    // Try to extract more specific counts using grep-like approach
    // Count post_type='post'
    const postTypePost = (sqlContent.match(/post_type','post'/g) || []).length;
    const postTypePage = (sqlContent.match(/post_type','page'/g) || []).length;
    const postTypeAttachment = (sqlContent.match(/post_type','attachment'/g) || []).length;

    report.stats.database.posts = postTypePost;
    report.stats.database.pages = postTypePage;
    report.stats.database.media = postTypeAttachment;

    // Count categories
    const categoryMatches = sqlContent.match(new RegExp(`INSERT INTO \`${postPrefix}terms\``, 'gi'));
    if (categoryMatches) {
      report.stats.database.categories = categoryMatches.length;
    }

    // Count tags (taxonomy='post_tag')
    const tagMatches = sqlContent.match(/taxonomy','post_tag'/g);
    if (tagMatches) {
      report.stats.database.tags = tagMatches.length;
    }

    // Count comments
    const commentMatches = sqlContent.match(new RegExp(`INSERT INTO \`${postPrefix}comments\``, 'gi'));
    if (commentMatches) {
      report.stats.database.comments = commentMatches.length;
    }

    // Count users/authors
    const userMatches = sqlContent.match(new RegExp(`INSERT INTO \`${postPrefix}users\``, 'gi'));
    if (userMatches) {
      report.stats.database.authors = userMatches.length;
    }

    console.log(`   ✓ Found ${report.stats.database.posts} posts`);
    console.log(`   ✓ Found ${report.stats.database.pages} pages`);
    console.log(`   ✓ Found ${report.stats.database.media} media attachments`);
    console.log(`   ✓ Found ${report.stats.database.comments} comments`);
    console.log(`   ✓ Found ${report.stats.database.authors} authors`);
    console.log(`   ✓ Found ${report.stats.database.tables.length} database tables`);

  } catch (err) {
    report.issues.push(`Error analyzing database: ${err.message}`);
    console.error(`   ✗ Error: ${err.message}`);
  }
}

/**
 * Analyze uploads directory
 */
function analyzeUploads() {
  console.log('📁 Analyzing uploads directory...');

  if (!fs.existsSync(UPLOADS_DIR)) {
    report.issues.push('Uploads directory not found');
    return;
  }

  report.checks.uploadsExist = true;

  const uploadStats = getDirSize(UPLOADS_DIR);
  report.stats.uploads.totalFiles = uploadStats.count;
  report.stats.uploads.totalSize = uploadStats.size;
  report.stats.uploads.byType = uploadStats.types;
  report.stats.uploads.byYear = uploadStats.byYear;

  console.log(`   ✓ Total files: ${uploadStats.count}`);
  console.log(`   ✓ Total size: ${formatBytes(uploadStats.size)}`);
  console.log(`   ✓ Files by type:`, Object.keys(uploadStats.types).slice(0, 5).join(', '));
  console.log(`   ✓ Files by year:`, Object.keys(uploadStats.byYear).join(', '));
}

/**
 * Check WordPress installation
 */
function checkWordPressInstallation() {
  console.log('🔍 Checking WordPress installation...');

  const wpConfig = path.join(WP_DIR, 'wp-config.php');
  const wpContent = path.join(WP_DIR, 'wp-content');

  if (fs.existsSync(wpConfig)) {
    report.checks.wordpressExists = true;
    console.log('   ✓ WordPress installation found');
  } else {
    report.issues.push('wp-config.php not found');
    console.log('   ✗ wp-config.php not found');
  }

  if (fs.existsSync(wpContent)) {
    console.log('   ✓ wp-content directory found');
  } else {
    report.issues.push('wp-content directory not found');
    console.log('   ✗ wp-content directory not found');
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
  console.log('💡 Generating recommendations...');

  if (report.stats.database.posts > 0) {
    report.recommendations.push({
      type: 'migration',
      priority: 'high',
      message: `Migrate ${report.stats.database.posts} blog posts to MDX format`,
    });
  }

  if (report.stats.database.pages > 0) {
    report.recommendations.push({
      type: 'migration',
      priority: 'high',
      message: `Migrate ${report.stats.database.pages} static pages (Home, Acerca de mi, Blog, Contacto)`,
    });
  }

  if (report.stats.uploads.totalFiles > 0) {
    report.recommendations.push({
      type: 'media',
      priority: 'high',
      message: `Copy ${report.stats.uploads.totalFiles} media files (${formatBytes(report.stats.uploads.totalSize)}) to Next.js public directory`,
    });
  }

  if (report.stats.database.comments > 0) {
    report.recommendations.push({
      type: 'feature',
      priority: 'medium',
      message: `Consider migrating ${report.stats.database.comments} comments or implementing new comment system (e.g., Supabase)`,
    });
  }

  report.recommendations.push({
    type: 'structure',
    priority: 'high',
    message: 'Set up Next.js project structure with: /, /blog, /blog/[slug], /acerca-de-mi, /contacto, /categoria/[slug], /author/[slug]',
  });

  report.recommendations.push({
    type: 'content',
    priority: 'high',
    message: 'Create migration script to extract WordPress content (XML export or direct SQL query) and convert to MDX',
  });
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  const mdPath = path.join(OUTPUT_DIR, 'audit-report.md');
  let md = `# WordPress Backup Audit Report

**Generated:** ${report.timestamp}
**Backup Location:** ${report.backupLocation}

## Executive Summary

This report analyzes the WordPress backup for the "Woman & Business" site to prepare for migration to Next.js.

### Key Findings

- ✅ Backup structure: ${report.checks.backupExists ? 'Valid' : 'Invalid'}
- ✅ WordPress installation: ${report.checks.wordpressExists ? 'Found' : 'Not Found'}
- ✅ Database: ${report.checks.databaseExists ? 'Found' : 'Not Found'} (${formatBytes(fs.statSync(DB_FILE).size)})
- ✅ Media uploads: ${report.checks.uploadsExist ? 'Found' : 'Not Found'} (${formatBytes(report.stats.uploads.totalSize)})

## Content Statistics

### Posts and Pages
- **Blog Posts:** ${report.stats.database.posts}
- **Static Pages:** ${report.stats.database.pages}
- **Media Attachments:** ${report.stats.database.media}
- **Comments:** ${report.stats.database.comments}
- **Authors:** ${report.stats.database.authors}
- **Categories:** ${report.stats.database.categories}
- **Tags:** ${report.stats.database.tags}

### Media Files
- **Total Files:** ${report.stats.uploads.totalFiles}
- **Total Size:** ${formatBytes(report.stats.uploads.totalSize)}
- **Files by Type:**
${Object.entries(report.stats.uploads.byType)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([type, count]) => `  - ${type}: ${count}`)
  .join('\n')}
- **Files by Year:**
${Object.entries(report.stats.uploads.byYear)
  .sort((a, b) => b[0].localeCompare(a[0]))
  .map(([year, count]) => `  - ${year}: ${count}`)
  .join('\n')}

## Database Tables

Found ${report.stats.database.tables.length} tables:
${report.stats.database.tables.slice(0, 20).map(t => `- ${t}`).join('\n')}
${report.stats.database.tables.length > 20 ? `\n... and ${report.stats.database.tables.length - 20} more tables` : ''}

## Issues Found

${report.issues.length > 0 ? report.issues.map(issue => `- ⚠️ ${issue}`).join('\n') : '✅ No issues found'}

## Migration Recommendations

${report.recommendations
  .map(rec => {
    const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
    return `### ${priorityIcon} ${rec.type.toUpperCase()}: ${rec.message}`;
  })
  .join('\n\n')}

## Next Steps

1. **Extract Database Content**
   - Use WordPress XML export or write SQL queries to extract posts, pages, categories, tags
   - Export author information

2. **Convert to MDX**
   - Create migration script to convert WordPress posts to MDX format
   - Preserve frontmatter: title, date, author, categories, tags, excerpt, featuredImage

3. **Copy Media Files**
   - Copy all files from \`wp-content/uploads\` to \`public/uploads\` or \`public/media\`
   - Update image URLs in content during migration

4. **Set Up Next.js Structure**
   - Create app router structure
   - Implement pages: /, /blog, /blog/[slug], /acerca-de-mi, /contacto
   - Implement archive pages: /categoria/[slug], /author/[slug]

5. **Implement Features**
   - Post listing with pagination
   - Related posts functionality
   - Author pages
   - Category/tag archives
   - Contact form (optional: migrate comments or implement new system)

---

*Report generated by WordPress Backup Audit Script*
`;

  fs.writeFileSync(mdPath, md);
  console.log(`\n📄 Report saved to: ${mdPath}`);

  // Also save JSON for programmatic access
  const jsonPath = path.join(OUTPUT_DIR, 'audit-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON data saved to: ${jsonPath}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 WordPress Backup Audit Script\n');
  console.log('=' .repeat(50));

  // Check if backup directory exists
  if (fs.existsSync(BACKUP_DIR)) {
    report.checks.backupExists = true;
    console.log('✅ Backup directory found\n');
  } else {
    report.issues.push('Backup directory not found');
    console.log('❌ Backup directory not found\n');
    process.exit(1);
  }

  // Run checks
  checkWordPressInstallation();
  console.log('');
  analyzeDatabase();
  console.log('');
  analyzeUploads();
  console.log('');
  generateRecommendations();
  console.log('');
  generateMarkdownReport();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Audit complete!\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
