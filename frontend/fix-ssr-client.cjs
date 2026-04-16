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

    if (content.includes('ssr: false') && !content.includes("'use client'") && !content.includes('"use client"')) {
      content = "'use client';\n" + content;
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});

console.log(`Added 'use client' to ${count} pages with ssr: false.`);
