---
lang: "en"
slug: "routing-engine-solver"
kind: "case"
order: 1
title: "Routing Engine · Planning and Solver"
seoTitle: "Routing Engine · Planning and Solver · Silas Pignotti"
description: "A web application that plans the recurring service visits of a maintenance company as a monthly plan with tours, time windows and breaks."
role: "Requirements, data model, planning logic, development and operations"
period: "since July 2026"
status: "live"
year: 2026
links: []
keyFigures:
  - { value: "October 2026", label: "In daily use since" }
  - { value: "1 month", label: "Pilot with the office" }
figures:
  - { n: 1, file: "routing-engine-solver/architecture", caption: "From order to stop list. The solver proposes, the office reviews and confirms." }
  - { n: 2, file: "routing-engine-solver/method", caption: "The interval sets the month. The solver sets day, vehicle and stop order." }
---

## Problem

A maintenance company visits its customers at fixed intervals, every few months depending on the site. The office planned these tours by hand from addresses, vehicles and expected service times, and many rules have to fit together. Not every vehicle can serve every site, some customers have time windows or fixed weekdays, every shift ends at a set time, and a long day needs a break. The office needed a monthly plan that can actually be driven, has a clear stop order and can still be changed before release. A date refused on the phone should not reshuffle the month.

## Approach

I took the requirements from the existing planning process, together with the people who do it every day. This led to the following decisions.

**The month is the planning unit.** The last service date and the interval in months give the month in which a site is due. Only then does the solver assign the due orders to days, vehicles and routes. An order without a fixed weekday can go on any working day; only restricted orders fix a day. This leaves room for short tours.

**A fixed order of goals.** The solver first plans as many due orders as possible, then uses as few tours as possible, then as little driving time as possible. I use PyVRP as the solver instead of writing my own algorithm. The version is pinned, because results and test cases depend on it. An upgrade is a separate, reviewed change.

**The plan is a proposal; the office decides.** The office checks the tours on the map, moves stops and confirms them. A confirmed stop gets a promised arrival window whose width the company sets itself. Later replanning keeps this promise.

**Solve date refusals locally.** When a customer declines a date, the application does not replan the whole month. It shows up to five alternatives, sorted by added driving time and each with an exact time, so the office can agree on a date during the call. Only after that does a background replan improve the remaining movable stops.

**Rules the company really needs.** Above a certain working time, a tour gets a break within a fixed period that the company sets. If the solver finds no place for it, it does not output the tour; its orders stay visible as open work. If a vehicle is not available, a day lock reserves that slot, so the next automatic plan does not fill it again. No order gets lost: it is planned, explicitly closed, or visible as open.

I deliberately did not build a replacement for the company's existing systems, learning features or automatic driver assignment, live traffic data, or a separate solver variant per customer. Planning stays rule-based, and a person confirms the result.

## System

The application is a modular monolith in Python. FastAPI renders the interface on the server with Jinja; HTMX swaps parts of the page, and Leaflet shows the tours on a map. There is no single-page app; state lives only on the server.

All data is stored in PostgreSQL and separated per company with row level security. Reads and writes use the token of the signed-in user. Relevant changes are recorded in an append-only audit log.

Geocoding, the travel-time matrix and the solver sit behind replaceable interfaces in the same process. External services receive only addresses or coordinates, durations and constraints, never customer names or notes. Travel times are stored per company and coordinate pair and reused until someone renews them on purpose. A new address only fetches the missing connections.

For each month the solver builds one model with vehicle classes, weekdays, shifts, time windows and compatibility rules between site type and vehicle. An independent validator checks the result before it is saved. The output is a stop list and a driver sheet as PDF.

## Result

The office tested the application for one month in a pilot with real planning work. I used this feedback to change the workflow and the route editing. Since October 2026 the company plans all its maintenance tours with it. The office checks the routes on the map, adjusts them and hands them to the drivers as a stop list. Development continues with feedback from daily use. Recent changes include the break rule, the local move after a date refusal and keeping confirmed tours when a rule changes.

## Limits

The Routing Engine is an internal tool for one company, not a general platform. Travel times come from a routing service with a simple traffic model, without live traffic. A buffer on driving times needs measured tours first. The stored travel-time matrix grows quadratically with the number of addresses; much more data needs a new storage plan. The app runs as one process. The solver is a heuristic: it finds good plans but does not prove an optimum.
