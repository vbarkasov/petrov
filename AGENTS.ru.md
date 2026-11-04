# AGENTS.ru.md

> English version: [AGENTS.md](./AGENTS.md)

Инструкции для AI-агентов и контрибьюторов, работающих в этом репозитории.

## 1. Обзор проекта

Персональный сайт-портфолио **Константина Петрова** с тремя вариантами резюме:

- `senior-frontend` — Senior Front-end Developer / UI-Architect
- `middle-frontend` — Middle Front-end Developer
- `middle-fullstack` — Middle Full-stack Developer (frontend-heavy)

Сайт полностью статический, двуязычный (русский / английский) и публикуется на GitHub Pages.

Текущий статус: **реализовано**. Каркас Astro, двуязычный лендинг, галерея проектов с просмотром изображений, три страницы резюме, переключатель темы, SEO/sitemap и workflow GitHub Pages готовы. Остались полировка контента, уборка ассетов и проверка деплоя.

## 2. Требования к продукту

- Лендинг портфолио: герой-блок, «Обо мне» и компетенции, карточки резюме, галерея проектов с просмотром изображений, достижения, контакты.
- Три страницы резюме, собранные из общих данных с собственным позиционированием.
- Две локали: `ru` (по умолчанию) и `en`; у каждой страницы и каждого резюме есть обе версии.
- Только статический вывод, разворачиваемый на GitHub Pages без сервера.
- Быстро, доступно, адаптивно, SEO-дружественно.

## 3. Целевой стек

- **Astro 7** с `output: "static"` (требует Node >= 22.23.4; CI использует Node 24).
- **TypeScript** в строгом режиме (`astro/tsconfigs/strict`, включён `resolveJsonModule`).
- **Tailwind CSS 4** через `@tailwindcss/vite`, конфигурация в CSS — `src/styles/global.css`.
- **@astrojs/sitemap** для `sitemap-index.xml`.
- Без рантайма UI-фреймворков (React/Vue). Клиентский JS — только несколько inline-скриптов: инициализация темы, переключатель темы, переключатель языка, диалог портфолио.
- Контент управляется данными: страницы рендерятся из JSON, а не пишутся руками в HTML.

## 4. Структура репозитория

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
    static/portfolio/<year>-<slug>/   закоммиченные скриншоты
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
  source-tmp-data/                     локальный исходный материал, в .gitignore
