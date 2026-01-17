#!/usr/bin/env python3
"""
Extract all WordPress data from SQL dump and convert to JSON
Enhanced version that extracts: posts, pages, users, categories, tags, comments, relationships, post_meta

Usage: python3 scripts/extract-all-wordpress-data.py backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql
"""

import re
import json
import html
import sys
from pathlib import Path
from collections import defaultdict

# WordPress table prefix from audit
TABLE_PREFIX = '_3YO_'
OUTPUT_DIR = Path(__file__).parent.parent / 'extracted_data'
OUTPUT_DIR.mkdir(exist_ok=True)

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

def extract_table_data(sql_content, table_name):
    """
    Extract data from a specific table
    """
    data = []
    pattern = rf"INSERT INTO `{re.escape(TABLE_PREFIX)}{table_name}`[^;]*VALUES\s*(.*?);"
    matches = re.finditer(pattern, sql_content, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        values_block = match.group(1)
        
        # Split into individual rows
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
                continue
            else:
                current_row += char
        
        # Parse each row
        for row_str in rows:
            if not row_str.strip():
                continue
            
            try:
                row_str = row_str.strip()
                if row_str.startswith('(') and row_str.endswith(')'):
                    row_str = row_str[1:-1]
                
                values = parse_sql_values(row_str)
                
                if table_name == 'posts':
                    if len(values) < 23:
                        continue
                    
                    post_type = clean_content(values[20] if len(values) > 20 else 'post')
                    post_status = clean_content(values[7] if len(values) > 7 else 'draft')
                    
                    if post_status != 'publish':
                        continue
                    
                    data.append({
                        'id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'author_id': int(clean_content(values[1])) if clean_content(values[1]).isdigit() else 0,
                        'date': clean_content(values[2]) if len(values) > 2 else '',
                        'date_gmt': clean_content(values[3]) if len(values) > 3 else '',
                        'content': clean_content(values[4]) if len(values) > 4 else '',
                        'title': clean_content(values[5]) if len(values) > 5 else '',
                        'excerpt': clean_content(values[6]) if len(values) > 6 else '',
                        'status': post_status,
                        'comment_status': clean_content(values[8]) if len(values) > 8 else 'open',
                        'ping_status': clean_content(values[9]) if len(values) > 9 else 'open',
                        'password': clean_content(values[10]) if len(values) > 10 else '',
                        'slug': clean_content(values[11]) if len(values) > 11 else '',
                        'modified': clean_content(values[14]) if len(values) > 14 else '',
                        'modified_gmt': clean_content(values[15]) if len(values) > 15 else '',
                        'parent': int(clean_content(values[17])) if len(values) > 17 and clean_content(values[17]).isdigit() else 0,
                        'guid': clean_content(values[18]) if len(values) > 18 else '',
                        'type': post_type,
                        'mime_type': clean_content(values[21]) if len(values) > 21 else '',
                        'comment_count': int(clean_content(values[22])) if len(values) > 22 and clean_content(values[22]).isdigit() else 0,
                    })
                elif table_name == 'users':
                    if len(values) < 10:
                        continue
                    data.append({
                        'id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'login': clean_content(values[1]) if len(values) > 1 else '',
                        'password': clean_content(values[2]) if len(values) > 2 else '',
                        'nicename': clean_content(values[3]) if len(values) > 3 else '',
                        'email': clean_content(values[4]) if len(values) > 4 else '',
                        'url': clean_content(values[5]) if len(values) > 5 else '',
                        'registered': clean_content(values[6]) if len(values) > 6 else '',
                        'activation_key': clean_content(values[7]) if len(values) > 7 else '',
                        'status': int(clean_content(values[8])) if len(values) > 8 and clean_content(values[8]).isdigit() else 0,
                        'display_name': clean_content(values[9]) if len(values) > 9 else '',
                    })
                elif table_name == 'comments':
                    if len(values) < 15:
                        continue
                    approved = clean_content(values[10]) if len(values) > 10 else '0'
                    if approved != '1':
                        continue
                    data.append({
                        'id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'post_id': int(clean_content(values[1])) if clean_content(values[1]).isdigit() else 0,
                        'author': clean_content(values[2]) if len(values) > 2 else '',
                        'author_email': clean_content(values[3]) if len(values) > 3 else '',
                        'author_url': clean_content(values[4]) if len(values) > 4 else '',
                        'author_ip': clean_content(values[5]) if len(values) > 5 else '',
                        'date': clean_content(values[6]) if len(values) > 6 else '',
                        'date_gmt': clean_content(values[7]) if len(values) > 7 else '',
                        'content': clean_content(values[8]) if len(values) > 8 else '',
                        'karma': int(clean_content(values[9])) if len(values) > 9 and clean_content(values[9]).isdigit() else 0,
                        'approved': approved == '1',
                        'agent': clean_content(values[11]) if len(values) > 11 else '',
                        'type': clean_content(values[12]) if len(values) > 12 else 'comment',
                        'parent': int(clean_content(values[13])) if len(values) > 13 and clean_content(values[13]).isdigit() else 0,
                        'user_id': int(clean_content(values[14])) if len(values) > 14 and clean_content(values[14]).isdigit() else 0,
                    })
                elif table_name == 'terms':
                    if len(values) < 4:
                        continue
                    data.append({
                        'id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'name': clean_content(values[1]) if len(values) > 1 else '',
                        'slug': clean_content(values[2]) if len(values) > 2 else '',
                        'group': int(clean_content(values[3])) if len(values) > 3 and clean_content(values[3]).isdigit() else 0,
                    })
                elif table_name == 'term_taxonomy':
                    if len(values) < 6:
                        continue
                    data.append({
                        'taxonomy_id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'term_id': int(clean_content(values[1])) if clean_content(values[1]).isdigit() else 0,
                        'taxonomy': clean_content(values[2]) if len(values) > 2 else '',
                        'description': clean_content(values[3]) if len(values) > 3 else '',
                        'parent': int(clean_content(values[4])) if len(values) > 4 and clean_content(values[4]).isdigit() else 0,
                        'count': int(clean_content(values[5])) if len(values) > 5 and clean_content(values[5]).isdigit() else 0,
                    })
                elif table_name == 'term_relationships':
                    if len(values) < 3:
                        continue
                    data.append({
                        'object_id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'term_taxonomy_id': int(clean_content(values[1])) if clean_content(values[1]).isdigit() else 0,
                        'term_order': int(clean_content(values[2])) if len(values) > 2 and clean_content(values[2]).isdigit() else 0,
                    })
                elif table_name == 'postmeta':
                    if len(values) < 4:
                        continue
                    data.append({
                        'meta_id': int(clean_content(values[0])) if clean_content(values[0]).isdigit() else 0,
                        'post_id': int(clean_content(values[1])) if clean_content(values[1]).isdigit() else 0,
                        'meta_key': clean_content(values[2]) if len(values) > 2 else '',
                        'meta_value': clean_content(values[3]) if len(values) > 3 else '',
                    })
            except Exception as e:
                continue
    
    return data

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-all-wordpress-data.py <sql_file_path>")
        sys.exit(1)
    
    sql_file = sys.argv[1]
    
    if not Path(sql_file).exists():
        print(f"Error: File not found: {sql_file}")
        sys.exit(1)
    
    print("Extracting all WordPress data from SQL dump...")
    print(f"Table prefix: {TABLE_PREFIX}")
    print()
    
    try:
        with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    # Extract all tables
    print("Extracting posts...")
    posts = extract_table_data(sql_content, 'posts')
    print(f"  Found {len(posts)} posts")
    
    print("Extracting users...")
    users = extract_table_data(sql_content, 'users')
    print(f"  Found {len(users)} users")
    
    print("Extracting comments...")
    comments = extract_table_data(sql_content, 'comments')
    print(f"  Found {len(comments)} comments")
    
    print("Extracting terms...")
    terms = extract_table_data(sql_content, 'terms')
    print(f"  Found {len(terms)} terms")
    
    print("Extracting term_taxonomy...")
    term_taxonomy = extract_table_data(sql_content, 'term_taxonomy')
    print(f"  Found {len(term_taxonomy)} term_taxonomy entries")
    
    print("Extracting term_relationships...")
    term_relationships = extract_table_data(sql_content, 'term_relationships')
    print(f"  Found {len(term_relationships)} term_relationships")
    
    print("Extracting postmeta...")
    post_meta = extract_table_data(sql_content, 'postmeta')
    print(f"  Found {len(post_meta)} post_meta entries")
    
    # Separate posts and pages
    blog_posts = [p for p in posts if p['type'] == 'post']
    pages = [p for p in posts if p['type'] == 'page']
    
    # Build categories and tags
    categories = []
    tags = []
    
    # Create lookup maps
    terms_map = {t['id']: t for t in terms}
    
    for tt in term_taxonomy:
        term = terms_map.get(tt['term_id'])
        if not term:
            continue
        
        if tt['taxonomy'] == 'category':
            categories.append({
                'id': term['id'],
                'name': term['name'],
                'slug': term['slug'],
                'description': tt['description'],
                'parent': tt['parent'],
                'count': tt['count'],
            })
        elif tt['taxonomy'] == 'post_tag':
            tags.append({
                'id': term['id'],
                'name': term['name'],
                'slug': term['slug'],
                'description': tt['description'],
                'count': tt['count'],
            })
    
    # Save all data
    output_files = {
        'posts': blog_posts,
        'pages': pages,
        'users': users,
        'categories': categories,
        'tags': tags,
        'comments': comments,
        'term_relationships': term_relationships,
        'post_meta': post_meta,
    }
    
    print("\nExtraction Summary:")
    print(f"  Posts: {len(blog_posts)}")
    print(f"  Pages: {len(pages)}")
    print(f"  Users: {len(users)}")
    print(f"  Categories: {len(categories)}")
    print(f"  Tags: {len(tags)}")
    print(f"  Comments: {len(comments)}")
    print(f"  Post Meta: {len(post_meta)}")
    print(f"  Term Relationships: {len(term_relationships)}\n")
    
    for filename, data in output_files.items():
        filepath = OUTPUT_DIR / f'{filename}.json'
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(data)} items to {filepath}")
    
    # Print samples
    if blog_posts:
        print("\nSample post titles:")
        for post in blog_posts[:5]:
            print(f"  - {post['title'][:60]}...")
    
    if pages:
        print("\nSample page titles:")
        for page in pages[:5]:
            print(f"  - {page['title'][:60]}...")
    
    if categories:
        print("\nCategories:")
        for cat in categories:
            print(f"  - {cat['name']} ({cat['slug']})")

if __name__ == '__main__':
    main()
