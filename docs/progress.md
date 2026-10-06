# Прогресс проекта

## ЛР 1 — Старт проекта на React и TypeScript
- Создан проект frontend на Vite (react-ts)
- Реализован стартовый экран Task Tracker (App.tsx, App.css, index.css)
- Настроен .node-version, README, docs/progress.md
- Пройдена проверка типов (strict: true) и сборка (npm run build)
- Репозиторий опубликован на GitHub

Коммит: fd05475 Lab 1: create React TypeScript app

## ЛР 2 — Страницы приложения и навигация
- Установлен `react-router`, подключён `BrowserRouter` в `main.tsx`
- Добавлены тип `Task` и 6 демонстрационных задач (`types/task.ts`, `data/tasks.ts`)
- Компонент `TaskCard`, страницы `TasksPage`, `TaskDetailsPage`, `NewTaskPage`, `NotFoundPage`
- Общий `AppLayout` с `NavLink` и `Outlet`; маршруты в `App.tsx`
- Стили списка, карточек и навигации (видимый фокус, узкий экран)

Проверка: `cd frontend && npm ci && npm run build && npm run dev`, затем открыть
`/` (редирект на `/tasks`), `/tasks/t1`, `/tasks/t2`, `/tasks/new`, `/unknown`,
`/tasks/missing`; обновить страницу на `/tasks/t1`; проверить «назад»/«вперёд»,
ширину 360 px и переходы клавишей Tab; в Network при кликах по ссылкам нет загрузки HTML.

Коммит: _указать хэш после `git commit`_ (Lab 2: add pages and navigation)
