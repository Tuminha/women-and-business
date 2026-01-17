#!/usr/bin/env python3
"""
Robust WordPress SQL extraction using state machine for proper parsing
"""
import re
import json
import html
import sys
from pathlib import Path

TABLE_PREFIX = '_3YO_'
OUTPUT_DIR = Path(__file__).parent.parent / 'extracted_data'
OUTPUT_DIR.mkdir(exist_ok=True)

def clean_content(content):
    """Clean WordPress content"""
    if not content or content == "NULL":
        return ''
    if content.startswith("'") and content.endswith("'"):
        content = content[1:-1]
    content = content.replace("\\'", "'")
    content = content.replace('\\"', '"')
    content = content.replace('\\\\', '\\')
    content = content.replace('\\n', '\n')
    content = content.replace('\\r', '\r')
    content = content.replace('\\t', '\t')
    try:
        content = html.unescape(content)
    except:
        pass
    return content

def parse_sql_row(row_str):
    """Parse a single SQL row using state machine"""
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
        elif char == '\\' and in_string:
            escape_next = True
            current += char
        elif char == "'" and not escape_next:
            in_string = not in_string
            current += char
        elif char == ',' and not in_string:
            values.append(current.strip())
            current = ''
        else:
            current += char
        
        i += 1
    
    if current:
        values.append(current.strip())
    
    return values

def split_rows_from_values_block(values_block):
    """Split VALUES block into individual rows using state machine"""
    rows = []
    current_row = []
    paren_depth = 0
    in_string = False
    escape_next = False
    
    i = 0
    while i < len(values_block):
        char = values_block[i]
        
        if escape_next:
            if current_row:
                current_row.append(char)
            escape_next = False
        elif char == '\\' and in_string:
            escape_next = True
            if current_row:
                current_row.append(char)
        elif char == "'" and not escape_next:
            in_string = not in_string
            if current_row:
                current_row.append(char)
        elif char == '(' and not in_string:
            if paren_depth == 0:
                # Start of a new row
                current_row = ['(']
            else:
                if current_row:
                    current_row.append(char)
            paren_depth += 1
        elif char == ')' and not in_string:
            if current_row:
                current_row.append(char)
            paren_depth -= 1
            if paren_depth == 0:
                # End of a row
                row_str = ''.join(current_row)
                rows.append(row_str)
                current_row = []
        elif char == ',' and paren_depth == 0 and not in_string:
            # Comma between rows - skip it
            pass
        else:
            if current_row:
                current_row.append(char)
        
        i += 1
    
    return rows

