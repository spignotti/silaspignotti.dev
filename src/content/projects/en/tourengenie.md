---
lang: "en"
slug: "tourengenie"
kind: "case"
order: 1
title: "Tourengenie"
seoTitle: "Tourengenie: Route planning for a maintenance company · Silas Pignotti"
description: "I built and operate Tourengenie, the software a Berlin maintenance company uses to plan its routes every day."
role: "Development and operations"
period: "since August 2026"
status: "live"
year: 2026
links:
  - label: "tourengenie.de"
    href: "https://tourengenie.de"
keyFigures:
  - value: "over 100"
    label: "customers on a fixed maintenance schedule"
  - value: "about 30 %"
    label: "fewer routes"
  - value: "about 50 %"
    label: "more maintenance jobs per route"
figures:
  - { n: 1, placeholder: "Screenshot of the planning view, to be added by Silas", caption: "The Tourengenie planning view.", section: "What Tourengenie does" }
  - { n: 2, file: "tourengenie/objective", caption: "The goals in a fixed order. A level only counts when all levels above it are equal.", section: "Planning" }
  - { n: 3, file: "tourengenie/travel-cache", caption: "A new stop only adds its own row and column to the travel time matrix.", section: "Travel time cache" }
  - { n: 4, file: "tourengenie/release", caption: "From development to production. If a deploy fails, the previous version runs again.", section: "Operations and infrastructure" }
---

## Background

I built Tourengenie on my own for a maintenance company in Berlin and run it on my server. The company services sewage lifting stations for over 100 customers on a fixed schedule. The office used paper notes and lists to draw up the monthly plan. There was no suitable software for this work.

## What Tourengenie does

Tourengenie turns due maintenance jobs into routes assigned to vehicles and days. When a customer accepts, cancels or reschedules an appointment, the software recalculates the plan. Confirmed appointments stay fixed. The dispatcher decides which appointments to arrange with customers.

## Results

The company uses Tourengenie to plan its routes every day. The company reports that since the switch, it runs about 30 % fewer routes and completes about 50 % more maintenance jobs per route. The office no longer needs paper notes or lists for planning.

## Planning

I model the whole month as a Vehicle Routing Problem (VRP). The model represents which vehicle visits which stops and in what order. I solve it with PyVRP, an open-source solver. In the model, each combination of a day of the week and a vehicle class is a separate vehicle. This lets a single run assign maintenance jobs across all days of the month. The model accounts for travel time between stops separately for each vehicle class.

The lexicographic objective ranks the goals in a fixed order. First, the plan should include all jobs that are due. Next, it should use as few routes as possible. If plans use the same number of routes, travel time decides. Distance only decides if travel time is also equal. I also give overdue maintenance jobs priority according to their urgency levels.

PyVRP optimizes a single integer objective function. I scale the objectives so that scheduling one more job always counts more than any reduction in the number of routes, and removing one route always counts more than any savings in travel time. This preserves the ranking in a single number.

An independent checker verifies each result by recalculating it. If the checker finds an error, Tourengenie does not publish the plan.

## Replanning

Every change triggers a new planning run. Confirmed routes stay fixed within the confirmation window. The model reschedules the remaining maintenance jobs. This keeps the confirmed arrangements in place even if the plan for the rest of the month changes.

The calculation runs in the background. If several changes arrive close together, I group them into one run per month. I apply the result as an atomic update. The dispatcher sees either the old plan or the complete new plan, never a partial plan.

## Travel time cache

I need travel times between stops to plan the routes. I cache this travel time matrix in PostgreSQL. The entries are directed edges, with a separate entry for each direction between two stops. I store them by tenant and vehicle profile without an expiry date.

When a location is saved, Tourengenie warms the cache in the background. If a new stop is added to n existing stops, the software only needs 2n more edges. These cover trips from the new stop to the existing stops and trips back. Recalculating the entire matrix would require n² edges. The travel times come from Geoapify, a routing service. I group requests into rectangles of origins and destinations to keep costs as low as possible under the provider's pricing model.

With cached travel times, replanning takes a few seconds. In the October measurement, a run with a warm cache took under two seconds. With a cold cache, it took about 16 seconds.

## Operations and infrastructure

I used a script to set up and harden my server, and I monitor it continuously. Development, staging and production run separately. Staging is the environment where I can check changes before the company uses them.

The CI/CD pipeline runs tests and security scans. The pipeline signs releases and deploys them automatically at night. If a deployment fails, an automatic rollback restores the previous version.

I write backward-compatible migrations so that the previous version can keep working with the database after a rollback. Before deployment, I test the migration against a copy of the latest backup.

## Company data

In production, Tourengenie uses the company's customer data. The application supports multiple tenants. I use Supabase and apply row-level security to every table in PostgreSQL. The database itself determines whether a tenant can see each row, without relying on the application to make that decision. I test these rules in CI.

Encrypted backups run every night. An automated restore test checks every month whether the data can be restored from a backup. Tests and coding agents have no access to production data.

## Agentic Software Engineering

I built Tourengenie with AI coding agents. The agents work on branches. Each change goes through mandatory checks in a pull request. I use a fresh agent that did not write the change to review it.

Another agent checks the change in the running app. I approve migrations, changes to authentication and secrets, and releases myself.

## Current status

Under the name Tourengenie, I am now testing the software with other companies.

[tourengenie.de](https://tourengenie.de)