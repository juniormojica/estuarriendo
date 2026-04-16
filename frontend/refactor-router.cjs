const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFiles() {
  const dirPath = path.join(__dirname, 'src');
  let count = 0;
  walkDir(dirPath, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;

      if (content.includes('react-router-dom')) {
        // Replace Link
        if (content.match(/import\s+{([^}]*)}.*from\s+'react-router-dom'/)) {
          let imports = content.match(/import\s+{([^}]*)}.*from\s+'react-router-dom'/)[1];
          let nextImports = [];
          if (imports.includes('useNavigate')) nextImports.push('useRouter');
          if (imports.includes('useLocation')) nextImports.push('usePathname');
          if (imports.includes('useParams')) nextImports.push('useParams');
          if (imports.includes('useSearchParams')) nextImports.push('useSearchParams');
          if (imports.includes('Navigate')) nextImports.push('redirect');

          let replacement = '';
          if (imports.includes('Link')) {
            replacement += `import Link from 'next/link';\n`;
          }
          if (nextImports.length > 0) {
            replacement += `import { ${nextImports.join(', ')} } from 'next/navigation';\n`;
          }

          content = content.replace(/import\s+{([^}]*)}.*from\s+'react-router-dom';?/, replacement.trim());
        }

        // Additional scattered replacements
        content = content.replace(/useNavigate/g, 'useRouter');
        content = content.replace(/const navigate = useRouter\(\);?/g, 'const router = useRouter();');
        content = content.replace(/navigate\(/g, 'router.push(');
        content = content.replace(/useLocation\(\)/g, 'usePathname()');
        content = content.replace(/useLocation/g, 'usePathname');
        content = content.replace(/const location = usePathname\(\);?/g, 'const pathname = usePathname();');
        // Warning: rough fix for location
        content = content.replace(/location\.pathname/g, 'pathname');
        content = content.replace(/location\.state/g, '(null as any)'); // Next.js doesn't have native route state

        // Protect CSR components
        if (!content.includes("'use client'") && !content.includes('"use client"')) {
            content = "'use client';\n" + content;
        }

        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          count++;
          console.log(`Updated ${filePath}`);
        }
      }
    }
  });
  console.log(`Finished updating ${count} files.`);
}

replaceInFiles();
