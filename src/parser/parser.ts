import path from 'node:path';
import { Project, type SourceFile } from 'ts-morph';
import type { Warning } from '../types.js';

let sharedProject: Project | null = null;

function getProject(): Project {
  if (!sharedProject) {
    sharedProject = new Project();
  }
  return sharedProject;
}

export function resetParser(): void {
  sharedProject = null;
}

export function parseFile(filePath: string): SourceFile | Warning {
  try {
    const project = getProject();
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
