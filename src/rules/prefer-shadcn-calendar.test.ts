import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnCalendar } from './prefer-shadcn-calendar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-calendar rule', () => {
  const project = new Project();

  it('should detect self-closing <input type="date" />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_date__.tsx',
      `export const Test = () => <input type="date" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-calendar', replacement: 'Calendar' });
  });

  it('should detect self-closing <input type="datetime-local" />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_datetime__.tsx',
      `export const Test = () => <input type="datetime-local" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-calendar', replacement: 'Calendar' });
  });

  it('should detect self-closing <input type="month" />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_month__.tsx',
      `export const Test = () => <input type="month" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-calendar', replacement: 'Calendar' });
  });

  it('should detect <div> with className containing "calendar"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_classname__.tsx',
      `export const Test = () => <div className="calendar-widget">...</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-calendar', replacement: 'Calendar' });
  });

  it('should detect <div> with className containing "datepicker"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_datepicker__.tsx',
      `export const Test = () => <div className="datepicker-container">...</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-calendar', replacement: 'Calendar' });
  });

  it('should detect <div> with className containing "date-picker"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_datepicker2__.tsx',
      `export const Test = () => <div className="date-picker-wrapper">...</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-calendar', replacement: 'Calendar' });
  });

  it('should not flag shadcn/ui Calendar component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_clean__.tsx',
      `import { Calendar } from '@/components/ui/calendar';
export const Clean = () => <Calendar />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag <input type="text" />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_calendar_text__.tsx',
      `export const Clean = () => <input type="text" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCalendar], rootDir);
    expect(findings).toHaveLength(0);
  });
});
