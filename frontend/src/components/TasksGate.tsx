import type { ReactNode } from 'react'
import type { Task } from '../types/task'
import type { TasksState } from '../hooks/useTasks'

type TasksGateProps = {
  state: TasksState
  onRetry: () => void
  children: (tasks: Task[]) => ReactNode
}

// Общая обработка загрузки личного списка для страниц списка, карточки и
// редактирования: ожидание, ошибка с повтором или готовые данные.
export function TasksGate({ state, onRetry, children }: TasksGateProps) {
  if (state.status === 'loading') {
    return <p role="status">Загружаем задачи…</p>
  }
  if (state.status === 'error') {
    return (
      <div className="form-note form-note-error">
        <p role="alert">{state.message}</p>
        <button type="button" onClick={onRetry}>
          Повторить
        </button>
      </div>
    )
  }
  return <>{children(state.tasks)}</>
}
