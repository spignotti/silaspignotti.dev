---
title: "DispoAI"
slug: "dispoai"
description: "Route optimization for container logistics. VRP solver generating optimized daily tours from order and fleet data."
category: "AI/Automation"
tags:
  - "Python"
  - "FastAPI"
  - "PyVRP"
  - "Docker"
  - "Supabase"
coverIcon: "workflow"
tagline: "VRP solver for container logistics: optimized daily tours from order and fleet data."
featured: true
year: 2026
completed: false
---

## Problem

Container logistics for waste management SMEs involves a routing problem that generic dispatch software does not handle: coordinating empty and full containers, multiple drop-off points, vehicle capacities, and driver shifts across daily tours. Dispatchers plan routes manually every morning. At 10 vehicles and 30 stops, the combinatorial space exceeds what manual planning can optimize. The result: suboptimal routes, wasted capacity, and avoidable costs.

## Solution

Web application with a VRP solver backend that generates optimized daily routes from order and fleet data. OpenRouteService for road-network routing and travel time matrices, Nominatim for geocoding. Supabase for data management. Docker-deployed. Built for a specific container logistics use case where existing dispatch tools fall short.

## Result

In progress. First test runs against dispatcher-planned baselines show optimized routes covering the same daily workload with fewer vehicles.

## Technical Details

PyVRP as the routing solver, handling capacity constraints, time windows, and multi-stop tours. Geocoding pipeline normalizes addresses via Nominatim and computes travel time matrices via OpenRouteService. FastAPI serves the optimization results, Supabase manages order and fleet data.
