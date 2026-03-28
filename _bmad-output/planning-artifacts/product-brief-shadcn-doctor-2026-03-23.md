---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ["README.md"]
date: 2026-03-23
author: James
---

# Product Brief: shadcn-doctor

## Executive Summary

shadcn-doctor addresses a critical gap in AI-assisted frontend development: ensuring consistent adoption of shadcn/ui components instead of custom HTML elements. Currently, even high-performance AI coding agents frequently create "fraud implementations" - importing shadcn but reverting to custom buttons, divs, and inputs, wasting tokens and creating massive technical debt that requires costly refactoring.

The tool provides iterative feedback for AI agents through AST-based pattern detection, enabling a "develop, analyze, fix, repeat" workflow with zero human intervention. This transforms frontend development from "measure once, cut twice" reactive cleanup into a proactive, self-correcting process.

---

## Core Vision

### Problem Statement

AI agents consistently fail to utilize shadcn/ui components even when instructed, defaulting to custom HTML elements and CSS classes. Traditional unit tests that only check imports and basic usage are insufficient - they miss the broader pattern of missed opportunities where shadcn components should replace custom implementations.

### Problem Impact

This creates massive oversight requiring major refactoring and architectural changes in frontend codebases. Developers experience frustrating back-and-forth cycles with AI agents, manually catching violations through code review or visual inspection. The cost compounds when using high-performance AI agents that waste tokens on inefficient implementations.

### Why Existing Solutions Fall Short

No existing tools target shadcn/ui adoption specifically. Generic ESLint rules and design system checkers focus on human developers, not AI agent workflows. Simple import/usage checking misses the core problem: AI agents creating custom implementations instead of leveraging existing design system components.

### Proposed Solution

shadcn-doctor provides intelligent AST-based pattern detection that identifies missed opportunities for shadcn/ui component adoption. Unlike AI-powered analysis tools, it uses community-driven rule patterns for predictable, cost-effective analysis that AI agents can easily integrate into iterative development workflows.

### Key Differentiators

- **AI Agent-Centric Design**: Built for iterative "analyze, fix, repeat" workflows without human intervention
- **Community-Driven Intelligence**: Open source pattern matching that evolves with community contributions
- **Pattern-Based Detection**: Identifies actual missed opportunities, not just import usage
- **First-Mover Advantage**: No existing tools target shadcn/ui adoption analysis specifically
- **Cost-Effective Analysis**: Rule-based intelligence without requiring additional AI services
- **Standard Output Format**: Familiar test runner output that integrates seamlessly with existing development workflows

## Target Users

### Primary Users

**Alex Chen - Senior AI Engineer at DevFlow AI**

Alex leads the development team for an AI coding assistant that helps React developers build applications faster. With 6 years of experience building developer tools, Alex understands that user trust is everything - when their AI agent produces inconsistent code, it reflects poorly on the entire platform.

**Problem Experience:**
Alex's biggest frustration is the endless back-and-forth when users report that the AI agent created custom `<button className="bg-blue-500...">` elements instead of using their project's shadcn components. It's like debugging, but worse - Alex has to constantly argue with their own AI about following design system patterns. Users lose confidence when they have to manually fix "obvious" component choices, and Alex's team spends hours tweaking prompts that still don't guarantee consistency.

**Current Workarounds:**
- Adding extensive design system instructions to prompts
- Manual code review of AI outputs  
- User complaints escalated to engineering team
- Constant prompt engineering experiments

**Success Vision:**
Alex wants their AI agent to automatically validate and self-correct component usage before presenting code to users. Success looks like: zero user complaints about missed shadcn opportunities, AI agents that learn from their mistakes, and a competitive advantage of having the most "design-system-aware" coding assistant in the market.

### Secondary Users

**Frontend Developers** - End users of AI coding tools who experience the frustration firsthand and provide feedback to AI tool creators.

**Design System Maintainers** - Teams who want to understand adoption patterns and ensure their components are being used correctly across AI-generated code.

### User Journey

**Discovery:** Alex finds shadcn-doctor through developer communities discussing AI agent quality issues
**Onboarding:** Integrates the tool into their AI agent's workflow as a validation step  
**Core Usage:** AI agent runs analysis automatically after code generation, self-corrects issues
**Success Moment:** First week with zero user complaints about component consistency
**Long-term:** Tool becomes standard quality gate, enabling autonomous design system compliance

## Success Metrics

**User Success Metrics (AI Agent Developers):**

**Primary Success Indicator:** Zero human intervention required for design system compliance
- AI agents complete full "develop → analyze → fix → repeat" cycles autonomously  
- Human only reviews final, pre-validated output instead of catching component issues
- Elimination of "task complete but actually needs more work" scenarios

**Measurable Outcomes:**
- **Reduced Support Load:** 90% reduction in component-related user complaints within 60 days of integration
- **Autonomous Completion Rate:** AI agents achieve "no issues detected" status before presenting code to humans
- **User Trust Increase:** Measurable improvement in user satisfaction with AI-generated component consistency

### Business Objectives

**For AI Tool Companies:**
- **Competitive Differentiation:** First-to-market with design-system-aware AI agents
- **User Retention:** Improved user satisfaction leads to lower churn rates
- **Reduced Support Costs:** Fewer escalations related to component consistency issues

**For the Open Source Project:**
- **Adoption Rate:** Number of AI coding tools integrating shadcn-doctor as quality gate
- **Community Growth:** Contributors adding new design system patterns and rules
- **Ecosystem Impact:** Industry standard for AI agent design system validation

### Key Performance Indicators

**Integration Success:**
- AI agents successfully run iterative analysis cycles without human oversight
- Time-to-clean-analysis for typical React components
- False positive rate kept under 5% to maintain AI agent trust in tool outputs

**Ecosystem Growth:**  
- Number of AI coding platforms with shadcn-doctor integration
- Community contributions of new pattern detection rules
- GitHub stars, npm downloads as leading indicators of adoption

<!-- Content will be appended sequentially through collaborative workflow steps -->