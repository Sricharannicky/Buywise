const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.js') || file.endsWith('.mjs')) results.push(file);
  });
  return results;
}

const authDist = path.join(__dirname, '..', 'node_modules', '@firebase', 'auth', 'dist');
const files = walk(authDist);
let patchedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('Pending promise was never set')) {
    const patched = content.replace(
      /(?:\w+\.)?debugAssert\(this\.pendingPromise,\s*['"]Pending promise was never set['"]\);?/g,
      'if (!this.pendingPromise) return;'
    );
    if (patched !== content) {
      fs.writeFileSync(file, patched, 'utf8');
      patchedCount++;
      console.log('Successfully patched:', path.relative(path.join(__dirname, '..'), file));
    }
  }
});

console.log(`[Buywise] Patched ${patchedCount} Firebase Auth files to prevent "Pending promise was never set" assertion failure.`);
