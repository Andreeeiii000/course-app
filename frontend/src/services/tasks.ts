import type { Task, TaskDraft } from '../types/task'
import { requireSupabase } from '../lib/supabase'

// Строка таблицы public.tasks: имена столбцов PostgreSQL (snake_case).
// overrideTypes ниже уточняет только статический тип ответа и не проверяет
// данные во время выполнения: структуру защищает схема, значения — ограничения БД.
type TaskRow = {
  id: string
  owner_id: string
  tag_id: string
  title: string
  description: string
  status: Task['status']
  due_date: string
  priority: Task['priority']
  created_at: string
}

const taskColumns =
  'id, owner_id, tag_id, title, description, status, due_date, priority, created_at'

// Преобразование строки БД в Task находится здесь, поэтому компоненты
// не зависят от snake_case и по-прежнему работают с полем `tag`.
function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.due_date,
    priority: row.priority,
    tag: row.tag_id,
  }
}

// Объект для записи без id, owner_id и created_at: id и created_at создаёт БД,
// а owner_id подставляет default auth.uid(); клиент владельца не выбирает.
function toWrite(draft: TaskDraft) {
  return {
    tag_id: draft.tag,
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: draft.status,
    due_date: draft.dueDate,
    priority: draft.priority,
  }
}

// Одно сообщение и для «нет такой строки», и для «строка скрыта политикой RLS»:
// интерфейс не должен раскрывать, существует ли чужой id.
const notFoundMessage = 'Задача не найдена или недоступна.'

// Список текущего пользователя. Условие owner_id добавляет RLS, поэтому
// фильтр в запросе не нужен и заменой политики не является.
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await requireSupabase()
    .from('tasks')
    .select(taskColumns)
    .order('created_at', { ascending: false })
    .overrideTypes<TaskRow[], { merge: false }>()

  if (error) throw new Error(`Не удалось загрузить задачи: ${error.message}`)
  return data.map(fromRow)
}

// Возвращает сохранённую строку с id, созданным базой.
export async function createTask(draft: TaskDraft): Promise<Task> {
  const { data, error } = await requireSupabase()
    .from('tasks')
    .insert(toWrite(draft))
    .select(taskColumns)
    .single()
    .overrideTypes<TaskRow, { merge: false }>()

  if (error) throw new Error(`Не удалось создать задачу: ${error.message}`)
  return fromRow(data)
}

// UPDATE всегда ограничен id. Если RLS скрывает строку (или её нет), запрос
// завершается без ошибки и затрагивает 0 строк — это проверяется явно,
// чтобы интерфейс не сообщал об успешном сохранении.
export async function updateTask(id: string, draft: TaskDraft): Promise<void> {
  const { data, error } = await requireSupabase()
    .from('tasks')
    .update(toWrite(draft))
    .eq('id', id)
    .select('id')

  if (error) throw new Error(`Не удалось изменить задачу: ${error.message}`)
  if (data.length === 0) throw new Error(notFoundMessage)
}

// DELETE тоже может затронуть 0 строк без ошибки: проверяем результат.
export async function deleteTask(id: string): Promise<void> {
  const { data, error } = await requireSupabase()
    .from('tasks')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw new Error(`Не удалось удалить задачу: ${error.message}`)
  if (data.length === 0) throw new Error(notFoundMessage)
}
