---
title: "Routing Engine · Built with Agents, Run in Production"
seo_title: "Routing Engine built with agents · Silas Pignotti"
summary: "How I develop and run the Routing Engine with AI coding agents: plan, implementation in worktrees, checks, review, release and deploy."
role: "Planning, rules for the agents, review process, releases and operations"
period: "since August 2026"
status: "ongoing"
links: []
key_figures:
  - label: "Merged pull requests (as of 19 Nov 2026)"
    value: "343"
  - label: "Releases since 22 Oct 2026"
    value: "9"
  - label: "First commit to first release"
    value: "11 weeks"
---

## Problem

I build and run the Routing Engine alone, next to my studies and a student job. A maintenance company uses it every day to plan its tours. AI coding agents write code fast, but speed alone is a risk here. A planning bug can lose an appointment, a database migration runs against real data, and credentials must never end up in the code. So the question was: how can agents do most of the implementation without me losing control over what goes into production? Every change should be checkable, and daily operations should stay stable.

## Approach

**Rules live in the repository.** A file `AGENTS.md` gives every agent the data rules, the limits for changes, the test strategy and the commands. A second file lists every standard a pull request must meet and says how it is checked: by a CI check or in review. A review finding must name the standard it breaks. Style alone is not a finding.

**Only decided work gets built.** An issue holds a decided task with acceptance criteria. Decisions whose reasons are not visible in the code are kept as short decision notes in the repository, 30 so far. There are no parallel specifications. Behaviour lives in code and tests.

**Roles are separate.** Larger work starts with a plan. An agent implements it in its own Git worktree, so several tasks can run in parallel. A second model that did not write the code reviews the pull request. If a change is visible in the app, another agent that did not write the code checks the running app against the acceptance criteria. Steps and screenshots go into the pull request. If this check fails, the work goes back to implementation.

**Who merges depends on risk.** When the checks are green and the review finds nothing blocking, the agent merges itself and writes a few lines on what was checked. New migrations, login, sessions, tenant separation, handling of credentials, release and deploy config, and the solver version always wait for my approval.

**Synthetic data only.** Tests, fixtures and demos use only invented data. An agent writes to production only with my approval. All worktrees share one local database; anyone who starts, resets or seeds it takes a lock first.

**Weekly care.** Since November a weekly care run is set up. It checks one topic at a time, for example tests or CI and deploy, fixes findings through pull requests and turns a finding into a standard that future pull requests must meet.

I deliberately did not build an automatic deploy after every merge, a hosted development database, or plan and session documents next to the code. A release is a deliberate decision.

## System

Every pull request goes through one required check. It runs linting and type checks, unit, service and browser tests, checks dependencies for known vulnerabilities and sets up a fresh local database. Tests for permissions, tenant separation and planning rules run against it, plus integration tests with a real login. On top come a secret scan, custom static analysis rules and a vulnerability scan of the container image. Docs-only changes skip the heavy steps; when in doubt, the full run wins. Slow solver tests run every night, and a scan of the released image runs every week.

A release is a version tag on `main`. It produces a signed container image with a list of its dependencies. Every night the server installs the newest signed release, after checking its signature and the database schema. Migrations stay compatible with the previous release, so the image can still be rolled back. Operations, monitoring and backups live in a separate repository.

## Result

The first commit was on 3 August 2026, and the app has been in daily use since October 2026. By 19 November 2026, 343 pull requests were merged, 28 of them automatic dependency updates. There were 7 in August, 64 in September, 88 in October and already 184 in November up to the 19th. Since the first release on 22 October there have been 9 releases. The CI workflows ran more than 2,100 times in total.

## Limits

Agents make mistakes that can pass the tests, and a review by a model is no proof. That is why the risky areas stay with me. For a small change the process often takes longer than the change itself. A green check on a Python-only pull request does not mean the database tests ran. And everything depends on one person. The tools change fast; the rules are written so that an agent can be replaced.

## Figures

1. **Process (Fig. 1).** Type: process diagram, horizontal. Shows issue → plan → agent implements in a worktree → checks and review → merge → release tag → nightly deploy. Under "checks and review", three small boxes: CI checks, review by a second model, check in the running app. A dashed branch "waits for approval" for migrations, login, credentials and deploy. Accent: "checks and review". Caption DE: „Vom Issue bis in den Betrieb. Agenten setzen um, Checks und Review entscheiden über den Merge.“ EN: "From issue to production. Agents implement; checks and review decide the merge."
2. **Pull requests per month (Fig. 2).** Type: key figure, bar chart. Values: August 7, September 64, October 88, November 184 (up to 19 Nov 2026). November bar marked "to 19 Nov". Accent: the October bar (first release, start of daily use). Caption DE: „Gemergte Pull Requests pro Monat, Stand 19.11.2026.“ EN: "Merged pull requests per month, as of 19 Nov 2026."