```

`source-tmp-data/` хранит необработанный исходный материал (скриншоты, выгрузки данных) и **не** коммитится. В `public/static/portfolio/` попадают только оптимизированные изображения, на которые есть ссылки.

`src/content/` опционален и может появиться позже для блога или кейсов проектов. Не переносите данные резюме из `src/data/resume/` без обновления этого документа.

## 5. Модель данных

Все файлы данных — JSON с полем `schemaVersion`. Это единственный источник правды; никогда не дублируйте факты резюме или портфолио в компонентах и файлах вариантов. Типы лежат в `src/types/content.ts`, доступ — через `src/lib/data.ts` (`getProfile`, `getResume`, `getVariants`, `getVariant`, `getPortfolio`).

### `src/data/profile.json`

Общие данные личности и контактов.

- `schemaVersion` — целое число.
- `name` — `{ ru, en }`.
- `roles` — `{ ru: string[], en: string[] }`, общие названия ролей.
- `contacts.phone` — `{ value, display, visible }`.
- `contacts.email` — `{ value, visible }`.
- `contacts.telegram` — `{ handle, url, visible }`.
- `contacts.location` — `{ ru, en }`.
- `contacts.github` — `{ label, url }`.
- `photo` — `null` или путь к файлу в `public/` (сейчас `/photo.jpg`).
- `defaultLocale` — `"ru"`.
- `locales` — `["ru", "en"]`.

При рендеринге учитывайте флаги `visible`. `BaseLayout` также использует их для JSON-LD.

### `src/data/resume/base.<locale>.json`

Локализованный контент резюме, по файлу на локаль. Оба файла **обязаны** иметь одинаковую структуру, идентификаторы и порядок; различаться могут только текстовые значения.

- `schemaVersion`, `locale`.
- `about` — профессиональное описание.
- `keyTechnologies` — плоский список ключевых технологий.
- `competencies` — список ключевых компетенций.
- `experience[]` — хронологически, от нового к старому. Каждая запись:
  - `id` — стабильный идентификатор в kebab-case.
  - `period` — строка для отображения, например `2016 — настоящее время` / `2016 — present`.
  - `company`, `role`.
  - `projects[]` — опционально, для фриланса и ролей с несколькими проектами. Каждый проект:
    - `id`, `name`, `description`, `stack[]`, `achievements[]`.
    - `previewImage?`, `images?` — необязательные пути к ассетам вида `/static/portfolio/...`, зарезервированы под галереи проектов. Типизированы, но пока не рендерятся.
  - `achievements[]` — для ролей с одним проектом.
- `technicalStack[]` — группы технологий:
  - `id` (`frameworks`, `state`, `styling`, `build`, `testing`, `adjacent`, `innovation`).
  - `label` — локализованное название категории.
  - `items[]`.
- `education[]` — `{ institution, specialty, graduationYear }`.
- `keyAchievements[]`, `whyMe[]`, `recommendations[]`.

### `src/data/resume/variants.json`

Независимая от локали конфигурация трёх вариантов резюме.

- `schemaVersion`, `defaultLocale`.
- `variants[]`:
  - `id` — совпадает со slug маршрута (`senior-frontend`, `middle-frontend`, `middle-fullstack`).
  - `order` — порядок отображения.
  - `slug` — сегмент URL, держите равным `id`.
  - `title` — `{ ru, en }`.
  - `summary` — `{ ru, en }`, позиционирование конкретного варианта.
  - `focus[]` — теги акцентов для UI; подписи берутся из `ui.focusLabels`.
  - `highlightProjects[]` — id проектов, продвигаемых в этом варианте (рендерятся со ★).
  - `experienceOrder[]` — id опыта в порядке отображения.
  - `skillsOrder[]` — id групп `technicalStack` в порядке отображения.
  - `deEmphasize[]` — теги/ключевые слова для визуального ослабления (факты никогда не удаляются).

### `src/data/portfolio.json`

Публичная галерея проектов на лендинге (`#portfolio`).

- `schemaVersion`, `items[]`.
- Каждый элемент:
  - `id` — стабильный строковый id (`"001"`, `"002"`, ...).
  - `slug` — стабильный идентификатор в kebab-case.
  - `title`, `description` — `{ ru, en }`.
  - `features` — `{ ru, en }[]`, может быть пустым.
  - `timeText` — год или период для отображения.
  - `previewImage` — путь к обложке карточки вида `/static/portfolio/...`.
  - `images[]` — полный набор изображений галереи вида `/static/portfolio/...`.
  - `tags[]` — теги технологий и тем.
  - `links?` — `[{ title, href, icon? }]`, внешние ссылки (пока не используются в UI).

Каждый `previewImage` и каждый элемент `images[]` обязан указывать на существующий файл в `public/`. Пути пишутся **без** базового пути GitHub Pages; его добавляет `withBase()`.

### Правила данных

- Идентификаторы стабильны; не переименовывайте их без обновления всех ссылок в `variants.json` и `portfolio.json`.
- Каждый id, на который ссылается вариант, должен существовать и в `base.ru.json`, и в `base.en.json`.
- Не выдумывайте работодателей, проекты, даты, метрики и скриншоты.
- Вариант Middle Full-stack должен оставаться честным: PHP и Python указаны как базовые / для понимания API, а не как продакшен-опыт на бэкенде.
- Чтобы добавить четвёртый вариант резюме, достаточно добавить запись в `variants.json`. Отдельный файл контента создавать не нужно.
- Чтобы добавить проект в портфолио, положите скриншоты в `public/static/portfolio/<year>-<slug>/` и добавьте одну запись в `portfolio.json`. Правки компонентов не нужны.

