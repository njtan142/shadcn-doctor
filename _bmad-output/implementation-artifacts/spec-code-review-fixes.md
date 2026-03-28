---
slug: code-review-fixes
title: Apply Code Review Fixes
status: in-progress
baseline_commit: 8ff85345e7603a20b70dfe42283dfd95ce3ea335
---

# Intent
Apply four specific code review fixes to address silent success on empty files, path escaping, incorrect tag matching, and error message formatting.

# Investigation Results

## Fixed 1: Silent success when no files found
**File:** `src/analyzer.ts`
Current `analyze` function proceeds even if `files` is empty. 
Fix: Add an early return if `files.length === 0`.

## Fixed 2: Relative paths escaping root directory
**File:** `src/engine/rule-engine.ts`
Current `runRules` calculates `filePath` using `path.relative` but doesn't check if the file is within `rootPath`.
Fix: Add a check `if (!sourceFile.getFilePath().startsWith(rootPath)) throw new Error('File outside rootPath');`.

## Fixed 3: Incorrect tag matching due to whitespace
**File:** `src/rules/prefer-shadcn-button.ts`
Current code uses `.getText()` which might include leading/trailing whitespace.
Fix: Use `.trim()` on the result of `.getText()`.

## Fixed 4: Rule failure message might be 'Object object'
**File:** `src/engine/rule-engine.ts`
Current code uses `String(error)`. While the snippet suggested by the user is `const msg = error instanceof Error ? error.message : String(error);`, which is very similar to what's there, I will ensure it's clean and consistent. Wait, the snippet *is* what's there. Maybe the user meant it *wasn't* there or wants it extracted for clarity.

# Task List
1. Modify `src/analyzer.ts` to add the guard for no files found.
2. Modify `src/engine/rule-engine.ts` to add the `rootPath` escaping check.
3. Modify `src/rules/prefer-shadcn-button.ts` to trim tag names.
4. Modify `src/engine/rule-engine.ts` to use a named constant for the error message for better readability and to ensure consistency with the request.

# Acceptance Criteria
- [ ] `analyze` returns a warning when no files are found.
- [ ] `runRules` throws an error if a file is outside `rootPath`.
- [ ] `prefer-shadcn-button` correctly identifies `< button >` (with whitespace) if applicable, or at least is more robust.
- [ ] Rule failure warnings contain helpful error messages.
- [ ] Existing tests pass and new tests verify these fixes.
