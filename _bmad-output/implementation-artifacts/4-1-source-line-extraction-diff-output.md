# Story 4.1: Source Line Extraction & Diff Output

Status: ready-for-dev

## Story

As a developer reading shadcn-doctor findings,
I want each finding to show the detected source code line and its suggested replacement in a git-style diff format,
so that I can immediately see exactly what to change without looking up the file.

## Acceptance Criteria

1. **Given** a TSX file with a raw `<button>` element at line 24
   **When** the human formatter renders the finding
   **Then** the output includes:
   ```
     24:5  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
     - <button className="bg-blue-500 text-white px-4 py-2" onClick={save}>
     + <Button onClick={save}>
   ```
   **And** the `-` line is rendered in red (ANSI 31)
   **And** the `+` line is rendered in green (ANSI 32)
   **And** a blank line separates this finding block from the next finding in the same file

2. **Given** multiple findings in the same file
   **When** the human formatter renders them
   **Then** each finding is followed by its own `-/+` diff lines
   **And** a blank line separates each finding block
   **And** no blank lines appear between the finding message line and its diff lines

3. **Given** a clean pass with no findings
   **When** the human formatter renders output
   **Then** no diff lines are produced
   **And** output remains: `No findings. N files scanned.`

4. **Given** `--format json` is used and findings exist
   **When** the JSON formatter renders output
   **Then** each finding object includes a `sourceLine` field containing the raw detected source code line
   **And** each finding object includes a `suggestedLine` field containing the replacement suggestion
   **And** no ANSI codes are present in either field

5. **Given** `NO_COLOR` is set or stdout is non-TTY
   **When** diff lines are rendered in human output
   **Then** the `-` and `+` prefix symbols remain visible
   **And** all information is conveyed without color

## Tasks / Subtasks

- [ ] Task 1 (AC: #1, #2)
  - [ ] Add `sourceLine` and `suggestedLine` fields to the `Finding` type in `src/types.ts`
  - [ ] Modify rule interface to support source line extraction (rules return source line text)
- [ ] Task 2 (AC: #1, #2)
  - [ ] Update `src/formatters/human-formatter.ts` to render diff lines after each finding
  - [ ] Implement red `-` line rendering for source code
  - [ ] Implement green `+` line rendering for suggested replacement
  - [ ] Add blank line spacing between finding blocks
- [ ] Task 3 (AC: #4)
  - [ ] Update `src/formatters/json-formatter.ts` to include `sourceLine` and `suggestedLine` in finding output
  - [ ] Verify no ANSI codes in JSON output fields
- [ ] Task 4 (AC: #5)
  - [ ] Ensure diff line symbols remain visible when colors are disabled
  - [ ] Verify `NO_COLOR` and non-TTY scenarios work correctly
- [ ] Task 5 (AC: #3)
  - [ ] Verify clean pass output has no diff lines

## Dev Notes

### Finding Type Update (from architecture)

The `Finding` type needs two new fields for source line extraction:

```typescript
interface Finding {
  file: string;       // Relative path from scan root
  line: number;       // 1-based line number
  column: number;     // 1-based column number
  rule: string;       // Rule ID: "prefer-shadcn-button"
  violation: string;  // Human-readable: "Raw <button> element detected"
  suggestion: string; // Human-readable: "Use <Button> from shadcn/ui"
  element: string;    // The detected element: "button"
  replacement: string;// The shadcn/ui component: "Button"
  sourceLine: string; // NEW: The raw source code line
  suggestedLine: string; // NEW: The replacement suggestion line
}
```

### Source Line Extraction

The source line is the complete line of source code where the violation was found. For example:
- Source line: `<button className="bg-blue-500 text-white px-4 py-2" onClick={save}>`
- Suggested line: `<Button onClick={save}>`

**Note:** The suggested line uses compact style by default (single-line when possible). The style-aware formatting with config file support is handled in Story 4.2.

### Human Formatter Diff Output Structure

```
src/pages/settings.tsx
  24:5  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
  - <button className="bg-blue-500 text-white px-4 py-2" onClick={save}>
  + <Button onClick={save}>

  41:3  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
  - <button className="bg-blue-500 text-white px-4 py-2" onClick={save}>
  + <Button onClick={save}>

src/components/form.tsx
  12:7  Raw <input> detected. Use <Input> from shadcn/ui.  prefer-shadcn-input
  - <input type="text" className="border rounded px-3 py-2" value={name} onChange={setName} />
  + <Input type="text" value={name} onChange={setName} />

3 findings in 42 files scanned.
```

### Color Implementation

Use `picocolors` library for colors (per UX-DR19). Never hard-code ANSI escape sequences.

```typescript
import pc from 'picocolors';

const redLine = pc.red('- <source>');
const greenLine = pc.green('+ <suggestion>');
```

### NO_COLOR and TTY Detection

Per UX-DR2 and UX-DR3:
- Check `process.env.NO_COLOR` - if set, suppress all colors
- Check `process.stdout.isTTY` - if false, auto-disable colors
- `FORCE_COLOR` env var overrides to force colors on

### Project Structure Notes

- Formatter file: `src/formatters/human-formatter.ts` (existing, modify)
- JSON formatter: `src/formatters/json-formatter.ts` (existing, modify)
- Types file: `src/types.ts` (existing, modify to add new fields)
- Rule files: All existing rules need to return `sourceLine` and `suggestedLine`
- Color utility: `picocolors` (from UX-DR19, verify it's installed)

### Source Tree Components to Touch

- `src/types.ts` (add sourceLine and suggestedLine to Finding interface)
- `src/formatters/human-formatter.ts` (add diff line rendering)
- `src/formatters/json-formatter.ts` (add sourceLine/suggestedLine to JSON output)
- `src/rules/*.ts` (all rules need to extract and return sourceLine/suggestedLine)
- `src/__fixtures__/` (verify existing fixtures cover needs)

### Testing Standards Summary

- Co-located tests: `*.test.ts` next to source files
- Test fixtures in `src/__fixtures__/`
- Use Vitest 4.x (from architecture)
- Test diff line rendering in human-formatter.test.ts
- Test sourceLine/suggestedLine in json-formatter.test.ts
- Verify color suppression scenarios with NO_COLOR and non-TTY

### References

- Rule interface: [Source: _bmad-output/planning-artifacts/architecture.md#Rule Definition Pattern]
- Finding type: [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Human formatter UX: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- Color system: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- NO_COLOR compliance: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Considerations]
- Story 4.2 context: [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2: Style-Aware Replacement Generation]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
