import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

type Setup =
  | { client: SupabaseClient; error: null }
  | { client: null; error: string }

// Клиент создаётся один раз при загрузке модуля. Если настройка неверна, модуль
// не бросает исключение: иначе приложение не запустилось бы вовсе (пустая страница).
// Вместо этого ошибка настройки доступна сервисам и показывается в интерфейсе,
// а страницы, которым Supabase не нужен, продолжают работать.
function setup(): Setup {
  if (!url || !publishableKey) {
    return {
      client: null,
      error:
        'Не настроены переменные Supabase в .env.local ' +
        '(VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY). ' +
        'После изменения файла перезапустите Vite.',
    }
  }
  try {
    return { client: createClient(url, publishableKey), error: null }
  } catch {
    // createClient бросает исключение, если URL не является корректным адресом.
    return {
      client: null,
      error:
        'VITE_SUPABASE_URL указан неверно: ожидается адрес вида ' +
        'https://<проект>.supabase.co. После изменения файла перезапустите Vite.',
    }
  }
}

const result = setup()

export const supabase = result.client
export const supabaseConfigError = result.error

if (supabaseConfigError) {
  // Сообщение не содержит значений ключей.
  console.error(supabaseConfigError)
}

// Клиент для сервисов личных данных: вместо обращения к null бросает
// понятную ошибку настройки, которая показывается в интерфейсе.
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase не настроен.')
  }
  return supabase
}
