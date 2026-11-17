import { Link, useNavigate, useParams } from 'react-router'
import { TaskForm } from '../components/TaskForm'
import { TasksGate } from '../components/TasksGate'
import type { TasksState } from '../hooks/useTasks'
import type { TaskDraft } from '../types/task'

type EditTaskPageProps = {
  tasksState: TasksState
  onRetry: () => void
  onUpdate: (id: string, draft: TaskDraft) => Promise<void>
}

export function EditTaskPage({ tasksState, onRetry, onUpdate }: EditTaskPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <TasksGate state={tasksState} onRetry={onRetry}>
      {(tasks) => {
        const task = tasks.find((item) => item.id === id)

        // Один и тот же ответ для отсутствующей и для недоступной задачи:
        // интерфейс не раскрывает, существует ли чужой id.
        if (!task) {
          return (
            <section>
              <h1>Задача не найдена</h1>
              <p>Задачи с таким идентификатором нет в вашем списке.</p>
              <Link to="/tasks">К списку задач</Link>
            </section>
          )
        }

        const initialValues: TaskDraft = {
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          priority: task.priority,
          tag: task.tag,
        }

        return (
          <section>
            <h1>Редактирование задачи</h1>
            <TaskForm
              key={task.id}
              initialValues={initialValues}
              onSave={async (draft) => {
                await onUpdate(task.id, draft)
                navigate(`/tasks/${task.id}`)
              }}
              onCancel={() => navigate(`/tasks/${task.id}`)}
            />
          </section>
        )
      }}
    </TasksGate>
  )
}
