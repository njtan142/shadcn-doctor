import fs from 'node:fs/promises';
import path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

export interface ValidateResult {
  fakeComponents: string[];
  genuinePaths: Set<string>;
  uiDir: string | null;
}

export async function validateGenuineComponents(targetPath: string): Promise<ValidateResult> {
  const uiDir = await findUiDirectory(targetPath);
  if (!uiDir) {
    return { fakeComponents: [], genuinePaths: new Set(), uiDir: null };
  }

  const fakeComponents: string[] = [];
  const genuinePaths = new Set<string>();
  try {
    const files = await fs.readdir(uiDir, { withFileTypes: true });
    const normalizedUiDir = uiDir.split(path.sep).join(path.posix.sep);

    for (const file of files) {
      if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
        const filePath = path.join(uiDir, file.name);
        const isGenuine = await checkIsGenuine(filePath);
        if (isGenuine) {
          genuinePaths.add(`${normalizedUiDir}/${file.name}`);
        } else {
          fakeComponents.push(file.name);
        }
      }
    }
  } catch (err) {
    // Directory might not exist or be accessible
  }

  return { fakeComponents, genuinePaths, uiDir };
}

export async function findUiDirectory(targetPath: string): Promise<string | null> {
  // Try to find project root (directory containing package.json or components.json)
  let currentDir = targetPath;

  try {
    const stats = await fs.stat(currentDir);
    if (stats.isFile()) {
      currentDir = path.dirname(currentDir);
    }
  } catch (e) {
    // Ignore, just use as is
  }

  // Look up to 3 levels up for project root
  let rootDir = currentDir;
  for (let i = 0; i < 3; i++) {
    try {
      await fs.stat(path.join(rootDir, 'components.json'));
      break;
    } catch {
      try {
        await fs.stat(path.join(rootDir, 'package.json'));
        break;
      } catch {
        const parent = path.dirname(rootDir);
        if (parent === rootDir) break;
        rootDir = parent;
      }
    }
  }

  const componentsJsonPath = path.join(rootDir, 'components.json');
  try {
    const data = await fs.readFile(componentsJsonPath, 'utf8');
    const json = JSON.parse(data);

    let uiAlias = json?.aliases?.ui;
    if (!uiAlias && json?.aliases?.components) {
      uiAlias = `${json.aliases.components}/ui`;
    }

    const possiblePaths = [
      path.join(rootDir, 'components', 'ui'),
      path.join(rootDir, 'src', 'components', 'ui'),
      path.join(rootDir, 'app', 'components', 'ui'),
      path.join(rootDir, 'lib', 'components', 'ui'),
    ];

    if (uiAlias) {
      // Try to convert something like "@/components/ui" or "~/components/ui" to a possible path
      const stripped = uiAlias.replace(/^[@~]\//, '');
      possiblePaths.unshift(path.join(rootDir, stripped));
      possiblePaths.unshift(path.join(rootDir, 'src', stripped));
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

  // Fallback if components.json doesn't exist or doesn't resolve
  const defaultPaths = [
    path.join(rootDir, 'components', 'ui'),
    path.join(rootDir, 'src', 'components', 'ui'),
  ];
  for (const p of defaultPaths) {
    try {
      const stats = await fs.stat(p);
      if (stats.isDirectory()) {
        return p;
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

export async function checkIsGenuine(filePath: string): Promise<boolean> {
  try {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(filePath);

    const importDeclarations = sourceFile.getImportDeclarations();
    let hasRadixOrLucideOrCva = false;
    let hasUtilsImport = false;

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (
        moduleSpecifier.startsWith('@radix-ui/') ||
        moduleSpecifier === 'lucide-react' ||
        moduleSpecifier === 'class-variance-authority'
      ) {
        hasRadixOrLucideOrCva = true;
      }
      if (
        moduleSpecifier.endsWith('lib/utils') ||
        moduleSpecifier.endsWith('utils/cn') ||
        moduleSpecifier === 'clsx' ||
        moduleSpecifier === 'tailwind-merge'
      ) {
        hasUtilsImport = true;
      }
    }

    let hasForwardRef = false;
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const callExpr of callExpressions) {
      const expressionText = callExpr.getExpression().getText();
      if (expressionText === 'React.forwardRef' || expressionText === 'forwardRef') {
        hasForwardRef = true;
        break;
      }
    }

    // shadcn components might also have 'use client' at the top
    const text = sourceFile.getFullText();
    const hasUseClient = text.includes('use client');
    const hasCnUsage = text.includes('cn(');

    // Some components like button.tsx have cva, cn, forwardRef
    // Some components like skeleton.tsx have cn
    // We should be reasonably permissive to avoid false positives.
    // Let's say it's genuine if it has any 2 of the following traits typical of shadcn components:
    const traits = [hasRadixOrLucideOrCva, hasUtilsImport, hasForwardRef, hasCnUsage];

    const score = traits.filter(Boolean).length;

    // Most shadcn components import utils and use cn().
    // If it has both, or utils + forwardRef, etc., it's genuine.
    return score >= 2;
  } catch (e) {
    return true; // If we can't parse it, don't flag it as fake
  }
}
