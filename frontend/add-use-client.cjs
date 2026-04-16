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
    
    // Check if it uses react-redux hooks or store/hooks directly
    const usesRedux = content.includes('useAppSelector') || 
                      content.includes('useAppDispatch') || 
                      content.includes('react-redux') || 
                      content.includes('@/store/hooks');
                      
    const usesForm = content.includes('react-hook-form');
    const usesMaps = content.includes('@react-google-maps/api');
    
    if (usesRedux || usesForm || usesMaps) {
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        content = "'use client';\n" + content;
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
        console.log(`Added 'use client' to ${filePath}`);
      }
    }
  }
});
console.log(`Finished adding 'use client' to ${count} files.`);
