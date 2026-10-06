import { Link, useParams } from 'react-router'
import { tasks } from '../data/tasks'
import { priorityLabels, statusLabels } from '../types/task'

export function TaskDetailsPage() {
  const { id } = useParams()
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
      <p>{task.description}</p>
      <dl className="details">
        <dt>Статус</dt>
        <dd>{statusLabels[task.status]}</dd>
        <dt>Приоритет</dt>
        <dd>{priorityLabels[task.priority]}</dd>
        <dt>Срок</dt>
        <dd>{task.dueDate}</dd>
        <dt>Тег</dt>
        <dd>{task.tag}</dd>
        <dt>Идентификатор</dt>
        <dd>{task.id}</dd>
      </dl>
      <Link to="/tasks">К списку задач</Link>
    </section>
  )
}
