# Story 1.2: file-discovery-ast-parsing

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer using shadcn-doctor,
I want the tool to discover all TypeScript/TSX files in a target path and parse them into ASTs,
So that source code can be analyzed for shadcn/ui adoption issues.

## Acceptance Criteria

1. **Given** a directory containing `.ts` and `.tsx` files **When** the file discovery module scans the directory **Then** all `.ts` and `.tsx` files are found recursively **And** files are returned in alphabetical path order for deterministic processing **And** non-TypeScript files (`.js`, `.css`, `.json`, etc.) are excluded
2. **Given** a single `.tsx` file path is provided **When** the file discovery module processes it **Then** only that single file is returned for scanning
3. **Given** a discovered `.tsx` file with valid TypeScript/JSX syntax **When** the AST parser processes it via ts-morph **Then** a parsed source file AST is returned for rule analysis
4. **Given** a discovered file with malformed or unparseable syntax **When** the AST parser attempts to process it **Then** a warning is collected: `⚠ Skipped: {file} (parse error)` **And** the file is skipped without crashing the process **And** remaining files continue to be processed
5. **Given** all output file paths **When** they are formatted for display **Then** paths use forward slashes regardless of OS (via `path.posix`) **And** paths are relative to the scan root

## Tasks / Subtasks

- [x] Task 1: Implement File Discovery Module (AC: 1, 2, 5)
  - [x] Implement scanner to take a single file or directory path.
  - [x] Use `fs.readdir({ recursive: true })` for directories.
  - [x] Filter out non-TypeScript files. Include only `.ts` and `.tsx`.
  - [x] Sort discovered files alphabetically to guarantee determinism.
  - [x] Normalize output paths using `path.posix` for cross-platform forward slashes and ensure they are relative to the scan root.
- [x] Task 2: Implement AST Parser Module (AC: 3, 4)
  - [x] Setup `ts-morph` project.
  - [x] Implement parsing logic for a single source file.
  - [x] Add try/catch error boundary for malformed files.
  - [x] Return a `Warning` payload if parsing fails instead of throwing.
- [x] Task 3: Unit Tests
  - [x] Write unit tests for file discovery (scanning a directory, single file, filtering).
  - [x] Write unit tests for AST parser (valid file, malformed file).

## Dev Notes

- **Architecture Rules for AST:** We use `ts-morph` v27.x. Wraps the TypeScript compiler API.
- **Architecture Rules for File Discovery:** Must use built-in Node.js `fs.readdir({ recursive: true })`.
- **Determinism Constraint:** It's absolutely critical that files are processed in an alphabetical path order so that the eventual output is completely deterministic. 
- **Error Boundaries:** The `parser` module must never crash the process if a single file has syntax errors. It must gracefully capture the error as a warning to be reported later.

### Project Structure Notes

- Scanner logic belongs in `src/scanner/`.
- Parser logic belongs in `src/parser/`.
- Continue adhering to established named exports and strict ESM configurations from Story 1.1.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AST-Parser]
- [Source: _bmad-output/planning-artifacts/architecture.md#File-Discovery-&-Traversal]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Implemented file discovery using `fs.readdir` and path normalization.
- Implemented AST parsing using `ts-morph` with error boundaries.
- Created unit tests for scanner and parser.
- Fixed linting, formatting and tests to ensure no regressions and all acceptance criteria met.

### File List

- src/scanner/index.ts
- src/scanner/scanner.ts
- src/scanner/scanner.test.ts
- src/parser/index.ts
- src/parser/parser.ts
- src/parser/parser.test.ts

## Review Findings

- [x] [Review][Patch] Fix noImplicitAnyLet - untyped `stat` variable [src/scanner/scanner.ts:8] — fixed

