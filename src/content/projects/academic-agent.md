---
title: Academic Agent
slug: academic-agent
description: "Academic agent with custom MCP server for Zotero, tag-scoped RAG via PaperQA2, and a LaTeX writing pipeline."
category: AI/Automation
tags:
  - Python
  - Zotero
  - LaTeX
  - MCP
  - PaperQA2
github: https://github.com/spignotti/academic-agent
coverIcon: book-open-check
tagline: "DOI to citation in one workflow. Three-layer academic agent built around Zotero."
year: 2026
completed: true
featured: true
---

## Problem

AI is moving into academic workflows, but used naively it breaks academic work in three ways: hallucinated citations without grounded sources, disconnected reference management that never links to a real bibliography, and writing support that stops at chat-with-PDF instead of connecting literature to a researcher's own line of reasoning. The challenge is building a structured workflow where both the agent and the researcher can work on the same material without getting in each other's way.

## Solution

Three-layer academic agent centered on Zotero as the single source of truth. Layer one: literature management via a custom MCP server that connects the agent to Zotero, so both researcher and agent share the same database. Layer two: tag-scoped RAG over local paper collections using PaperQA2, enabling project-specific retrieval without a custom embedding pipeline. Layer three: LaTeX-based writing pipeline as a shared interface where agent and researcher collaborate on the same documents, with citation key resolution against scoped bibliographies. litresearch integrated for project kickstarting.

## Result

A single agent that carries a paper from DOI to citation. 43+ MCP tools, 8 skills, 190 tests. A DOI returns a fully tagged Zotero item with verified metadata and PDF. A project query returns a RAG answer sourced from the local library with citation keys ready for LaTeX. A research session produces a structured report with Q&A, source excerpts, and \cite{} keys linked to the scoped library.bib.

## Technical Details

The MCP server (zotero-companion) is the center of the system. It exposes Zotero Local API operations as a tight toolset: item management with metadata verification, PDF attach with Semantic Scholar fallback download, tag management with namespace conventions (area/*, project/*, topic/*, status/*), and scoped BibTeX export. Retrieval sits on top: PaperQA2 builds its index over a symlink farm pointing at Zotero's PDF storage, parameterized by tag scope. Project workspaces under ~/academic-workspace/projects/<slug>/ each get a scoped library.bib, drafts/ folder for LaTeX, state.md for research tracking, and a git repo with auto-commits. The slug maps to the Zotero project/<slug> tag. This is the only coupling between database and local environment.
