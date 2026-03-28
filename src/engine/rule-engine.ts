import path from 'node:path';
import type { SourceFile, Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule, Warning } from '../types.js';

export function runRules(
  sourceFile: SourceFile,
  rules: Rule[],
  rootPath: string
): { findings: Finding[]; warnings: Warning[] } {
  const findings: Finding[] = [];
  const warnings: Warning[] = [];

  const normalizedRootForward = rootPath.replace(/\\/g, '/');
  const normalizedRoot = normalizedRootForward.endsWith('/') ? normalizedRootForward : normalizedRootForward + '/';
  const absoluteFilePath = sourceFile.getFilePath();
  const normalizedFilePath = absoluteFilePath.replace(/\\/g, '/');
  if (!normalizedFilePath.startsWith(normalizedRoot) && normalizedFilePath !== normalizedRootForward) {
    const warning: Warning = {
      message: `File "${absoluteFilePath}" is outside rootPath "${rootPath}" — skipped`,
    };
    return { findings: [], warnings: [warning] };
  }

  const filePath = path.relative(rootPath, sourceFile.getFilePath()).split(path.sep).join(path.posix.sep);

  // Group rules by the SyntaxKind they visit for efficiency
  const rulesByKind = new Map<SyntaxKind, Rule[]>();
  for (const rule of rules) {
    for (const kind of rule.nodeTypes) {
      if (!rulesByKind.has(kind)) {
        rulesByKind.set(kind, []);
      }
      rulesByKind.get(kind)!.push(rule);
    }
  }

  sourceFile.forEachDescendant((node) => {
    const kind = node.getKind();
    const rulesToRun = rulesByKind.get(kind);

    if (rulesToRun) {
      for (const rule of rulesToRun) {
        try {
          const finding = rule.check(node);
          if (finding) {
            // Ensure the finding has correct file and location info
            const { line, column } = sourceFile.getLineAndColumnAtPos(node.getStart());

            findings.push({
              ...finding,
              file: filePath,
              line,
              column,
            });
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          warnings.push({
            message: `Rule "${rule.id}" failed on file "${filePath}" at line ${node.getStartLineNumber()}: ${msg}`,
          });
        }
      }
    }
  });

  return { findings, warnings };
}
