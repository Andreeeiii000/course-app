import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskDraft } from '../types/task'
import { useTags } from '../hooks/useTags'
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
  // Справочник: своё состояние загрузки, отдельное от черновика формы.
  const { load, retry } = useTags()
  const tags = load.status === 'success' ? load.data : []
  const selectedTagExists = tags.some((tag) => tag.id === draft.tag)
  const canSave = load.status === 'success' && selectedTagExists

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSave) {
      setError('Дождитесь справочника и выберите доступный тег.')
      return
    }
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

      <label htmlFor="task-tag">Тег *</label>
      <select
        id="task-tag"
        value={draft.tag}
        required
        disabled={load.status !== 'success' || tags.length === 0}
        onChange={(event) => setDraft({ ...draft, tag: event.target.value })}
      >
        <option value="">Выберите тег</option>
        {draft.tag !== '' && !selectedTagExists && (
          <option value={draft.tag} disabled>
            Текущий код: {draft.tag} — выберите доступный тег
          </option>
        )}
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>

      {load.status === 'loading' && (
        <p role="status" className="form-note">
          Загружаем теги…
        </p>
      )}
      {load.status === 'error' && (
        <div className="form-note form-note-error">
          <p role="alert">{load.message}</p>
          <button type="button" onClick={retry}>
            Повторить
          </button>
        </div>
      )}
      {load.status === 'success' && tags.length === 0 && (
        <div className="form-note">
          <p role="status">Тегов пока нет. Сохранение недоступно.</p>
          <button type="button" onClick={retry}>
            Повторить
          </button>
        </div>
      )}
      {load.status === 'success' &&
        tags.length > 0 &&
        draft.tag !== '' &&
        !selectedTagExists && (
          <p role="status" className="form-note">
            Тег «{draft.tag}» не найден в справочнике. Выберите доступный
            вариант из списка.
          </p>
        )}

      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={!canSave}>
          Сохранить
        </button>
        <button type="button" onClick={props.onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}
