# AGENTS.ru.md

> English version: [AGENTS.md](./AGENTS.md)

Инструкции для AI-агентов и контрибьюторов, работающих в этом репозитории.

## 1. Обзор проекта

Персональный сайт-портфолио **Константина Петрова** с тремя вариантами резюме:

- `senior-frontend` — Senior Front-end Developer / UI-Architect
- `middle-frontend` — Middle Front-end Developer
- `middle-fullstack` — Middle Full-stack Developer (frontend-heavy)

Сайт полностью статический, двуязычный (русский / английский) и публикуется на GitHub Pages.

Текущий статус: **реализовано**. Каркас Astro, лендинг портфолио, три страницы резюме, двуязычный роутинг, переключатель темы и workflow GitHub Pages готовы. Остались полировка контента и проверка деплоя.

## 2. Требования к продукту

- Лендинг портфолио: герой-блок, «Обо мне», ключевые навыки, избранные проекты, контакты.
- Три страницы резюме, собранные из общих данных с собственным позиционированием.
- Две локали: `ru` (по умолчанию) и `en`; у каждой страницы и каждого резюме есть обе версии.
- Только статический вывод, разворачиваемый на GitHub Pages без сервера.
- Быстро, доступно, адаптивно, SEO-дружественно.

## 3. Целевой стек

- **Astro 7** с `output: "static"` (требует Node >= 22.23.4; CI использует Node 24).
- **TypeScript** в строгом режиме.
- **Tailwind CSS 4** через `@tailwindcss/vite`.
- Без рантайма UI-фреймворков (React/Vue), пока нет конкретной необходимости.
- Контент управляется данными: резюме рендерятся из JSON, а не пишутся руками в HTML.

## 4. Структура репозитория

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

`src/content/` опционален и может появиться позже для блога или кейсов проектов. Не переносите данные резюме из `src/data/resume/` без обновления этого документа.

## 5. Модель данных

Все файлы данных — JSON с полем `schemaVersion`. Это единственный источник правды; никогда не дублируйте факты резюме в компонентах или файлах вариантов.

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
- `photo` — `null` или путь к файлу в `public/`.
- `defaultLocale` — `"ru"`.
- `locales` — `["ru", "en"]`.

При рендеринге учитывайте флаги `visible`.

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
  - `focus[]` — теги акцентов для UI.
  - `highlightProjects[]` — id проектов, продвигаемых в этом варианте.
  - `experienceOrder[]` — id опыта в порядке отображения.
  - `skillsOrder[]` — id групп `technicalStack` в порядке отображения.
  - `deEmphasize[]` — теги/ключевые слова для визуального ослабления (факты никогда не удаляются).

### Правила данных

- Идентификаторы стабильны; не переименовывайте их без обновления всех ссылок в `variants.json`.
- Каждый id, на который ссылается вариант, должен существовать и в `base.ru.json`, и в `base.en.json`.
- Не выдумывайте работодателей, проекты, даты и метрики.
- Вариант Middle Full-stack должен оставаться честным: PHP и Python указаны как базовые / для понимания API, а не как продакшен-опыт на бэкенде.
- Чтобы добавить четвёртый вариант резюме, достаточно добавить запись в `variants.json`. Отдельный файл контента создавать не нужно.

## 6. Интернационализация

- Локали: `ru` (по умолчанию), `en`.
- URL: `/ru/...` и `/en/...`; корень `/` перенаправляет на локаль по умолчанию.
- Роутинг ручной: `src/pages/[lang]/...` и `getStaticPaths`. Не добавляйте встроенный i18n-роутинг Astro поверх него.
- Все видимые строки живут в файлах данных или `src/i18n/*.ts`. Никакого хардкода текста в компонентах.
- Генерируйте `hreflang`-альтернативы и локализованные `<title>` / meta description для каждой страницы.
- Держите RU и EN синхронными в рамках одного изменения.

## 7. Деплой на GitHub Pages

