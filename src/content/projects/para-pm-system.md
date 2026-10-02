---
title: "PARA PM System"
slug: "para-pm-system"
description: "Personal project and knowledge system combining PARA, structured project context, and AI-assisted routing in Notion."
category: "AI & Automation"
tags:
  - "Notion"
  - "Notion API"
  - "OpenCode"
coverIcon: "layout-dashboard"
tagline: "PARA-based project and knowledge management with structured context and AI-assisted routing."
featured: false
year: 2025
completed: false
---

## Problem

Work across academic research, software projects, applications and personal knowledge creates context in different forms: projects, tasks, decisions, notes, resources and reusable workflows.

Without a consistent structure, information becomes difficult to retrieve and AI-assisted work repeatedly requires the same project context to be reconstructed.

## Solution

The system uses PARA as the underlying information architecture for projects, areas, resources and archived material in Notion.

Projects contain their current state, durable decisions and relevant artifacts. Notes and resources are linked to the appropriate context instead of being stored as an undifferentiated knowledge base.

Reusable AI skills handle recurring workflows such as content routing, research preparation and structured hand-offs. They define triggers, constraints and output formats, with confirmation required before persistent changes are made.

## Result

The system is used as the central project and knowledge workspace across academic, technical and personal work.

Project context remains available across sessions, while recurring information-management tasks follow the same routing and validation rules. The system has evolved from a PARA workspace into a broader context layer for AI-assisted work.

The system was designed around a simple principle: **build the context system, not a more complex agent.** Rather than encoding every workflow into one assistant, tasks are routed to the relevant context, rules and tools. Several patterns that started as custom conventions in the workspace, including task-specific skills, persistent project context and structured routing, have since become increasingly common abstractions in the AI tools used around it.

## Technical Details

Notion provides the structured data layer through related databases for projects, areas, tasks, notes, resources and specialized collections. It stores project context, durable decisions and project management rather than repository code or implementation details.

Technical projects connect this context to a separate development workflow. GitHub acts as the source of truth for code and technical issues, while OpenCode handles implementation through project-specific context, skills and development rules. The boundaries between the systems are explicit: Notion determines what should be built and preserves the relevant product context; GitHub tracks the technical work and resulting code; OpenCode executes against that repository context.

Routing rules and reusable skills connect these layers without requiring one agent to hold the entire system in its prompt. Depending on the task, the agent loads the relevant project context, domain resources and workflow instructions before acting.

The same principle applies to knowledge management. Incoming information is classified by destination rather than forcing an entire note into a single category. AI skills define reusable multi-step workflows with explicit constraints and human-in-the-loop checkpoints, while the Notion API supports structured reads and writes where automation is appropriate.
