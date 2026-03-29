const fs = require('fs');

let content = fs.readFileSync('src/analyzer.ts', 'utf8');

const validationCode = `
  const fakeComponents = await validateGenuineComponents(absoluteRootPath);
  if (fakeComponents.length > 0) {
    console.error('\u26A0\uFE0F Warning: The following components in your ui directory do not appear to be genuine shadcn/ui installations:');
    for (const comp of fakeComponents) {
      console.error(\`  - \${comp} (Missing standard shadcn imports/structure)\`);
    }
    console.error(''); // empty line
  }

  console.error(\`\u26a1 Scanning \${absoluteRootPath}...\`);
`;

const lines = content.split('\n');
const index = lines.findIndex(l => l.includes('Scanning ${absoluteRootPath}...'));
if (index !== -1) {
  lines[index] = validationCode;
} else {
  console.log("Not found!");
}

fs.writeFileSync('src/analyzer.ts', lines.join('\n'));
