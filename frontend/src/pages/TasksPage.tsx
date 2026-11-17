import { useState } from 'react'
import { Link } from 'react-router'
import { TaskCard } from '../components/TaskCard'
import { TasksGate } from '../components/TasksGate'
import type { TasksState } from '../hooks/useTasks'
import type { Task, TaskStatus } from '../types/task'
import { isTaskStatus, statusLabels, statusOptions } from '../types/task'

type TasksPageProps = { tasksState: TasksState; onRetry: () => void }

export function TasksPage({ tasksState, onRetry }: TasksPageProps) {
  return (
    <section>
      <h1>Мои задачи</h1>
      <Link to="/tasks/new">Добавить задачу</Link>

      <TasksGate state={tasksState} onRetry={onRetry}>
        {(tasks) => <TaskList tasks={tasks} />}
      </TasksGate>
    </section>
  )
}

// Список с фильтром по статусу (ЛР 3). Фильтр — локальное состояние,
// сам список приходит из App (данные текущего пользователя из Supabase).
function TaskList({ tasks }: { tasks: Task[] }) {
  const [status, setStatus] = useState<TaskStatus | 'all'>('all')

  const visibleTasks = tasks.filter(
    (task) => status === 'all' || task.status === status
  )

  if (tasks.length === 0) {
    return (
      <p>
        Задач пока нет. <Link to="/tasks/new">Создайте первую задачу.</Link>
      </p>
    )
  }

  return (
    <>
      <div className="filter">
        <label htmlFor="status-filter">Статус</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'all' || isTaskStatus(value)) setStatus(value)
          }}
        >
          <option value="all">Все</option>
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setStatus('all')}>
          Сбросить фильтр
        </button>
      </div>

      {visibleTasks.length === 0 ? (
        <p>Нет задач с выбранным статусом.</p>
      ) : (
        <div className="task-list">
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </>
  )
}
