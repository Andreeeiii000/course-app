import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './app/AppLayout'
import { RequireAuth } from './app/RequireAuth'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { AuthPage } from './pages/AuthPage'
import { TasksPage } from './pages/TasksPage'
import { TaskDetailsPage } from './pages/TaskDetailsPage'
import { NewTaskPage } from './pages/NewTaskPage'
import { EditTaskPage } from './pages/EditTaskPage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { TaskDraft } from './types/task'
import { createTask, deleteTask, updateTask } from './services/tasks'
import './App.css'

export default function App() {
  // Состояние авторизации создаётся один раз и передаётся вниз.
  const auth = useAuth()
  const userId = auth.status === 'authenticated' ? auth.session.user.id : null

  // Личные задачи живут в Supabase. До входа список пуст, при выходе и смене
  // пользователя прежний список очищается до запроса нового. Демонстрационных
  // записей ЛР 2 больше нет: они не смешиваются с настоящими.
  const { state: tasksState, reload, refresh } = useTasks(userId)

  // Создание: запись в БД, затем повторная загрузка списка и id новой строки.
  // Ошибка записи уходит в форму; ошибка перезагрузки показывается в списке
  // (refresh её не пробрасывает), чтобы не вызвать повторную отправку.
  async function handleCreate(draft: TaskDraft): Promise<string> {
    const created = await createTask(draft)
    await refresh()
    return created.id
  }

  async function handleUpdate(id: string, draft: TaskDraft): Promise<void> {
    await updateTask(id, draft)
    await refresh()
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteTask(id)
    await refresh()
  }

  return (
    <Routes>
      <Route element={<AppLayout auth={auth} />}>
        <Route index element={<Navigate to="/tasks" replace />} />

        {/* Публичный маршрут. Вошедшего пользователя уводим к списку. */}
        <Route
          path="auth"
          element={
            auth.status === 'authenticated' ? (
              <Navigate to="/tasks" replace />
            ) : auth.status === 'checking' ? (
              <p role="status">Проверяем сессию…</p>
            ) : (
              <AuthPage />
            )
          }
        />

        {/* Личные страницы: без сессии недоступны. */}
        <Route element={<RequireAuth auth={auth} />}>
          <Route
            path="tasks"
            element={<TasksPage tasksState={tasksState} onRetry={reload} />}
          />
          <Route
            path="tasks/new"
            element={<NewTaskPage onCreate={handleCreate} />}
          />
          <Route
            path="tasks/:id"
            element={
              <TaskDetailsPage
                tasksState={tasksState}
                onRetry={reload}
                onDelete={handleDelete}
              />
            }
          />
          <Route
            path="tasks/:id/edit"
            element={
              <EditTaskPage
                tasksState={tasksState}
                onRetry={reload}
                onUpdate={handleUpdate}
              />
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
