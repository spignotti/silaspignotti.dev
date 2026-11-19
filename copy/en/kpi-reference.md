---
title: "KPI Reference"
summary: "For a plastics sorting company I built KPI logic and a volume forecast as a reference implementation and matched production against it."
role: "Working student, data analytics: requirements, reference implementation, matching, handover"
period: "2025 to 2026"
status: "completed"
links: []
key_figures:
  - label: "Forecast error, chosen model (WMAPE)"
    value: "8.42 %"
  - label: "Forecast error, previous year as forecast"
    value: "20.12 %"
  - label: "Forecast cases in backtest"
    value: "1,300"
---

## Problem

A plastics sorting company wanted to show operational KPIs and a forecast of incoming volumes in its web application. Management set the requirements, and the backend team built the application. What was missing in between was a clear calculation logic: which data really exists, how to handle special cases, and which values must come out in the end. Without this basis, every difference in production would have started a new discussion.

## Approach

**Reference first, then production.** I clarified the requirements with management and the backend team, checked data availability and special cases, and built the logic as a reference implementation in Python and SQL. I documented the business rules. The backend team then moved the logic into the web application.

**Matching means identical values.** Production counted as correct only when it returned the same values as the reference. For this check I handed over reference data and technical documentation. Every forecast version is stored, so it stays clear later what was predicted when.

**Several models compared in a backtest.** For the volume forecast I compared several approaches in a backtest over past years. The chosen model is multiplicative: a volume level, a seasonal factor per month, a weight for working days and a share per site. It also exists as an Excel reference and was the most accurate in the backtest. A model based on the origin of volumes would have needed extra data and fallback rules for new origins and was not more accurate. I dropped it.

## System

The reference consists of SQL queries on a local database and Python for the forecast and the analysis. A small frontend shows the results; the company's web application took over this code. The backend team received reference values as CSV and technical documentation for each calculation.

## Result

Over 1,300 forecast cases in the backtest, the weighted mean absolute percentage error (WMAPE) of the chosen model is 8.42 %. Using the previous year's volume as the forecast gives 20.12 %. The logic is fully handed over, and the project is completed.

## Limits

Most of the remaining error comes from changes in yearly volume that depend on external factors. The model cannot see them. The forecast is only as good as the history behind it. The error falls over the year: early in the year it is clearly higher than in autumn.

## Figures

1. **Process (Fig. 1).** Type: process diagram, horizontal. Shows requirement → reference implementation → matching with production → handover. Accent: "reference implementation". Caption DE: „Die Referenz legt fest, welche Werte die Produktion liefern muss.“ EN: "The reference defines the values production must deliver."
2. **Forecast model (Fig. 2).** Type: method diagram, one line as a product: volume level × seasonal factor (month) × working-day weight × site share = forecast. No values, no site names. Accent: "forecast" (the result). Caption DE: „Vier Faktoren, multipliziert. Allgemeine Form, keine Betriebswerte.“ EN: "Four factors, multiplied. General form, no company values."
3. **Forecast error (Fig. 3).** Type: key figure, horizontal bars, WMAPE in percent. Real values for two bars only: "previous year as forecast" 20.12 % and "chosen model" 8.42 %. [OFFEN: the concept plans four bars (previous year, origin, site, chosen). The values for origin and site are not approved; either use two bars or get approval.] Accent: the bar of the chosen model. Caption DE: „Prognosefehler im Rückblick über 1.300 Fälle.“ EN: "Forecast error in a backtest over 1,300 cases."
