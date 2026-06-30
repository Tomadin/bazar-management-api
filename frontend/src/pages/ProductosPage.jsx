import { useCallback, useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import {
  getProductos,
  getProductosBajoStock,
  crearProducto,
  descontarStock,
  activarProducto,
  eliminarProducto,
} from '../api/productos.js'
import { ApiError } from '../api/http.js'
import Loading from '../components/Loading.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import Modal from '../components/Modal.jsx'
import Field from '../components/Field.jsx'
import ReponerStockModal from '../components/ReponerStockModal.jsx'
import { formatMoneda } from '../utils/format.js'

const FORM_VACIO = { nombre: '', marca: '', costo: '', cantidadDisponible: '' }
// Umbral de bajo stock (coincide con el criterio del backend en /falta_stock).
const UMBRAL_BAJO_STOCK = 15

// Validación local replicando las reglas del backend (feedback inmediato).
function validar(form) {
  const errores = {}
  const nombre = form.nombre.trim()
  const marca = form.marca.trim()

  if (nombre.length < 2 || nombre.length > 50)
    errores.nombre = 'El nombre debe tener entre 2 y 50 caracteres.'
  if (marca.length < 2 || marca.length > 15)
    errores.marca = 'La marca debe tener entre 2 y 15 caracteres.'

  const costo = Number(form.costo)
  if (!form.costo || Number.isNaN(costo) || costo < 0.01)
    errores.costo = 'El costo debe ser mayor o igual a 0.01.'

  const cantidad = Number(form.cantidadDisponible)
  if (
    form.cantidadDisponible === '' ||
    !Number.isInteger(cantidad) ||
    cantidad < 0
  )
    errores.cantidadDisponible = 'La cantidad debe ser un entero mayor o igual a 0.'

  return errores
}

export default function ProductosPage() {
  const [incluirInactivos, setIncluirInactivos] = useState(false)
  const [soloBajoStock, setSoloBajoStock] = useState(false)
  const fetcher = useCallback(
    () => (soloBajoStock ? getProductosBajoStock() : getProductos(incluirInactivos)),
    [soloBajoStock, incluirInactivos],
  )
  const { data: productos, loading, error, reload } = useApi(fetcher)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [reponiendo, setReponiendo] = useState(null)
  const [accionError, setAccionError] = useState(null)
  // Cantidad a descontar por producto: { [id]: string }
  const [descuentos, setDescuentos] = useState({})

  async function manejarAccion(fn) {
    setAccionError(null)
    try {
      await fn()
      await reload()
    } catch (err) {
      setAccionError(err)
    }
  }

  async function descontar(id) {
    const valor = Number(descuentos[id])
    if (!Number.isInteger(valor) || valor <= 0) {
      setAccionError(new ApiError('Ingresá una cantidad entera mayor a cero.', 400))
      return
    }
    await manejarAccion(async () => {
      await descontarStock(id, valor)
      setDescuentos((prev) => ({ ...prev, [id]: '' }))
    })
  }

  return (
    <>
      <div className="page-header">
        <h1>Productos</h1>
        <div className="page-actions">
          <label className="toggle">
            <input
              type="checkbox"
              checked={soloBajoStock}
              onChange={(e) => setSoloBajoStock(e.target.checked)}
            />
            Ver solo bajo stock
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={incluirInactivos}
              disabled={soloBajoStock}
              onChange={(e) => setIncluirInactivos(e.target.checked)}
            />
            Incluir inactivos
          </label>
          <button className="btn-primary" onClick={() => setModalAbierto(true)}>
            + Nuevo producto
          </button>
        </div>
      </div>

      <ErrorBanner error={accionError} onClose={() => setAccionError(null)} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBanner error={error} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Costo</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    No hay productos para mostrar.
                  </td>
                </tr>
              )}
              {productos.map((p) => {
                const activo = p.estado === 'ACTIVO'
                return (
                  <tr key={p.id} className={activo ? undefined : 'inactivo'}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.marca}</td>
                    <td>{formatMoneda(p.costo)}</td>
                    <td>
                      {p.cantidadDisponible}
                      {activo && p.cantidadDisponible < UMBRAL_BAJO_STOCK && (
                        <span className="badge badge-bajo" style={{ marginLeft: '0.4rem' }}>
                          stock bajo
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {activo && (
                          <>
                            <input
                              className="inline-input"
                              type="number"
                              min="1"
                              placeholder="cant."
                              value={descuentos[p.id] ?? ''}
                              onChange={(e) =>
                                setDescuentos((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                            />
                            <button className="btn-sm btn-ghost" onClick={() => descontar(p.id)}>
                              Descontar
                            </button>
                            <button className="btn-sm btn-ghost" onClick={() => setReponiendo(p)}>
                              Reponer
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              onClick={() =>
                                manejarAccion(() => eliminarProducto(p.id))
                              }
                            >
                              Desactivar
                            </button>
                          </>
                        )}
                        {!activo && (
                          <button
                            className="btn-sm btn-success"
                            onClick={() => manejarAccion(() => activarProducto(p.id))}
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <ProductoFormModal
          onClose={() => setModalAbierto(false)}
          onCreado={async () => {
            setModalAbierto(false)
            await reload()
          }}
        />
      )}

      {reponiendo && (
        <ReponerStockModal
          producto={reponiendo}
          onClose={() => setReponiendo(null)}
          onRepuesto={async () => {
            setReponiendo(null)
            await reload()
          }}
        />
      )}
    </>
  )
}

function ProductoFormModal({ onClose, onCreado }) {
  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function setCampo(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setErrorGeneral(null)
    const erroresLocales = validar(form)
    setErrores(erroresLocales)
    if (Object.keys(erroresLocales).length > 0) return

    setEnviando(true)
    try {
      await crearProducto({
        nombre: form.nombre.trim(),
        marca: form.marca.trim(),
        costo: Number(form.costo),
        cantidadDisponible: Number(form.cantidadDisponible),
      })
      await onCreado()
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
    <Modal titulo="Nuevo producto" onClose={onClose}>
      <ErrorBanner error={errorGeneral} onClose={() => setErrorGeneral(null)} />
      <form onSubmit={enviar} noValidate>
        <Field
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={setCampo}
          error={errores.nombre}
          maxLength={50}
        />
        <Field
          label="Marca"
          name="marca"
          value={form.marca}
          onChange={setCampo}
          error={errores.marca}
          maxLength={15}
        />
        <Field
          label="Costo"
          name="costo"
          type="number"
          step="0.01"
          min="0.01"
          value={form.costo}
          onChange={setCampo}
          error={errores.costo}
        />
        <Field
          label="Cantidad disponible"
          name="cantidadDisponible"
          type="number"
          min="0"
          value={form.cantidadDisponible}
          onChange={setCampo}
          error={errores.cantidadDisponible}
        />
        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
