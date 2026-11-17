import { useCallback, useEffect, useRef, useState } from 'react'
import type { Task } from '../types/task'
import { getTasks } from '../services/tasks'

// Состояние загрузки личного списка для страниц. Список есть только в success:
// у гостя и во время запроса страницы личных данных не видят.
export type TasksState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; tasks: Task[] }

// Данные хранятся вместе с id владельца: ответ, пришедший после смены
// пользователя, не может попасть в список другого аккаунта.
type Loaded = { userId: string; tasks: Task[] }
type Failure = { userId: string; message: string }

export function useTasks(userId: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [prevUserId, setPrevUserId] = useState(userId)
  // Номер последнего запроса: устаревший ответ игнорируется.
  const requestId = useRef(0)

  // Смена пользователя или выход: прежний список и ошибка очищаются сразу,
  // во время того же рендера — старые данные не успевают попасть на экран.
  if (userId !== prevUserId) {
    setPrevUserId(userId)
    setLoaded(null)
    setFailure(null)
  }

  // Запрашивает список и записывает результат в состояние внутри колбэков
  // Promise (не синхронно). Ошибку не пробрасывает, а переводит состояние в error
  // (видно в интерфейсе, есть «Повторить»). Это важно после create/update/delete:
  // запись уже сохранена, и ошибка перезагрузки не должна выглядеть как отказ
  // сохранения — иначе пользователь повторит отправку и получит дубль.
  const fetchFor = useCallback((ownerId: string): Promise<void> => {
    const id = ++requestId.current
    return getTasks().then(
      (tasks) => {
        if (id !== requestId.current) return
        setLoaded({ userId: ownerId, tasks })
        setFailure(null)
      },
      (error: unknown) => {
        if (id !== requestId.current) return
        const message = error instanceof Error
          ? error.message : 'Не удалось загрузить задачи.'
        setFailure({ userId: ownerId, message })
      },
    )
  }, [])

  // Загрузка зависит только от user.id: обновление токена (новый объект Session
  // с тем же id) повторный запрос не вызывает. Для гостя запросов нет.
  useEffect(() => {
    if (userId === null) return
    void fetchFor(userId)
    return () => {
      requestId.current += 1 // ответ ушедшего пользователя больше не нужен
    }
  }, [userId, attempt, fetchFor])

  // «Повторить» после ошибки загрузки.
  const reload = useCallback(() => {
    setFailure(null)
    setAttempt((current) => current + 1)
  }, [])

  // Повторная загрузка после изменения: показанный список не заменяется
  // индикатором, пока приходит новый.
  const refresh = useCallback(async () => {
    if (userId !== null) await fetchFor(userId)
  }, [userId, fetchFor])

  let state: TasksState = { status: 'loading' }
  if (userId !== null) {
    if (failure !== null && failure.userId === userId) {
      state = { status: 'error', message: failure.message }
    } else if (loaded !== null && loaded.userId === userId) {
      state = { status: 'success', tasks: loaded.tasks }
    }
  }

  return { state, reload, refresh }
}
