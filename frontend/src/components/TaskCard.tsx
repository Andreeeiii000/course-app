import { Link } from 'react-router'
import type { Task } from '../types/task'
import { priorityLabels, statusLabels } from '../types/task'

type TaskCardProps = { task: Task }

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <h2>
        <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      </h2>
      <p>{task.description}</p>
      <p>Срок: {task.dueDate}</p>
      <p className="task-meta">
        <span className={`badge status-${task.status}`}>
          {statusLabels[task.status]}
        </span>
        <span className={`badge priority-${task.priority}`}>
          Приоритет: {priorityLabels[task.priority]}
        </span>
      </p>
    </article>
  )
}
