# AGENTS.md

> Русская версия: [AGENTS.ru.md](./AGENTS.ru.md)

Instructions for AI agents and contributors working in this repository.

## 1. Project overview

Personal portfolio website of **Konstantin Petrov** with three resume variants:

- `senior-frontend` — Senior Front-end Developer / UI Architect
- `middle-frontend` — Middle Front-end Developer
- `middle-fullstack` — Middle Full-stack Developer (frontend-heavy)

The site is fully static, bilingual (Russian / English) and published to GitHub Pages.

Current status: **implemented**. The Astro scaffold, portfolio landing, three resume pages, bilingual routing, theme switch and GitHub Pages workflow are in place. Remaining work is content polish and deployment verification.

## 2. Product requirements

- Portfolio landing page: hero, about, key skills, selected projects, contacts.
- Three resume pages, each built from the same base data with its own positioning.
- Two locales: `ru` (default) and `en`; every page and resume has both versions.
- Static output only, deployable to GitHub Pages without a server.
- Fast, accessible, responsive, SEO-friendly.

## 3. Target stack

- **Astro 7** with `output: "static"` (requires Node >= 22.23.4; CI uses Node 24).
- **TypeScript** in strict mode.
- **Tailwind CSS 4** via `@tailwindcss/vite`.
- No UI framework runtime (React/Vue) unless a concrete need appears.
- Data-driven content: resumes are rendered from JSON, not hand-written HTML.

## 4. Repository layout

```
/
  AGENTS.md
  AGENTS.ru.md
  astro.config.mjs
  package.json
  tsconfig.json
  .github/workflows/deploy.yml
  public/
    favicon.svg
    robots.txt
  src/
    components/
      ContactLinks.astro
      Footer.astro
      Header.astro
      LanguageSwitcher.astro
      ProjectCard.astro
      ResumeCard.astro
      ThemeToggle.astro
    layouts/
      BaseLayout.astro
    i18n/
      index.ts
      ui.ts
      ru.ts
      en.ts
    lib/
      data.ts
      paths.ts
    types/
      content.ts
    styles/
      global.css
    pages/
      index.astro
      404.astro
      [lang]/
        index.astro
        resume/
          [slug].astro
    data/
      profile.json
      resume/
        base.ru.json
        base.en.json
        variants.json
```

`src/content/` is optional and may be introduced later for blog or project case studies. Do not move the resume data out of `src/data/resume/` without updating this document.

## 5. Data model

All data files are JSON with a `schemaVersion` field. They are the single source of truth; never duplicate resume facts in components or variant files.

### `src/data/profile.json`

Shared identity and contact data.

- `schemaVersion` — integer.
- `name` — `{ ru, en }`.
- `roles` — `{ ru: string[], en: string[] }`, general role labels.
- `contacts.phone` — `{ value, display, visible }`.
- `contacts.email` — `{ value, visible }`.
- `contacts.telegram` — `{ handle, url, visible }`.
- `contacts.location` — `{ ru, en }`.
- `contacts.github` — `{ label, url }`.
- `photo` — `null` or a path to a file in `public/`.
- `defaultLocale` — `"ru"`.
- `locales` — `["ru", "en"]`.

Respect the `visible` flags when rendering contacts.

### `src/data/resume/base.<locale>.json`

Localized resume content, one file per locale. Both files **must** have identical structure, ids and ordering; only text values may differ.

- `schemaVersion`, `locale`.
- `about` — professional summary.
- `keyTechnologies` — flat list of primary technologies.
- `competencies` — list of key competencies.
- `experience[]` — chronological, newest first. Each entry:
  - `id` — stable kebab-case identifier.
  - `period` — display string, e.g. `2016 — настоящее время` / `2016 — present`.
  - `company`, `role`.
  - `projects[]` — optional, for freelance or multi-project roles. Each project:
    - `id`, `name`, `description`, `stack[]`, `achievements[]`.
  - `achievements[]` — for single-project roles.
- `technicalStack[]` — groups of technologies:
  - `id` (`frameworks`, `state`, `styling`, `build`, `testing`, `adjacent`, `innovation`).
  - `label` — localized category name.
  - `items[]`.
- `education[]` — `{ institution, specialty, graduationYear }`.
- `keyAchievements[]`, `whyMe[]`, `recommendations[]`.

### `src/data/resume/variants.json`

Locale-independent configuration of the three resume variants.

