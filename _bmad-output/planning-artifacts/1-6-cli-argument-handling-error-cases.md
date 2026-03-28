# Story 1.6: CLI Argument Handling & Error Cases

Status: ready-for-dev

## Story

As a developer using shadcn-doctor,
I want to specify a target file or directory as a CLI argument, or default to the current working directory,
so that I can easily scan any part of my project with a single command.

## Acceptance Criteria

1. **Given** the user runs `npx shadcn-doctor ./src/components`
   **When** the CLI processes the argument
   **Then** the tool scans all `.ts`/`.tsx` files recursively in `./src/components`

2. **Given** the user runs `npx shadcn-doctor ./src/page.tsx`
   **When** the CLI processes the argument
   **Then** the tool scans only that single file

3. **Given** the user runs `npx shadcn-doctor` with no arguments
   **When** the CLI processes the command
   **Then** the tool scans the current working directory recursively

4. **Given** the user runs `npx shadcn-doctor ./nonexistent`
   **When** the target path does not exist
   **Then** `Error: Path not found: ./nonexistent` is written to stderr
   **And** the process exits with code 2

5. **Given** the user runs `npx shadcn-doctor ./empty-dir`
   **When** the target directory contains no `.ts`/`.tsx` files
   **Then** `Error: No TypeScript files found in: ./empty-dir` is written to stderr
   **And** the process exits with code 2

6. **Given** the user runs `npx shadcn-doctor --help`
   **When** the help flag is processed
   **Then** complete usage documentation is displayed including: description, usage syntax, path argument, `--format` flag, and exit code meanings

7. **Given** the user runs `npx shadcn-doctor --version`
   **When** the version flag is processed
   **Then** the package version from `package.json` is displayed

## Tasks / Subtasks

