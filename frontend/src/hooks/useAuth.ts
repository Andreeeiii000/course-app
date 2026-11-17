import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Три состояния интерфейса: сессия проверяется, пользователь не вошёл,
// пользователь вошёл. Пока идёт проверка, личные страницы не показываются.
export type AuthState =
  | { status: 'checking' }
  | { status: 'guest' }
  | { status: 'authenticated'; session: Session }

function fromSession(session: Session | null): AuthState {
  return session
    ? { status: 'authenticated', session }
    : { status: 'guest' }
}

// Состояние авторизации создаётся один раз (в App). Пароль и токены здесь не
// хранятся: сессию сохраняет и обновляет сам клиент supabase-js, а хук лишь
// переносит её в React.
export function useAuth(): AuthState {
  // Если Supabase не настроен (lib/supabase.ts), проверять нечего:
  // сразу «гость», AuthPage покажет ошибку настройки.
  const [auth, setAuth] = useState<AuthState>(() =>
    supabase ? { status: 'checking' } : { status: 'guest' }
  )

  useEffect(() => {
    const client = supabase
    if (!client) return

    let active = true

    // Callback синхронный: только переносит полученную сессию в React.
    // Обращаться к Supabase из него нельзя — возможна взаимная блокировка.
    const { data: { subscription } } = client.auth
      .onAuthStateChange((_event, session) => {
        if (active) setAuth(fromSession(session))
      })

    // Восстановление браузерной сессии при открытии страницы. Если событие
    // уже изменило состояние, поздний ответ getSession его не перезаписывает.
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return
      setAuth((current) => current.status === 'checking'
        ? (error ? { status: 'guest' } : fromSession(data.session))
        : current)
    }).catch(() => {
      // Непредвиденный сбой: не оставляем «checking» навсегда.
      if (!active) return
      setAuth((current) =>
        current.status === 'checking' ? { status: 'guest' } : current)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return auth
}
