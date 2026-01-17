#!/bin/bash

# This script updates all API route files to remove Cloudflare D1 references

echo "Updating API routes to use Supabase..."

# Find all API route files 
FILES=$(find src/app/api -name 'route.ts')

# Process each file
for file in $FILES; do
  echo "Processing $file"
  
  # Replace "const { DB } = request.cf.env;" with a comment
  sed -i '' 's/const { DB } = request\.cf\.env;//g' "$file"
  
  # Replace "await functionName(DB," with "await functionName("
  sed -i '' 's/await \([a-zA-Z0-9]*\)(DB,/await \1(/g' "$file"
  
  echo "Updated $file"
done

echo "Done updating API routes." 