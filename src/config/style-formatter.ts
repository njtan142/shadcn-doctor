import type { Config } from './config-resolver.js';

function getIndent(indent: number): string {
  return ' '.repeat(indent);
}

function applyQuotes(line: string, quoteStyle: 'single' | 'double'): string {
  if (quoteStyle === 'single') {
    return line.replace(/"([^"]*)"/g, "'$1'");
  }
  return line;
}

function findOpeningTagEnd(sourceLine: string): number {
  let i = 0;
  let inAttr = false;
  let attrChar = '';
  let braceDepth = 0;

  while (i < sourceLine.length) {
    const char = sourceLine[i];

    if (inAttr) {
      if (char === attrChar) {
        inAttr = false;
      }
    } else if (char === '"' || char === "'") {
      inAttr = true;
      attrChar = char;
    } else if (char === '{') {
      braceDepth++;
    } else if (char === '}') {
      braceDepth--;
    } else if (char === '>' && braceDepth === 0) {
      return i;
    }
    i++;
  }
  return -1;
}

function formatCompact(sourceLine: string, replacement: string, config: Config): string {
  const tagEnd = findOpeningTagEnd(sourceLine);
  if (tagEnd === -1) {
    const simpleMatch = sourceLine.match(/^<(\w+)/);
    if (!simpleMatch) {
      return `<${replacement}>`;
    }
    const originalAttrs = sourceLine.slice(simpleMatch[0].length);
    return applyQuotes(`<${replacement}${originalAttrs}`, config.quotes);
  }

  const elementMatch = sourceLine.match(/^<(\w+)/);
  if (!elementMatch) {
    return `<${replacement}>`;
  }
  const tagContent = sourceLine.slice(elementMatch[0].length, tagEnd + 1);
  const childrenAndClosing = sourceLine.slice(tagEnd + 1);
  return applyQuotes(`<${replacement}${tagContent}${childrenAndClosing}`, config.quotes);
}

function parseAttributes(attrsStr: string): string[] {
  const trimmed = attrsStr.trimEnd();
  if (trimmed.endsWith('/')) {
    const withoutSlash = trimmed.slice(0, -1).trimEnd();
    if (withoutSlash) {
      const props = withoutSlash.split(/\s+/).filter((s) => s.length > 0);
      return props;
    }
    return [];
  }

  const props: string[] = [];
  let i = 0;
  let currentProp = '';
  let inAttr = false;
  let attrChar = '';

  while (i < attrsStr.length) {
    const char = attrsStr[i];

    if (inAttr) {
      currentProp += char;
      if (char === attrChar) {
        inAttr = false;
      }
    } else if (char === '"' || char === "'") {
      currentProp += char;
      inAttr = true;
      attrChar = char;
    } else if (char === ' ' || char === '\n' || char === '\t') {
      if (currentProp.trim()) {
        props.push(currentProp.trim());
      }
      currentProp = '';
    } else {
      currentProp += char;
    }
    i++;
  }

  if (currentProp.trim()) {
    props.push(currentProp.trim());
  }

  return props.filter((p) => p.length > 0);
}

function formatExpanded(sourceLine: string, replacement: string, config: Config): string {
  const tagEnd = findOpeningTagEnd(sourceLine);
  if (tagEnd === -1) {
    const simpleMatch = sourceLine.match(/^<(\w+)/);
    if (!simpleMatch) {
      return `<${replacement}>`;
    }
    const originalAttrs = sourceLine.slice(simpleMatch[0].length);
    return applyQuotes(`<${replacement}${originalAttrs}`, config.quotes);
  }

  const elementMatch = sourceLine.match(/^<(\w+)/);
  if (!elementMatch) {
    return `<${replacement}>`;
  }

  const attrsStr = sourceLine.slice(elementMatch[0].length, tagEnd);
  const closingBracket = sourceLine[tagEnd];
  const childrenAndClosing = sourceLine.slice(tagEnd + 1);

  const props = parseAttributes(attrsStr);
  const indent = getIndent(config.indent);

  const isSelfClosing = tagEnd > 0 && sourceLine[tagEnd - 1] === '/';
  const closingSeq = isSelfClosing ? `/>` : `${closingBracket}${childrenAndClosing}`;

  if (props.length === 0) {
    return applyQuotes(`<${replacement}${closingSeq}`, config.quotes);
  }

  const formattedProps = props.map((p) => `${indent}${p}`).join('\n');
  const result = `<${replacement}\n${formattedProps}\n${closingSeq}`;
  return applyQuotes(result, config.quotes);
}

function formatPrettier(sourceLine: string, replacement: string, config: Config): string {
  const compactResult = formatCompact(sourceLine, replacement, config);
  if (compactResult.length <= config.printWidth) {
    return compactResult;
  }
  return formatExpanded(sourceLine, replacement, config);
}

export function formatSuggestedLine(
  sourceLine: string,
  replacement: string,
  config: Config,
): string {
  switch (config.style) {
    case 'expanded':
      return formatExpanded(sourceLine, replacement, config);
    case 'prettier':
      return formatPrettier(sourceLine, replacement, config);
    default:
      return formatCompact(sourceLine, replacement, config);
  }
}
