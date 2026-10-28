---
name: portfolio-writer
description: >
  Write and revise silaspignotti.dev copy: project pages, landing, about, and
  the projects overview. Use when the user asks to draft, rewrite, or update
  website text, or runs /portfolio-writer.
---

# Portfolio writer

This repository is the only source for site copy. English by default. German only when Silas asks. Read the target file in `src/content/` before writing.

## Workflow

1. Input: project data, notes, the existing file, or a concrete change request.
2. Draft in chat. Substance and structure first, no over-polishing.
3. Review with Silas: targeted revisions, no full rewrite.
4. After Silas' OK: write the approved text to the target file on a dedicated branch and open a pull request against `main` (persist and publish steps: `site-deploy`). Merge only after Silas' OK.

Draft-only requests stay in chat.

## Voice

A competent peer documenting the work. Neutral-technical. Personality through word choice, rhythm, and compression, not through anecdotes or self-positioning. Confident, not inflated.

Competence shows through the work itself: what was built, which decisions were made, what came out. "I built this and this happened", not "this is how it should be done". No lecturing, no best-practice guides, no "In this article I'll show you".

Common international English. Clear SVO sentences. No native-speaker flourishes (no phrasal-verb chains, no idiomatic metaphors, no "albeit" or "wherein"). Credibility test: would a German Geoinformatik M.Sc. student with good English write it this way? If not, simplify.

Result first. Concrete learnings. "I found that…" or "What worked:". State the fact; let the reader judge.

## Anti-patterns

- No marketing speak, buzzword padding, "we are excited", or filler paragraphs.
- No em dashes. Use a comma, period, colon, or semicolon, or rebuild the sentence.
- No generic takeaways ("This taught me the importance of…"). Concrete learnings with substance.
- No borrowed authority: not "You should always…".
- No throat-clearing or setup sentences.
- No significance inflation ("a pivotal moment", "a testament to").
- No self-praise ("I'm passionate about", "I thrive on", "I love working with"). Show the work instead of a label.
- No downgrading. Context engineering, agentic systems, RAG, and ML/DL are real areas of work. Do not reduce everything to "Python and SQL".
- On landing and about: topic areas (Geospatial · AI · Automation), not role titles, not a project list, not freelance or OSS-contributor language. Name that work "Data Engineering & Tooling" when it needs a label.

## Pages

Frontmatter matches `src/content.config.ts`.

**Project:** Problem → Solution → Result → optional Technical Details. About 300–600 words for the first three sections; Technical Details as long as the complexity needs.

- Problem: what the problem is and why it exists. Context for a reader without prior knowledge. Short, no drama.
- Solution: what was built and how it works at a high level. Key technical decisions. No code details, but enough depth for technical readers.
- Result: what came out. Quantified where possible (metrics, numbers, comparisons). What the project demonstrates.
- Technical Details: pipeline, architecture, or method in depth. Components, data flows, key implementation decisions. Factual and compressed, no reflection or learnings.

**Landing:** hook, three focus areas (Data & AI, Geospatial, Systems & Automation), tech stack, CTA. Short and confident.

**About:** bio, experience, education, skills. Factual, honest, no LinkedIn pathos. Urban planning as personal motivation, not as a comparison with CS graduates.

**Projects overview:** short teasers, each as problem / solution / result.

## Tags

**Project pages:** detailed tags are explicitly allowed. This is where concrete technical depth should be visible.

- Languages, frameworks, platforms, relevant libraries, APIs, models, and project-specific tools can be tags when they are substantial for that project. Examples: `PyTorch`, `scikit-learn`, `XGBoost`, `GeoPandas`, `Rasterio`, `PyVRP`, `OpenAlex`, `Semantic Scholar`.
- Algorithms or model types can be tags when they play a central role in the project, not when they are an implementation detail.
- No padding. A tag stays only if Silas actually used it in the project and can explain what for and how.
- The prose explains the technical decision; tags make the concrete stack visible at a glance.

**Landing tools carousel:** stays deliberately curated. Only robust, profile-defining tools. No mirror of all project tags; project-specific libraries do not go there automatically.

**General:** one naming scheme. Do not mix product, API, and tool names (`Claude Code` for the tool, not `Claude`). No technologies that were only planned, evaluated, or touched in passing.

## SEO basics

Primary keyword in the title and the first paragraph. Hierarchical, keyword-aware H2/H3 structure. Natural language; do not force keywords.

## Constraints

- Work only from provided material. Flag gaps, do not invent.
- Keep Silas' voice on revisions: improve, do not overwrite.
- No meta commentary in the delivered text. Feedback belongs in the chat.
- No unrequested changes to existing text.
