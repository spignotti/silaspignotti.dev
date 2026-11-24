---
lang: "en"
slug: "berlin-lst-downscaling"
kind: "case"
order: 3
title: "Master's Thesis · Berlin's Heat at 10 m"
seoTitle: "Master's thesis: land surface temperature in Berlin from 100 m to 10 m · Silas Pignotti"
description: "In my master's thesis, I test which urban data help a deep learning model refine land surface temperature in Berlin from 100 m to 10 m."
role: "Master's thesis: research question, data pipeline, models, evaluation"
period: "2026, submission in December 2026"
status: "ongoing"
year: 2026
links:
  - { label: "Code on GitHub", href: "https://github.com/spignotti/berlin-lst-downscaling" }
keyFigures:
  - { value: "100 m → 10 m", label: "Resolution" }
  - { value: "2017 to 2025", label: "Data period" }
  - { value: "Berlin, warm season May to September", label: "Study area" }
figures:
  - { n: 1, file: "berlin-lst-downscaling/data-flow", caption: "From raw data to temperature at 10 m." }
  - { n: 2, file: "berlin-lst-downscaling/ablation-stages", caption: "Five stages on one fixed model. Each stage adds one group of inputs." }
  - { n: 3, file: "berlin-lst-downscaling/resolution-compare", caption: "The same area at 100 m and at 10 m." }
---

## Problem

Landsat measures land surface temperature at about 100 m resolution. That is enough for large patterns, but not for questions at the level of blocks and streets. There, buildings, trees, sealed surfaces and shade decide the temperature. Sentinel-2 and Berlin's geodata show these structures at 10 m, but they do not measure temperature. Downscaling connects the two levels. The open question is which urban data actually help. There is also no independent thermal reference at 10 m that could measure the result directly.

## Approach

**The model stays fixed; only the inputs change.** A residual 2D U-Net predicts temperature at 10 m as a correction of a coarse starting value. Architecture and training stay the same in all stages. Five stages add information step by step: Sentinel-2 spectral data, urban morphology, shading, weather data from ERA5-Land, and finally a training loss that gives more weight to temperature structure. Extra runs leave single groups out. This shows the contribution of each group on its own. Developing a new architecture was not the goal.

**Learned features as a cross-check.** An extra comparison arm replaces the hand-built morphology and shadow channels with learned annual embeddings from Sentinel-1 and Sentinel-2 that contain no temperature data. It shows whether building my own context groups is worth the effort, or whether general embeddings do the same.

**One spectral source, strict data rules.** Landsat provides only the target temperature; all optical inputs come from Sentinel-2. This avoids a sensor change between training and application. A 100 m cell counts only if the Landsat value and all 100 matching 10 m pixels are valid. I do not fill missing values, and I fit the scaling on the training years only. I do not select scenes by temperature, because a selection of hot days says nothing about the quality of the downscaling.

**Separate years and separate areas.** Training uses 2017 to 2023, model selection uses 2024, and 2025 is tested once, after the model is fixed. Because the model has seen the validation areas during training, a spatial test is added: whole blocks of the city are left out of training.

**Evaluate where the measurement is.** I compare models at 100 m, after aggregating the 10 m prediction back. A naive upsampling of the coarse value and a random forest serve as references, with the same mask and the same metric. Statements about 10 m are an assessment, not a measured result.

**Recompute everything after a data fix.** During the work I found an offset in the Sentinel-2 reflectances of newer processing versions and an error in the building data. I fixed both, rebuilt the features and recomputed all model runs instead of keeping the old numbers.

## System

A versioned selection defines which Landsat scenes enter the study and which Sentinel-2 image belongs to each. Of 290 pairs, 286 remain; four drop out because Sentinel-2 does not cover part of Berlin. From this, the pipeline builds analysis-ready rasters on one shared 10 m grid in EPSG:25833. From Berlin geodata, including LoD2 buildings, terrain, vegetation height and imperviousness, it computes heights, cover fractions, sky view factor and shadows. ERA5-Land adds weather values per scene. The result is one stack per scene with 22 channels and a mask of valid pixels. For training, the pipeline cuts these into patches of 160 × 160 pixels, 8,078 in the current release.

Every product is published with a STAC item, provenance data and a completion marker that is written last. Without this marker a product does not count as published. Separate validation scripts check every stage. Data is stored in Google Cloud Storage, training runs on Vertex AI, and Weights & Biases tracks the runs.

## Result

The data pipeline is complete and reproducible, from scene selection to the training dataset for the summer months of 2017 to 2025. All stages have since been trained on the corrected data release; the one-time test on 2025 stays sealed until submission. The final model is meant to produce a multi-year 10 m time series of land surface temperature for Berlin.

[Placeholder: Final result after submission on 22.12., model RMSE against the baseline, 2 to 3 sentences]

## Limits

There is no independent temperature measurement at 10 m. Evaluation therefore happens at 100 m, and the 10 m patterns are a reconstruction, not a measurement. The coarse starting value comes from the same scene. The data covers only the warm season from May to September and the time of the satellite overpass. A comparison with ECOSTRESS as an independent source is not yet a result. Berlin is one case study; the findings may not transfer to other cities.
