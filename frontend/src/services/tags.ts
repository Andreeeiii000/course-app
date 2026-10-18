import type { Tag } from '../types/tag'

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

const tagsUrl = `${import.meta.env.BASE_URL}demo/tags.json`

// Возвращает данные или отклонённый Promise: без alert, без изменения App
// и без скрытого резервного массива.
export async function getTags(signal: AbortSignal): Promise<Tag[]> {
  const response = await fetch(tagsUrl, {
    signal,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить теги: HTTP ${response.status}`)
  }
  const value: unknown = await response.json()
  return parseTags(value)
}
