# Story 3.1: Form Control Detection Rules (Checkbox, Switch, RadioGroup)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer using shadcn-doctor,
I want the tool to detect raw `<input type="checkbox">`, toggle/switch patterns, and `<input type="radio">` elements,
so that all form control components are covered by the analysis and I get suggestions for their shadcn/ui equivalents.

## Acceptance Criteria

1. **Given** a TSX file containing `<input type="checkbox" />` **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-checkbox`, violation "Raw <input type=\"checkbox\"> detected. Use <Checkbox> from shadcn/ui.", element `input`, replacement `Checkbox`

2. **Given** a TSX file containing a toggle/switch pattern (e.g., `<input type="checkbox" role="switch" />` or a `<div>` with `role="switch"`) **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-switch`, violation "Custom switch detected. Use <Switch> from shadcn/ui.", element `input` or `div`, replacement `Switch`

3. **Given** a TSX file containing `<input type="radio" />` elements **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-radio-group`, violation "Raw <input type=\"radio\"> detected. Use <RadioGroup> from shadcn/ui.", element `input`, replacement `RadioGroup`

4. **Given** a TSX file using shadcn/ui `<Checkbox>`, `<Switch>`, or `<RadioGroup>` components **When** the rule engine processes the file **Then** no findings are produced for those components

5. **Given** an `<input>` element with `type="text"` or `type="email"` or other non-checkbox/radio type **When** the checkbox and radio rules evaluate it **Then** the checkbox and radio rules do not flag it (the input rule from Epic 1 handles generic inputs)

## Tasks / Subtasks

- [ ] Task 1: Create `prefer-shadcn-checkbox` rule (AC: 1, 4, 5)
  - [ ] Create `src/rules/prefer-shadcn-checkbox.ts` following the exact same structure as existing rules
  - [ ] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with tag name `input` (lowercase only)
  - [ ] Check for `type="checkbox"` attribute
  - [ ] Exclude if `role="switch"` is present (handled by switch rule)
  - [ ] Return finding with: rule `prefer-shadcn-checkbox`, violation `"Raw <input type=\"checkbox\"> detected. Use <Checkbox> from shadcn/ui."`, suggestion `"Use <Checkbox> from shadcn/ui."`, element `input`, replacement `Checkbox`

- [ ] Task 2: Create `prefer-shadcn-switch` rule (AC: 2, 4)
  - [ ] Create `src/rules/prefer-shadcn-switch.ts` following the standard rule structure
  - [ ] Detect `JsxOpeningElement` and `JsxSelfClosingElement` for `input` and `div` tags
  - [ ] Match `input` with `type="checkbox"` AND `role="switch"`
  - [ ] Match `div` with `role="switch"`
  - [ ] Return finding with: rule `prefer-shadcn-switch`, violation `"Custom switch detected. Use <Switch> from shadcn/ui."`, suggestion `"Use <Switch> from shadcn/ui."`, element `input` or `div`, replacement `Switch`

- [ ] Task 3: Create `prefer-shadcn-radio-group` rule (AC: 3, 4, 5)
  - [ ] Create `src/rules/prefer-shadcn-radio-group.ts` following the standard rule structure
  - [ ] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with tag name `input`
  - [ ] Check for `type="radio"` attribute
  - [ ] Return finding with: rule `prefer-shadcn-radio-group`, violation `"Raw <input type=\"radio\"> detected. Use <RadioGroup> from shadcn/ui."`, suggestion `"Use <RadioGroup> from shadcn/ui."`, element `input`, replacement `RadioGroup`

- [ ] Task 4: Register rules in `src/rules/index.ts`
  - [ ] Import all three new rules
  - [ ] Add to `ALL_RULES` array
  - [ ] Add named exports

- [ ] Task 5: Update fixtures (AC: 1, 2, 3, 4, 5)
  - [ ] Add raw variants to `src/__fixtures__/raw-html-elements.tsx`
  - [ ] Add shadcn/ui components to `src/__fixtures__/clean-component.tsx`

- [ ] Task 6: Write unit tests
  - [ ] `src/rules/prefer-shadcn-checkbox.test.ts`
  - [ ] `src/rules/prefer-shadcn-switch.test.ts`
  - [ ] `src/rules/prefer-shadcn-radio-group.test.ts`

## Dev Notes

### Critical: Match established patterns from `prefer-shadcn-button.ts`

- Case-sensitive lowercase tag matching.
- `.trim()` on `getTagNameNode().getText()`.
- Return `null` if no match, `Finding` if match.
- File/line/column are 0-filled (handled by engine).

### Specific detection logic for attributes

To check attributes using `ts-morph`:
```typescript
const attributes = node.getAttributes();
const typeAttr = attributes.find(a => a.isKind(SyntaxKind.JsxAttribute) && a.getName() === 'type');
const roleAttr = attributes.find(a => a.isKind(SyntaxKind.JsxAttribute) && a.getName() === 'role');

const typeValue = typeAttr?.getInitializer()?.getText().replace(/['"]/g, '');
const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"]/g, '');
```

### Violation Message Formula (UX-DR16)

Follow the exact formula: `"Raw <{element}> detected. Use <{Component}> from shadcn/ui."`
For custom components: `"Custom {name} detected. Use <{Component}> from shadcn/ui."`

### Fixture updates

Add these for raw detection:
- `<input type="checkbox" />`
- `<input type="checkbox" role="switch" />`
- `<div role="switch"></div>`
- `<input type="radio" />`

Add these for no-op detection:
- `<Checkbox />`
- `<Switch />`
- `<RadioGroup />`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Message-Language-Patterns]
- [Source: src/rules/prefer-shadcn-button.ts (canonical rule pattern)]
- [Source: src/rules/prefer-shadcn-input.ts (previous form control rule pattern)]

## Dev Agent Record

### Agent Model Used

gemini-2.0-pro-exp

### Debug Log References

### Completion Notes List

### File List
