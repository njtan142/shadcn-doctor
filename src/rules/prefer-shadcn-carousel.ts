import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const CAROUSEL_KEYWORDS = new Set(['carousel', 'swiper', 'embla']);
const SLIDER_CONTAINER_KEYWORDS = new Set(['slider-container', 'slider-wrapper']);

export const preferShadcnCarousel: Rule = {
  id: 'prefer-shadcn-carousel',
  description:
    'Detects <div> or <section> elements with carousel/slider/swiper/embla class keywords and suggests using shadcn/ui <Carousel> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName !== 'div' && tagName !== 'section') {
      return null;
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );

    if (!classNameAttr) {
      return null;
    }

    const classNameValue =
      classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';
    const tokens = classNameValue.split(/\s+/);

    // Direct carousel/swiper/embla keyword match
    const hasCarouselKeyword = tokens.some((token) => CAROUSEL_KEYWORDS.has(token));
    if (hasCarouselKeyword) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-carousel',
        violation: `Raw <${tagName}> with carousel-like class detected. Use <Carousel> from shadcn/ui.`,
        suggestion: 'Use <Carousel> from shadcn/ui.',
        element: tagName,
        replacement: 'Carousel',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    // "slider" alone could be a Slider (range input) pattern — only flag when combined
    // with a container/wrapper token OR when it appears as a compound token like
    // "slider-container" or "slider-wrapper"
    const hasSliderToken = tokens.some((token) => token === 'slider');
    const hasContainerToken = tokens.some((token) => token === 'container' || token === 'wrapper');
    const hasSliderCompound = tokens.some((token) => SLIDER_CONTAINER_KEYWORDS.has(token));

    if (hasSliderCompound || (hasSliderToken && hasContainerToken)) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-carousel',
        violation: `Raw <${tagName}> with slider container class detected. Use <Carousel> from shadcn/ui.`,
        suggestion: 'Use <Carousel> from shadcn/ui.',
        element: tagName,
        replacement: 'Carousel',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
