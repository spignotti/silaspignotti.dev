---
title: "kitamap"
slug: "kitamap"
description: "Open-data spatial analysis of daycare supply, accessibility, and projected demand in Berlin."
category: "Geospatial & Data"
tags:
  - "Python"
  - "GeoPandas"
  - "Shapely"
  - "scikit-learn"
  - "Prophet"
  - "Statsmodels"
  - "OpenRouteService"
  - "OpenStreetMap"
  - "CARTO"
github: "https://github.com/spignotti/kitamap"
demo: "https://pinea.app.carto.com/map/81885962-c7a8-4639-8124-372e0caa6e60"
coverIcon: "map-pin"
tagline: "Combining open geodata, demographic forecasting, and walking accessibility to analyse daycare provision in Berlin."
featured: false
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

Assessing daycare provision requires more than mapping facility locations. Supply, local population, future demographic change and practical accessibility all affect whether an area is sufficiently served.

The project explores how far this type of planning analysis can be reproduced with publicly available data for Berlin.

## Solution

kitamap combines daycare locations and available capacity information with demographic data and routing-based accessibility analysis.

The workflow prepares facility and administrative data, estimates missing capacity values, projects demographic development to 2034 and calculates 500 m walking-distance catchments around daycare locations.

The resulting indicators are combined at district level and published through an interactive CARTO dashboard.

## Result

The project produced a reproducible open-data workflow for comparing daycare supply, projected demand and walking accessibility across Berlin.

The analysis highlights spatial differences in current provision and future demand under the assumptions of the model. The interactive dashboard makes the resulting indicators and spatial patterns accessible alongside the project report.

The results are exploratory rather than a replacement for official daycare planning, particularly because open facility data are incomplete and some capacity values have to be estimated.

## Technical Details

The spatial workflow uses GeoPandas and Shapely to prepare daycare locations, administrative areas and additional OpenStreetMap data.

Where facility capacity is missing, the pipeline estimates values using available facility characteristics and district-level information. Demographic forecasting compares several time-series approaches before selecting the models used for projections to 2034.

OpenRouteService generates 500 m walking-distance isochrones around daycare locations, allowing accessibility to be analysed beyond administrative boundaries.

The final indicators and geometries are exported to CARTO for interactive mapping and comparison. The repository contains the analysis workflow, notebooks, methodology documentation and the accompanying project report.
