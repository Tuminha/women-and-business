#!/usr/bin/env python3
"""Analyze SQL file to understand structure"""
import re
import sys

sql_file = sys.argv[1] if len(sys.argv) > 1 else 'backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql'

with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find all INSERT INTO _3YO_posts statements
pattern = r'INSERT INTO `_3YO_posts`.*?;'
matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
print(f'Found {len(matches)} INSERT statements for posts')

# Sample first match to see structure
if matches:
    first = matches[0]
    print(f'\nFirst INSERT statement (first 500 chars):')
    print(first[:500])
    print('\n...')
    print(f'Total length: {len(first)} chars')
