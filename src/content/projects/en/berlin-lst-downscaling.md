---
lang: "en"
slug: "berlin-lst-downscaling"
kind: "case"
order: 2
title: "Master's thesis · Berlin heat at 10 m"
seoTitle: "Master's thesis: Berlin land surface temperature from 100 m to 10 m · Silas Pignotti"
description: "In my master's thesis, I test which urban data help a deep learning model downscale land surface temperature in Berlin from 100 m to 10 m."
role: "Preparing geospatial data, training and evaluating models"
period: "2026, submission in December 2026"
status: "ongoing"
year: 2026
links: []
keyFigures:
  - value: "100 m → 10 m"
    label: "Resolution"
  - value: "2017 to 2025"
    label: "Training and test years"
  - value: "27"
    label: "Model runs in the ablation"
figures:
  - { n: 1, file: "berlin-lst-downscaling/data-flow", caption: "From source data through the feature stack to temperature at 10 m.", section: "Data pipeline" }
  - { n: 2, file: "berlin-lst-downscaling/pseudo-pairs", caption: "The model learns to downscale from 1000 m to 100 m and applies what it learns to go from 100 m to 10 m. I evaluate it at 100 m.", section: "Pseudo-pair design" }
  - { n: 3, file: "berlin-lst-downscaling/ablation", caption: "The nine ablation variants. I keep the model fixed and vary only the inputs and, in stage 5, the training target.", section: "Ablation" }
  - { n: 4, file: "berlin-lst-downscaling/season-map", caption: "Land surface temperature difference from the mean of each overpass, May to September 2025, at 10 m. Preliminary, master's thesis status (not yet reviewed).", section: "Maps" }
---

## Background

The Landsat satellites measure land surface temperature at a resolution of about 100 m. This is too coarse to show differences within Berlin's city blocks and streets. At that scale, temperature depends on where buildings and trees stand, which surfaces are sealed and where shadows fall.

Sentinel-2 imagery and Berlin's geospatial data show these features on a 10 m grid. Independent measurements of land surface temperature at this resolution are unavailable.

## Research question

I test which urban data help a model derive a 10 m map from temperature measurements at 100 m. This increase in spatial resolution is called downscaling. I examine the contribution of buildings, vegetation, shadows and weather. I also test a temperature-sensitive training method that explicitly takes temperature patterns into account during learning.

The model produces temperature maps at 10 m. In the test, urban context improves the predictions. The difference is larger in areas the model never saw during training. To compare the maps with the measurements, I aggregate them back to 100 m.

## Data pipeline

I use thermal imagery from Landsat 8 and 9 for land surface temperature. I also use Sentinel-2 imagery and Berlin's 3D building data at LoD2, a level of detail that includes roof shapes. I derive shadows and the sky view factor from the building data. The sky view factor describes how much of the sky is visible from a given location.

I add vegetation height, surface sealing and weather data from ERA5-Land, a weather reanalysis. I align all data to the same 10 m grid in the EPSG:25833 coordinate reference system. For training and evaluation, I use imagery from the warm season, from May to September, in the years 2017 to 2025.

I record the data in a STAC catalogue that lists spatial datasets and their metadata. The metadata include information about where the data came from. A manifest specifies which data the pipeline processes. Validation scripts check the preprocessing. I can repeat the preprocessing with the same manifest. I run training on Vertex AI in Google Cloud.

## Pseudo-pair design

Because temperature measurements at 10 m are unavailable, I train the model one resolution level coarser. I aggregate the Landsat measurements to 1000 m and use this grid as the input. I use the Landsat measurements at 100 m as the target. At this scale, the model can learn from measured temperatures how temperature varies within the coarser grid cells.

To produce the maps, I use the measurements at 100 m as the input and have the model estimate values at 10 m. This assumes that what the model learns from 1000 m to 100 m also applies to the step from 100 m to 10 m. For evaluation, I average the predicted values back onto the exact 100 m grid. I then compare them with the Landsat measurements.

## Split by year

I train on data from 2017 to 2023. I use data from 2024 for validation. I use these data to assess my modelling choices. I hold back 2025 for testing. I accessed the test set once, after I had finalised all decisions.

## Ablation

In the ablation, I add or remove groups of input data to measure their contribution. I use the same 2D U-Net in all nine variants. This neural network processes patterns in the grids at several resolutions. I train each variant with three seeds. A seed determines the sequence of random numbers for a run. This gives me 27 model runs.

For the baseline, I upsample the coarse temperature measurements directly to the finer grid. I also compare the U-Net with a random forest, which estimates temperature using predictions from many decision trees.

## Statistics

I use a paired bootstrap across scenes. I sample scenes with replacement and compare the models on the same sampled scenes each time. I repeat this 10,000 times. Before the evaluation, I define the criterion for deciding whether a difference is statistically reliable.

I also evaluate the models using a spatial holdout. I exclude areas from training and evaluate the predictions for those areas separately. This lets me check how the models perform in places they never saw during training.

## Results

The U-Net is substantially more accurate than naive upsampling and the random forest. In the test year, urban context gives a small, statistically reliable improvement. Building structure, weather and a separate group of indices derived from red and near-infrared bands contribute to the result. The NDVI and NDWI indices for vegetation and water provide no further improvement. I find no statistically reliable benefit from temperature-sensitive training.

Urban context helps substantially more in areas the model never saw during training. The split by year alone does not reveal this difference.

## Maps

I produced temperature maps at 10 m for 39 scenes from 2025 and 42 scenes from the 2026 warm season. The model did not see the 2026 imagery during training or testing. I also produced difference maps. They show where the estimated temperature changes when I include urban context in the model.

## Limitations

The evaluation checks agreement with Landsat at 100 m. Different temperature patterns at 10 m can give the same value when averaged back to 100 m. Without independent temperature measurements at 10 m, I cannot validate individual values at this resolution. The transfer to the finer scale remains an assumption.

## Status

I will submit my master's thesis in December 2026. The numerical results will follow after submission.
