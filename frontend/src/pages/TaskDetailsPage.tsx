import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { TasksGate } from '../components/TasksGate'
import type { TasksState } from '../hooks/useTasks'
import { priorityLabels, statusLabels } from '../types/task'

type TaskDetailsPageProps = {
  tasksState: TasksState
  onRetry: () => void
  onDelete: (id: string) => Promise<void>
}

export function TaskDetailsPage({
  tasksState, onRetry, onDelete,
}: TaskDetailsPageProps) {
  const { id } = useParams()
  const navigate = useNavigate() // хуки — до условных возвратов
  const [pending, setPending] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Подтверждение остаётся перед запросом. После успеха список перезагружен
  // в App, затем выполняется прежняя навигация; при ошибке страница остаётся.
  async function handleDelete(taskId: string, title: string) {
    if (pending) return
    if (!window.confirm(`Удалить задачу «${title}»?`)) return
    setPending(true)
    setDeleteError('')
    try {
      await onDelete(taskId)
      // pending намеренно не сбрасывается: страница уходит из дерева, а сброс
      // раньше навигации на кадр показал бы «Задача не найдена».
      navigate('/tasks', { replace: true })
    } catch (caught: unknown) {
      setDeleteError(
        caught instanceof Error ? caught.message : 'Не удалось удалить задачу.'
      )
      setPending(false) // ошибка: остаёмся на странице, повтор доступен
    }
  }

  return (
    <TasksGate state={tasksState} onRetry={onRetry}>
      {(tasks) => {
        const task = tasks.find((item) => item.id === id)

        if (!task) {
          // Список уже обновлён после удаления, переход ещё не выполнен:
          // вместо «не найдена» показываем ход операции.
          if (pending) return <p role="status">Удаляем задачу…</p>
          return (
            <section>
              <h1>Задача не найдена</h1>
              <p>Задачи с таким идентификатором нет в вашем списке.</p>
              <Link to="/tasks">К списку задач</Link>
            </section>
          )
        }

        return (
          <section>
            <h1>{task.title}</h1>
            {task.description && <p>{task.description}</p>}
            <dl className="details">
              <dt>Статус</dt>
              <dd>{statusLabels[task.status]}</dd>
              <dt>Приоритет</dt>
              <dd>{priorityLabels[task.priority]}</dd>
              <dt>Срок</dt>
              <dd>{task.dueDate}</dd>
              <dt>Тег</dt>
              <dd>{task.tag || '—'}</dd>
              <dt>Идентификатор</dt>
              <dd>{task.id}</dd>
            </dl>
            {deleteError && (
              <p role="alert" className="form-error">
                {deleteError}
              </p>
            )}
            <div className="form-actions">
              <Link to={`/tasks/${task.id}/edit`}>Редактировать</Link>
              <button
                type="button"
                className="danger"
                disabled={pending}
                onClick={() => void handleDelete(task.id, task.title)}
              >
                {pending ? 'Удаляем…' : 'Удалить'}
              </button>
              <Link to="/tasks">К списку задач</Link>
            </div>
          </section>
        )
      }}
    </TasksGate>
  )
}
