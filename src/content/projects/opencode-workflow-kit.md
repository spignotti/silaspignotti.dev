---
title: "OpenCode Workflow Kit"
slug: "opencode-workflow-kit"
description: "A practical harness for AI coding agents on OpenCode. Bounded autonomy, Plan/Build separation, and review checkpoints for accountable development."
category: "AI/Automation"
tags:
  - "OpenCode"
  - "Git"
github: "https://github.com/spignotti/opencode-workflow-kit"
coverIcon: "workflow"
tagline: "A practical harness for AI coding agents. Plan, build, and review with bounded autonomy on OpenCode."
featured: false
year: 2026
completed: false
---

**A practical harness for AI coding agents. Plan, build, and review with bounded autonomy on OpenCode.**

---

## Problem

Coding agents can produce a lot of code quickly. The difficult part is keeping their work aligned with project constraints and engineering standards. Unsupervised execution is acceptable for experiments, but risky when every change needs to be explainable and reviewable.

A second problem is provider lock-in. Most coding tools bind you to a single provider and a small set of models. You depend on one company's API for your entire workflow, and you pay premium prices for every task even when a cheaper model would do.

## Solution

This project turns an AI coding agent from an open-ended executor into a bounded engineering workflow.

OpenCode provides the open foundation: access to models from different providers, local models, configurable agents, sub-agents, permissions, and prompts. This project adds the workflow discipline around that foundation.

A Plan/Build workflow with two primary agents:

- **Plan** turns an idea into an explicit, validated execution plan. Routine planning and deeper planning for high-consequence problems are handled by separate modes. Research and investigation are delegated to a review sub-agent, so stronger models are reserved for decisions that need them.
- **Build** executes only the approved plan. Commits, reviews, and explicit stop conditions make long-running work inspectable and reversible. The workflow stops when assumptions break instead of silently improvising.

Most AI coding tools optimize for delegation: give the agent a task and let it run. This project optimizes for accountable delegation: the agent can work independently, but only inside a defined project frame, with explicit checkpoints, independent review, and a hard stop when something unexpected happens.

## Result

The system has been my daily development environment across projects for the past one to two years. It is an evolving extraction of the workflow I actually use, not a speculative framework designed around a single demo. This is the public repository; the personal system contains a few additional fine-tuned variants for private use, but the core workflow is the same.

## Technical Details

**Project frames.** Scaffolds establish conventions, validation, Git workflow, and project boundaries before implementation begins. Work happens only within that frame.

**Separated responsibility.** Planning and implementation are different agents with different permissions and different success criteria. The Plan agent produces a validated plan; the Build agent executes it. Neither agent works outside its role.

**Checkpoints and stop authority.** Commits, reviews, and explicit stop conditions make long-running work inspectable and reversible. Review is separated from implementation and can be assigned to an independent agent or model. The Build agent stops at any point where something unexpected comes up instead of continuing on assumptions. This allows one to two hours of semi-autonomous work without unreviewed changes.

**Model routing as workflow design.** Different tasks can use different models and providers. Research and review can be delegated to separate agents or less expensive models, while stronger models are reserved for decisions that need them. Model choice becomes part of the workflow rather than an opaque vendor decision. OpenCode makes it practical to combine hosted, open-weight, and local models without redesigning the workflow around one provider. In practice, a combination of frontier models and open-weight models covers the same workload as a premium cloud plan at roughly 20 to 30 EUR per month, about ten times cheaper.

**Commands and skills** govern behavior: Git conventions, security checks, data handling, and other workflow rules. They are versioned alongside the project so the same standards apply in every session. In the public kit, these are part of the long-term architecture and will be extracted from the private system over time.
