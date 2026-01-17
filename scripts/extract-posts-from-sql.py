#!/usr/bin/env python3
"""
Extract posts from WordPress SQL dump and convert to JSON

Usage: python3 scripts/extract-posts-from-sql.py backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql
"""

import re
import json
import html
import sys
from pathlib import Path

# WordPress table prefix from audit
TABLE_PREFIX = '_3YO_'

def parse_sql_values(row_str):
    """
    Parse SQL VALUES row, handling quoted strings and escaping
    """
    values = []
    current = ''
    in_string = False
    escape_next = False
    
    i = 0
    while i < len(row_str):
        char = row_str[i]
        
        if escape_next:
            current += char
            escape_next = False
        elif char == '\\':
            if i + 1 < len(row_str) and row_str[i + 1] in ["'", '"', '\\', 'n', 'r', 't']:
                escape_next = True
            else:
                current += char
        elif char == "'" and not in_string:
            in_string = True
        elif char == "'" and in_string:
            # Check if it's an escaped quote
            if i + 1 < len(row_str) and row_str[i + 1] == "'":
                current += "'"
                i += 1  # Skip next quote
            else:
                in_string = False
        elif char == ',' and not in_string:
            values.append(current.strip())
            current = ''
        else:
            current += char
        
        i += 1
    
    if current:
        values.append(current.strip())
    
    return values

def clean_content(content):
    """
    Clean WordPress content
    """
    if not content or content == "NULL":
        return ''
    
    # Remove outer quotes if present
    if content.startswith("'") and content.endswith("'"):
        content = content[1:-1]
    
    # Unescape SQL strings
    content = content.replace("\\'", "'")
    content = content.replace('\\"', '"')
    content = content.replace('\\\\', '\\')
    content = content.replace('\\n', '\n')
    content = content.replace('\\r', '\r')
    content = content.replace('\\t', '\t')
    
    # Unescape HTML entities
    try:
        content = html.unescape(content)
    except:
        pass
    
    return content

def extract_posts_from_sql(sql_file_path):
    """
    Parse WordPress SQL dump and extract posts
    """
    posts = []
    pages = []
    
    print(f"Reading SQL file: {sql_file_path}")
    
    try:
        with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return posts, pages
    
    # Find INSERT INTO statements for posts table
    pattern = rf"INSERT INTO `{re.escape(TABLE_PREFIX)}posts`[^;]*VALUES\s*(.*?);"
    matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
    
    total_rows = 0
    
    for match in matches:
        values_block = match.group(1)
        
        # Split into individual rows (handle multi-line values)
        # Each row starts with ( and ends with ),
        # But we need to be careful with nested parentheses in content
        rows = []
        current_row = ''
        paren_depth = 0
        in_string = False
        escape_next = False
        
        for char in values_block:
            if escape_next:
                current_row += char
                escape_next = False
            elif char == '\\' and in_string:
                escape_next = True
                current_row += char
            elif char == "'" and not escape_next:
                in_string = not in_string
                current_row += char
            elif char == '(' and not in_string:
                if paren_depth == 0:
                    current_row = '('
                else:
                    current_row += char
                paren_depth += 1
            elif char == ')' and not in_string:
                current_row += char
                paren_depth -= 1
                if paren_depth == 0:
                    rows.append(current_row)
                    current_row = ''
            elif char == ',' and paren_depth == 0 and not in_string:
                # Skip commas between rows
                continue
            else:
                current_row += char
        
        # Parse each row
        for row_str in rows:
            if not row_str.strip():
                continue
            
            try:
                # Remove outer parentheses
                row_str = row_str.strip()
                if row_str.startswith('(') and row_str.endswith(')'):
                    row_str = row_str[1:-1]
                
                values = parse_sql_values(row_str)
                
                if len(values) < 23:
                    continue
                
                # WordPress posts table structure (simplified):
                # ID, post_author, post_date, post_date_gmt, post_content, post_title,
                # post_excerpt, post_status, comment_status, ping_status, post_password,
                # post_name, to_ping, pinged, post_modified, post_modified_gmt,
                # post_content_filtered, post_parent, guid, menu_order, post_type,
                # post_mime_type, comment_count
                
                post_id = values[0].strip("'\"")
                post_type = values[20].strip("'\"") if len(values) > 20 else 'post'
                post_status = values[7].strip("'\"") if len(values) > 7 else 'draft'
                
                # Only process published posts and pages
                if post_status != 'publish':
                    continue
                
                post_data = {
                    'id': int(post_id) if post_id.isdigit() else post_id,
                    'type': post_type,
                    'title': clean_content(values[5]) if len(values) > 5 else '',
                    'slug': clean_content(values[11]) if len(values) > 11 else '',
                    'content': clean_content(values[4]) if len(values) > 4 else '',
                    'excerpt': clean_content(values[6]) if len(values) > 6 else '',
                    'date': clean_content(values[2]) if len(values) > 2 else '',
                    'author_id': clean_content(values[1]) if len(values) > 1 else '',
                    'status': post_status,
                }
                
                if post_type == 'post':
                    posts.append(post_data)
                    total_rows += 1
                elif post_type == 'page':
                    pages.append(post_data)
                    total_rows += 1
                
            except Exception as e:
                # Skip problematic rows
                continue
    
    print(f"Extracted {len(posts)} posts and {len(pages)} pages (total rows processed: {total_rows})")
    return posts, pages

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-posts-from-sql.py <sql_file_path>")
        print("Example: python3 extract-posts-from-sql.py backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql")
        sys.exit(1)
    
    sql_file = sys.argv[1]
    
    if not Path(sql_file).exists():
        print(f"Error: File not found: {sql_file}")
        sys.exit(1)
    
    print("Extracting posts from WordPress SQL dump...")
    print(f"Table prefix: {TABLE_PREFIX}")
    print()
    
    posts, pages = extract_posts_from_sql(sql_file)
    
    # Save posts to JSON
    output_posts = 'posts.json'
    with open(output_posts, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Saved {len(posts)} posts to {output_posts}")
    
    # Save pages to JSON
    output_pages = 'pages.json'
    with open(output_pages, 'w', encoding='utf-8') as f:
        json.dump(pages, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved {len(pages)} pages to {output_pages}")
    
    # Print summary
    if posts:
        print(f"\nSample post titles:")
        for post in posts[:5]:
            print(f"  - {post['title'][:60]}...")
    
    if pages:
        print(f"\nSample page titles:")
        for page in pages[:5]:
            print(f"  - {page['title'][:60]}...")

if __name__ == '__main__':
    main()
