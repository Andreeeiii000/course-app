import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { supabase, supabaseConfigError } from '../lib/supabase'

type Mode = 'signin' | 'signup'

const MIN_PASSWORD_LENGTH = 8

// Правила пароля учебного проекта: от 8 символов, есть буква и цифра.
// Возвращает текст ошибки или пустую строку.
function validatePassword(password: string): string {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Пароль должен содержать не менее ${MIN_PASSWORD_LENGTH} символов.`
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return 'Пароль должен содержать хотя бы одну букву и одну цифру.'
  }
  return ''
}

// Сообщения Supabase приходят на английском и могут зависеть от настроек
// проекта. Известные коды переводим; «аккаунт уже существует» не показываем
// отдельно: форма не должна подтверждать, что чужой email зарегистрирован.
function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null &&
    'code' in error && typeof error.code === 'string'
      ? error.code : ''
  const name = error instanceof Error ? error.name : ''

  if (name === 'AuthRetryableFetchError') {
    return 'Нет связи с сервером. Проверьте сеть и повторите попытку.'
  }
  switch (code) {
    case 'invalid_credentials':
      return 'Неверный email или пароль.'
    case 'email_not_confirmed':
      return 'Email не подтверждён. Перейдите по ссылке из письма и повторите вход.'
    case 'weak_password':
      return 'Пароль слишком простой. Используйте более длинный пароль с буквами и цифрами.'
    case 'email_address_invalid':
      return 'Укажите корректный адрес email.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Слишком много попыток. Подождите немного и повторите.'
    case 'signup_disabled':
      return 'Регистрация отключена в настройках проекта.'
    case 'user_already_exists':
      return 'Не удалось зарегистрироваться. Проверьте данные или выполните вход.'
  }
  return error instanceof Error
    ? `Не удалось выполнить запрос: ${error.message}`
    : 'Не удалось выполнить запрос.'
}

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isSignUp = mode === 'signup'

  function switchMode(next: Mode) {
    if (pending || next === mode) return
    setMode(next)
    setError('')
    setMessage('')
    setPassword('') // email сохраняется, пароль вводится заново
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return // повторная отправка во время запроса
    if (!supabase) {
      setError(supabaseConfigError ?? 'Supabase не настроен.')
      return
    }

    setError('')
    setMessage('')

    if (isSignUp) {
      const passwordError = validatePassword(password)
      if (passwordError) {
        setError(passwordError) // поля остаются как есть
        return
      }
    }

    setPending(true)
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (signUpError) throw signUpError
        if (data.session) {
          navigate('/tasks', { replace: true })
        } else {
          // Подтверждение email включено: сессии ещё нет, вход не выполнен.
          setMessage(
            'Проверьте почту и подтвердите регистрацию. ' +
            'После подтверждения войдите с этим email и паролем.'
          )
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInError) throw signInError
        navigate('/tasks', { replace: true })
      }
    } catch (caught: unknown) {
      setError(authErrorMessage(caught)) // email не очищается
    } finally {
      setPending(false)
    }
  }

  return (
    <section>
      <h1>{isSignUp ? 'Регистрация' : 'Вход'}</h1>

      <div className="mode-switch" role="group" aria-label="Режим формы">
        <button
          type="button"
          aria-pressed={!isSignUp}
          disabled={pending}
          onClick={() => switchMode('signin')}
        >
          Вход
        </button>
        <button
          type="button"
          aria-pressed={isSignUp}
          disabled={pending}
          onClick={() => switchMode('signup')}
        >
          Регистрация
        </button>
      </div>

      {supabaseConfigError && (
        <p role="alert" className="form-error">
          {supabaseConfigError}
        </p>
      )}

      <form className="task-form" onSubmit={handleSubmit}>
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="auth-password">Пароль</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSignUp && (
          <p className="form-hint">
            Не менее {MIN_PASSWORD_LENGTH} символов, с буквой и цифрой.
          </p>
        )}

        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="form-note">
            {message}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" disabled={pending || !supabase}>
            {pending
              ? 'Отправляем…'
              : isSignUp ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </form>
    </section>
  )
}
