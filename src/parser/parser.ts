import path from 'node:path';
import { Project, type SourceFile } from 'ts-morph';
import type { Warning } from '../types.js';

const project = new Project();

export function parseFile(filePath: string): SourceFile | Warning {
  try {
    const sourceFile =
      project.addSourceFileAtPathIfExists(filePath) || project.addSourceFileAtPath(filePath);

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
