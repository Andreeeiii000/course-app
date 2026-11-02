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

Коммит: fda4183 Lab 2: App pages and navigation

## ЛР 3 — Формы и локальное состояние приложения
- Добавлен тип `TaskDraft = Omit<Task, 'id'>`; общий список вынесен в состояние `App`, добавлены `createTask`, `updateTask`, `deleteTask` (без мутаций: spread, `map`, `filter`; id создаётся через `crypto.randomUUID` до `setTasks`)
- Страницы получают данные и обработчики через props; `data/tasks.ts` используется только как начальное значение
- Переиспользуемая форма `TaskForm` (отдельный черновик, `noValidate`, `preventDefault`, отмена без сохранения); страницы `NewTaskPage` и `EditTaskPage` (`key={task.id}`)
- Проверка: название 3–100 символов, срок обязателен, предметное правило — у завершённой задачи нужно описание результата
- Удаление с подтверждением на странице задачи; фильтр по статусу со сбросом и пустыми состояниями
- В layout добавлено пояснение, что данные временные (только в памяти)

Проверка: `cd frontend && npm ci && npm run build && npm run dev`, затем в одном сеансе, без обновления страницы:
1. создать задачу, открыть карточку, вернуться к списку;
2. изменить поля и статус, проверить карточку и список;
3. внести изменения и нажать «Отмена» — запись не меняется;
4. пустое и состоящее из пробелов название, нет срока, статус «Готово» без описания — ошибка видна, поля не пропадают;
5. переключить фильтр, сбросить, получить «нет совпадений»;
6. отменить удаление, подтвердить, открыть адрес удалённой записи и `/tasks/missing/edit`;
7. удалить все записи, увидеть пустой список, создать новую;
8. открыть редактирование разных записей — поля соответствуют id;
9. обновить страницу — демонстрационный набор вернулся.
Дополнительно: отправка по Enter, ширина 360 px, консоль без ошибок; `npm run build` и `npm run preview`.

Коммит: b9d4fbd Lab 3: add local forms and CRUD

## ЛР 4 — Загрузка справочника приложения по HTTP
- Справочник тегов: `frontend/public/demo/tags.json` (5 значений: `study`, `work`, `home`, `health`, `personal`), доступен по `/demo/tags.json`
- Тип `Tag` (`types/tag.ts`); в `Task.tag` теперь хранится `id` справочника, демонстрационные задачи в `data/tasks.ts` обновлены (`Учёба`→`study`, `Быт`→`home`, `Проект`→`work`)
- Сервис `services/tags.ts`: `getTags(signal)` — `fetch` с `cache: 'no-store'`, проверка `response.ok`, `response.json()` как `unknown`; `parseTags` — type guard `isTag`, проверка массива и уникальности `id` (без `as Tag[]`)
- Хук `hooks/useTags.ts`: состояния `loading` / `error` / `success`, `retry` через счётчик `attempt`, `AbortController` и флаг `active` в очистке эффекта
- `TaskForm`: текстовое поле тега заменено на `select` (value = `id`, текст = `name`); сообщения загрузки, ошибки, пустого справочника и неизвестного тега; `canSave` блокирует кнопку и проверяется в `handleSubmit`
- В `TaskCard` добавлена метка «Тег: <id>»; фильтр по статусу, CRUD, маршруты и пояснение о временном хранении из ЛР 3 сохранены
- Отклонение от методички: `setLoad({ status: 'loading' })` убран из тела эффекта (начальное состояние уже `loading`, `retry()` ставит его сам) — иначе `eslint-plugin-react-hooks` выдаёт `react-hooks/set-state-in-effect`

