import { NavLink, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="app">
      <header>
        <p className="app-title">Task Tracker</p>
        <p className="app-subtitle">Личные задачи, сроки и прогресс.</p>
        <nav aria-label="Основная навигация">
          <NavLink to="/tasks" end>Задачи</NavLink>
          <NavLink to="/tasks/new">Создать</NavLink>
        </nav>
      </header>
      <p className="memory-note" role="note">
        Данные хранятся только в памяти открытого приложения: изменения
        временные и пропадут после обновления страницы — вернутся
        демонстрационные задачи.
      </p>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
