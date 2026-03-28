import path from 'node:path';
import { Project, type SourceFile } from 'ts-morph';
import type { Warning } from '../types.js';

export function parseFile(filePath: string): SourceFile | Warning {
  try {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(filePath);

    const syntacticDiagnostics = project
      .getLanguageService()
      .getProgram()
      ?.getSyntacticDiagnostics(sourceFile);

    if (syntacticDiagnostics && syntacticDiagnostics.length > 0) {
      return {
        message: `⚠ Skipped: ${path.basename(filePath)} (parse error)`,
      };
    }

    return sourceFile;
  } catch (_error) {
    return {
      message: `⚠ Skipped: ${path.basename(filePath)} (parse error)`,
    };
  }
}
