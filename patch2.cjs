const fs = require('fs');

let content = fs.readFileSync('src/validator/genuine.ts', 'utf8');

const newFindUiDirectory = `export async function findUiDirectory(targetPath: string): Promise<string | null> {
  const componentsJsonPath = path.join(targetPath, 'components.json');
  try {
    const data = await fs.readFile(componentsJsonPath, 'utf8');
    const json = JSON.parse(data);
    
    let uiAlias = json?.aliases?.ui;
    if (!uiAlias && json?.aliases?.components) {
      uiAlias = \`\${json.aliases.components}/ui\`;
    }

    const possiblePaths = [
      path.join(targetPath, 'components', 'ui'),
      path.join(targetPath, 'src', 'components', 'ui'),
      path.join(targetPath, 'app', 'components', 'ui'),
      path.join(targetPath, 'lib', 'components', 'ui')
    ];

    if (uiAlias) {
      // Try to convert something like "@/components/ui" or "~/components/ui" to a possible path
      const stripped = uiAlias.replace(/^[@~]\//, '');
      possiblePaths.unshift(path.join(targetPath, stripped));
      possiblePaths.unshift(path.join(targetPath, 'src', stripped));
    }
    
    // Check which one actually exists
    for (const p of possiblePaths) {
      try {
        const stats = await fs.stat(p);
        if (stats.isDirectory()) {
          return p;
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // No components.json or unreadable
  }
  return null;
}`;

content = content.replace(/export async function findUiDirectory[\s\S]*?return null;\n\}/, newFindUiDirectory);

fs.writeFileSync('src/validator/genuine.ts', content);
