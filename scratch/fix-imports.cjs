const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Remove `import React from 'react';`
  newContent = newContent.replace(/import\s+React\s*,\s*\{\s*(.*?)\s*\}\s*from\s+['"]react['"];?/g, "import { $1 } from 'react';");
  newContent = newContent.replace(/import\s+React\s+from\s+['"]react['"];?/g, "");
  
  if (content !== newContent) {
    // Also remove empty lines left behind at the top
    newContent = newContent.replace(/^\s*[\r\n]/gm, '');
    fs.writeFileSync(file, newContent);
    fixedCount++;
  }
});

console.log(`Fixed React imports in ${fixedCount} files.`);
