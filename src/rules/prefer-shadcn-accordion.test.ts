import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnAccordion } from './prefer-shadcn-accordion.js';

describe('prefer-shadcn-accordion rule', () => {
  const project = new Project();

  it('should detect raw <details> elements', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_accordion_details__.tsx',
      `export const Test = () => (
  <div>
    <details>
      <summary>Section title</summary>
      <p>Content here</p>
    </details>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAccordion], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-accordion',
      replacement: 'Accordion',
      element: 'details',
    });
  });

  it('should detect self-closing <details /> element', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_accordion_details_self_closing__.tsx',
      `export const Test = () => (
  <div>
    <details />
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAccordion], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-accordion',
      replacement: 'Accordion',
      element: 'details',
    });
  });

  it('should detect <div> with accordion className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_accordion_div__.tsx',
      `export const Test = () => (
  <div className="accordion-container">
    <div className="accordion-item">Item 1</div>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAccordion], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-accordion',
      replacement: 'Accordion',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Accordion component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_accordion_clean__.tsx',
      `import { Accordion } from '@/components/ui/accordion';
export const Clean = () => <Accordion />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAccordion], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag plain <div> without accordion class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_accordion_nodiv__.tsx',
      `export const Test = () => (
  <div className="flex flex-col gap-4">
    <p>Some content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAccordion], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