- `schemaVersion`, `defaultLocale`.
- `variants[]`:
  - `id` — matches the route slug (`senior-frontend`, `middle-frontend`, `middle-fullstack`).
  - `order` — display order.
  - `slug` — URL segment, keep equal to `id`.
  - `title` — `{ ru, en }`.
  - `summary` — `{ ru, en }`, variant-specific positioning.
  - `focus[]` — emphasis tags used by the UI.
  - `highlightProjects[]` — project ids promoted for this variant.
  - `experienceOrder[]` — experience ids in display order.
  - `skillsOrder[]` — `technicalStack` group ids in display order.
  - `deEmphasize[]` — tags/keywords to visually downplay (never remove facts).

### Data rules

- IDs are stable; do not rename without updating every reference in `variants.json`.
- Every id referenced by a variant must exist in both `base.ru.json` and `base.en.json`.
- Do not invent employers, projects, dates or metrics.
- The Middle Full-stack variant must stay honest: PHP and Python are listed as basic / API-understanding skills, not production backend experience.
- To add a fourth resume variant, add an entry to `variants.json` only. Do not create a separate content file.

## 6. Internationalization

- Locales: `ru` (default), `en`.
- URLs: `/ru/...` and `/en/...`; the root `/` redirects to the default locale.
- Routing is manual via `src/pages/[lang]/...` and `getStaticPaths`. Do not add Astro's built-in i18n routing on top of it.
- All visible strings live in data files or `src/i18n/*.ts`. No hardcoded copy in components.
- Emit `hreflang` alternates and localized `<title>` / meta description for each page.
- Keep RU and EN in sync in the same change.

## 7. GitHub Pages deployment

- Repository: `vbarkasov/petrov`.
- Expected URL: `https://vbarkasov.github.io/petrov/`.
- Configure Astro with `site: "https://vbarkasov.github.io"` and `base: "/petrov/"`.
- If a custom domain is added, put it in `public/CNAME`, change `base` to `"/"` and update `site`.
- Build output: `dist/`.
- Workflow `.github/workflows/deploy.yml`:
  - Trigger on push to `main` and `workflow_dispatch`.
  - Permissions: `contents: read`, `pages: write`, `id-token: write`.
  - Steps: checkout, setup Node 24, `npm ci`, `npm run check`, `npm run build`, `actions/upload-pages-artifact` with `path: dist`, `actions/deploy-pages`.
- Always generate asset URLs through Astro helpers or relative paths so the `/petrov/` base works.
- Do not commit `dist/`.

## 8. Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
npm run lint
npm run format
```

Before committing, `npm run check` and `npm run build` must pass.

## 9. Code conventions

- TypeScript strict mode; no `any`; type all data at module boundaries.
- Astro components in `src/components/` and layouts in `src/layouts/`, PascalCase filenames.
- Tailwind utility-first. Extract reusable class sets into components rather than long `@apply` blocks.
- Prefer semantic HTML, correct heading order, labels, `alt` text, keyboard support and visible focus.
- Mobile-first responsive layout; support system dark mode.
- Keep components small and data-agnostic; content variation belongs to data, not templates.
- No comments unless explicitly requested.
- Never commit secrets, tokens or private contact data beyond what is configured in `profile.json`.

## 10. Content rules

- Do not duplicate resume text across variants; variants may only override title, summary, ordering and emphasis.
- Dates use an em dash: `2016 — настоящее время`, `2014 — 2016`.
- Preserve metrics in the wording that came from the source data; do not round or embellish.
- Keep RU/EN parity for every text field.
- Contact visibility is controlled by `profile.json`; do not bypass it.

## 11. Git workflow

- Work on `main`; use short-lived branches for larger changes.
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- `.gitignore` must include `node_modules/`, `dist/`, `.astro/`, `.env*`.
- Do not commit generated build output.

## 12. Verification

- `npm run check && npm run build` succeeds.
- All JSON files parse successfully.
- RU and EN data files share identical structure and ids.
- Variant references resolve to existing experience/project ids.
- Links work with the GitHub Pages base path.
- Lighthouse targets: Performance, Accessibility, Best Practices, SEO >= 90.
- Check desktop and mobile widths, light and dark themes.

## 13. Roadmap

- [x] Scaffold Astro + TypeScript + Tailwind.
- [x] Add i18n routing, base layout and shared components.
- [x] Render the three resume pages from `src/data/resume/`.
- [x] Build the portfolio landing page with selected projects.
- [x] Add SEO, Open Graph, sitemap, accessibility and dark mode.
- [ ] Verify the GitHub Pages deployment on the live URL.
- [ ] Expand project descriptions and add public case study links when available.

## 14. Do not

- Do not add a server runtime or switch Astro to SSR.
- Do not duplicate resume facts outside `src/data/resume/`.
- Do not hardcode absolute `/` asset URLs that break the `/petrov/` base.
- Do not remove or ignore contact visibility flags.
- Do not overstate backend experience in the Middle Full-stack variant.
- Do not commit secrets or private data.