Проверка: `cd frontend && npm ci && npm run build && npm run dev`, DevTools → Network, фильтр `tags.json`, включить Disable cache. Адрес — тот, что показал Vite (например, `http://localhost:5173/demo/tags.json`).
1. Загрузка: открыть `/tasks/new` — в Network один `GET /demo/tags.json` (200, Initiator — `services/tags.ts`), в Response массив; выбрать тег, заполнить название и срок, сохранить; открыть «Редактировать» — выбран сохранённый тег.
2. Ожидание: включить Slow 3G, перейти к списку и снова открыть форму — виден «Загружаем теги…», кнопка «Сохранить» недоступна, остальные поля доступны.
3. Ошибка и повтор без потери черновика: загрузить приложение, включить Offline, открыть форму, дождаться ошибки, ввести название и описание, вернуть Online, нажать «Повторить» — введённые поля на месте, теги загрузились.
4. Отсутствующий файл: временно изменить `tagsUrl` в `services/tags.ts` на несуществующий путь — ошибка `HTTP 404` (или ошибка разбора, если сервер вернул HTML с кодом 200); вернуть путь.
5. Пустой ответ: заменить содержимое `public/demo/tags.json` на `[]` — «Тегов пока нет. Сохранение недоступно.», `select` и «Сохранить» недоступны; восстановить файл, нажать «Повторить».
6. Неверная структура: в `tags.json` поочерёдно — объект вместо массива, числовой `id`, элемент без `name`, повторяющийся `id` — каждый раз сообщение об ошибке структуры или повторе идентификаторов; восстановить файл.
7. Устаревший ответ: на Slow 3G открыть форму и сразу перейти к списку — на странице списка нет ошибок, в консоли нет предупреждений React; открыть форму снова и дождаться собственного запроса.
8. Неизвестный тег: убрать `work` из `tags.json`, открыть редактирование задачи `t5` — виден «Текущий код: work…» и сообщение о выборе доступного тега, название и срок не изменились; восстановить файл.
9. Регрессия: полный CRUD, «Отмена» (смена тега в черновике не меняет запись), удаление с подтверждением, фильтр по статусу, `/unknown`, `/tasks/missing`.
10. Сборка: `npm run build`, `npm run preview` — `/demo/tags.json` открывается в preview, создание и редактирование с выбором тега работают.

Коммит: 4977eb6 Lab 4: load reference data over HTTP

## ЛР 5 — Схема данных и справочник в Supabase
- Создан учебный проект Supabase; схема описана SQL-файлами в репозитории: `supabase/migrations/202610242011_initial_schema.sql` (таблицы, ограничения, RLS, права, политика) и `supabase/seed.sql` (справочные данные)
- Схема (тема Task Tracker):

| Таблица | Назначение | Ключ | Связь | Данные |
|---|---|---|---|---|
| `tags` | справочник тегов | `id` (text) | — | публичные, только чтение |
| `tasks` | задачи пользователя | `id` (uuid) | `tag_id` → `tags.id` (restrict), `owner_id` → `auth.users.id` (cascade) | личные, закрыты от клиента до ЛР 6 |

- Ограничения: `tags` — `id`/`name` не пустые и без пробелов по краям, `name` уникально; `tasks` — название 3–100 символов, допустимые `status` и `priority`, у `done` непустое описание (правило формы ЛР 3), даты `date`, `created_at` `timestamptz`. Индексы по `owner_id` и `tag_id`
- Доступ: RLS включён на обеих таблицах; `revoke all` у `anon` и `authenticated`; `grant select` и политика `using (true)` только у `tags`; у `tasks` нет ни прав, ни политик
- Seed: те же `id`, что в JSON ЛР 4 (`study`, `work`, `home`, `health`, `personal`), UPSERT — повторное применение безопасно
- Установлен `@supabase/supabase-js`; `lib/supabase.ts` создаёт один клиент из `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`; `.env.local` в `.gitignore`, `.env.example` с заглушками в репозитории
- `services/tags.ts`: `getTags` читает `tags` (`select('id, name')`, `order('name')`, `abortSignal`), проверяет `error` до передачи данных, `parseTags` сохранён; `tagsUrl` и `fetch` удалены, `public/demo/tags.json` удалён, скрытого резервного массива нет
- `TaskForm`: добавлена кнопка «Обновить справочник» (`type="button"`, недоступна во время загрузки, не отправляет форму); основные записи, маршруты, фильтр, отмена и удаление из ЛР 3–4 не менялись; задачи по-прежнему только в состоянии `App`
- Отклонения от методички:
  - `lib/supabase.ts` не бросает исключение при загрузке модуля, а экспортирует `supabase = null` и `supabaseConfigError`: исключение при импорте оставило бы пустую страницу, а методичка требует «сообщить об ошибке настройки». `getTags` выбрасывает эту ошибку, она видна в форме, список задач при этом работает;
  - `useTags` хранит `previous` (последний успешный справочник) в состоянии `loading`: при обновлении список тегов не исчезает, выбранный тег остаётся виден;
  - в миграцию добавлены CHECK `tasks_done_requires_description` и индексы по внешним ключам;
  - в кнопке «Повторить» пустого состояния нет: оно обновляется кнопкой «Обновить справочник».

Порядок применения (SQL Editor, один раз): 1) файл миграции целиком; 2) `seed.sql`. Фактически применено: 02.11.2026, 18:45.

