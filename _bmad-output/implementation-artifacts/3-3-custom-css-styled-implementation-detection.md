# Story 3.3: Custom CSS-Styled Implementation Detection

Status: ready-for-dev

## Story

As a developer using shadcn-doctor,
I want the tool to detect `<div>` elements with CSS styling patterns that indicate a custom implementation of a Card component,
so that even non-semantic custom implementations are flagged when a shadcn/ui equivalent clearly applies.

## Acceptance Criteria

1. **Given** a TSX file containing a `<div>` with card-like CSS classes (e.g., `border`, `rounded`, `shadow`, `p-4` or similar padding — multiple signals combined)
   **When** the rule engine processes the file
   **Then** a finding is produced with rule ID `prefer-shadcn-card`, violation "Custom styled <div> detected. Use <Card> from shadcn/ui.", element `div`, replacement `Card`

2. **Given** a `<div>` with only one card-like class (e.g., just `border` or just `rounded`)
   **When** the rule evaluates it
   **Then** no finding is produced (single signals are too ambiguous — conservative matching)

3. **Given** a `<div>` with classes that clearly indicate non-card usage (e.g., layout containers with `flex`, `grid` without card-like styling)
   **When** the rule evaluates it
   **Then** no finding is produced

4. **Given** a shadcn/ui `<Card>` component is already in use
   **When** the rule evaluates it
   **Then** no finding is produced

5. **Given** the false positive rate across all detection rules in this epic
   **When** measured against a representative set of real-world TSX files
   **Then** the false positive rate remains below 5% (NFR5)
   **And** rules err toward not flagging when intent is ambiguous

## Tasks / Subtasks

- [ ] Task 1 (AC: #1)
  - [ ] Create `src/rules/prefer-shadcn-card.ts` rule file
  - [ ] Implement card-like class detection with multiple signals (border + rounded + shadow/padding)
  - [ ] Register rule in `src/rules/index.ts` barrel export as `prefer-shadcn-card`
- [ ] Task 2 (AC: #2, #3)
  - [ ] Implement single-signal filtering (ignore single card-like classes)
  - [ ] Implement layout container detection (ignore divs with `flex`, `grid` unless they also have strong card signals)
- [ ] Task 3 (AC: #4)
  - [ ] Add shadcn/ui Card component detection to prevent false positives
- [ ] Task 4 (AC: #5)
  - [ ] Create `src/rules/prefer-shadcn-card.test.ts` with comprehensive test cases
  - [ ] Add test fixtures for card detection to `src/__fixtures__/`
  - [ ] Verify false positive rate with conservative matching

## Dev Notes

### Rule Interface (from architecture)
```typescript
interface Rule {
  id: string;                     // "prefer-shadcn-card"
  description: string;             // Human-readable description
  nodeTypes: SyntaxKind[];        // AST node types this rule visits
  check: (node: Node) => Finding | null;
}
```

### Finding Type (from architecture)
```typescript
interface Finding {
  file: string;       // Relative path from scan root
  line: number;       // 1-based line number
  column: number;     // 1-based column number
  rule: string;       // Rule ID: "prefer-shadcn-card"
  violation: string;  // "Custom styled <div> detected. Use <Card> from shadcn/ui."
  suggestion: string; // "Use <Card> from shadcn/ui."
  element: string;    // The detected element: "div"
  replacement: string;// The shadcn/ui component: "Card"
}
```

### Card-Like CSS Class Signals
Multiple signals should be combined for a positive match:
- **Border signals:** `border`, `border-`, `rounded`, `shadow`, `shadow-`
- **Padding signals:** `p-`, `px-`, `py-`, `pt-`, `pb-`, `pl-`, `pr-`, `gap-`
- **Background signals:** `bg-`, `background`

**Match criteria:** A div must have at least 2 distinct signal categories (e.g., border + padding, or rounded + shadow + padding) to be flagged.

### Conservative Matching Rules
1. **Single signal = no flag:** A div with only `border` or only `rounded` is not flagged
2. **Layout containers excluded:** divs with `flex` or `grid` classes are not flagged unless they have very strong card signals (3+ categories)
3. **shadcn/ui Card = no flag:** If the source file imports `Card` from shadcn/ui, no findings are produced for that file

### Project Structure Notes

- Rule file location: `src/rules/prefer-shadcn-card.ts`
- Test file location: `src/rules/prefer-shadcn-card.test.ts`
- Fixture file: `src/__fixtures__/custom-styled.tsx` (from architecture, line 398)
- Export in `src/rules/index.ts` under `ALL_RULES` array
- Rule interface follows architecture exactly — no variations, no subclasses

### Detection Pattern
The rule should use ts-morph to:
1. Visit all `JsxElement` nodes with tag name `div`
2. Extract all `className` string literals and JSX attributes
3. Parse class names (support both `className="..."` string concatenation and template literals)
4. Count distinct card-signal categories
5. If >= 2 categories and no shadcn/ui Card import detected, return a finding
6. If layout classes (`flex`, `grid`) present, require >= 3 categories
7. Return `null` for no match

### Source Tree Components to Touch
- `src/rules/prefer-shadcn-card.ts` (new)
- `src/rules/prefer-shadcn-card.test.ts` (new)
- `src/rules/index.ts` (add to ALL_RULES)
- `src/__fixtures__/custom-styled.tsx` (use existing, verify it covers needed cases)

### Testing Standards Summary
- Co-located tests: `*.test.ts` next to source files
- Test fixtures in `src/__fixtures__/`
- Use Vitest 4.x (from architecture)
- Mock ts-morph Project for AST parsing tests
- Test both positive matches (multiple signals) and negative matches (single signal, layout containers)

### References

- Rule interface: [Source: _bmad-output/planning-artifacts/architecture.md#Rule Definition Pattern]
- Finding type: [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Project structure: [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- Card detection UX: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Message Language Patterns]
- Epic 3 context: [Source: _bmad-output/planning-artifacts/epics.md#Epic 3: Comprehensive Component Detection]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
- src/rules/prefer-shadcn-card.ts
- src/rules/prefer-shadcn-card.test.ts
