---
title: "DispoAI"
slug: "dispoai"
description: "AI-assisted route optimization for container logistics. VRP solver with live map UI, built for a real waste management company."
category: "AI/Automation"
tags:
  - "Python"
  - "FastAPI"
  - "Docker"
  - "Streamlit"
  - "Supabase"
coverIcon: "workflow"
tagline: "Optimal routes, real constraints."
featured: false
year: 2026
completed: false
---

## Problem

Dispatchers at container logistics companies plan routes manually every morning. No tooling for constraint-aware optimization (time windows, vehicle capacity, driver shifts). Scheduling takes 1-2 hours and produces suboptimal routes.

## Solution

Web app with FastAPI backend and Streamlit UI. PyVRP solves the Vehicle Routing Problem with real-world constraints. OpenRouteService/Nominatim for geocoding and road-network routing. Supabase for order and fleet data. Docker for deployment on Hetzner.

## Result

PoC built and validated with DINO Containerdienst. Route quality and time savings measured against current manual process.

## Lessons Learned

- To be filled after completion.

## Deep Dive

VRP formulation: capacity constraints, time windows, multi-depot. PyVRP chosen over OR-Tools for Python-native API and active maintenance. Geocoding pipeline: address normalization + ORS matrix for travel times.
