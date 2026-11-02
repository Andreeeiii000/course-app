-- Справочные данные Task Tracker (ЛР 5).
-- Выполняется после миграции supabase/migrations/202610242011_initial_schema.sql.
-- Файл можно запускать повторно: UPSERT обновляет name и не создаёт новых id.
-- Здесь только справочник: задачи, пользователи и email в seed не помещаются.

insert into public.tags (id, name)
values
    ('study', 'Учёба'),
    ('work', 'Работа'),
    ('home', 'Дом'),
    ('health', 'Здоровье'),
    ('personal', 'Личное')
on conflict (id) do update
set name = excluded.name;
