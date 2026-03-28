---
name: bmad-mastermind
description: Autonomous orchestration skill that spawns sub-agents to run the full sprint cycle (create-story, dev-story, code-review, dev-story again) iteratively with fresh contexts. Use when the user wants to run the entire Mastermind workflow autonomously.
---

# BMad Mastermind Workflow

This skill orchestrates the entire agile development lifecycle autonomously by delegating specific phases to specialized sub-agents via the `generalist` tool. This ensures each phase is executed with a fresh, focused context, preventing context bloat and improving execution quality.

## Core Mandates

- **Delegation is Mandatory:** You MUST use the `generalist` tool for each phase of the workflow to ensure a fresh context. DO NOT perform the tasks (like writing code or creating stories) in your main context.
- **Sequential Execution:** Wait for the `generalist` tool to complete its task in one turn before starting the next step.
- **Commit Between Phases:** You (the main orchestrator agent) should handle commits between each delegated task, or instruct the `generalist` to commit at the end of its run.
- **Rinse and Repeat:** Run this process in an infinite loop (or until the sprint planning indicates no more stories are available or the user stops you).

## The Mastermind Loop

For each iteration, perform the following steps sequentially. 

### Step 1: Create Story
Call the `generalist` tool with the following request:
> "Please activate the `bmad-create-story` skill. Read the sprint plan and create the next story in the `_bmad-output/planning-artifacts/` directory. Once completed, stop. Do not commit."

### Step 2: Commit Story
Once the `generalist` completes Step 1, use `run_shell_command` to commit the new story.
- `git add .`
- `git commit -m "chore(planning): create next story"`

### Step 3: Implement Story
Call the `generalist` tool with the following request:
> "Please activate the `bmad-dev-story` skill. Find the most recently created story in `_bmad-output/planning-artifacts/` and implement it fully. Ensure you validate your changes. Once completed, stop. Do not commit."

### Step 4: Commit Implementation
Once the `generalist` completes Step 3, use `run_shell_command` to commit the implementation.
- `git add .`
- `git commit -m "feat: implement story"`

### Step 5: Code Review
Call the `generalist` tool with the following request:
> "Please activate the `bmad-code-review` skill. Review the code changes made in the latest commit (`HEAD`). Produce a structured review and if there are actionable edge cases, bugs, or architectural issues, prepare a list of fixes needed. If the code is perfect, output 'No fixes required'."

### Step 6: Dev Story Again (Fixes)
If the code review produced actionable fixes, call the `generalist` tool with the following request:
> "Please activate the `bmad-quick-dev` or `bmad-dev-story` skill. Read the recent code review findings and apply all necessary fixes to the codebase to address the issues raised. Once completed, stop. Do not commit."

### Step 7: Commit Fixes
Once the `generalist` completes Step 6, use `run_shell_command` to commit the fixes.
- `git add .`
- `git commit -m "fix: address code review findings"`

### Step 8: Rinse and Repeat
Immediately begin Step 1 again to process the next story in the backlog. Continue this loop autonomously until the sprint plan is empty or the user explicitly asks to stop.
