---
title: "Routing Engine"
slug: "routing-engine"
description: "Route planning application for recurring field-service operations, developed from a real maintenance workflow and used by the office team."
category: "Applied Systems"
tags:
  - "Python"
  - "FastAPI"
  - "React"
  - "Next.js"
  - "PyVRP"
  - "Docker"
coverIcon: "truck"
tagline: "Route planning application for recurring field-service operations, developed from a real maintenance workflow and used by the office team."
featured: true
year: 2026
completed: false
---

## Problem

Recurring maintenance tours were planned manually from individual addresses, vehicle availability and expected service times. The office team needed a usable daily plan: feasible routes, a clear stop order and enough control to adjust plans before they reached the field.

## Solution

Routing Engine is a web application for planning recurring field-service maintenance tours. It combines service orders, vehicle types, shift times, breaks and compatibility rules into daily route proposals. The office team reviews the routes on a map, adjusts stops when needed and exports a practical stop list.

The first version focused on the core planning workflow rather than replacing the surrounding CRM or ERP systems. Requirements and business rules were derived from the existing operational process and translated into the application's data model and planning logic.

## Result

The application was tested with the office team in a one-month pilot. Feedback from real planning work was used to adjust the workflow and route handling. It is now used operationally for recurring maintenance planning.

Development continues around the live workflow, including persistence, API and system boundaries, deployment, monitoring, performance and issues reported during use.

The application remains an internal tool for one field-service business, not a general logistics platform.

## Technical Details

The backend uses Python and FastAPI, with PyVRP providing the vehicle-routing solver. The planning model combines service orders, vehicle constraints, working times, breaks and compatibility rules before generating route proposals.

A React and Next.js frontend provides the planning interface, map review and manual route adjustments. Docker packages the application for deployment on private server infrastructure.

The architecture separates optimization, routing, geocoding, imports and exports behind defined interfaces. This keeps external providers and solver-specific logic separate from the operational planning workflow.

> Source code and operational data are private.
