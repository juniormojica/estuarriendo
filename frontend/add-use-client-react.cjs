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
    
    // Check if it uses React hooks
    const usesHooks = content.includes('useState') || 
                      content.includes('useEffect') || 
                      content.includes('useRef') || 
                      content.includes('useMemo') ||
                      content.includes('useCallback') ||
                      content.includes('useContext');
                      
    if (usesHooks) {
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        content = "'use client';\n" + content;
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
        console.log(`Added 'use client' to ${filePath}`);
      }
    }
  }
});
console.log(`Finished adding 'use client' based on React hooks to ${count} files.`);
