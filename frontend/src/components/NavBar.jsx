import { NavLink } from 'react-router-dom'

const enlaces = [
  { to: '/productos', label: 'Productos', ico: 'P' },
  { to: '/clientes', label: 'Clientes', ico: 'C' },
  { to: '/ventas', label: 'Ventas', ico: 'V' },
]

// Sidebar lateral colapsable. Recibe el estado de colapso y el toggle desde App.
export default function NavBar({ colapsada, onToggle }) {
  return (
    <aside className={`sidebar ${colapsada ? 'colapsada' : ''}`}>
      <div className="sidebar-top">
        {!colapsada && <span className="sidebar-brand">Bazar</span>}
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={colapsada ? 'Expandir menú' : 'Colapsar menú'}
          title={colapsada ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="hamburger" />
        </button>
      </div>

      <nav className="sidebar-nav">
        {enlaces.map((e) => (
          <NavLink
            key={e.to}
            to={e.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={e.label}
          >
            <span className="nav-ico">{e.ico}</span>
            <span className="nav-label">{e.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
