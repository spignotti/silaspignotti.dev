---
title: "Urban Heat Island Downscaling"
slug: "master-thesis-uhi"
description: "Five-stage ablation study on urban-context-aware LST downscaling from 100 m to 10 m. Historical thermal reconstruction and adaptation measure evaluation for Berlin."
category: "Geospatial"
tags:
  - "Python"
  - "PyTorch"
  - "Google Earth Engine"
  - "GCP"
  - "Rasterio"
coverIcon: "satellite"
tagline: "What urban context does a thermal model actually need? Ablation study and 10 m LST reconstruction for Berlin."
featured: true
year: 2026
completed: false
---

**What urban context does a thermal model actually need? Ablation study and 10 m LST reconstruction for Berlin.**

## Problem

Climate change is intensifying urban heat islands, but the thermal data available for city-level planning is too coarse to act on. Landsat provides land surface temperature (LST) at 100 m, enough for regional patterns but not for street-level decisions: which blocks overheat, which interventions cool effectively, where to prioritize. Higher-resolution thermal sensors (ECOSTRESS, drones) lack the revisit frequency or spatial coverage for systematic monitoring. No open, high-resolution thermal baseline exists for Berlin.

## Solution

Deep learning model that downscales Landsat LST from 100 m to Sentinel-2 resolution (10 m), tested through a five-stage ablation study. Each stage adds one input category to quantify its contribution: spectral indices, 3D building morphology (LoD2), meteorological context (DWD stations), temporal features, and a thermal-aware loss function. A random forest baseline isolates the deep learning contribution. The resulting model generates a historical 10 m LST time series for Berlin, enabling retrospective evaluation of climate adaptation measures (green roofs, street trees, de-sealing) via difference-in-differences analysis.

## Result

In progress (M.Sc. thesis, target completion October 2026). Planned deliverables: reproducible 10 m LST maps for Berlin across multiple Landsat scenes, ablation results quantifying the contribution of urban context features to downscaling accuracy, a pre-trained model published on HuggingFace, and effect estimates per adaptation category validated against ECOSTRESS and temporal cross-validation.

## Technical Details

Five-stage ablation on a shared encoder-decoder architecture. Stage 1: Sentinel-2 spectral bands and vegetation indices as baseline input. Stage 2 adds 3D urban morphology from Berlin's LoD2 building model (heights, footprints, surface fractions). Stage 3 adds meteorological variables from DWD climate stations (air temperature, wind, humidity). Stage 4 introduces temporal encoding across acquisition dates. Stage 5 replaces standard MSE with a thermal-aware loss combining spatial structure preservation (SSIM) and physical consistency. Random forest trained on identical features serves as the non-deep-learning baseline at each stage.

Data pipeline built on Google Earth Engine for satellite data acquisition, cloud masking, and index computation, exporting to GCP Cloud Storage. Model training on Vertex AI with experiment tracking (MLflow or W&B). Validation uses three independent signals: scale-consistency checks, cross-sensor comparison against ECOSTRESS (70 m), and temporal cross-validation across seasons.