- Репозиторий: `vbarkasov/petrov`.
- Ожидаемый URL: `https://vbarkasov.github.io/petrov/`.
- Настройте Astro с `site: "https://vbarkasov.github.io"` и `base: "/petrov/"`.
- Если появится кастомный домен, положите его в `public/CNAME`, измените `base` на `"/"` и обновите `site`.
- Результат сборки: `dist/`.
- Workflow `.github/workflows/deploy.yml`:
  - Триггеры: push в `main` и `workflow_dispatch`.
  - Права: `contents: read`, `pages: write`, `id-token: write`.
  - Шаги: checkout, setup Node 24, `npm ci`, `npm run check`, `npm run build`, `actions/upload-pages-artifact` с `path: dist`, `actions/deploy-pages`.
- Всегда формируйте URL ассетов через хелперы Astro или относительные пути, чтобы base `/petrov/` работал.
- Не коммитьте `dist/`.

## 8. Команды

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
npm run lint
npm run format
```

Перед коммитом должны проходить `npm run check` и `npm run build`.

## 9. Соглашения кода

- TypeScript strict mode; без `any`; типизируйте данные на границах модулей.
- Astro-компоненты в `src/components/`, лейауты в `src/layouts/`, имена файлов в PascalCase.
- Tailwind utility-first. Переиспользуемые наборы классов выносите в компоненты, а не в длинные блоки `@apply`.
- Предпочитайте семантический HTML, правильный порядок заголовков, подписи, `alt`, поддержку клавиатуры и видимый фокус.
- Mobile-first адаптивность; поддержка системной тёмной темы.
- Компоненты небольшие и не завязаны на конкретные данные; вариативность контента — в данных, а не в шаблонах.
- Без комментариев, если явно не попросили.
- Никогда не коммитьте секреты, токены или приватные контакты сверх того, что настроено в `profile.json`.

## 10. Правила контента

- Не дублируйте текст резюме между вариантами; вариант может переопределять только title, summary, порядок и акценты.
- Даты — с длинным тире: `2016 — настоящее время`, `2014 — 2016`.
- Сохраняйте метрики в формулировках исходных данных; не округляйте и не приукрашивайте.
- Держите паритет RU/EN для каждого текстового поля.
- Видимость контактов управляется `profile.json`; не обходите её.

## 11. Git-процесс

- Работайте в `main`; для крупных изменений — короткоживущие ветки.
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- `.gitignore` должен включать `node_modules/`, `dist/`, `.astro/`, `.env*`.
- Не коммитьте сгенерированный результат сборки.

## 12. Проверка

- `npm run check && npm run build` проходит успешно.
- Все JSON-файлы парсятся без ошибок.
- Файлы RU и EN имеют идентичную структуру и id.
- Ссылки вариантов разрешаются в существующие id опыта/проектов.
- Ссылки работают с учётом base-пути GitHub Pages.
- Ориентиры Lighthouse: Performance, Accessibility, Best Practices, SEO >= 90.
- Проверяйте десктоп и мобильные ширины, светлую и тёмную темы.

## 13. Дорожная карта

- [x] Создать каркас Astro + TypeScript + Tailwind.
- [x] Добавить i18n-роутинг, базовый лейаут и общие компоненты.
- [x] Отрендерить три страницы резюме из `src/data/resume/`.
- [x] Собрать лендинг портфолио с избранными проектами.
- [x] Добавить SEO, Open Graph, sitemap, доступность и тёмную тему.
- [ ] Проверить деплой на GitHub Pages по живому URL.
- [ ] Расширить описания проектов и добавить публичные ссылки на кейсы, когда появятся.

## 14. Чего делать нельзя

- Не добавляйте серверный рантайм и не переключайте Astro на SSR.
- Не дублируйте факты резюме вне `src/data/resume/`.
- Не хардкодьте абсолютные URL ассетов с `/`, ломающие base `/petrov/`.
- Не удаляйте и не игнорируйте флаги видимости контактов.
- Не преувеличивайте бэкенд-опыт в варианте Middle Full-stack.
- Не коммитьте секреты и приватные данные.