- [ ] Task 1: Wire Commander into `src/cli.ts` replacing raw `process.argv` parsing (AC: #6, #7, #1, #2, #3)
  - [ ] Import and configure Commander `Command` with program name, description, version, and optional `[path]` argument
  - [ ] Add `--format <format>` option with choices `human` and `json`, defaulting to `human`
  - [ ] Add help text describing exit codes (0 = pass, 1 = findings, 2 = fatal error)
  - [ ] Call `program.parse(process.argv)` and extract `path` arg (default `'.'`) and `format` option
  - [ ] Pass `format` option through to `run()` for future use (Epic 2 wires JSON formatter)

- [ ] Task 2: Implement path-not-found error case in `src/analyzer.ts` (AC: #4)
  - [ ] Call `fs.stat` on the resolved target path before invoking `discoverFiles`
  - [ ] If `stat` throws `ENOENT`, throw an Error with message `Path not found: {targetPath}` (use the user-provided path, not the resolved one)
  - [ ] Let `cli.ts` `run()` catch block handle the error and write it to stderr with exit code 2

- [ ] Task 3: Implement no-files-found error case in `src/analyzer.ts` (AC: #5)
  - [ ] Replace the current "silent success" early return (which returns `pass: true` with no findings) with an error throw
  - [ ] Throw an Error with message `No TypeScript files found in: {targetPath}` (user-provided path)
  - [ ] Let `cli.ts` `run()` catch block handle it with exit code 2

- [ ] Task 4: Write tests for CLI argument handling (AC: #1–#7)
  - [ ] Create `src/cli.test.ts` testing: default `.` path, explicit file path, explicit dir path
  - [ ] Test path-not-found error produces correct stderr message and exit code 2
  - [ ] Test empty-dir error produces correct stderr message and exit code 2
  - [ ] Test `--help` flag output contains expected documentation keywords
  - [ ] Test `--version` flag output contains the version from `package.json`

- [ ] Task 5: Update `bin/shadcn-doctor.js` if CLI signature changes (AC: #1–#3)
  - [ ] Confirm `bin/shadcn-doctor.js` still calls `run()` without arguments (Commander handles argv internally)
  - [ ] No change needed if `run()` already calls `program.parse()` internally

## Dev Notes

### Current State of `src/cli.ts` (Critical — Must Replace)

The current `src/cli.ts` does **NOT** use Commander. It parses `process.argv[2]` directly:

```typescript
const targetPath = process.argv[2] ?? '.';
run(targetPath).catch(...);
```

This story replaces this with a proper Commander program. The Commander package (`^14.0.3`) is already in `package.json` dependencies — no new dependencies required.

### Commander Integration Pattern

```typescript
import { Command } from 'commander';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const program = new Command();
program
  .name('shadcn-doctor')
  .description('Detect missed shadcn/ui component adoption in TypeScript/TSX files')
  .version(version)
  .argument('[path]', 'File or directory to scan', '.')
  .option('--format <format>', 'Output format: human or json', 'human')
  .addHelpText('after', '\nExit codes:\n  0  No findings (pass)\n  1  Findings detected\n  2  Fatal error')
  .action(async (targetPath: string, options: { format: string }) => {
    await run(targetPath, options.format);
  });

program.parse(process.argv);
```

**NOTE:** `package.json` version reading in ESM requires `createRequire` since dynamic `import()` of JSON requires the `assert { type: 'json' }` flag which has compatibility issues. Commander also supports `.version(version, '-v, --version')` for custom flag alias if needed.

### Error Handling Flow

The `run()` function in `src/cli.ts` already has a `try/catch` that writes `Error: {message}: {detail}` to stderr and sets exit code 2. The two new errors (path not found, no files) must surface as thrown `Error` objects from `analyze()` so the existing `catch` block handles them uniformly.

**Current issue in `src/analyzer.ts`:** The current code has a silent early return for empty files:

```typescript
if (files.length === 0) {
  return {
    pass: true,
    summary: { total: 0, filesScanned: 0 },
    findings: [],
    warnings: [{ message: 'No files found to analyze' }],
  };
}
```

This must become a throw:
```typescript
if (files.length === 0) {
  throw new Error(`No TypeScript files found in: ${targetPath}`);
}
```

And `fs.stat` check before `discoverFiles`:
```typescript
import fs from 'node:fs/promises';

export async function analyze(targetPath: string): Promise<AnalysisResult> {
  const absoluteRootPath = path.resolve(targetPath);

  try {
    await fs.stat(absoluteRootPath);
  } catch {
    throw new Error(`Path not found: ${targetPath}`);
  }

  const files = await discoverFiles(absoluteRootPath);
  if (files.length === 0) {
    throw new Error(`No TypeScript files found in: ${targetPath}`);
  }
  // ... rest of function
}
```

### Error Message Format Precision

From AC #4 and #5, note the **exact** error message format required by the acceptance criteria:
- `Path not found: ./nonexistent` — use the **user-provided** path (relative as given), not the resolved absolute path
- `No TypeScript files found in: ./empty-dir` — same, user-provided path

The `run()` catch block in `cli.ts` currently formats errors as `Error: {description}: {detail}`. This would produce:
`Error: Path not found: ./nonexistent: Error: Path not found: ./nonexistent\n    at ...`

The stderr output acceptance criteria says `Error: Path not found: ./nonexistent` with no stack trace. The catch block must be updated to write only the message, not the full stack:

```typescript
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 2;
}
```

### `discoverFiles` behavior note

`src/scanner/scanner.ts` currently calls `fs.stat` internally but throws its own error if the path doesn't exist. The `fs.stat` in `analyzer.ts` must run first so the error message uses the user-provided path (not an internal path).

The `discoverFiles` function also already returns `[]` for a single non-TS file (e.g., a `.js` file). The empty-dir check in `analyzer.ts` covers this case generically.

### `--format` Option (Forward-Compatible Stub)

Story 1.6 adds the `--format` option to Commander but the JSON formatter is implemented in Epic 2 (Story 2.1). For now:
- Accept `--format human` (default) and `--format json`
- If `--format json` is passed, still output human format with a warning, OR simply pass the format through to `run()` and `analyze()` for the formatter selection in Story 2.1

The recommended approach: add a `format` parameter to `run()` and store it, but always call `formatHuman()` in this story. Story 2.1 will complete the JSON branch. This avoids having to touch `cli.ts` again in Story 2.1 for the signature.

### Architecture Compliance Requirements

- `src/cli.ts` is the ONLY file that may write exit codes — do not add `process.exit()` or `process.exitCode` anywhere else
- `src/cli.ts` is the ONLY file that parses CLI arguments — all Commander setup belongs here
- `src/analyzer.ts` throws errors; `src/cli.ts` catches them
- No `console.log` — use `process.stdout.write()` and `process.stderr.write()` exclusively
- Output formatters own all stdout content — `cli.ts` calls formatter and writes the result, never formats directly

### Project Structure Notes

Files to create or modify:
- **Modify:** `src/cli.ts` — replace raw argv with Commander, update `run()` signature to accept `format`
- **Modify:** `src/analyzer.ts` — add `fs.stat` check, replace silent empty-files return with thrown Error
- **Create:** `src/cli.test.ts` — CLI argument and error case tests

Files that should NOT change:
- `src/types.ts` — no new types needed
- `src/scanner/scanner.ts` — file discovery behavior unchanged
- `src/engine/rule-engine.ts` — no changes needed
- `src/rules/` — no changes needed
- `src/formatters/human-formatter.ts` — no changes needed
- `bin/shadcn-doctor.js` — still calls `run()` with no args; Commander handles `process.argv` internally

### Testing Approach

Use Vitest with `vi.spyOn` or module mocking to test CLI behavior without spawning child processes. The `isMain` guard in `cli.ts` (checking `import.meta.url === process.argv[1]`) means the action callback can be tested by calling `run()` directly with controlled inputs.

For integration-style path tests, use `src/__fixtures__/` for valid paths and `os.tmpdir()` for empty directory creation (clean up after test).

```typescript
// Example test pattern
import { run } from './cli.js';

it('exits with code 2 for nonexistent path', async () => {
  const stderrSpy = vi.spyOn(process.stderr, 'write');
  await run('./definitely-does-not-exist', 'human');
  expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Path not found'));
  expect(process.exitCode).toBe(2);
});
```

### Known Deferred Issues (From Previous Story)

From `deferred-work.md` (1-5 code review):
1. `absoluteFilePath` from ts-morph may contain URI-encoded characters causing the path guard in `rule-engine.ts` to silently skip files — this is a known issue, do NOT attempt to fix it in this story
2. Integration test at `src/rules/all-rules-integration.test.ts:28` may fail in CI due to projectRoot resolution — known issue, do NOT fix in this story

These are deferred to a future story. Do not let them distract from the story scope.

### References

- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6: CLI Argument Handling & Error Cases]
- Architecture: CLI boundary rules and exit code ownership [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- Architecture: Error handling patterns [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- Architecture: Process patterns — logging/output ownership [Source: _bmad-output/planning-artifacts/architecture.md#Logging & Output Ownership]
- Architecture: Exit codes (0/1/2) [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- UX Requirements: Error message format `Error: {description}: {detail}` [Source: _bmad-output/planning-artifacts/epics.md#UX-DR10]
- FR13: Specify target path as CLI argument [Source: _bmad-output/planning-artifacts/epics.md#Functional Requirements]
- FR14: No arguments scans cwd [Source: _bmad-output/planning-artifacts/epics.md#Functional Requirements]
- NFR14: Clear actionable error messages [Source: _bmad-output/planning-artifacts/epics.md#NonFunctional Requirements]
- NFR15: `--help` flag provides complete usage [Source: _bmad-output/planning-artifacts/epics.md#NonFunctional Requirements]
- Current `src/cli.ts` implementation: uses raw `process.argv`, no Commander wiring yet
- Current `src/analyzer.ts`: silent success on empty files must become a thrown error
- Deferred issues from story 1-5: [Source: _bmad-output/implementation-artifacts/deferred-work.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
