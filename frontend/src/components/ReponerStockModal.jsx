import { useState } from 'react'
import { reponerStock } from '../api/productos.js'
import { ApiError } from '../api/http.js'
import Modal from './Modal.jsx'
import Field from './Field.jsx'
import ErrorBanner from './ErrorBanner.jsx'

// Modal reutilizable para aumentar el stock de un producto.
// Props: producto (con id/nombre/cantidadDisponible), onClose, onRepuesto(productoActualizado).
export default function ReponerStockModal({ producto, onClose, onRepuesto }) {
  const [cantidad, setCantidad] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function validar() {
    const valor = Number(cantidad)
    if (cantidad === '' || !Number.isInteger(valor) || valor <= 0) {
      return { cantidad: 'La cantidad debe ser un entero mayor a cero.' }
    }
    return {}
  }

  async function enviar(e) {
    e.preventDefault()
    setErrorGeneral(null)
    const erroresLocales = validar()
    setErrores(erroresLocales)
    if (Object.keys(erroresLocales).length > 0) return

    setEnviando(true)
    try {
      const actualizado = await reponerStock(producto.id, Number(cantidad))
      await onRepuesto(actualizado)
    } catch (err) {
      if (err instanceof ApiError && err.validationErrors) {
        setErrores(err.validationErrors)
      } else {
        setErrorGeneral(err)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={`Reponer stock — ${producto.nombre}`} onClose={onClose}>
      <ErrorBanner error={errorGeneral} onClose={() => setErrorGeneral(null)} />
      <p className="muted" style={{ marginTop: 0 }}>
        Stock actual: <strong>{producto.cantidadDisponible}</strong>
      </p>
      <form onSubmit={enviar} noValidate>
        <Field
          label="Cantidad a reponer"
          name="cantidad"
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          error={errores.cantidad}
          autoFocus
        />
        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? 'Reponiendo…' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
