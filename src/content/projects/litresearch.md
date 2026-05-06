---
title: "litresearch"
slug: "litresearch"
description: "Open-source CLI for automated literature research. Structured reports and BibTeX exports from a research question. Published on PyPI."
category: "AI/Automation"
tags:
  - "Python"
  - "Typer"
  - "Semantic Scholar"
  - "OpenAlex"
github: "https://github.com/spignotti/litresearch"
demo: "https://pypi.org/project/litresearch/"
coverIcon: "file-search"
tagline: "From research question to filtered and ranked paper set in minutes, not days."
featured: false
year: 2026
completed: true
---

## Problem

Literature search is one of the most time-consuming parts of academic work. For a new topic, the standard workflow means decomposing a research question into search terms, manually cycling between databases, scanning hundreds of abstracts, following citation chains, and filtering for relevance. Existing AI research tools increasingly automate parts of this, but the full pipeline from question to filtered, ranked paper set with PDFs and exportable references remains manual work.

## Solution

Open-source CLI tool that automates the full literature search pipeline. Takes a research question, decomposes it into multiple search strategies via LLM, retrieves papers from Semantic Scholar and OpenAlex, screens and ranks results by relevance against the original question, and produces a structured report with BibTeX/RIS export and downloaded PDFs. Supports citation graph expansion and iterative refinement.

## Result

From research question to relevant paper selection in minutes instead of days. Published on PyPI (MIT license). One-command workflow: input a question, get a ranked report with PDFs, references, and per-paper analysis. Reproducible and resumable via pipeline checkpoints.

## Technical Details

Four-stage pipeline. Query generation decomposes the research question into keyword-based, concept-based, and methodological search strategies via LLM (routed through LiteLLM for provider-agnostic API access). Multi-source discovery retrieves candidates from Semantic Scholar and OpenAlex with deduplication and source tracking. Screening and ranking uses LLM-based relevance scoring with configurable selection modes (top-percent, top-k, threshold). Report generation produces structured Markdown with per-paper analysis, synthesis, BibTeX/RIS export, and Zotero integration. Each stage is independently cacheable, and runs are resumable from saved state checkpoints.
