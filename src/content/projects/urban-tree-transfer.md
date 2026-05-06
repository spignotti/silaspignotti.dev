---
title: "Urban Tree Transfer"
slug: "urban-tree-transfer"
description: "Cross-city transfer of urban tree genus classification using Sentinel-2. End-to-end ML pipeline with spatial block CV across Berlin and Leipzig."
category: "Geospatial"
tags:
  - "Python"
  - "PyTorch"
  - "scikit-learn"
  - "XGBoost"
  - "1D-CNN"
  - "Google Earth Engine"
github: "https://github.com/spignotti/urban-tree-transfer"
coverIcon: "trees"
tagline: "Can a model trained in Berlin classify trees in Leipzig? Cross-city transfer of urban tree genus classification."
featured: false
year: 2026
completed: true
downloads:
  - label: "Project report (PDF)"
    href: "/projects/urban-tree-transfer/report.pdf"
---

## Problem

Cities need tree cadastres for informed urban tree management, but manual field surveys are expensive and do not scale. Satellite-based classification using Sentinel-2 data offers an alternative, but current approaches focus on species detection, not genus classification, which is critical for environmental and urban planning. Additionally, models trained on one city typically fail when applied to another due to domain shift. No systematic baselines existed to quantify this cross-city transfer gap.

## Solution

Reproducible ML pipeline built on multitemporal Sentinel-2 composites (12 months, 10 bands + 13 vegetation indices) and municipal tree cadastres from Berlin (905k trees) and Leipzig (168k trees), 17 genus-level classes. XGBoost and 1D-CNN compared under strict spatial block CV across three experiments: source optimization, zero-shot transfer, and fine-tuning with stratified target data fractions. Includes a cadastre cleaning method for dead tree detection and GPS position correction. Built entirely on open data.

## Result

XGBoost weighted F1 = 0.751 in Berlin under spatial block CV, exceeding published benchmarks despite higher class count and stricter evaluation. Zero-shot transfer to Leipzig: XGBoost -49.8%, 1D-CNN -37.4%. Fine-tuning sweet spot at 25-50% local data. Pipeline design (class balancing: +18 pp F1, spatial evaluation, feature engineering) contributes more to performance than algorithm or hyperparameter choice.

## Technical Details

Three-stage pipeline. Source-domain optimization in Berlin compares XGBoost (50 importance-ranked features from 276 candidates) and 1D-CNN (full 144-feature temporal sequences) under spatial block CV with 1200 m blocks. Standard random CV inflated accuracy by double digits. Spatial block CV caught this. Zero-shot transfer applies Berlin-trained models directly to Leipzig without adaptation. Fine-tuning uses stratified Leipzig data fractions against from-scratch baselines, with recovery following a power-law curve. The cadastre cleaning step handles dead tree detection and GPS position correction, which directly contributed to training data quality and the strong source-domain performance.
