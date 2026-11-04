# AGENTS.md

> Русская версия: [AGENTS.ru.md](./AGENTS.ru.md)

Instructions for AI agents and contributors working in this repository.

## 1. Project overview

Personal portfolio website of **Konstantin Petrov** with three resume variants:

- `senior-frontend` — Senior Front-end Developer / UI Architect
- `middle-frontend` — Middle Front-end Developer
- `middle-fullstack` — Middle Full-stack Developer (frontend-heavy)

The site is fully static, bilingual (Russian / English) and published to GitHub Pages.

Current status: **implemented**. Astro scaffold, bilingual landing page, portfolio gallery with an image viewer, three resume pages, theme switch, SEO/sitemap and the GitHub Pages workflow are in place. Remaining work is content polish, asset cleanup and deployment verification.

## 2. Product requirements

- Portfolio landing: hero, about/competencies, resume cards, project gallery with image viewer, achievements, contacts.
- Three resume pages, each built from the same base data with its own positioning.
- Two locales: `ru` (default) and `en`; every page and resume has both versions.
- Static output only, deployable to GitHub Pages without a server.
- Fast, accessible, responsive, SEO-friendly.

## 3. Target stack

- **Astro 7** with `output: "static"` (requires Node >= 22.23.4; CI uses Node 24).
- **TypeScript** strict mode (`astro/tsconfigs/strict`, `resolveJsonModule` enabled).
- **Tailwind CSS 4** via `@tailwindcss/vite`, configured through CSS in `src/styles/global.css`.
- **@astrojs/sitemap** for `sitemap-index.xml`.
- No UI framework runtime (React/Vue). The only client-side JavaScript is a few inline scripts: theme bootstrap, theme toggle, language switcher, portfolio dialog.
- Data-driven content: pages render from JSON, not hand-written HTML.

## 4. Repository layout

```
/
  AGENTS.md
  AGENTS.ru.md
  astro.config.mjs
  package.json
  .prettierrc
  tsconfig.json
  .github/workflows/deploy.yml
  public/
    favicon.svg
    photo.jpg
    robots.txt
    static/portfolio/<year>-<slug>/   committed screenshots
  src/
    components/
      ContactLinks.astro
      Footer.astro
      Header.astro
      LanguageSwitcher.astro
      PortfolioCard.astro
      PortfolioModal.astro
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
      portfolio.json
      resume/
        base.ru.json
        base.en.json
        variants.json
  source-tmp-data/                     local raw material, gitignored
```

`source-tmp-data/` holds unprocessed source material (screenshots, exported data) and is **not** committed. Only optimized, referenced images belong in `public/static/portfolio/`.

`src/content/` is optional and may be introduced later for blog or project case studies. Do not move the resume data out of `src/data/resume/` without updating this document.

## 5. Data model

All data files are JSON with a `schemaVersion` field. They are the single source of truth; never duplicate resume or portfolio facts in components or variant files. Types live in `src/types/content.ts`; access goes through `src/lib/data.ts` (`getProfile`, `getResume`, `getVariants`, `getVariant`, `getPortfolio`).

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
- `photo` — `null` or a path to a file in `public/` (currently `/photo.jpg`).
- `defaultLocale` — `"ru"`.
- `locales` — `["ru", "en"]`.

Respect the `visible` flags when rendering contacts. `BaseLayout` also uses them for JSON-LD.

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
    - `previewImage?`, `images?` — optional asset paths under `/static/portfolio/...`, reserved for project galleries. They are typed but not yet rendered.
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
  - `focus[]` — emphasis tags used by the UI; labels come from `ui.focusLabels`.
  - `highlightProjects[]` — project ids promoted for this variant (rendered as a ★ marker).
  - `experienceOrder[]` — experience ids in display order.
  - `skillsOrder[]` — `technicalStack` group ids in display order.
  - `deEmphasize[]` — tags/keywords to visually downplay (never remove facts).

### `src/data/portfolio.json`

The public project gallery rendered on the landing page (`#portfolio`).

