import type { Tag } from '../types/tag'
import { supabase, supabaseConfigError } from '../lib/supabase'

// Проверка одного элемента: объект проверяется до обращения к его полям.
function isTag(value: unknown): value is Tag {
  if (typeof value !== 'object' || value === null) return false
  return (
    'id' in value && typeof value.id === 'string' &&
    value.id.trim().length > 0 && value.id === value.id.trim() &&
    'name' in value && typeof value.name === 'string' &&
    value.name.trim().length > 0
  )
}

// Разбор массива: структура и уникальность id. Пустой массив допустим —
// его отдельно обрабатывает интерфейс. Лишние поля ответа игнорируются.
// Проверка нужна и для ответа Supabase: данные приходят извне, и TypeScript
// не гарантирует, что форма ответа совпадает с ожидаемой.
export function parseTags(value: unknown): Tag[] {
  if (!Array.isArray(value) || !value.every(isTag)) {
    throw new Error('Неверная структура справочника тегов.')
  }
  const tags: Tag[] = value
  const ids = new Set(tags.map((tag) => tag.id))
  if (ids.size !== tags.length) {
    throw new Error('В справочнике повторяются идентификаторы.')
  }
  return tags
}

// Читает справочник из таблицы public.tags в Supabase (только SELECT).
// Возвращает данные или отклонённый Promise: без alert, без изменения App
// и без скрытого резервного массива — ошибка доступа должна быть видна.
export async function getTags(signal: AbortSignal): Promise<Tag[]> {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase не настроен.')
  }

  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .order('name')
    .abortSignal(signal)

  // Запрос отменён (уход со страницы, повторная попытка): результат не нужен.
  if (signal.aborted) {
    throw new DOMException('Запрос отменён', 'AbortError')
  }

  // Supabase не бросает исключение, а возвращает пару data/error:
  // ошибку проверяем до передачи результата дальше.
  if (error) {
    throw new Error(`Не удалось загрузить теги: ${error.message}`)
  }

  return parseTags(data)
}
