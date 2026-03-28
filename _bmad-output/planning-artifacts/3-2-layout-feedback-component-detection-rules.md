# Story 3.2: Layout & Feedback Component Detection Rules

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer using shadcn-doctor,
I want the tool to detect raw HTML patterns that should use shadcn/ui's Card, Dialog, Alert, Tabs, Table, Badge, and Avatar components,
so that structural and feedback components are included in the analysis.

## Acceptance Criteria

1. **Given** a TSX file containing a raw `<table>` element **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-table`, violation "Raw <table> detected. Use <Table> from shadcn/ui.", element `table`, replacement `Table`

2. **Given** a TSX file containing a raw `<dialog>` element or a `<div>` with `role="dialog"` **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-dialog`, violation "Raw <dialog> detected. Use <Dialog> from shadcn/ui." or "Custom modal <div> detected. Use <Dialog> from shadcn/ui.", element `dialog` or `div`, replacement `Dialog`

3. **Given** a TSX file containing a `<div>` with `role="alert"` or an alert-like aria pattern **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-alert`, violation "Custom alert <div> detected. Use <Alert> from shadcn/ui.", element `div`, replacement `Alert`

4. **Given** a TSX file containing a raw `<span>` or `<div>` with badge-like class names (e.g., `badge`, `tag`, `chip`, `label` with styling classes) **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-badge`, violation "Custom badge detected. Use <Badge> from shadcn/ui.", element `span` or `div`, replacement `Badge`

5. **Given** a TSX file containing a raw `<img>` element styled as a circular avatar (e.g., with `rounded-full` class and small fixed dimensions) **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-avatar`, violation "Custom avatar detected. Use <Avatar> from shadcn/ui.", element `img`, replacement `Avatar`

6. **Given** a TSX file containing tab-like navigation using raw `<button>` groups with tab-related attributes or class names **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-tabs`, violation "Custom tabs detected. Use <Tabs> from shadcn/ui.", replacement `Tabs`

7. **Given** a TSX file using shadcn/ui `<Table>`, `<Dialog>`, `<Alert>`, `<Badge>`, `<Avatar>`, or `<Tabs>` components **When** the rule engine processes the file **Then** no findings are produced for those components

8. **Given** ambiguous patterns where the developer's intent is unclear **When** the rule evaluates the node **Then** the rule does NOT flag it (conservative matching — when in doubt, don't flag)

## Tasks / Subtasks

- [x] Task 1: Create `prefer-shadcn-table` rule (AC: 1, 7)
  - [x] Create `src/rules/prefer-shadcn-table.ts`
  - [x] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with tag name `table`
  - [x] Return finding with: rule `prefer-shadcn-table`, violation `"Raw <table> detected. Use <Table> from shadcn/ui."`

- [x] Task 2: Create `prefer-shadcn-dialog` rule (AC: 2, 7)
  - [x] Create `src/rules/prefer-shadcn-dialog.ts`
  - [x] Detect `JsxOpeningElement` for `dialog` and `div` tags
  - [x] Match `dialog` (raw) or `div` with `role="dialog"` attribute
  - [x] Set violation message accordingly: `"Raw <dialog> detected. Use <Dialog> from shadcn/ui."` or `"Custom modal <div> detected. Use <Dialog> from shadcn/ui."`

- [x] Task 3: Create `prefer-shadcn-alert` rule (AC: 3, 7)
  - [x] Create `src/rules/prefer-shadcn-alert.ts`
  - [x] Detect `JsxOpeningElement` for `div` tags
  - [x] Match `div` with `role="alert"` or alert-like ARIA patterns
  - [x] Return finding with: rule `prefer-shadcn-alert`, violation `"Custom alert <div> detected. Use <Alert> from shadcn/ui."`

- [x] Task 4: Create `prefer-shadcn-badge` rule (AC: 4, 7, 8)
  - [x] Create `src/rules/prefer-shadcn-badge.ts`
  - [x] Detect `JsxOpeningElement` for `span` and `div` tags
  - [x] Check `className` for badge-like terms (`badge`, `tag`, `chip`, `label`)
  - [x] Apply conservative matching: require multiple signals or a clear indicator
  - [x] Return finding with: rule `prefer-shadcn-badge`, violation `"Custom badge detected. Use <Badge> from shadcn/ui."`

- [x] Task 5: Create `prefer-shadcn-avatar` rule (AC: 5, 7, 8)
  - [x] Create `src/rules/prefer-shadcn-avatar.ts`
  - [x] Detect `JsxOpeningElement` and `JsxSelfClosingElement` for `img` tags
  - [x] Check `className` for `rounded-full` and small sizing (e.g., `w-10 h-10`, `size-8`)
  - [x] Return finding with: rule `prefer-shadcn-avatar`, violation `"Custom avatar detected. Use <Avatar> from shadcn/ui."`

- [x] Task 6: Create `prefer-shadcn-tabs` rule (AC: 6, 7, 8)
  - [x] Create `src/rules/prefer-shadcn-tabs.ts`
  - [x] Detect patterns of `button` groups with tab-related roles or class names
  - [x] Return finding with: rule `prefer-shadcn-tabs`, violation `"Custom tabs detected. Use <Tabs> from shadcn/ui."`

- [x] Task 7: Register rules in `src/rules/index.ts`
  - [x] Import all new rules and add to `ALL_RULES` array

- [ ] Task 8: Update fixtures and write unit tests
  - [ ] Add raw variants to `src/__fixtures__/raw-html-elements.tsx`
  - [ ] Add shadcn/ui components to `src/__fixtures__/clean-component.tsx`
  - [ ] Create test files for each new rule in `src/rules/`

## Dev Notes

### Conservative Matching (NFR5)

- Rules for complex layout components (Badge, Avatar, Tabs) should be conservative.
- Avoid flagging generic `div` or `span` unless styling or roles clearly indicate a design system component mismatch.
- For `Badge`, check for common tailwind-like badge classes (`rounded-full`, `px-2.5`, `py-0.5`, `bg-primary`, etc.) in combination with keywords.

### Attribute Detection (re-use from 3.1)

- Use the `attributes.find` pattern from previous stories to safely extract `role`, `type`, and `className` values.
- For `className`, handle template literals or combined string values if possible, or stick to literal string matches for simplicity (MVP).

### Violation Message Formula (UX-DR16)

- Always use: `"Raw <{element}> detected. Use <{Component}> from shadcn/ui."`
- Or: `"Custom {name} detected. Use <{Component}> from shadcn/ui."`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Message-Language-Patterns]
- [Source: _bmad-output/planning-artifacts/3-1-form-control-detection-rules-checkbox-switch-radiogroup.md (Previous Story Pattern)]

## Dev Agent Record

### Agent Model Used

gemini-2.0-pro-exp

### Debug Log References

### Completion Notes List

### File List