- `schemaVersion`, `items[]`.
- Each item:
  - `id` — stable string id (`"001"`, `"002"`, ...).
  - `slug` — stable kebab-case identifier.
  - `title`, `description` — `{ ru, en }`.
  - `features` — `{ ru, en }[]`, may be empty.
  - `timeText` — display year or period string.
  - `previewImage` — card image path under `/static/portfolio/...`.
  - `images[]` — full gallery paths under `/static/portfolio/...`.
  - `tags[]` — technology/topic tags.
  - `links?` — `[{ title, href, icon? }]` external links (currently unused by the UI).

Every `previewImage` and every entry in `images[]` must point to an existing file in `public/`. Paths are written **without** the GitHub Pages base; `withBase()` adds it.

### Data rules

- IDs are stable; do not rename without updating every reference in `variants.json` and `portfolio.json`.
- Every id referenced by a variant must exist in both `base.ru.json` and `base.en.json`.
- Do not invent employers, projects, dates, metrics or screenshots.
- The Middle Full-stack variant must stay honest: PHP and Python are listed as basic / API-understanding skills, not production backend experience.
- To add a fourth resume variant, add an entry to `variants.json` only. Do not create a separate content file.
- To add a portfolio project, add screenshots to `public/static/portfolio/<year>-<slug>/` and one entry to `portfolio.json`. No component changes are required.

## 6. Images and assets

- Raw material stays in `source-tmp-data/` (gitignored).
- Committed images live under `public/static/portfolio/<year>-<slug>/` and are referenced from JSON as `/static/portfolio/<year>-<slug>/<file>.png`.
- Always resolve asset URLs through `withBase()` from `src/lib/paths.ts`; never hardcode `/petrov/` or an absolute `/` path in a template.
- Keep `previewImage` oriented horizontally (cards use `aspect-video`); prefer reasonably compressed PNG/JPEG.
- `public/static/portfolio/portfolio/` is a leftover duplicate tree. Do not reference it and do not add new files there; delete it only with explicit confirmation.

## 7. Internationalization

- Locales: `ru` (default), `en`.
- URLs: `/ru/...` and `/en/...`; the root `/` is a static redirect page to the default locale.
- Routing is manual via `src/pages/[lang]/...` and `getStaticPaths`. Do not add Astro's built-in i18n routing on top of it.
- UI strings live in `src/i18n/ru.ts` and `src/i18n/en.ts`, typed by the `UI` interface in `src/i18n/ui.ts` and read with `getUI(locale)`. Content lives in JSON. No hardcoded copy in components.
- Both dictionaries must implement every `UI` key; adding a key requires updating `ui.ts`, `ru.ts` and `en.ts` together.
- `ui.variantDescriptions` and `ui.focusLabels` are keyed maps; fall back to the data value/tag when a key is missing.
- Emit `hreflang` alternates (including `x-default`) and localized `<title>` / meta description for each page — `BaseLayout` does this from the current pathname.

## 8. GitHub Pages deployment

- Repository: `vbarkasov/petrov`.
- Expected URL: `https://vbarkasov.github.io/petrov/`.
- Astro config: `site: "https://vbarkasov.github.io"`, `base: "/petrov/"`, `integrations: [sitemap()]`.
- If a custom domain is added, put it in `public/CNAME`, change `base` to `"/"` and update `site`.
- Build output: `dist/`.
- Workflow `.github/workflows/deploy.yml`:
  - Trigger on push to `main` and `workflow_dispatch`.
  - Permissions: `contents: read`, `pages: write`, `id-token: write`.
  - Steps: checkout, setup Node 24 with npm cache, `npm ci`, `npm run check`, `npm run build`, `actions/upload-pages-artifact` with `path: dist`, `actions/deploy-pages`.
- `dist/404.html` is generated from `src/pages/404.astro`; the root redirect page must stay `noindex`.
- Always generate asset URLs through Astro helpers or the `paths.ts` helpers so the `/petrov/` base works.
- Do not commit `dist/`.

