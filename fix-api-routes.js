const fs = require('fs');
const path = require('path');

// List of files to process
function getAllApiRoutes(dirPath = path.join(__dirname, 'src', 'app', 'api'), results = []) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllApiRoutes(filePath, results);
    } else if (file === 'route.ts') {
      results.push(filePath);
    }
  }
  
  return results;
}

// Process each file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace "const { DB } = request.cf.env;"
  content = content.replace(/const\s*{\s*DB\s*}\s*=\s*request\.cf\.env;?/g, '');
  
  // Replace "await functionName(DB," with "await functionName("
  content = content.replace(/await\s+([a-zA-Z0-9_]+)\(DB,\s*/g, 'await $1(');
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  
  console.log(`Updated ${filePath}`);
}

// Main function
async function main() {
  try {
    console.log('Starting to update API routes...');
    
    // Get all API route files
    const apiRoutes = getAllApiRoutes();
    console.log(`Found ${apiRoutes.length} API routes to process`);
    
    // Process each file
    for (const route of apiRoutes) {
      processFile(route);
    }
    
    console.log('All API routes updated successfully!');
  } catch (error) {
    console.error('Error updating API routes:', error);
    process.exit(1);
  }
}

// Run the script
main(); 