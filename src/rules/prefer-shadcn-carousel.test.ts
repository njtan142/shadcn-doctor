import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnCarousel } from './prefer-shadcn-carousel.js';

describe('prefer-shadcn-carousel rule', () => {
  const project = new Project();

  it('should detect <div> with carousel class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_div__.tsx',
      `export const Test = () => <div className="carousel overflow-hidden">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-carousel',
      replacement: 'Carousel',
      element: 'div',
    });
  });

  it('should detect <section> with carousel class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_section__.tsx',
      `export const Test = () => <section className="carousel w-full">content</section>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-carousel',
      replacement: 'Carousel',
      element: 'section',
    });
  });

  it('should detect <div> with swiper class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_swiper__.tsx',
      `export const Test = () => <div className="swiper w-full">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-carousel', replacement: 'Carousel' });
  });

  it('should detect <div> with embla class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_embla__.tsx',
      `export const Test = () => <div className="embla overflow-hidden">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-carousel', replacement: 'Carousel' });
  });

  it('should detect <div> with slider combined with container', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_slider_container__.tsx',
      `export const Test = () => <div className="slider container w-full">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-carousel', replacement: 'Carousel' });
  });

  it('should detect <div> with slider combined with wrapper', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_slider_wrapper__.tsx',
      `export const Test = () => <div className="slider wrapper">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-carousel', replacement: 'Carousel' });
  });

  it('should detect <div> with slider-container compound class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_slider_compound__.tsx',
      `export const Test = () => <div className="slider-container">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-carousel', replacement: 'Carousel' });
  });

  it('should not flag <div> with slider alone (avoid conflict with Slider rule)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_slider_alone__.tsx',
      `export const Test = () => <div className="slider">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag non-div/section elements with carousel class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_nav__.tsx',
      `export const Test = () => <nav className="carousel">content</nav>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Carousel component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_carousel_clean__.tsx',
      `import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
export const Clean = () => (
  <Carousel>
    <CarouselContent>
      <CarouselItem>Slide 1</CarouselItem>
    </CarouselContent>
  </Carousel>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCarousel], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