def extract_posts_robust(sql_file_path):
    """Extract posts by reading line by line and finding all INSERT statements"""
    posts = []
    pages = []
    
    print("Reading SQL file line by line...")
    with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    # Find all lines with INSERT INTO _3YO_posts
    insert_lines = []
    for i, line in enumerate(lines):
        if 'INSERT INTO' in line and f'`{TABLE_PREFIX}posts`' in line and 'VALUES' in line:
            insert_lines.append((i+1, line))
            print(f"Found INSERT statement at line {i+1} (length: {len(line)} chars)")
    
    if not insert_lines:
        print("ERROR: Could not find any INSERT INTO _3YO_posts statements")
        return posts, pages
    
    print(f"\nProcessing {len(insert_lines)} INSERT statement(s)...")
    
    # Process each INSERT statement
    for stmt_idx, (line_num, insert_line) in enumerate(insert_lines):
        print(f"\n--- Processing INSERT statement {stmt_idx + 1}/{len(insert_lines)} (line {line_num}) ---")
    
        # Extract column names
        col_match = re.search(rf'INSERT INTO `{re.escape(TABLE_PREFIX)}posts`\s*\(([^)]+)\)', insert_line, re.IGNORECASE)
        if not col_match:
            print(f"  WARNING: Could not extract column names from statement {stmt_idx + 1}, skipping...")
            continue
        
        columns = [col.strip().strip('`') for col in col_match.group(1).split(',')]
        print(f"  Found {len(columns)} columns: {', '.join(columns[:5])}...")
        
        # Extract VALUES block - find everything after VALUES until the final semicolon
        # We need to be careful because semicolons might appear in content
        # Since the INSERT is on one line, we can find the last semicolon
        values_start = insert_line.find('VALUES')
        if values_start == -1:
            print(f"  WARNING: Could not find VALUES keyword in statement {stmt_idx + 1}, skipping...")
            continue
        
        # Find the last semicolon (end of INSERT statement)
        values_block = insert_line[values_start + 6:]  # Skip "VALUES"
        # Remove leading whitespace
        values_block = values_block.lstrip()
        # Remove trailing semicolon if present
        if values_block.endswith(';'):
            values_block = values_block[:-1]
        
        print(f"  VALUES block length: {len(values_block)} characters")
        
        # Split into rows
        print("  Splitting VALUES block into rows...")
        rows = split_rows_from_values_block(values_block)
        print(f"  Extracted {len(rows)} rows")
        
        # Parse each row
        stmt_posts = 0
        stmt_pages = 0
        for row_idx, row_str in enumerate(rows):
            if row_idx % 50 == 0 and len(rows) > 50:
                print(f"    Processing row {row_idx + 1}/{len(rows)}...")
            
            if not row_str.strip() or len(row_str) < 10:
                continue
            
            try:
                # Remove outer parentheses
                clean_row = row_str.strip()
                if clean_row.startswith('(') and clean_row.endswith(')'):
                    clean_row = clean_row[1:-1]
                
                values = parse_sql_row(clean_row)
                
                if len(values) != len(columns):
                    # Skip rows with mismatched column counts
                    continue
                
                # Create a dict from column names to values
                row_dict = {col: values[idx] for idx, col in enumerate(columns)}
                
                post_type = clean_content(row_dict.get('post_type', ''))
                post_status = clean_content(row_dict.get('post_status', ''))
                
                # Only published content
                if post_status != 'publish':
                    continue
                
                post_data = {
                    'id': int(clean_content(row_dict.get('ID', '0'))) if clean_content(row_dict.get('ID', '0')).isdigit() else 0,
                    'author_id': int(clean_content(row_dict.get('post_author', '0'))) if clean_content(row_dict.get('post_author', '0')).isdigit() else 0,
                    'date': clean_content(row_dict.get('post_date', '')),
                    'date_gmt': clean_content(row_dict.get('post_date_gmt', '')),
                    'content': clean_content(row_dict.get('post_content', '')),
                    'title': clean_content(row_dict.get('post_title', '')),
                    'excerpt': clean_content(row_dict.get('post_excerpt', '')),
                    'status': post_status,
                    'comment_status': clean_content(row_dict.get('comment_status', 'open')),
                    'ping_status': clean_content(row_dict.get('ping_status', 'open')),
                    'password': clean_content(row_dict.get('post_password', '')),
                    'slug': clean_content(row_dict.get('post_name', '')),
                    'modified': clean_content(row_dict.get('post_modified', '')),
                    'modified_gmt': clean_content(row_dict.get('post_modified_gmt', '')),
                    'parent': int(clean_content(row_dict.get('post_parent', '0'))) if clean_content(row_dict.get('post_parent', '0')).isdigit() else 0,
                    'guid': clean_content(row_dict.get('guid', '')),
                    'type': post_type,
                    'mime_type': clean_content(row_dict.get('post_mime_type', '')),
                    'comment_count': int(clean_content(row_dict.get('comment_count', '0'))) if clean_content(row_dict.get('comment_count', '0')).isdigit() else 0,
                }
                
                if post_type == 'post':
                    posts.append(post_data)
                    stmt_posts += 1
                elif post_type == 'page':
                    pages.append(post_data)
                    stmt_pages += 1
                    
            except Exception as e:
                # Skip rows that fail to parse
                continue
        
        print(f"  ✓ Extracted {stmt_posts} posts and {stmt_pages} pages from this statement")
    
    return posts, pages

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-wordpress-robust.py <sql_file>")
        sys.exit(1)
    
    sql_file = sys.argv[1]
    if not Path(sql_file).exists():
        print(f"Error: File not found: {sql_file}")
        sys.exit(1)
    
    print("Extracting posts and pages...")
    posts, pages = extract_posts_robust(sql_file)
    
    print(f"\n✓ Extracted {len(posts)} posts and {len(pages)} pages")
    
    # Save to JSON
    with open(OUTPUT_DIR / 'posts.json', 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved {len(posts)} posts to {OUTPUT_DIR / 'posts.json'}")
    
    with open(OUTPUT_DIR / 'pages.json', 'w', encoding='utf-8') as f:
        json.dump(pages, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved {len(pages)} pages to {OUTPUT_DIR / 'pages.json'}")
    
    if posts:
        print("\nSample posts:")
        for post in posts[:3]:
            print(f"  - {post['title'][:60]}...")
    
    if pages:
        print("\nSample pages:")
        for page in pages[:3]:
            print(f"  - {page['title'][:60]}...")

if __name__ == '__main__':
    main()
