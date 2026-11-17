-- ЛР 6. Личные задачи: доступ только владельцу.
--
-- До этой миграции у tasks не было ни прав для клиентских ролей, ни политик.
-- Теперь роль authenticated получает четыре операции, а Row Level Security
-- добавляет к каждой из них условие owner_id = auth.uid().
--
-- Порядок применения в SQL Editor: выполнить файл целиком один раз
-- (после 202610242011_initial_schema.sql и seed.sql). Применённую миграцию
-- не редактируют: новое изменение записывается в следующий файл.
--
-- Справочник tags не затрагивается: он по-прежнему читается всеми.
-- Строки в tasks и пользователей в auth.users через SQL не создаются:
-- аккаунты появляются через Auth API, а owner_id задаёт значение по умолчанию.

-- ---------------------------------------------------------------------------
-- 1. Владелец по умолчанию и права
-- ---------------------------------------------------------------------------

-- Клиент не передаёт owner_id: его берёт база из проверенного токена сессии.
alter table public.tasks
    alter column owner_id set default auth.uid();

-- Права пересобираем с нуля: anon не получает ничего,
-- authenticated — только четыре операции над строками.
revoke all on table public.tasks from anon, authenticated;

grant select, insert, update, delete
    on table public.tasks to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Четыре отдельные политики (не FOR ALL: так проще проверить и развивать)
-- ---------------------------------------------------------------------------
-- (select auth.uid()) в подзапросе вычисляется один раз на запрос, а не для
-- каждой строки. Проверка is not null оставляет анонимный запрос без строк.

-- SELECT: using определяет, какие существующие строки видны.
create policy "tasks select own"
on public.tasks for select to authenticated
using ((select auth.uid()) is not null
    and (select auth.uid()) = owner_id);

-- INSERT: with check проверяет новую строку. Подставить чужой owner_id нельзя.
create policy "tasks insert own"
on public.tasks for insert to authenticated
with check ((select auth.uid()) is not null
    and (select auth.uid()) = owner_id);

-- UPDATE: using защищает исходную строку, with check запрещает передать её
-- другому владельцу. Для UPDATE нужна и политика SELECT (она есть выше).
create policy "tasks update own"
on public.tasks for update to authenticated
using ((select auth.uid()) is not null
    and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null
    and (select auth.uid()) = owner_id);

-- DELETE: удалять можно только свои строки.
create policy "tasks delete own"
on public.tasks for delete to authenticated
using ((select auth.uid()) is not null
    and (select auth.uid()) = owner_id);

-- RLS на обеих таблицах включён миграцией ЛР 5; повторное включение безопасно.
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
