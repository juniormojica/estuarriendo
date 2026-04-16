const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirPath = path.join(__dirname, 'src');
let count = 0;

walkDir(dirPath, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    content = content.replace(/@\/pages\//g, '@/views/');
    content = content.replace(/from '\.\.\/pages\//g, "from '../views/");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});

console.log(`Updated imports in ${count} files.`);
