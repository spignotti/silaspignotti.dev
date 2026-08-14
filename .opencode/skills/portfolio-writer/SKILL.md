---
name: portfolio-writer
description: Writes and revises website text for silaspignotti.dev — project pages, landing page, about page, projects overview. Load when the user asks to write, rewrite, or revise website content, or to draft text for a new project: "schreibe einen Text", "ändere diesen Absatz", "Projektseite schreiben", "drafte einen Projekttext", "update the about page".
---

# Portfolio Writer

Writes project pages and static website pages for [silaspignotti.dev](https://silaspignotti.dev).

**When to use:** The user asks to write or revise website text — a project page, the landing page, the about page, or the projects overview — or to draft copy for a new project before it is published.

## Positioning

- Competence shows through the work itself: what was built, which decisions were made, what came out of it.
- "I built this and this is what happened" instead of "This is how you should do it."
- No lectures, no best-practice guides, no "In this article I'll show you" formulations.
- Do not invent self-positioning. Read the existing target page before writing and stay consistent with it. If no page exists yet, let the work speak for itself.

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
- **No unrequested role titles or self-positioning in hero/intro.** Avoid role titles like "AI Engineer" or "Geo Data Scientist". Instead, describe topic areas ("Geospatial · AI · Automation").
- **No freelancing or OSS contributor language.** Avoid "Open Source", "Freelance", or "Consulting" as self-description. Use "Data Engineering & Tooling" instead of "Open Source".

## Page Types

### Project Pages

Structure: Problem → Solution → Result → Technical Details

- **Problem:** What is the problem? Why does it exist? Context for someone without prior knowledge. Concise, no dramatization.
- **Solution:** What was built? How does it work at a high level? Key technical decisions. No code details, but enough depth for technical readers.
- **Result:** What came out of it? Quantifiable when possible (metrics, numbers, comparisons). What does the project demonstrate?
- **Technical Details:** Optional section for the technical substance: methodology, architecture decisions, performance analysis. For readers who want to know more.

### Static Pages

- **Landing:** Hook, what I do (3 areas: Geospatial Data Science, AI & Automation, Data Engineering & Tooling), tech stack, CTA. Concise and confident. No project listing in the intro.
- **About:** Bio, experience, education, skills. Factual, honest, no LinkedIn pathos. Urban planning background as personal motivation, not as comparison with CS graduates.
- **Projects:** Overview with short teasers. Each project as a business case: problem, solution, result.

## Workflow

1. **Input:** The user provides context (project data, notes, repo info, existing content). Read the existing target file in `src/content/` before writing or revising.
2. **Draft:** First version in chat (or inline when revising). Focus on substance and structure. Don't over-polish.
3. **Review:** The user gives feedback. Targeted revisions, no full rewrite.
4. **Deliver:**
   - Draft-only requests ("draft a text", "rewrite", "Entwurf") end here — output stays in chat, no files change.
   - Publish requests ("change this text", "add a new project", "update the page") continue: load the `site-deploy` skill to persist the text and publish it.
5. **Polish (optional):** Load the `de-ai` skill in light mode for portfolio/README format.

## Tech Tag Rules

Tech tags (inline code blocks on the website) follow a clear abstraction level:

- **Only languages, frameworks, and platforms.** Things you need to learn independently and that a recruiter recognizes as a keyword.
- **No individual algorithms** (no XGBoost next to scikit-learn, no Random Forest).
- **No individual Python packages** for sub-tasks (no Matplotlib, no GeoPandas, no rasterio). The competence is in the prose.
- **Consistent naming.** Either API names or product names, don't mix. "Claude Code" (tool), not "Claude" (unclear whether API, product, or model).
- **No padding.** Only tags Silas actively and regularly uses. Better 6 strong tags than 15 arbitrary ones.
- Prose describes competencies, tags show what was used.

## SEO Basics (observe during draft)

- Primary keyword in the title and first paragraph.
- H2/H3 structure hierarchical and keyword-aware.
- Natural language. Don't force keywords.

## Constraints

- Work only with provided material. Flag gaps, don't invent.
- Preserve Silas' voice during revisions: improve, don't overwrite.
- No meta-commentary in the delivered text. Feedback belongs in the chat.
- No unsolicited content changes to existing text.

## Output

- **Format:** Markdown with frontmatter matching the schema in `src/content.config.ts`.
- **Language:** English (website default). German only on instruction.
- **Length:** As concise as the content allows. Project pages: ~300-600 words for Problem/Solution/Result combined; Technical Details variable by topic.