Проверка (по одному запросу в SQL Editor; ошибка ограничения — ожидаемый результат):
1. Table Editor: `tags` — 5 строк, `tasks` — пусто; типы столбцов, PK и FK соответствуют схеме.
2. Справочник и ограничения:
```sql
select id, name from public.tags order by name;
insert into public.tags (id, name) values ('', 'Пусто');          -- tags_id_not_blank
insert into public.tags (id, name) values ('x1', '');             -- tags_name_not_blank
insert into public.tags (id, name) values ('study', 'Дубль');    -- PK, 23505
insert into public.tags (id, name) values ('y1', 'Учёба');       -- unique name, 23505
```
3. Внешний ключ: запрос из методички (случайный `owner_id`) завершается ошибкой FK; `tag_id` проверяется в ЛР 6 с реальным пользователем. Строки в `auth.users` вручную не создаются.
4. Права и RLS (ожидается `true, false, false, false, false, false` и `true / true` в `rowsecurity`):
```sql
select
  has_table_privilege('anon', 'public.tags', 'select')           as anon_select_tags,
  has_table_privilege('anon', 'public.tags', 'insert')           as anon_insert_tags,
  has_table_privilege('authenticated', 'public.tags', 'update')  as auth_update_tags,
  has_table_privilege('authenticated', 'public.tags', 'delete')  as auth_delete_tags,
  has_table_privilege('anon', 'public.tasks', 'select')          as anon_select_tasks,
  has_table_privilege('authenticated', 'public.tasks', 'insert') as auth_insert_tasks;
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('tags', 'tasks');
select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public';
```
Политика ровно одна: `tags are publicly readable`, `SELECT`, роли `anon` и `authenticated`.
5. Чтение: `cd frontend && npm ci && npm run dev`, DevTools → Network, фильтр `rest/v1/tags`. Открыть `/tasks/new` — один `GET` к домену проекта Supabase (200, Initiator — `services/tags.ts`), в Response пять строк. Выбрать тег, создать задачу, открыть «Редактировать» — на странице задачи виден `id` (`study`), в форме — `name` («Учёба»).
6. Ошибка и повтор: временно заменить `'tags'` в `getTags` на `'tagz'` — в форме сообщение об ошибке Supabase и «Повторить»; ввести название и описание, вернуть правильное имя таблицы, нажать «Повторить» — поля на месте.
7. Пустой результат: в SQL Editor `delete from public.tags;` — задач в БД нет, удаление допустимо. «Обновить справочник» — «Тегов пока нет. Сохранение недоступно.», `select` и «Сохранить» недоступны. Выполнить `seed.sql`, нажать «Обновить справочник» без перезагрузки — теги вернулись, черновик не потерян.
8. Изменение `name` при прежнем `id`: `update public.tags set name = 'Учебные задачи' where id = 'study';` — после «Обновить справочник» в форме новое название, выбранный тег и введённые поля прежние. Затем вернуть `'Учёба'` (или обновить `seed.sql`, чтобы БД и репозиторий совпадали).
9. Запрет записи из браузера: временно добавить в эффект любого компонента
```ts
const w = await supabase!.from('tags').insert({ id: 'hack', name: 'Не должно сохраниться' })
const r = await supabase!.from('tasks').select('id')
console.log(w.error?.code, w.error?.message, r.error?.code, r.error?.message)
```
Ожидается `42501 permission denied for table tags` и `42501 permission denied for table tasks`; в `tags` новой строки нет. Проверочный код удалить до коммита; разрешающие политики не добавлять.
10. Конфигурация: переименовать `.env.local`, перезапустить Vite — список задач работает, форма показывает «Не настроены переменные Supabase в .env.local», сетевых запросов к API нет; вернуть файл и перезапустить Vite.
11. Устаревший ответ: на Slow 3G открыть форму и сразу перейти к списку — в консоли нет ошибок, запрос отменён.
12. Регрессия: полный CRUD, «Отмена», удаление с подтверждением, фильтр по статусу, `/unknown`, `/tasks/missing`; после обновления страницы вернулись 6 демонстрационных задач (основные записи пока локальны).
13. Сборка: `npm run build`, `npm run preview` — форма читает справочник из Supabase, в Network нет `/demo/tags.json`.
14. Репозиторий: `git status` показывает миграцию, seed, `lib/supabase.ts`, сервис, `package.json`, lock-файл и `.env.example`, но не `.env.local`; в чистой копии `npm ci` и `npm run build` проходят после создания `.env.local`.

Коммит: 82e10ba Lab 5: add Supabase schema and reference data
