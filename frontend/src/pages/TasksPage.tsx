import { useState } from 'react'
import { Link } from 'react-router'
import { TaskCard } from '../components/TaskCard'
import type { Task, TaskStatus } from '../types/task'
import { isTaskStatus, statusLabels, statusOptions } from '../types/task'

type TasksPageProps = { tasks: Task[] }

export function TasksPage({ tasks }: TasksPageProps) {
  // Локальное состояние: выбранный фильтр. Сам список приходит из App.
  const [status, setStatus] = useState<TaskStatus | 'all'>('all')

  const visibleTasks = tasks.filter(
    (task) => status === 'all' || task.status === status
  )

  return (
    <section>
      <h1>Мои задачи</h1>
      <Link to="/tasks/new">Добавить задачу</Link>

      {tasks.length === 0 ? (
        <p>
          Задач пока нет. <Link to="/tasks/new">Создайте первую задачу.</Link>
        </p>
      ) : (
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
      )}
    </section>
  )
}
