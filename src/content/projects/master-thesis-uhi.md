---
title: "Urban Heat Island Downscaling"
slug: "master-thesis-uhi"
description: "Ablation study of urban-context features for land-surface-temperature downscaling from 100 m to 10 m in Berlin."
category: "Geospatial & Data"
tags:
  - "Python"
  - "PyTorch"
  - "Planetary Computer"
  - "odc-stac"
  - "earthaccess"
  - "Google Cloud"
  - "Vertex AI"
  - "BigQuery"
  - "Weights & Biases"
coverIcon: "satellite"
tagline: "Ablation study of urban-context features for 100 m to 10 m land-surface-temperature downscaling in Berlin."
featured: true
year: 2026
completed: false
---

## Problem

Landsat provides land surface temperature at approximately 100 m resolution. This is sufficient for larger thermal patterns, but too coarse to represent much of the variation introduced by urban morphology, vegetation, shading and surface structure.

The thesis investigates whether additional urban context can improve reconstruction of land surface temperature at 10 m resolution, and which inputs contribute most to that improvement.

## Solution

The study uses a fixed 2D U-Net backbone and a five-stage ablation design. The architecture remains constant while additional information is introduced step by step:

1. Sentinel-2 spectral information
2. urban morphology and surface geometry
3. shading and solar geometry
4. meteorological context
5. a thermal-aware loss function

A random forest provides a non-deep-learning baseline. The aim is not to develop a new neural-network architecture, but to isolate the contribution of different input features and training choices.

## Result

The data and preprocessing pipeline is complete. Satellite, meteorological and urban-context data for Berlin have been co-registered into reproducible feature stacks with leakage-free training, validation and test splits.

Model training and the ablation study are currently in progress. A locked Stage-1 probe reached a validation RMSE of 1.193 K compared with 1.526 K for the same-cohort naive baseline. Full Stage-1 training and the later ablation stages are still underway.

The final model will be used to reconstruct a multi-year 10 m LST time series for Berlin. Evaluation of selected climate-adaptation measures is an optional downstream analysis where suitable before-and-after data are available.

## Technical Details

The data pipeline combines Landsat 8/9 thermal data, Sentinel-2 optical data, Berlin urban-context datasets and DWD meteorological observations. Landsat and Sentinel-2 acquisition uses Planetary Computer STAC with `odc-stac`; ECOSTRESS validation data are accessed through `earthaccess` and NASA CMR.

The current feature release contains co-registered 28-channel stacks covering the warm seasons from 2017 to 2025. Data preparation includes explicit eligibility rules, leakage-free temporal splits and reproducible scaling contracts.

Training runs on Google Cloud using Vertex AI, with experiment tracking in Weights & Biases. Validation combines temporal and spatial holdouts with scale-consistency checks, structural metrics and independent comparison against ECOSTRESS.

> M.Sc. thesis in Geoinformation at BHT Berlin, currently in progress.