## 6. Изображения и ассеты

- Исходный материал остаётся в `source-tmp-data/` (в .gitignore).
- Коммитимые изображения лежат в `public/static/portfolio/<year>-<slug>/` и указываются в JSON как `/static/portfolio/<year>-<slug>/<file>.png`.
- Всегда формируйте URL ассетов через `withBase()` из `src/lib/paths.ts`; никогда не хардкодьте `/petrov/` или абсолютный `/` в шаблоне.
- Обложка `previewImage` должна быть горизонтальной (карточки используют `aspect-video`); предпочитайте аккуратно сжатые PNG/JPEG.
- `public/static/portfolio/portfolio/` — оставшееся дублирующее дерево. Не ссылайтесь на него и не добавляйте туда файлы; удаляйте только по явному подтверждению.

## 7. Интернационализация

- Локали: `ru` (по умолчанию), `en`.
- URL: `/ru/...` и `/en/...`; корень `/` — статическая страница-редирект на локаль по умолчанию.
- Роутинг ручной: `src/pages/[lang]/...` и `getStaticPaths`. Не добавляйте встроенный i18n-роутинг Astro поверх него.
- UI-строки живут в `src/i18n/ru.ts` и `src/i18n/en.ts`, типизируются интерфейсом `UI` из `src/i18n/ui.ts` и читаются через `getUI(locale)`. Контент — в JSON. Никакого хардкода текста в компонентах.
- Оба словаря обязаны реализовать все ключи `UI`; новый ключ добавляется сразу в `ui.ts`, `ru.ts` и `en.ts`.
- `ui.variantDescriptions` и `ui.focusLabels` — словари по ключам; при отсутствии ключа используйте значение из данных или сам тег.
- Генерируйте `hreflang`-альтернативы (включая `x-default`) и локализованные `<title>` / meta description для каждой страницы — `BaseLayout` делает это на основе текущего pathname.

## 8. Деплой на GitHub Pages

- Репозиторий: `vbarkasov/petrov`.
- Ожидаемый URL: `https://vbarkasov.github.io/petrov/`.
- Конфигурация Astro: `site: "https://vbarkasov.github.io"`, `base: "/petrov/"`, `integrations: [sitemap()]`.
- Если появится кастомный домен, положите его в `public/CNAME`, измените `base` на `"/"` и обновите `site`.
- Результат сборки: `dist/`.
- Workflow `.github/workflows/deploy.yml`:
  - Триггеры: push в `main` и `workflow_dispatch`.
  - Права: `contents: read`, `pages: write`, `id-token: write`.
  - Шаги: checkout, setup Node 24 с npm-кешем, `npm ci`, `npm run check`, `npm run build`, `actions/upload-pages-artifact` с `path: dist`, `actions/deploy-pages`.
- `dist/404.html` генерируется из `src/pages/404.astro`; страница-редирект в корне обязана оставаться `noindex`.
- Всегда формируйте URL ассетов через хелперы Astro или `paths.ts`, чтобы base `/petrov/` работал.
- Не коммитьте `dist/`.

