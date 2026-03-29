import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnPagination } from './prefer-shadcn-pagination.js';

describe('prefer-shadcn-pagination rule', () => {
  const project = new Project();

  it('should detect <nav aria-label="pagination">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_pagination__.tsx',
      `export const Test = () => (
  <nav aria-label="pagination">
    <ul>
      <li><a href="#">1</a></li>
      <li><a href="#">2</a></li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPagination], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-pagination',
      replacement: 'Pagination',
      element: 'nav',
    });
  });

  it('should detect <nav aria-label="Pagination"> (capitalized)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_pagination_caps__.tsx',
      `export const Test = () => (
  <nav aria-label="Pagination">
    <ul>
      <li><a href="#">1</a></li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPagination], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-pagination',
      replacement: 'Pagination',
      element: 'nav',
    });
  });

  it('should detect <ul> with className containing "pagination"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_pagination_ul__.tsx',
      `export const Test = () => (
  <ul className="pagination-list flex">
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
  </ul>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPagination], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-pagination',
      replacement: 'Pagination',
      element: 'ul',
    });
  });

  it('should detect <nav> with className containing "pagination"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_pagination_nav_class__.tsx',
      `export const Test = () => (
  <nav className="pagination-nav">
    <button>Previous</button>
    <button>Next</button>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPagination], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-pagination',
      replacement: 'Pagination',
      element: 'nav',
    });
  });

  it('should not flag shadcn/ui Pagination component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_pagination_clean__.tsx',
      `import { Pagination } from '@/components/ui/pagination';
export const Clean = () => <Pagination />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPagination], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <nav> without pagination indicators', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_pagination_no_flag__.tsx',
      `export const Clean = () => (
  <nav aria-label="main">
    <ul>
      <li>Home</li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPagination], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
