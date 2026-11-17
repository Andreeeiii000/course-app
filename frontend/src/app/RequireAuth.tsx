import { Navigate, Outlet, useLocation } from 'react-router'
import type { AuthState } from '../hooks/useAuth'

// Защищённый маршрут улучшает сценарий пользователя, но не является границей
// безопасности: данные защищает RLS в базе. Пока сессия проверяется, личная
// страница не показывается даже на мгновение.
export function RequireAuth({ auth }: { auth: AuthState }) {
  const location = useLocation() // хуки — до условных возвратов

  if (auth.status === 'checking') {
    return <p role="status">Проверяем сессию…</p>
  }
  if (auth.status === 'guest') {
    return <Navigate to="/auth" replace
      state={{ from: location.pathname }} />
  }
  return <Outlet />
}
