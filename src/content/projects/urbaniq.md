---
title: "urbanIQ"
slug: "urbaniq"
description: "Natural-language geodata aggregation for Berlin. Automated spatial analysis and district profiles from a single query."
category: "Geospatial"
tags:
  - "Python"
  - "FastAPI"
  - "GeoPandas"
  - "OpenAI API"
  - "LangChain"
  - "HTMX"
  - "SQLite"
github: "https://github.com/spignotti/urbanIQ"
coverIcon: "building-2"
tagline: "One question instead of ten datasets. Natural-language access to Berlin's geodata."
year: 2025
completed: true
screenshots:
  - src: "/projects/urbaniq/screenshot-01.png"
    alt: "urbanIQ district analysis interface"
---

## Problem

Geodata aggregation, clipping, and preparation is one of the biggest time sinks in urban planning projects. Data is scattered across multiple geoportals, APIs, and formats. Even for technically proficient analysts, harmonizing datasets into a usable format takes hours. For non-technical stakeholders in city administration, it is often impossible without GIS support.

## Solution

A geodata aggregation system that accepts natural-language queries, identifies relevant data sources, retrieves and clips data to the requested spatial level, harmonizes formats and CRS, and outputs unified geodata packages with metadata reports. Web interface for non-technical users.

## Result

From a single question to a complete, harmonized geodata package with documentation. Demonstrates that LLM-based query parsing combined with automated geodata pipelines can eliminate the manual aggregation bottleneck in urban planning workflows.

## Technical Details

Four services. NLP service parses natural-language requests via OpenAI GPT to identify required datasets and spatial levels. Data service orchestrates retrieval from Berlin Geoportal WFS and OpenStreetMap Overpass API. Processing service handles CRS transformation, spatial clipping, and schema normalization. Metadata service generates reports on data quality and usage guidance. FastAPI backend with SQLModel ORM, Alembic migrations, HTMX frontend, Docker deployment.
