---
title: "OpenCode Workflow Kit"
slug: "opencode-workflow-kit"
description: "Provider-neutral OpenCode setup that separated planning, implementation, and independent review. Built when models still needed tighter rules; kept as a public record after I moved to a smaller, tool-native setup."
category: "AI & Automation"
tags:
  - "OpenCode"
  - "Python"
  - "Git"
  - "GitHub Actions"
github: "https://github.com/spignotti/opencode-workflow-kit"
coverIcon: "workflow"
tagline: "A provider-neutral OpenCode setup that separated planning, implementation, and independent review for AI-assisted coding."
featured: false
year: 2026
completed: true
---

## Problem

Coding agents can implement changes quickly. Across larger projects that is not enough. Constraints drift, research quality varies, and review often collapses into the same agent that produced the patch.

This mattered especially at the time this kit was built. Models still made more errors and needed tighter rules: implementation should follow an approved plan, unexpected conditions should stop the run, and reviews should be independent of the agent that wrote the code.

## Solution

OpenCode Workflow Kit is a provider-neutral OpenCode configuration built around that split.

Plan scopes the work, gathers evidence, and writes an executable plan. Build implements only that plan and stops when assumptions or project conditions no longer match.

Read-only subagents handle research, plan checks, contract review, and topic reviews such as security. A memory system kept project knowledge available across sessions. Reusable skills add rules for Git, testing, data work, geospatial projects, and frontend constraints. Project setup can also generate a compact technical contract that keeps architectural and delivery constraints in the repository.

## Result

I ran this workflow for months on technical projects. It belonged to a phase when models needed more guardrails. That is also why I no longer use it.

Models are much stronger now, and a smaller setup is often better. Tool-native coding agents now ship similar primitives themselves: parallel research, a plan/build split, and spawned reviews. Maintaining a parallel framework stopped being worth the cost and effort.

The public kit remains as a skill case: a curated snapshot of that working method. It is not an active toolkit and it does not claim parity with my private setup or with current commercial agents.

## Technical Details

The repository combines OpenCode agent configuration, Markdown prompts and skills, Python validation, Git workflows, and GitHub Actions.

Plan and Build have separate permissions and success criteria. Review and research subagents run under read-only evidence-probe permissions. Stop conditions block implementation when the approved plan no longer applies.

The memory layer persisted project knowledge across sessions. Domain packs cover data and geospatial work: schema invariants, reproducible transformations, CRS handling, raster alignment, spatial validation, and provenance.

A validation script checks configuration, references, and privacy constraints. Unit tests and secret scanning run in CI.
