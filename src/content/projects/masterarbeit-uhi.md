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
coverIcon: "satellite"
tagline: "M.Sc. thesis: Resolving urban heat at street level."
featured: true
year: 2026
completed: false
---

## Problem

Climate change is intensifying urban heat islands, but the data foundation for local action is inadequate. Temperature measurement stations are sparse and coarse, and spatial interpolation cannot capture the fine-grained thermal patterns that matter for neighborhood-level planning. Landsat thermal data (100m resolution) is too coarse for street-level analysis. No open high-resolution thermal baseline exists for Berlin.

## Solution

Deep learning model that downscales Landsat LST to Sentinel-2 resolution (10m) using spectral, structural, and three-dimensional urban features. The model accounts for physical phenomena across multiple acquisition times (emission, radiation, diurnal variation). Causal analysis links local adaptation measures (trees, sealed surfaces, water bodies, green spaces) to temperature differences, providing evidence-based evaluation of cooling interventions rather than assumption-based planning.

## Result

In progress (M.Sc. thesis). Target: reproducible Berlin UHI map at 10m resolution with quantified effect estimates per adaptation category, plus historical temperature reconstruction for trend analysis.

## Technical Details

Data stack: Landsat 8/9 thermal bands, Sentinel-2 optical bands, Berlin Geoportal (ISU5 land use), DWD climate stations. Cloud-based ML pipeline on GCP (Vertex AI for training, BigQuery for data management), with experiment tracking and MLOps workflows. The downscaling model operates in the 3D urban context — building heights, surface materials, and vegetation structure inform temperature predictions beyond what spectral data alone can capture. Preprocessing via Google Earth Engine.
