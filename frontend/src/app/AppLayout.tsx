import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import type { AuthState } from '../hooks/useAuth'
import { requireSupabase } from '../lib/supabase'

export function AppLayout({ auth }: { auth: AuthState }) {
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  // Выход только из текущего браузерного сеанса (local scope). Подписка в
  // useAuth получит SIGNED_OUT, очистит состояние, а RequireAuth уведёт
  // пользователя на /auth. Хранилище сессии вручную не очищается.
  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setSignOutError('')
    try {
      const { error } = await requireSupabase().auth.signOut({ scope: 'local' })
      if (error) throw error
    } catch (caught: unknown) {
      setSignOutError(
        caught instanceof Error
          ? `Не удалось выйти: ${caught.message}`
          : 'Не удалось выйти.'
      )
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="app">
      <header>
        <p className="app-title">Task Tracker</p>
        <p className="app-subtitle">Личные задачи, сроки и прогресс.</p>
        {auth.status === 'authenticated' && (
          <>
            <nav aria-label="Основная навигация">
              <NavLink to="/tasks" end>Задачи</NavLink>
              <NavLink to="/tasks/new">Создать</NavLink>
            </nav>
            <div className="user-bar">
              <span>
                Вы вошли как{' '}
                <strong>{auth.session.user.email ?? 'пользователь без email'}</strong>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? 'Выходим…' : 'Выйти'}
              </button>
            </div>
            {signOutError && (
              <p role="alert" className="form-error">
                {signOutError}
              </p>
            )}
          </>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
