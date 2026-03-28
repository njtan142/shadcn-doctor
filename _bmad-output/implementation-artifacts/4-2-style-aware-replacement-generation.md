# Story 4.2: Style-Aware Replacement Generation

Status: ready-for-dev

## Story

As a developer or AI agent reading shadcn-doctor suggestions,
I want the replacement code in the `+` diff line to match my project's formatting style,
so that suggestions are copy-paste ready without needing manual reformatting.

## Acceptance Criteria

1. **Given** no `.shadcn-doctorrc.json` config exists
   **When** replacement code is generated for the `+` diff line
   **Then** the compact preset is used by default (single-line replacement when possible)
   **And** double quotes and 2-space indentation are the defaults

2. **Given** a `.shadcn-doctorrc.json` with `"style": "compact"` exists in the project root
   **When** replacement code is generated
   **Then** the replacement fits on a single line when props are few
   **And** the output matches the configured indent and quote style

3. **Given** a `.shadcn-doctorrc.json` with `"style": "expanded"` exists
   **When** replacement code is generated
   **Then** each prop appears on its own line
   **And** the closing `>` or `/>` is on its own line
   **And** indentation uses the configured indent style

4. **Given** a `.shadcn-doctorrc.json` with `"style": "prettier"` and `"printWidth": 80` exists
   **When** replacement code is generated and the single-line version exceeds print width
   **Then** the replacement is formatted as expanded (multi-line)
   **When** the single-line version fits within print width
   **Then** the replacement is formatted as compact (single-line)

5. **Given** config resolution runs
   **When** no config file exists
   **Then** defaults are used silently with no warning or message to the user

6. **Given** a `.shadcn-doctorrc.json` exists but contains malformed JSON
   **When** config resolution runs
   **Then** `⚠ Invalid config: .shadcn-doctorrc.json (using defaults)` is written to stderr
   **And** the compact default preset is used

7. **Given** all replacement suggestions across different rules
   **When** they are generated
   **Then** the quote style (double or single) from config is applied consistently
   **And** only the element-level swap is generated (complex child transformations like `<select>` + `<option>` children show opening element replacement only)

## Tasks / Subtasks

- [ ] Task 1 (AC: #5, #6)
  - [ ] Create `src/config/config-resolver.ts` module for loading `.shadcn-doctorrc.json`
  - [ ] Implement config file search in project root (current working directory)
  - [ ] Handle missing config gracefully with silent defaults
  - [ ] Handle malformed JSON with warning to stderr and fallback to defaults
  - [ ] Export `Config` type and `resolveConfig()` function

- [ ] Task 2 (AC: #1, #2, #3, #4, #7)
  - [ ] Create `src/config/style-formatter.ts` module for style-aware formatting
  - [ ] Implement `compact` preset: single-line when props fit within printWidth
  - [ ] Implement `expanded` preset: always multi-line with one prop per line
  - [ ] Implement `prettier` preset: threshold-based (compact if under printWidth, expanded if over)
  - [ ] Support configurable indent (2-space, 4-space, tab)
  - [ ] Support configurable quote style (double or single)
  - [ ] Support configurable printWidth (default 80)
  - [ ] Ensure element-level swap only (no child content transformation)

- [ ] Task 3 (AC: #2, #3, #4, #7)
  - [ ] Integrate style formatter with rule engine's `generateSuggestedLine()` function
  - [ ] Pass configured style settings to suggestion generation
  - [ ] Verify quote style is applied correctly to generated suggestions

- [ ] Task 4 (AC: #5, #6)
  - [ ] Add tests for config-resolver with missing config file (should use defaults silently)
  - [ ] Add tests for config-resolver with malformed JSON (should warn and use defaults)
  - [ ] Add tests for config-resolver with valid config (should apply settings)
  - [ ] Add tests for style-formatter with compact preset
  - [ ] Add tests for style-formatter with expanded preset
  - [ ] Add tests for style-formatter with prettier preset (under and over printWidth)

- [ ] Task 5 (AC: #7)
  - [ ] Verify element-level swap only behavior (e.g., select shows only `<Select>` opening tag)
  - [ ] Verify complex children are not generated in suggestions

## Dev Notes

### Config File Format

The `.shadcn-doctorrc.json` file stores formatting preferences:

```json
{
  "style": "compact",
  "indent": 2,
  "quotes": "double",
  "printWidth": 80
}
```

**Default values when no config exists:**
- `style`: `"compact"`
- `indent`: `2`
- `quotes`: `"double"`
- `printWidth`: `80`

### Config Resolution Logic

```
1. Search for `.shadcn-doctorrc.json` in current working directory
2. If not found → use defaults silently (no message)
3. If found but malformed JSON → warning to stderr, use defaults
4. If found and valid → apply settings
```

### Style Presets

**Compact (default):**
```tsx
<Button onClick={handleClick} className="bg-primary">
```
Single line when all props fit within printWidth.

**Expanded:**
```tsx
<Button
  onClick={handleClick}
  className="bg-primary"
>
```
Always multi-line with one prop per line.

**Prettier:**
```tsx
// Under printWidth (80 chars) → compact
<Button onClick={handleClick}>

// Over printWidth → expanded
<Button
  onClick={handleClick}
  className="bg-primary text-white"
>
```

### Element-Level Swap Only

Complex child transformations are NOT generated. For example:

- `<select><option>...</option></select>` → `<Select>` (opening tag only, no Option children)
- `<div><span>...</span></div>` → `<Badge>` or appropriate component (text content not cloned)

This matches UX-DR15 specification.

### Project Structure Notes

- New directory: `src/config/` with `index.ts`, `config-resolver.ts`, `style-formatter.ts`
- Config module is independent — can be used by both CLI and rule engine
- Config resolution is synchronous and fast (file read + JSON parse)

### Source Tree Components to Touch

- `src/config/` (NEW: config resolution and style formatting)
  - `src/config/index.ts` (barrel export)
  - `src/config/config-resolver.ts` (config file loading and validation)
  - `src/config/style-formatter.ts` (style-aware suggestion formatting)
  - `src/config/config-resolver.test.ts`
  - `src/config/style-formatter.test.ts`
- `src/engine/rule-engine.ts` (integrate style formatter with `generateSuggestedLine()`)
- `src/__fixtures__/` (add fixture for config-based formatting tests)

### Testing Standards Summary

- Co-located tests: `*.test.ts` next to source files
- Test config resolution with missing, malformed, and valid configs
- Test style formatter with all three presets
- Test edge cases: empty props, many props, long prop values
- Test quote and indent configuration

### References

- Config file spec: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Setup Command UX]
- Style-aware suggestion: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Style-Aware Suggestion Generation]
- Story 4.1 context: [Source: _bmad-output/implementation-artifacts/4-1-source-line-extraction-diff-output.md]
- Finding type with sourceLine/suggestedLine: [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
