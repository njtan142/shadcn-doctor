import { describe, expect, it } from 'vitest';
import type { Config } from './config-resolver.js';
import { formatSuggestedLine } from './style-formatter.js';

describe('Style Formatter', () => {
  describe('compact style', () => {
    it('should format simple button as single line', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button onClick={handleClick} className="bg-primary">Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button onClick={handleClick} className="bg-primary">Click</button>');
    });

    it('should handle self-closing elements', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button className="bg-primary" />';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button className="bg-primary" />');
    });

    it('should handle elements without attributes', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button>Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button>Click</button>');
    });
  });

  describe('expanded style', () => {
    it('should format with each prop on its own line', () => {
      const config: Config = { style: 'expanded', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button onClick={handleClick} className="bg-primary">Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe(
        '<Button\n  onClick={handleClick}\n  className="bg-primary"\n>Click</button>',
      );
    });

    it('should use configured indent size', () => {
      const config: Config = { style: 'expanded', indent: 4, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button onClick={handleClick}>Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button\n    onClick={handleClick}\n>Click</button>');
    });

    it('should handle self-closing elements in expanded mode', () => {
      const config: Config = { style: 'expanded', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button className="bg-primary" />';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button\n  className="bg-primary"\n/>');
    });
  });

  describe('prettier style', () => {
    it('should use compact when under printWidth', () => {
      const config: Config = { style: 'prettier', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button onClick={handleClick}>Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button onClick={handleClick}>Click</button>');
    });

    it('should use expanded when over printWidth', () => {
      const config: Config = { style: 'prettier', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine =
        '<button onClick={handleClick} className="bg-primary text-white font-bold">Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe(
        '<Button\n  onClick={handleClick}\n  className="bg-primary text-white font-bold"\n>Click</button>',
      );
    });

    it('should respect custom printWidth', () => {
      const config: Config = { style: 'prettier', indent: 2, quotes: 'double', printWidth: 120 };
      const sourceLine = '<button onClick={handleClick} className="bg-primary">Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button onClick={handleClick} className="bg-primary">Click</button>');
    });
  });

  describe('quote style', () => {
    it('should apply single quotes when configured', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'single', printWidth: 80 };
      const sourceLine = '<button className="bg-primary">Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe("<Button className='bg-primary'>Click</button>");
    });

    it('should keep double quotes by default', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<button className="bg-primary">Click</button>';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button className="bg-primary">Click</button>');
    });
  });

  describe('element-level swap only', () => {
    it('should only replace opening tag, not children', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine =
        '<select><option value="1">One</option><option value="2">Two</option></select>';
      const result = formatSuggestedLine(sourceLine, 'Select', config);
      expect(result).toBe(
        '<Select><option value="1">One</option><option value="2">Two</option></select>',
      );
    });

    it('should handle div with children', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '<div><span>text</span></div>';
      const result = formatSuggestedLine(sourceLine, 'Badge', config);
      expect(result).toBe('<Badge><span>text</span></div>');
    });
  });

  describe('edge cases', () => {
    it('should handle non-element input gracefully', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = 'not an element';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button>');
    });

    it('should handle empty source line', () => {
      const config: Config = { style: 'compact', indent: 2, quotes: 'double', printWidth: 80 };
      const sourceLine = '';
      const result = formatSuggestedLine(sourceLine, 'Button', config);
      expect(result).toBe('<Button>');
    });
  });
});
