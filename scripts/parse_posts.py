#!/usr/bin/env python3
import re
from pathlib import Path

SQL_PATH = Path('backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql')


def iter_insert_blocks(text: str):
    marker = "INSERT INTO `_3YO_posts`"
    idx = 0
    while True:
        start = text.find(marker, idx)
        if start == -1:
            break
        i = start
        in_str = False
        quote = ''
        while i < len(text):
            ch = text[i]
            if in_str:
                if ch == '\\':
                    i += 2
                    continue
                if ch == quote:
                    in_str = False
                i += 1
                continue
            if ch in ("'", '"'):
                in_str = True
                quote = ch
                i += 1
                continue
            if ch == ';':
                yield text[start:i]
                idx = i + 1
                break
            i += 1
        else:
            break


def parse_rows(block: str):
    rows = []
    depth = 0
    in_str = False
    quote = ''
    start = None
    i = 0
    while i < len(block):
        ch = block[i]
        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == quote:
                in_str = False
            i += 1
            continue
        if ch in ("'", '"'):
            in_str = True
            quote = ch
            i += 1
            continue
        if ch == '(':
            if depth == 0:
                start = i + 1
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0 and start is not None:
                rows.append(block[start:i])
        i += 1
    return rows


def split_row(row: str):
    values = []
    cur = ''
    in_str = False
    quote = ''
    i = 0
    while i < len(row):
        ch = row[i]
        if in_str:
            if ch == '\\':
                cur += ch
                i += 1
                if i < len(row):
                    cur += row[i]
                    i += 1
                continue
            if ch == quote:
                in_str = False
                cur += ch
                i += 1
                continue
            cur += ch
            i += 1
            continue
        if ch in ("'", '"'):
            in_str = True
            quote = ch
            cur += ch
            i += 1
            continue
        if ch == ',':
            values.append(cur.strip())
            cur = ''
            i += 1
            continue
        cur += ch
        i += 1
    values.append(cur.strip())
    return values


def strip_value(value: str):
    if not value:
        return value
    if value.upper() == 'NULL':
        return None
    if value[0] in ("'", '"') and value[-1] == value[0]:
        inner = value[1:-1]
        inner = inner.replace("\\'", "'")
        inner = inner.replace('\\"', '"')
        inner = inner.replace('\\\\', '\\')
        return inner
    return value


def parse_posts(debug: bool = False):
    text = SQL_PATH.read_text(encoding='utf-8', errors='ignore')
    posts = {}
    blocks = list(iter_insert_blocks(text))
    if debug:
        print(f"[DEBUG] found {len(blocks)} `_3YO_posts` inserts")
    for idx_block, stmt in enumerate(blocks):
        match = re.search(r"INSERT INTO `_3YO_posts`\s*\((.*?)\)\s*VALUES\s*(.*)", stmt, re.S)
        if not match:
            continue
        cols = [col.strip(' `') for col in match.group(1).split(',')]
        values_block = match.group(2)
        rows = parse_rows(values_block)
        if debug:
            print(f"[DEBUG] block {idx_block} rows={len(rows)}")
        for idx, row in enumerate(rows):
            values = split_row(row)
            if len(values) != len(cols):
                if debug and idx < 2:
                    print(f"[WARN] row length {len(values)} vs cols {len(cols)}")
                continue
            entry = {cols[i]: strip_value(values[i]) for i in range(len(cols))}
            posts[int(entry['ID'])] = entry
    return posts


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Inspect _3YO_posts content")
    parser.add_argument("--debug", action="store_true", help="Show debug output")
    args = parser.parse_args()

    posts = parse_posts(debug=args.debug)
    filtered = [p for p in posts.values() if p.get('post_type') == 'post' and p.get('post_status') in ("publish", "private")]
    filtered.sort(key=lambda p: p.get("post_date", ""), reverse=True)
    for p in filtered[:20]:
        date = p.get("post_date") or ""
        print(f"{p['ID']}\t{p.get('post_title')}\t{p.get('post_name')}\t{date}")
    print(f"[{len(filtered)} published posts parsed]")


if __name__ == '__main__':
    main()
