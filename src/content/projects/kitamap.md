---
title: "kitamap"
slug: "kitamap"
description: "Open-data analysis of childcare availability in Berlin: demographic forecasting, accessibility mapping, and supply-demand gap identification."
category: "Geospatial"
tags:
  - "Python"
  - "scikit-learn"
  - "GeoPandas"
  - "OpenRouteService"
  - "CARTO"
github: "https://github.com/spignotti/kitamap"
demo: "https://pinea.app.carto.com/map/81885962-c7a8-4639-8124-372e0caa6e60"
coverIcon: "map-pin"
tagline: "Open data vs. official planning: reproducing Berlin's daycare study with freely available data."
year: 2024
completed: true
screenshots:
  - src: "/projects/kitamap/screenshot-01.png"
    alt: "kitamap CARTO dashboard"
downloads:
  - label: "Project report (PDF)"
    href: "/projects/kitamap/report.pdf"
---

## Problem

Berlin's district offices produce daycare planning studies, but the underlying data and methodology are not publicly accessible. Without transparent foundations, planning decisions about new daycare locations lack verifiable evidence. The question: can an open-data-only approach reproduce the official findings?

## Solution

Analysis pipeline combining demographic forecasting of child population per planning area (horizon: 2034), current daycare capacity mapping, and routing-based accessibility analysis. Results published as an interactive CARTO dashboard showing underserved districts, coverage gaps, and future demand trajectories.

## Result

The open-data approach identified nearly the same underserved districts as the district office's closed-data study. Built in a few weeks with freely available data, demonstrating that open data can match resource-intensive official analyses for daycare planning. Interactive map and project report available.

## Technical Details

Three-stage pipeline. ETL extracts and geocodes daycare locations and capacities from OpenStreetMap and Berlin's open data portal. Demographic forecasting compares three time series models, with an ensemble of two selected for the final projection to 2034. OpenRouteService computes 500m walking-distance isochrones for each daycare, producing accessibility scores that account for cross-district reachability. Outputs exported to CARTO for interactive visualization.
