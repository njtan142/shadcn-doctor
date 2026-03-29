import type { Config } from './config-resolver.js';

function getIndent(indent: number): string {
  return ' '.repeat(indent);
}

function displayWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x10000) {
      width += 2;
    } else if (code > 0x7f) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

function applyQuotes(line: string, quoteStyle: 'single' | 'double'): string {
  if (quoteStyle !== 'single') {
    return line;
  }
  const result: string[] = [];
  let i = 0;
  let braceDepth = 0;

  while (i < line.length) {
    const char = line[i];
    if (char === '{') {
      braceDepth++;
      result.push(char);
    } else if (char === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      result.push(char);
    } else if (char === '"' && braceDepth === 0) {
      let end = i + 1;
      while (end < line.length && line[end] !== '"') {
        if (line[end] === '\\') {
          result.push(line[end]);
          if (end + 1 < line.length) {
            result.push(line[end + 1]);
            end += 2;
            continue;
          }
          break;
        }
        end++;
      }
      result.push("'");
      for (let j = i + 1; j < end; j++) {
        result.push(line[j]);
      }
      result.push("'");
      i = end;
    } else {
      result.push(char);
    }
    i++;
  }

  return result.join('');
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
  const tagContent = sourceLine.slice(elementMatch[0].length, tagEnd);
  const isSelfClosing = tagEnd > 0 && sourceLine[tagEnd - 1] === '/';
  const closingSeq = isSelfClosing ? `/>` : `${sourceLine[tagEnd]}${sourceLine.slice(tagEnd + 1)}`;
  const attrs = isSelfClosing ? tagContent.slice(0, -1) : tagContent;
  return applyQuotes(`<${replacement}${attrs}${closingSeq}`, config.quotes);
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
  let currentProp = '';
  let inAttr = false;
  let attrChar = '';

  for (const char of attrsStr) {
    if (inAttr) {
      currentProp += char;
      if (char === attrChar) {
        inAttr = false;
      }
    } else if (char === '"' || char === "'") {
      currentProp += char;
      inAttr = true;
      attrChar = char;
    } else if (/\s/.test(char)) {
      if (currentProp.trim()) {
        props.push(currentProp.trim());
      }
      currentProp = '';
    } else {
      currentProp += char;
    }
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
  if (displayWidth(compactResult) < config.printWidth) {
    return compactResult;
  }
  return formatExpanded(sourceLine, replacement, config);
}

export function formatSuggestedLine(
  sourceLine: string,
  replacement: string,
  config: Config,
): string {
  const MAX_INPUT_LENGTH = 10000;
  if (sourceLine.length > MAX_INPUT_LENGTH) {
    return `<${replacement}>`;
  }

  switch (config.style) {
    case 'expanded':
      return formatExpanded(sourceLine, replacement, config);
    case 'prettier':
      return formatPrettier(sourceLine, replacement, config);
    default:
      return formatCompact(sourceLine, replacement, config);
  }
}
