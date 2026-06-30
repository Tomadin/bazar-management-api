import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import ProductosPage from './pages/ProductosPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import ReportesPage from './pages/ReportesPage.jsx'

export default function App() {
  const [colapsada, setColapsada] = useState(
    () => localStorage.getItem('sidebarColapsada') === 'true',
  )

  function toggle() {
    setColapsada((prev) => {
      const next = !prev
      localStorage.setItem('sidebarColapsada', String(next))
      return next
    })
  }

  return (
    <div className={`layout ${colapsada ? 'layout-colapsada' : ''}`}>
      <NavBar colapsada={colapsada} onToggle={toggle} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
      </main>
    </div>
  )
}
