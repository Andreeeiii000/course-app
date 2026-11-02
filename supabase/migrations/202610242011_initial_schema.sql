-- ЛР 5. Начальная схема Task Tracker.
--
-- tags  — публичный справочник тегов (читают все, изменяет только администратор БД);
-- tasks — личные задачи пользователя (до ЛР 6 закрыты от клиентских ролей).
--
-- Порядок применения в SQL Editor:
--   1) выполнить этот файл целиком один раз;
--   2) выполнить supabase/seed.sql.
-- Применённую миграцию не переименовывают и не редактируют: новое изменение
-- схемы записывается в следующий файл supabase/migrations/.

-- ---------------------------------------------------------------------------
-- 1. Таблицы
-- ---------------------------------------------------------------------------

-- Справочник тегов. id — стабильный код (как в JSON ЛР 4), name — название
-- для пользователя. name можно менять, id — нет: на него ссылаются задачи.
create table public.tags (
    id text primary key,
    name text not null unique,
    constraint tags_id_not_blank
        check (id = btrim(id) and id <> ''),
    constraint tags_name_not_blank
        check (name = btrim(name) and name <> '')
);

-- Личные задачи. Поля соответствуют форме ЛР 3; tag во frontend — это tag_id.
create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    tag_id text not null references public.tags(id)
        on update cascade on delete restrict,
    title text not null,
    description text not null default '',
    status text not null,
    due_date date not null,
    priority text not null,
    created_at timestamptz not null default now(),
    constraint tasks_title_length
        check (char_length(btrim(title)) between 3 and 100),
    constraint tasks_status_allowed
        check (status in ('todo', 'in_progress', 'done')),
    constraint tasks_priority_allowed
        check (priority in ('low', 'medium', 'high')),
    -- Предметное правило ЛР 3: у завершённой задачи должно быть описание результата.
    -- Просроченный срок допустим, поэтому due_date с текущей датой не сравнивается.
    constraint tasks_done_requires_description
        check (status <> 'done' or btrim(description) <> '')
);

-- Индексы по внешним ключам: понадобятся для выборки «мои задачи» (ЛР 6)
-- и для быстрой проверки on delete restrict у справочника.
create index tasks_owner_id_idx on public.tasks (owner_id);
create index tasks_tag_id_idx on public.tasks (tag_id);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security и минимальные права
-- ---------------------------------------------------------------------------

alter table public.tags enable row level security;
alter table public.tasks enable row level security;

-- Сначала забираем всё, что клиентские роли могли получить по умолчанию.
revoke all on table public.tags from anon, authenticated;
revoke all on table public.tasks from anon, authenticated;

-- Возвращаем только чтение публичного справочника.
grant select on table public.tags to anon, authenticated;

create policy "tags are publicly readable"
on public.tags
for select
to anon, authenticated
using (true);

-- У tasks в ЛР 5 нет ни прав для anon/authenticated, ни политик:
-- браузер не может ни читать, ни изменять личные строки.
-- Права и политики появятся в ЛР 6 вместе с Supabase Auth.
