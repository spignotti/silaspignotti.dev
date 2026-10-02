---
title: "Urban Tree Transfer"
slug: "urban-tree-transfer"
description: "Cross-city transfer of urban tree genus classification using multitemporal Sentinel-2 data, spatial validation, and local fine-tuning."
category: "Geospatial & Data"
tags:
  - "Python"
  - "scikit-learn"
  - "XGBoost"
  - "PyTorch"
  - "1D-CNN"
  - "GeoPandas"
  - "Rasterio"
  - "Google Earth Engine"
github: "https://github.com/spignotti/urban-tree-transfer"
coverIcon: "trees"
tagline: "Testing how well Sentinel-2 tree classification transfers between cities and how much local data is needed to recover performance."
featured: false
year: 2026
completed: true
downloads:
  - label: "Project report (PDF)"
    href: "/projects/urban-tree-transfer/report.pdf"
---

## Problem

Satellite-based tree classification can reduce the amount of field data required for urban tree inventories, but a model that performs well in one city may not transfer reliably to another.

The project investigates this domain shift directly: how much performance is lost when a model trained in Berlin is applied to Leipzig, and how much local target data is needed to recover useful performance.

## Solution

A reproducible machine-learning pipeline was built around multitemporal Sentinel-2 data and municipal tree cadastres from Berlin and Leipzig.

XGBoost and a temporal 1D-CNN were evaluated under spatial block cross-validation before being transferred between cities. The study then compared zero-shot transfer with fine-tuning at increasing fractions of local Leipzig training data.

Data preparation was treated as part of the modelling problem. The pipeline includes cadastre harmonisation, spatial quality filtering, feature engineering, class balancing and corrections for inaccurate tree positions.

## Result

XGBoost reached a weighted F1 of 0.751 in Berlin under spatial block cross-validation. Direct transfer to Leipzig reduced performance substantially: by 49.8% for XGBoost and 37.4% for the 1D-CNN.

Adding local Leipzig data recovered much of this gap. For XGBoost, the strongest practical transfer advantage appeared at approximately 25–50% of the local training data; with the complete target dataset, training from scratch became competitive.

The experiments also showed that pipeline and evaluation choices had a large effect on measured performance. Class balancing alone improved weighted F1 by approximately 18 percentage points, while spatial validation prevented the overly optimistic scores produced by random cross-validation.

## Technical Details

The pipeline processes monthly Sentinel-2 L2A composites with spectral bands and vegetation indices together with municipal tree cadastres and canopy-height information. Google Earth Engine is used for satellite-data processing, while GeoPandas and Rasterio support the spatial preprocessing workflow.

The final harmonised dataset contains more than 780,000 trees across Berlin and Leipzig. Spatial quality control includes vegetation plausibility checks, temporal completeness filtering, proximity filtering and canopy-height-based corrections for inaccurate tree coordinates.

For tabular modelling, XGBoost uses an importance-ranked feature subset derived from the multitemporal input data. The deep-learning comparison uses a PyTorch 1D-CNN operating on the full temporal feature sequence.

Evaluation follows three stages: source-domain optimisation under 1,200 m spatial block cross-validation, zero-shot transfer from Berlin to Leipzig, and target-domain fine-tuning using 10%, 25%, 50% and 100% of the available Leipzig training data.

The repository contains the reusable pipeline, tests, experiment outputs and the full project report.
