import { useEffect, useState } from 'react'
import type { Tag } from '../types/tag'
import { getTags } from '../services/tags'

// previous — последний успешно загруженный справочник, пока идёт обновление
// (при первой загрузке и после ошибки — пустой массив). Благодаря ему список
// тегов в форме не исчезает во время «Обновить справочник».
type TagsLoad =
  | { status: 'loading'; previous: Tag[] }
  | { status: 'error'; message: string }
  | { status: 'success'; data: Tag[] }

export function useTags() {
  const [load, setLoad] = useState<TagsLoad>({ status: 'loading', previous: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    // Статус «loading» не ставится здесь: он начальный, а retry() выставляет
    // его до смены attempt. Синхронный setState в эффекте даёт каскад рендеров.
    getTags(controller.signal)
      .then((data) => {
        if (active) setLoad({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message = error instanceof Error
          ? error.message : 'Не удалось загрузить справочник.'
        setLoad({ status: 'error', message })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  // Повторяет запрос к Supabase: после ошибки («Повторить») и по кнопке
  // «Обновить справочник». Черновик формы хранится в TaskForm и не меняется.
  function retry() {
    setLoad((current) => ({
      status: 'loading',
      previous:
        current.status === 'success' ? current.data
        : current.status === 'loading' ? current.previous
        : [],
    }))
    setAttempt((current) => current + 1)
  }

  return { load, retry }
}
