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

    // Remove 'use client' added before
    content = content.replace(/'use client';\n/g, '').replace(/"use client";\n/g, '');

    // Undo next/dynamic if we changed it
    if (content.includes('import dynamic from')) {
      content = content.replace(/import dynamic from 'next\/dynamic';\n/g, '');
      
      const dynamicMatch = content.match(/const (\w+) = dynamic\(\(\) => import\('([^']+)'\), \{ ssr: false \}\);;?/);
      if (dynamicMatch) {
         const clientVar = dynamicMatch[1];
         const importPath = dynamicMatch[2];
         content = content.replace(dynamicMatch[0], `import ${clientVar} from '${importPath}';\nimport ClientOnly from '@/components/ClientOnly';`);
         
         // Now wrap the render
         content = content.replace(`<${clientVar} />`, `<ClientOnly><${clientVar} /></ClientOnly>`);
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});

console.log(`Reverted dynamic imports and used ClientOnly in ${count} pages.`);
