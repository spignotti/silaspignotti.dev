---
lang: "en"
slug: "urban-tree-transfer"
kind: "case"
order: 3
title: "Urban Tree Transfer"
seoTitle: "Urban Tree Transfer: Tree genus recognition with Sentinel-2 from Berlin to Leipzig · Silas Pignotti"
description: "I tested whether a model trained in Berlin could recognise tree genera in Leipzig from Sentinel-2 data and how much local data it needed."
role: "Geospatial data preparation, model training and evaluation"
period: "2025 to March 2026"
status: "completed"
year: 2026
links:
  - label: "Code on GitHub"
    href: "https://github.com/spignotti/urban-tree-transfer"
  - label: "Report as PDF (English)"
    href: "/projects/urban-tree-transfer/report.pdf"
keyFigures:
  - value: "0.75"
    label: "Weighted F1 in Berlin"
  - value: "0.38"
    label: "Weighted F1 in Leipzig, zero-shot transfer"
  - value: "25 to 50%"
    label: "Share of local data at which transfer helps"
figures:
  - { n: 1, file: "urban-tree-transfer/spatial-blocks", caption: "With a random split, the test set includes trees near those used for training. Spatial blocks separate training and test data.", section: "Pipeline and spatial blocks" }
  - { n: 2, file: "urban-tree-transfer/transfer", caption: "Weighted F1 for XGBoost in Leipzig by share of local training data, compared with training from scratch and the Berlin test result.", section: "Test set results" }
---

## Background

Many cities have no tree cadastre. Mapping trees in the field is expensive. A model can recognise tree genera from satellite data, but its performance drops when it moves to another city. The size of this drop in tree genus recognition had yet to be measured systematically.

## Research question

I trained a model on data from Berlin and tested it in Leipzig. First, I measured how well it recognised tree genera there without additional training data. Then I used different amounts of data from Leipzig to see how much of the loss I could recover.

## Summary of results

Without local data, the Berlin model performed about half as well in Leipzig. It performed better than a model trained from scratch mainly when I had a quarter to half of the Leipzig data for further training.

## Data

I combined the tree cadastres from Berlin and Leipzig. The Berlin cadastre contains 905,132 trees, and the Leipzig cadastre contains 167,867. After quality filtering, 782,022 trees remained for the analysis. I use the genus recorded in the cadastre as the target class for the model. I distinguish 17 genus classes.

The satellite data come from Google Earth Engine. I use Sentinel-2 monthly composites for 2021, which combine several observations per month into a single image. I use cloud masking to exclude parts of the images that clouds cover. I calculate vegetation indices from the satellite data by combining different spectral bands into metrics for vegetation.

To match each tree to the satellite image, I adjust the position from the cadastre to the tree crown. I derive a canopy height model from elevation models to represent crown height above the ground. I use the adjusted position to assign each tree the values of one pixel.

## Pipeline and spatial blocks

I implemented the processing pipeline as a Python package with tests. The package lets me repeat the workflow from raw data to evaluation. During feature selection, I decide which of the calculated features to use in the model.

Neighbouring trees tend to be similar. Because of this spatial autocorrelation, a random split can place similar trees in both the training and validation sets. The result then depends in part on how many trees from the same area the model saw during training.

I therefore divide the data into spatial blocks of 1200 m. In block cross-validation, I hold out entire blocks for validation and train on the remaining blocks. I also split the training and test data by block. I leave the test set unfiltered.

## Models and experiments

I compare four models. Random Forest combines the predictions of many decision trees. XGBoost adds trees one at a time to correct errors in the predictions made so far. The 1D CNN uses filters to find patterns in a sequence of input values. TabNet selects which features to use for prediction when it processes tabular data. I use an automated search to choose the settings that must be fixed before training, called hyperparameters.

First, I optimise the models in Berlin. Then I examine domain shift, which is the change in the data when moving to another city. I test this through zero-shot transfer by applying the Berlin model in Leipzig without using local training data.

In the third experiment, I adapt the pretrained model to Leipzig through fine-tuning on local data. I use 10%, 25%, 50% and 100% of the Leipzig data. For comparison, I train a model from scratch in Leipzig. This lets me assess the benefit of pretraining in Berlin at different shares of local data.

## Hypotheses

I defined the hypotheses before the experiments and tested them statistically. The results supported one hypothesis. Recognition performance dropped by different amounts for different genera when I moved the model to Leipzig.

I rejected another hypothesis. Spectral separability, which measures how well satellite signals distinguish genera, did not predict transfer performance.

## Test set results

I use weighted F1 for the evaluation. It accounts for how often predictions for a genus are correct and how many of its trees the model finds. More common genera carry more weight in the overall score.

In Berlin, XGBoost reaches a weighted F1 of 0.75. With zero-shot transfer to Leipzig, the score drops to 0.38. Fine-tuning with 10% of the Leipzig data raises it to 0.50, with 25% to 0.57 and with 50% to 0.66. With 100%, the pretrained model reaches 0.77. Training from scratch in Leipzig reaches 0.79.

With all the Leipzig data, training from scratch performs about as well as fine-tuning. The practical benefit of transfer occurs at intermediate shares of 25 to 50% of local data. For a city without a tree cadastre, this gives an indication of how much field survey work it needs.

Class balancing, where I balance the influence of genera with different frequencies during training, improved the score by around 18 percentage points. It had a larger effect than the choice of model. In Berlin, class balancing improves the result. It also widens the transfer gap, which is the difference between the results in Berlin and Leipzig.

## Limitations

The analysis covers one year and two cities with the same climate. I distinguish trees at genus level. I analyse a single pixel for each tree.

I use the genus labels from the cadastres without checking them. Label noise from incorrect genus labels can distort the measured transfer gap.

## Status

I completed the project in March 2026. The report is available in English as a PDF.
