---
title: "litresearch"
slug: "litresearch"
description: "CLI tool for automated literature research, from research questions to ranked paper sets, structured reports, and reference exports."
category: "AI & Automation"
tags:
  - "Python"
  - "Typer"
  - "LiteLLM"
  - "Semantic Scholar"
  - "OpenAlex"
  - "Zotero"
  - "Pydantic"
  - "pypdf"
github: "https://github.com/spignotti/litresearch"
demo: "https://pypi.org/project/litresearch/"
coverIcon: "file-search"
tagline: "Automated literature research from research question to ranked papers and structured exports."
featured: true
year: 2026
completed: true
---

## Problem

Literature research involves repeated work across search engines, PDFs, reference managers and analysis tools. Starting from a research question means developing search strategies, discovering papers across multiple sources, screening results, following citation links and preparing references for further work.

The project started as a way to make this process reproducible and reduce the amount of manual coordination between these steps.

## Solution

litresearch is a Python CLI that turns one or more research questions into a structured literature-research pipeline.

It generates multiple search strategies, discovers papers through Semantic Scholar and OpenAlex, deduplicates candidates, screens and analyzes them with an LLM, expands relevant citation graphs and ranks the resulting paper set.

The pipeline produces structured reports, BibTeX and RIS references, JSON data, run metrics and available PDFs. Optional Zotero integration exports selected papers directly to a library.

## Result

litresearch is published on PyPI and maintained as an open-source Python package. The current version provides multi-source discovery, citation expansion, Zotero export, resumable runs and run-level telemetry.

Pipeline state is persisted between stages, allowing interrupted or long-running research jobs to resume without repeating completed work.

## Technical Details

The CLI is built with Python and Typer. LLM calls are routed through LiteLLM, keeping model and provider selection configurable outside the research pipeline.

Semantic Scholar and OpenAlex provide independent discovery sources. Candidate records are deduplicated while retaining source provenance. Screening and deeper analysis use configurable selection strategies before citation expansion and final ranking.

Pydantic defines configuration and data contracts across pipeline stages. PDF extraction uses pypdf with configurable token budgets and fallback behavior when full text is unavailable.

Each run stores its intermediate state, generated outputs and operational metrics. This makes the pipeline resumable and provides visibility into source coverage, PDF availability, stage timings and skipped records.
