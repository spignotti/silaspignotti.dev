---
title: "urbanIQ"
slug: "urbaniq"
description: "Natural-language interface for retrieving, processing, and packaging Berlin geodata from multiple sources."
category: "AI & Automation"
tags:
  - "Python"
  - "FastAPI"
  - "GeoPandas"
  - "Shapely"
  - "SQLModel"
  - "SQLite"
  - "LangChain"
  - "OpenAI API"
  - "HTMX"
github: "https://github.com/spignotti/urbanIQ"
coverIcon: "building-2"
tagline: "Natural-language access to Berlin geodata through an automated spatial processing pipeline."
featured: false
year: 2025
completed: true
screenshots:
  - src: "/projects/urbaniq/screenshot-01.png"
    alt: "urbanIQ district analysis interface"
---

## Problem

Preparing geodata for urban analysis often requires several separate steps: identifying suitable datasets, retrieving them from different services, selecting the relevant spatial extent, aligning coordinate systems and documenting the resulting data.

These steps require GIS knowledge even when the actual question is relatively simple, such as requesting buildings and public transport stops for a Berlin district.

## Solution

urbanIQ is a web application that translates natural-language geodata requests into a structured processing workflow.

The system identifies the requested datasets and spatial area, retrieves data from Berlin Geoportal services and OpenStreetMap, applies spatial filtering and coordinate transformations, and packages the processed datasets together with generated metadata.

A browser-based interface allows the workflow to be started without interacting directly with GIS services or APIs.

## Result

The project demonstrates an end-to-end workflow from a natural-language request to a downloadable geodata package.

It combines LLM-based request interpretation with deterministic geospatial processing rather than asking the language model to perform the spatial analysis itself. The resulting prototype supports a defined set of Berlin datasets and district-level requests.

## Technical Details

FastAPI provides the application backend and separates request handling from the individual processing services. SQLModel and SQLite store jobs, generated packages and registered data sources.

The NLP service uses LangChain and the OpenAI API to map free-text requests to predefined datasets and spatial levels. External connectors handle Berlin Geoportal WFS services and the OpenStreetMap Overpass API.

GeoPandas and Shapely perform the deterministic spatial operations, including clipping, CRS transformation and geometry processing. The processed datasets are exported together with metadata describing their source and use.

The frontend uses server-rendered templates and HTMX for the interaction layer, keeping the application within a Python-centered stack.