## 9. Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check     # astro check (types + templates)
npm run lint      # alias of astro check
npm run format    # prettier --write . (prettier-plugin-astro)
```

Before committing, `npm run check` and `npm run build` must pass.

## 10. Code conventions

- TypeScript strict mode; no `any`; type all data at module boundaries.
- Astro components in `src/components/` and layouts in `src/layouts/`, PascalCase filenames.
- Tailwind utility-first. Extract reusable class sets into components rather than long `@apply` blocks.
- Dark mode is class-based: `@custom-variant dark` in `global.css`, toggled on `<html>`, bootstrapped inline in `BaseLayout` and stored in `localStorage` under `theme`.
- Print styles use `.no-print` and `.print-avoid-break`; the resume page exposes a print/PDF button.
- Prefer semantic HTML, correct heading order, labels, `alt` text, keyboard support and visible focus.
- Mobile-first responsive layout; support system dark mode defaults.
- Keep components small and data-agnostic; content variation belongs to data, not templates.
- The portfolio gallery uses a native `<dialog>` in `PortfolioModal.astro`: cards are keyboard-activatable, arrow keys navigate images, Escape closes, focus returns to the triggering card. Preserve this behavior when touching either component.
- No comments unless explicitly requested.
- Never commit secrets, tokens or private contact data beyond what is configured in `profile.json`.

### Known deviations

- `src/pages/[lang]/index.astro` still hardcodes the `Portfolio` section heading; move it into `ui.sections` when that page is touched.
- `public/static/portfolio/portfolio/` duplicates the asset tree and is unreferenced.

## 11. Content rules

- Do not duplicate resume text across variants; variants may only override title, summary, ordering and emphasis.
- Dates use an em dash: `2016 — настоящее время`, `2014 — 2016`.
- Preserve metrics in the wording that came from the source data; do not round or embellish.
- Keep RU/EN parity for every text field.
- Contact visibility is controlled by `profile.json`; do not bypass it.
- Portfolio descriptions must describe real work and real screenshots.

## 12. Git workflow

- Work on `main`; use short-lived branches for larger changes.
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- `.gitignore` must include `node_modules/`, `dist/`, `.astro/`, `.env*`, `source-tmp-data/`.
- Do not commit generated build output or temporary debug scripts.

## 13. Verification

- `npm run check && npm run build` succeeds.
- All JSON files parse successfully.
- RU and EN data files share identical structure and ids.
- Variant references resolve to existing experience/project ids.
- Every `previewImage` / `images[]` path in `portfolio.json` and resume project data exists in `public/`.
- Links work with the GitHub Pages base path (`/petrov/`).
- The portfolio dialog opens from mouse and keyboard, navigates with arrows, and closes with Escape.
- Lighthouse targets: Performance, Accessibility, Best Practices, SEO >= 90.
- Check desktop and mobile widths, light and dark themes.

## 14. Roadmap

- [x] Scaffold Astro + TypeScript + Tailwind.
- [x] Add i18n routing, base layout and shared components.
- [x] Render the three resume pages from `src/data/resume/`.
- [x] Build the portfolio landing page with resume cards and a project gallery.
- [x] Add SEO, Open Graph, sitemap, JSON-LD, accessibility and dark mode.
- [x] Add the portfolio image viewer with keyboard navigation.
- [ ] Verify the GitHub Pages deployment on the live URL.
- [ ] Expand project descriptions, add public case study links, and surface `features`/`links` in the UI.
- [ ] Remove the duplicated `public/static/portfolio/portfolio/` tree.
- [ ] Move the hardcoded `Portfolio` heading into the i18n dictionaries.

## 15. Do not

- Do not add a server runtime or switch Astro to SSR.
- Do not duplicate resume or portfolio facts outside `src/data/`.
- Do not hardcode absolute `/` asset URLs that break the `/petrov/` base.
- Do not remove or ignore contact visibility flags.
- Do not overstate backend experience in the Middle Full-stack variant.
- Do not reference or extend `public/static/portfolio/portfolio/`.
- Do not commit secrets, private data or `source-tmp-data/`.
