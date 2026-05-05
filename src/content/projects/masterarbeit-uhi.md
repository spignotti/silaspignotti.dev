---
title: "Urban Heat Island Downscaling"
slug: "masterarbeit-uhi"
description: "Deep learning-based LST downscaling from Landsat to Sentinel-2 resolution with causal analysis of climate adaptation measures in Berlin."
category: "Geospatial"
tags:
  - "Python"
  - "PyTorch"
  - "Google Earth Engine"
  - "GCP"
  - "Landsat"
  - "Sentinel-2"
  - "Deep Learning"
  - "Remote Sensing"
coverIcon: "satellite"
tagline: "Resolving urban heat at street level."
featured: false
year: 2026
completed: false
---

## Problem

Cities need fine-grained LST maps to evaluate cooling interventions, but Landsat thermal data is too coarse (100m) for street-level analysis. No open high-resolution thermal baseline exists for Berlin.

## Solution

Deep learning model downscales Landsat LST to Sentinel-2 resolution (10m) using spectral and structural features. Causal analysis links local adaptation measures (trees, sealed surfaces, water bodies) to temperature differences across the city.

## Result

In progress. Target: reproducible Berlin UHI map at 10m resolution + quantified effect estimates per adaptation category.

## Lessons Learned

- To be filled after completion.

## Deep Dive

Data stack: Landsat 8/9 thermal band, Sentinel-2 optical bands, Geoportal Berlin (ISU5), DWD climate stations. Infrastructure: GCP (Vertex AI, BigQuery), Google Earth Engine for preprocessing.
