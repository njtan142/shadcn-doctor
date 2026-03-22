# shadcn-doctor 🩺

> **Comprehensive shadcn/ui component usage analysis and migration tool**

A sophisticated CLI tool that analyzes your React codebase to identify missed opportunities for shadcn/ui component adoption, providing actionable insights and migration suggestions.

[![npm version](https://badge.fury.io/js/shadcn-doctor.svg)](https://www.npmjs.com/package/shadcn-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Vision

**Beyond simple import detection** - shadcn-doctor performs deep AST analysis to identify patterns in your codebase where shadcn/ui components should be used instead of custom HTML elements and styling.

### The Problem We Solve

- ✅ You have shadcn/ui installed and working
- ❌ Most of your codebase still uses custom `<button>`, `<div>` elements instead of shadcn components
- ❌ Large TSX files have dozens of missed opportunities for proper component usage
- ❌ No tooling exists to systematically identify and guide these migrations
- ❌ Teams don't know which patterns should become which components

### Our Solution

```bash
npx shadcn-doctor analyze

🔍 Analyzing 147 files...

📊 SHADCN ADOPTION REPORT
┌────────────────────┬───────┬─────────┬────────────┐
│ Component          │ Used  │ Missed  │ Potential  │
├────────────────────┼───────┼─────────┼────────────┤
│ Button             │   25  │   43    │    68      │
│ Card               │    3  │   28    │    31      │
│ Input              │    8  │   19    │    27      │
│ Dialog             │    2  │   15    │    17      │
│ Select             │    0  │   12    │    12      │
└────────────────────┴───────┴─────────┴────────────┘

🎯 Current adoption: 18% (38/158 opportunities)
🚀 Potential adoption: 74% (155/158 opportunities)

📁 TOP PRIORITY FILES:
└── src/components/UserDashboard.tsx (12 opportunities)
    ├── Line 45: <button className="bg-blue-500..."> → <Button variant="default">
    ├── Line 78: <div className="border rounded..."> → <Card>
    └── Line 102: <input className="w-full..."> → <Input>
```

## 🏗️ Architecture

### Multi-Layer Analysis Engine

```
shadcn-doctor/
├── analyzers/              # Component-specific pattern detection
│   ├── ButtonAnalyzer.ts   # <button> → <Button> detection
│   ├── CardAnalyzer.ts     # Layout divs → <Card> detection  
│   ├── InputAnalyzer.ts    # <input> → <Input> detection
│   ├── DialogAnalyzer.ts   # Modal patterns → <Dialog>
│   └── SelectAnalyzer.ts   # Custom dropdowns → <Select>
├── detectors/              # AST parsing and pattern matching
├── reporters/              # Output formatting and suggestions
└── cli.ts                 # npx entry point
```

### Component Detection Strategies

#### Button Analysis
```typescript
// Detects these patterns:
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
<div onClick={handler} className="cursor-pointer bg-gray-100">
<a className="inline-flex items-center px-4 py-2 border">

// Suggests:
<Button variant="default">
<Button variant="ghost">  
<Button variant="outline">
```

#### Card Analysis  
```typescript
// Detects these patterns:
<div className="bg-white shadow rounded-lg border">
<div className="p-6 bg-card border rounded">
<section className="border border-gray-200 rounded-md">

// Suggests:
<Card>
  <CardHeader>
    <CardTitle>
  <CardContent>
```

## 🚀 Usage

### Installation

```bash
# Run directly
npx shadcn-doctor analyze

# Or install globally  
npm install -g shadcn-doctor
shadcn-doctor analyze
```

### Commands

```bash
# Comprehensive analysis
shadcn-doctor analyze

# Focus on specific components
shadcn-doctor analyze --components button,card,input

# Generate migration plan
shadcn-doctor analyze --format=plan > migration-plan.md

# CI/CD integration
shadcn-doctor analyze --threshold=60 --fail-below-threshold
```

### Configuration

```json
// shadcn-doctor.config.json
{
  "threshold": 60,
  "ignore": ["**/*.test.tsx", "src/legacy/**"],
  "components": ["button", "card", "input", "dialog", "select"],
  "customPatterns": {
    "button": ["div[onClick][className*=button]"]
  }
}
```

## 🎯 Roadmap

### Phase 1: MVP (Q1 2026)
- [x] Core CLI architecture
- [ ] Button, Card, Input analyzers
- [ ] Basic reporting
- [ ] NPM package distribution

### Phase 2: Enhanced Analysis (Q2 2026)  
- [ ] Dialog, Select, Form analyzers
- [ ] Before/after code suggestions
- [ ] Integration with popular bundlers
- [ ] VS Code extension

### Phase 3: Community Ecosystem (Q3 2026)
- [ ] Plugin architecture for custom components
- [ ] Framework support (Vue, Svelte)
- [ ] Integration with design systems
- [ ] Auto-fix capabilities

## 🤝 Contributing

This project is built using [BMAD (Business Model Agile Development)](https://github.com/bmad-org/bmad) methodology for systematic development workflows.

### Development Setup

```bash
git clone https://github.com/yourusername/shadcn-doctor.git
cd shadcn-doctor

# Install BMAD for structured development
npx @bmad/installer@latest

# Start development
/bmad-quick-spec "Add button analyzer with pattern detection"
```

### Contribution Guidelines

1. **Use BMAD workflows** for feature development
2. **Add comprehensive tests** for new analyzers  
3. **Update documentation** for new detection patterns
4. **Follow semantic versioning** for releases

## 🔧 Technical Details

### AST Parsing Strategy
- Uses TypeScript Compiler API for robust parsing
- Pattern matching via CSS-selector-like queries
- Configurable confidence scoring for suggestions

### Performance Considerations
- Incremental analysis for large codebases
- Caching layer for repeated analysis
- Parallel processing for multiple files

### Output Formats
- **Terminal**: Colorized, interactive reports
- **JSON**: Machine-readable for CI/CD integration
- **Markdown**: Documentation-ready migration plans

## 📄 License

MIT © [Contributors](https://github.com/njtan142/shadcn-doctor/graphs/contributors)

---

**Built with ❤️ for the shadcn/ui community**

> *"Every custom button deserves to become a proper `<Button>` component"*