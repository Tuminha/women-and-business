import re

sql_file = "extracted_data/backup-1.5.2026_09-05-37_womanao0/mysql/womanao0_WP3YO.sql"
output_file = "extracted_content.txt"

with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find INSERT INTO `_3YO_posts` statements
# This is a simplified regex, assuming standard mysqldump format
inserts = re.findall(r"INSERT INTO `_3YO_posts` VALUES (.*?);", content, re.DOTALL)

with open(output_file, 'w', encoding='utf-8') as out:
    for insert_block in inserts:
        # Split individual value groups (careful with commas inside strings)
        # This is a hacky parser for SQL values
        rows = re.split(r"\),\s*\(", insert_block)
        for row in rows:
            # Try to extract post_title and post_content
            # Structure roughly: ID, author, date, date_gmt, content, title, ...
            # We'll search for text fields
            parts = row.split("','")
            if len(parts) > 5:
                # Cleaning up potential SQL escaping
                post_content = parts[2].replace(r"\'", "'").replace(r'\"', '"')
                post_title = parts[3].replace(r"\'", "'")
                post_type = "post" # simplified assumption
                
                # Check for post type in the row if possible, but for now just dump everything that looks like text
                if len(post_content) > 100: # Filter out short metadata
                    out.write(f"TITLE: {post_title}\n")
                    out.write(f"CONTENT: {post_content[:500]}...\n")
                    out.write("-" * 40 + "\n")

print("Extraction complete.")
