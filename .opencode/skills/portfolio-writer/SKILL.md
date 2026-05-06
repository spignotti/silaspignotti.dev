---
name: portfolio-writer
description: Writes project pages and static website pages for silaspignotti.dev. Positioning: a student showing real work, not an expert dispensing wisdom. Load when asked to write, rewrite, or revise project pages, the landing page, about page, projects overview, or contact page.
---

# Portfolio Writer

Writes project pages and static website pages for [silaspignotti.dev](http://silaspignotti.dev).

**Positioning:** A student who shows real work, not an expert who dispenses wisdom.

**When to use:** Silas wants to write or revise a project page (Problem/Solution/Result/Lessons Learned/Deep Dive) or a static website page (Landing, About, Projects, Contact).

## Positioning

- Student and aspiring Geo Data Scientist who documents real projects. Not a thought leader, not a lecturer.
- Competence shows through the work itself: what was built, which decisions were made, what came out of it.
- "I built this and this is what happened" instead of "This is how you should do it."
- No lectures, no best-practice guides, no "In this article I'll show you" formulations.

## Voice

- Neutral-technical. Personality through word choice, rhythm, compression. Not through anecdotes or self-positioning.
- Confident but not inflated. A competent peer documenting their work.
- English as default (website is in English). German only if Silas specifies.
- Non-native English: Common, internationally standardized vocabulary. No native-speaker flourishes (no phrasal verb chains, no idiomatic metaphors, no "albeit"/"wherein"). Clear SVO sentence structures.
- Credibility test: Would a German Geoinformatik M.Sc. student with good English write it this way? If no, simplify.

## Anti-Patterns

- No marketing speak, no buzzword padding, no "we are excited", no filler paragraphs.
- No em dashes. Use comma, period, colon, semicolon, or restructure the sentence.
- No generic takeaways ("This taught me the importance of..."). Concrete learnings with substance.
- No feigned authority: not "You should always..." but "I found that..." or "What worked:".
- No throat-clearing. No setup sentences. Result first.
- No significance inflation: "marking a pivotal moment", "a testament to". State the fact, let the reader judge.
- No self-praise: "I'm passionate about", "I thrive on", "I love working with". Show the work instead of slapping on labels.
- **No downgrading.** Do not weaken Silas' real competencies. Context Engineering, Agentic Systems, RAG are not buzzwords — they are real areas of work. Don't reduce everything to "Python and SQL". The work includes ML/DL, not just data pipelines.
- **No project listings in hero/intro.** Projects are presented on /projects. Intro text describes competencies and working style, not individual projects.
- **No job title claims as a student.** Avoid role titles like "AI Engineer" or "Geo Data Scientist" in hero/intro. Instead, describe topic areas ("Geospatial · AI · Automation").
- **No freelancing or OSS contributor language.** Avoid "Open Source", "Freelance", or "Consulting" as self-description. Use "Data Engineering & Tooling" instead of "Open Source".

## Page Types

### Project Pages

Structure: Problem → Solution → Result → Lessons Learned → Deep Dive

- **Problem:** What is the problem? Why does it exist? Context for someone without prior knowledge. Concise, no dramatization.
- **Solution:** What was built? How does it work at a high level? Key technical decisions. No code details, but enough depth for technical readers.
- **Result:** What came out of it? Quantifiable when possible (metrics, numbers, comparisons). What does the project demonstrate?
- **Lessons Learned:** 2-4 concrete, honest insights. What went well, what didn't, what would be done differently. No generic "I learned the importance of testing". Good example: "Spatial block CV added 3 weeks to the pipeline but caught a 12pp accuracy inflation from spatial autocorrelation." Bad example: "Testing is important and I learned to always test thoroughly."
- **Deep Dive:** Optional technical deep-dive into one aspect of the project. Methodology, architecture decision, performance analysis. For readers who want to know more. Can stand alone (someone could read only the deep dive).

### Static Pages

- **Landing:** Hook, what I do (3 areas: Geospatial Data Science, AI & Automation, Data Engineering & Tooling), tech stack, CTA. Concise and confident. No project listing in the intro.
- **About:** Bio, experience, education, skills. Factual, honest, no LinkedIn pathos. Urban planning background as personal motivation, not as comparison with CS graduates.
- **Projects:** Overview with short teasers. Each project as a business case: problem, solution, result.
- **Contact:** Direct, inviting, links to relevant profiles.

## Workflow

1. **Input:** Silas provides context (project data, notes, repo info, existing content from `src/content/`).
2. **Draft:** First version in chat. Focus on substance and structure. Don't over-polish.
3. **Review:** Silas gives feedback. Targeted revisions, no full rewrite.
4. **Pipeline:** After approval → Content SEO pass → load `de-ai` skill and run in light mode for portfolio/README format.
5. **Persist:** Write the final text to the target page.

## Tech Tag Rules

Tech tags (inline code blocks on the website) follow a clear abstraction level:

- **Only languages, frameworks, and platforms.** Things you need to learn independently and that a recruiter recognizes as a keyword.
- **No individual algorithms** (no XGBoost next to scikit-learn, no Random Forest).
- **No individual Python packages** for sub-tasks (no Matplotlib, no GeoPandas, no rasterio). The competence is in the prose.
- **Consistent naming.** Either API names or product names, don't mix. "Claude Code" (tool), not "Claude" (unclear whether API, product, or model).
- **No padding.** Only tags Silas actively and regularly uses. Better 6 strong tags than 15 arbitrary ones.
- Prose describes competencies, tags show what was used.

## SEO Basics (observe during draft)

The Content SEO skill optimizes afterward. But already consider during drafting:

- Primary keyword in the title and first paragraph.
- H2/H3 structure hierarchical and keyword-aware.
- Natural language. Don't force keywords.

## Constraints

- Work only with provided material. Flag gaps, don't invent.
- Preserve Silas' voice during revisions: improve, don't overwrite.
- No meta-commentary in the delivered text. Feedback belongs in the chat.
- No unsolicited content changes to existing text.

## Output

- **Format:** Markdown, matching the page type.
- **Language:** English (website default). German only on instruction.
- **Length:** As concise as the content allows. Project pages: ~300-600 words for Problem/Solution/Result combined, ~100-200 for Lessons Learned, Deep Dive variable by topic.
