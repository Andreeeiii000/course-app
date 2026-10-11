import { Link, useNavigate, useParams } from 'react-router'
import { priorityLabels, statusLabels } from '../types/task'
import type { Task } from '../types/task'

type TaskDetailsPageProps = {
  tasks: Task[]
  onDelete: (id: string) => void
}

export function TaskDetailsPage({ tasks, onDelete }: TaskDetailsPageProps) {
  const { id } = useParams()
  const navigate = useNavigate() // хуки — до условного возврата
  const task = tasks.find((item) => item.id === id)

  if (!task) {
    return (
      <section>
        <h1>Задача не найдена</h1>
        <p>Задачи с таким идентификатором нет в списке.</p>
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
      <div className="form-actions">
        <Link to={`/tasks/${task.id}/edit`}>Редактировать</Link>
        <button
          type="button"
          className="danger"
          onClick={() => {
            if (window.confirm(`Удалить задачу «${task.title}»?`)) {
              onDelete(task.id)
              navigate('/tasks', { replace: true })
            }
          }}
        >
          Удалить
        </button>
        <Link to="/tasks">К списку задач</Link>
      </div>
    </section>
  )
}
