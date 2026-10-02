---
title: "OpenCode Workflow Kit"
slug: "opencode-workflow-kit"
description: "Provider-neutral OpenCode workflow for planning, implementation, review, and project-specific development constraints."
category: "AI & Automation"
tags:
  - "OpenCode"
  - "Python"
  - "Git"
  - "GitHub Actions"
github: "https://github.com/spignotti/opencode-workflow-kit"
coverIcon: "workflow"
tagline: "Structured plan, build, and review workflows for AI-assisted software development."
featured: false
year: 2026
completed: true
---

## Problem

Coding agents can implement changes quickly, but reliable use across larger projects requires more than a prompt. Project constraints, research quality, review, Git workflows and domain-specific rules need to remain consistent across sessions.

This becomes especially relevant when an agent works semi-autonomously: implementation should follow an approved plan, unexpected conditions should stop execution, and reviews should be independent from the agent that produced the change.

## Solution

OpenCode Workflow Kit is a provider-neutral workflow configuration built around separate planning, implementation and review responsibilities.

The core workflow uses two primary agents. **Plan** scopes work, gathers evidence and produces an executable plan. **Build** implements only that approved plan and stops when assumptions or project conditions no longer match.

Specialized read-only subagents handle research, plan checking, contract review and integration review. Reusable skills provide additional rules for Git workflows, testing, data work, geospatial projects and frontend development.

Project setup can also generate a compact technical contract that keeps important architectural and delivery constraints versioned with the repository.

## Result

The public kit packages the workflow I use across technical projects into a self-contained OpenCode configuration. Version 1.0 is published as an independent repository with installation tooling, validation, tests and CI.

The public version is intentionally separated from my personal configuration. It contains the reusable workflow and project rules, but no provider credentials, model configuration, personal paths or private integrations.

## Technical Details

The repository combines OpenCode agent configuration, Markdown-based prompts and skills, Python validation scripts, Git workflows and GitHub Actions.

Plan and Build agents have separate permissions and success criteria. Review and research subagents operate under read-only evidence-probe permissions, while explicit stop conditions prevent implementation from continuing when the approved plan no longer applies.

The repository includes reusable domain packs for data and geospatial work, covering topics such as schema invariants, reproducible transformations, CRS handling, raster alignment, spatial validation and provenance.

A validation script checks configuration, references and privacy constraints. Unit tests and secret scanning run through CI before changes are merged.