## 9. Команды

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check     # astro check (типы + шаблоны)
npm run lint      # алиас astro check
npm run format    # prettier --write . (prettier-plugin-astro)
```

Перед коммитом должны проходить `npm run check` и `npm run build`.

## 10. Соглашения кода

- TypeScript strict mode; без `any`; типизируйте данные на границах модулей.
- Astro-компоненты в `src/components/`, лейауты в `src/layouts/`, имена файлов в PascalCase.
- Tailwind utility-first. Переиспользуемые наборы классов выносите в компоненты, а не в длинные блоки `@apply`.
- Тёмная тема на классах: `@custom-variant dark` в `global.css`, класс на `<html>`, инициализация inline в `BaseLayout` и хранение в `localStorage` под ключом `theme`.
- Печатные стили используют `.no-print` и `.print-avoid-break`; на странице резюме есть кнопка печати/PDF.
- Предпочитайте семантический HTML, правильный порядок заголовков, подписи, `alt`, поддержку клавиатуры и видимый фокус.
- Mobile-first адаптивность; поддержка системной тёмной темы по умолчанию.
- Компоненты небольшие и не завязаны на конкретные данные; вариативность контента — в данных, а не в шаблонах.
- Галерея портфолио использует нативный `<dialog>` в `PortfolioModal.astro`: карточки активируются клавиатурой, стрелки листают изображения, Escape закрывает, фокус возвращается на карточку. Сохраняйте это поведение при правках обоих компонентов.
- Без комментариев, если явно не попросили.
- Никогда не коммитьте секреты, токены или приватные контакты сверх того, что настроено в `profile.json`.

### Известные отклонения

- В `src/pages/[lang]/index.astro` заголовок секции `Portfolio` всё ещё захардкожен; перенесите его в `ui.sections`, когда будете трогать эту страницу.
- `public/static/portfolio/portfolio/` дублирует дерево ассетов и нигде не используется.

## 11. Правила контента

- Не дублируйте текст резюме между вариантами; вариант может переопределять только title, summary, порядок и акценты.
- Даты — с длинным тире: `2016 — настоящее время`, `2014 — 2016`.
- Сохраняйте метрики в формулировках исходных данных; не округляйте и не приукрашивайте.
- Держите паритет RU/EN для каждого текстового поля.
- Видимость контактов управляется `profile.json`; не обходите её.
- Описания проектов портфолио должны соответствовать реальной работе и реальным скриншотам.

## 12. Git-процесс

- Работайте в `main`; для крупных изменений — короткоживущие ветки.
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- `.gitignore` должен включать `node_modules/`, `dist/`, `.astro/`, `.env*`, `source-tmp-data/`.
- Не коммитьте сгенерированный результат сборки и временные отладочные скрипты.

## 13. Проверка

- `npm run check && npm run build` проходит успешно.
- Все JSON-файлы парсятся без ошибок.
- Файлы RU и EN имеют идентичную структуру и id.
- Ссылки вариантов разрешаются в существующие id опыта/проектов.
- Каждый путь `previewImage` / `images[]` в `portfolio.json` и в данных проектов резюме существует в `public/`.
- Ссылки работают с учётом base-пути GitHub Pages (`/petrov/`).
- Диалог портфолио открывается мышью и клавиатурой, листается стрелками и закрывается по Escape.
- Ориентиры Lighthouse: Performance, Accessibility, Best Practices, SEO >= 90.
- Проверяйте десктоп и мобильные ширины, светлую и тёмную темы.

## 14. Дорожная карта

- [x] Создать каркас Astro + TypeScript + Tailwind.
- [x] Добавить i18n-роутинг, базовый лейаут и общие компоненты.
- [x] Отрендерить три страницы резюме из `src/data/resume/`.
- [x] Собрать лендинг портфолио с карточками резюме и галереей проектов.
- [x] Добавить SEO, Open Graph, sitemap, JSON-LD, доступность и тёмную тему.
- [x] Добавить просмотр изображений портфолио с навигацией с клавиатуры.
- [ ] Проверить деплой на GitHub Pages по живому URL.
- [ ] Расширить описания проектов, добавить публичные ссылки на кейсы и вывести `features`/`links` в UI.
- [ ] Удалить дублирующее дерево `public/static/portfolio/portfolio/`.
- [ ] Перенести захардкоженный заголовок `Portfolio` в словари i18n.

## 15. Чего делать нельзя

- Не добавляйте серверный рантайм и не переключайте Astro на SSR.
- Не дублируйте факты резюме и портфолио вне `src/data/`.
- Не хардкодьте абсолютные URL ассетов с `/`, ломающие base `/petrov/`.
- Не удаляйте и не игнорируйте флаги видимости контактов.
- Не преувеличивайте бэкенд-опыт в варианте Middle Full-stack.
- Не ссылайтесь на `public/static/portfolio/portfolio/` и не расширяйте его.
- Не коммитьте секреты, приватные данные и `source-tmp-data/`.
