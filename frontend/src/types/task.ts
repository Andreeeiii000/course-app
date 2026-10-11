export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string // YYYY-MM-DD
  priority: TaskPriority
  tag: string
}

// Черновик формы: все поля Task, кроме id (id создаёт приложение)
export type TaskDraft = Omit<Task, 'id'>

export const statusLabels: Record<TaskStatus, string> = {
  todo: 'Запланировано',
  in_progress: 'В работе',
  done: 'Готово',
}

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

export const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done']
export const priorityOptions: TaskPriority[] = ['low', 'medium', 'high']

// Сужение строки из события до TaskStatus / TaskPriority без `as` и `any`
export function isTaskStatus(value: string): value is TaskStatus {
  return value === 'todo' || value === 'in_progress' || value === 'done'
}

export function isTaskPriority(value: string): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high'
}
