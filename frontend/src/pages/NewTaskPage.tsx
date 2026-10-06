import { Link } from 'react-router'

export function NewTaskPage() {
  return (
    <section>
      <h1>Создание задачи</h1>
      <p>
        Форма создания задачи появится в следующей лабораторной работе. Пока
        новые записи добавить нельзя.
      </p>
      <Link to="/tasks">К списку задач</Link>
    </section>
  )
}
