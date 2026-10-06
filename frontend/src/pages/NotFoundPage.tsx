import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1>Страница не найдена</h1>
      <p>Такого адреса в приложении нет. Проверьте ссылку или вернитесь к списку.</p>
      <Link to="/tasks">К списку задач</Link>
    </section>
  )
}
