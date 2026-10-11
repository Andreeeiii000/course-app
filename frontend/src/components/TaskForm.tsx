import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskDraft } from '../types/task'
import {
  isTaskPriority,
  isTaskStatus,
  priorityLabels,
  priorityOptions,
  statusLabels,
  statusOptions,
} from '../types/task'

type TaskFormProps = {
  initialValues: TaskDraft
  onSave: (draft: TaskDraft) => void
  onCancel: () => void
}

// Возвращает текст ошибки или пустую строку, если данные корректны.
function validateDraft(draft: TaskDraft): string {
  const title = draft.title.trim()
  if (title.length < 3 || title.length > 100) {
    return 'Название должно содержать от 3 до 100 символов.'
  }
  if (!draft.dueDate) {
    return 'Укажите срок задачи.'
  }
  // Предметное правило: у завершённой задачи должно быть описание результата.
  // Просроченный срок допустим, поэтому дату с «сегодня» не сравниваем.
  if (draft.status === 'done' && draft.description.trim() === '') {
    return 'Для завершённой задачи опишите результат в поле «Описание».'
  }
  return ''
}

export function TaskForm(props: TaskFormProps) {
  // Черновик — копия начальных значений; общий список он не меняет.
  const [draft, setDraft] = useState<TaskDraft>(() => ({ ...props.initialValues }))
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = validateDraft(draft)
    if (message) {
      setError(message)
      return // введённые поля остаются в draft
    }
    setError('')
    props.onSave({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      tag: draft.tag.trim(),
    })
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="task-title">Название *</label>
      <input
        id="task-title"
        value={draft.title}
        required
        maxLength={200}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />

      <label htmlFor="task-description">Описание</label>
      <textarea
        id="task-description"
        rows={4}
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
      />

      <label htmlFor="task-date">Срок *</label>
      <input
        id="task-date"
        type="date"
        value={draft.dueDate}
        required
        onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
      />

      <label htmlFor="task-status">Статус</label>
      <select
        id="task-status"
        value={draft.status}
        onChange={(e) => {
          const status = e.target.value
          if (isTaskStatus(status)) setDraft({ ...draft, status })
        }}
      >
        {statusOptions.map((value) => (
          <option key={value} value={value}>
            {statusLabels[value]}
          </option>
        ))}
      </select>

      <label htmlFor="task-priority">Приоритет</label>
      <select
        id="task-priority"
        value={draft.priority}
        onChange={(e) => {
          const priority = e.target.value
          if (isTaskPriority(priority)) setDraft({ ...draft, priority })
        }}
      >
        {priorityOptions.map((value) => (
          <option key={value} value={value}>
            {priorityLabels[value]}
          </option>
        ))}
      </select>

      <label htmlFor="task-tag">Тег</label>
      <input
        id="task-tag"
        value={draft.tag}
        onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
      />

      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit">Сохранить</button>
        <button type="button" onClick={props.onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}
