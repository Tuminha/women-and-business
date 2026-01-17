#!/usr/bin/env python3
from scripts.parse_posts import parse_posts

TARGET_IDS = [567, 1130, 1248]


def main():
    posts = parse_posts()
    for post_id in TARGET_IDS:
        post = posts.get(post_id)
        if not post:
            continue
        print(f"--- {post_id} {post.get('post_title')} [{post.get('post_name')}] ---")
        print(post.get('post_content') or '')
        print()


if __name__ == '__main__':
    main()
