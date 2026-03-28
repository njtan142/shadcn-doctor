# Story 2.2: AI Agent Loop Validation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an AI coding agent,
I want the JSON output to contain sufficient context for me to fix each finding and rerun until clean,
so that I can autonomously close the shadcn/ui compliance loop without human intervention.

## Acceptance Criteria

1. **Given** a JSON finding with `file`, `line`, `column`, `rule`, `violation`, `suggestion`, `element`, and `replacement` fields **When** an AI agent reads the finding **Then** the agent has enough context to locate the exact source location and understand what replacement to make

2. **Given** a file with multiple raw HTML element violations **When** the tool is run with `--format json`, findings are fixed, and the tool is rerun **Then** the second run produces fewer findings (progress is visible) **And** when all violations are fixed and the tool is rerun, the output shows `"pass": true` with `"total": 0`

3. **Given** the same source files are scanned twice **When** JSON output is compared between runs **Then** the output is byte-for-byte identical (deterministic) **And** findings appear in the same order (alphabetical by file, then by line number)

4. **Given** a fatal error occurs during a JSON-format run (e.g., path not found) **When** the error is handled **Then** stderr contains the human-readable error message **And** stdout contains no partial or malformed JSON output **And** the process exits with code 2

## Tasks / Subtasks

- [ ] Task 1: Verify JSON context sufficiency (AC: 1)
  - [ ] Review `Finding` type in `src/types.ts` to ensure all fields from Story 2.1 are present
  - [ ] Verify `json-formatter.ts` includes all these fields in its output
- [ ] Task 2: Implement and verify determinism (AC: 3)
  - [ ] Ensure `scanner.ts` sorts discovered files alphabetically (already in Story 1.2 AC)
  - [ ] Ensure `rule-engine.ts` processes files in the discovered order
  - [ ] Ensure findings within a file are sorted by line and column number
  - [ ] Write integration test verifying byte-for-byte identical output for repeated runs on the same input
- [ ] Task 3: Validate fix-and-rerun loop (AC: 2)
  - [ ] Create an integration test that:
    1. Runs `shadcn-doctor` on a fixture with multiple violations
    2. Parses the JSON output
    3. Programmatically "fixes" one violation in the fixture (or mocks the fix)
    4. Reruns `shadcn-doctor` and verifies the finding count decreased
    5. Fixes all violations and verifies `pass: true` and `total: 0`
- [ ] Task 4: Ensure clean fatal error handling for JSON mode (AC: 4)
  - [ ] Verify `cli.ts` `run()` function handles fatal errors by writing ONLY to stderr
  - [ ] Add integration test: `npx shadcn-doctor ./nonexistent --format json`
  - [ ] Assert: stdout is empty, stderr has error message, exit code 2

## Dev Notes

- Determinism is a core architectural requirement. File sorting should happen in the scanner, and finding sorting should be maintained or applied in the engine/formatter.
- Fatal errors (exit code 2) must not emit any JSON to stdout, as this would break parsers expecting a complete result.
- AI agents rely on the `line` and `column` being accurate to apply patches.

### Project Structure Notes

- Determinism logic should live in `src/scanner/file-discovery.ts` (file sorting) and `src/engine/rule-engine.ts` (finding sorting if needed).
- Fatal error handling is managed in `src/cli.ts`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.2-AI-Agent-Loop-Validation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Determinism]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey-2-AI-Agent-The-Autonomous-Loop]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
