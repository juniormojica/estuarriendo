const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirPath = path.join(__dirname, 'src', 'app');
let count = 0;

walkDir(dirPath, (filePath) => {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip layout or providers
    if (content.includes('import dynamic from')) return;

    // Find the import
    const importMatch = content.match(/import\s+(\w+Client)\s+from\s+'(@\/pages\/[^']+)'/);
    if (importMatch) {
      const clientVar = importMatch[1];
      const importPath = importMatch[2];
      
      const replacement = `import dynamic from 'next/dynamic';\nconst ${clientVar} = dynamic(() => import('${importPath}'), { ssr: false });`;
      
      content = content.replace(importMatch[0], replacement);
      
      // Make sure it doesn't have 'use client' if it exports generateMetadata
      if (content.includes('export async function generateMetadata') && content.includes("'use client'")) {
        content = content.replace(/'use client';\n/g, '').replace(/"use client";\n/g, '');
      }

      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});

console.log(`Updated ${count} pages to use dynamic imports with ssr: false.`);
