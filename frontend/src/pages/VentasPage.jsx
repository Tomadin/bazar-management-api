import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import { getVentas, crearVenta, cancelarVenta } from '../api/ventas.js'
import { getClientes } from '../api/clientes.js'
import { getProductos } from '../api/productos.js'
import { ApiError } from '../api/http.js'
import Loading from '../components/Loading.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import Modal from '../components/Modal.jsx'
import { formatMoneda, formatFecha } from '../utils/format.js'

export default function VentasPage() {
  const fetcher = useCallback(() => getVentas(), [])
  const { data: ventas, loading, error, reload } = useApi(fetcher)

  const [expandida, setExpandida] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [accionError, setAccionError] = useState(null)

  async function cancelar(id) {
    setAccionError(null)
    try {
      await cancelarVenta(id)
      await reload()
    } catch (err) {
      setAccionError(err)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Ventas</h1>
        <button className="btn-primary" onClick={() => setModalAbierto(true)}>
          + Nueva venta
        </button>
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
                <th></th>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    No hay ventas registradas.
                  </td>
                </tr>
              )}
              {ventas.map((v) => {
                const activa = v.estado === 'ACTIVA'
                const abierta = expandida === v.id
                return (
                  <FragmentVenta
                    key={v.id}
                    venta={v}
                    activa={activa}
                    abierta={abierta}
                    onToggle={() => setExpandida(abierta ? null : v.id)}
                    onCancelar={() => cancelar(v.id)}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <NuevaVentaModal
          onClose={() => setModalAbierto(false)}
          onCreada={async () => {
            setModalAbierto(false)
            await reload()
          }}
        />
      )}
    </>
  )
}

function FragmentVenta({ venta, activa, abierta, onToggle, onCancelar }) {
  return (
    <>
      <tr className={activa ? undefined : 'inactivo'}>
        <td>
          <button className="btn-sm btn-ghost" onClick={onToggle} aria-label="Ver detalle">
            {abierta ? '▾' : '▸'}
          </button>
        </td>
        <td>{venta.id}</td>
        <td>{formatFecha(venta.fechaVenta)}</td>
        <td>
          {venta.cliente
            ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
            : '—'}
        </td>
        <td>{formatMoneda(venta.total)}</td>
        <td>
          <span className={`badge ${activa ? 'badge-activo' : 'badge-anulada'}`}>
            {venta.estado}
          </span>
        </td>
        <td>
          {activa && (
            <button className="btn-sm btn-danger" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </td>
      </tr>
      {abierta && (
        <tr className="detalle-row">
          <td colSpan={7}>
            <div className="detalle-box">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.detalles?.map((d, i) => (
                    <tr key={i}>
                      <td>{d.nombreProducto}</td>
                      <td>{d.cantidad}</td>
                      <td>{formatMoneda(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="total-line">Total: {formatMoneda(venta.total)}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function NuevaVentaModal({ onClose, onCreada }) {
  const [clientes, setClientes] = useState(null)
  const [productos, setProductos] = useState(null)
  const [cargaError, setCargaError] = useState(null)

  const [clienteId, setClienteId] = useState('')
  // items: [ { productoId: string, cantidad: string } ]
  const [items, setItems] = useState([{ productoId: '', cantidad: '1' }])
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Cargamos sólo clientes y productos activos para los selects.
  useEffect(() => {
    Promise.all([getClientes(false), getProductos(false)])
      .then(([cs, ps]) => {
        setClientes(cs)
        setProductos(ps)
      })
      .catch((err) => setCargaError(err))
  }, [])

  function setItem(idx, campo, valor) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)),
    )
  }

  function agregarItem() {
    setItems((prev) => [...prev, { productoId: '', cantidad: '1' }])
  }

  function quitarItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function costoDe(productoId) {
    const p = productos?.find((p) => String(p.id) === String(productoId))
    return p ? p.costo : 0
  }

  // Total estimado en el front (el backend calcula el definitivo).
  const total = items.reduce((acc, it) => {
    const cant = Number(it.cantidad)
    if (!it.productoId || !Number.isFinite(cant) || cant <= 0) return acc
    return acc + costoDe(it.productoId) * cant
  }, 0)

  function validar() {
    if (!clienteId) return 'Seleccioná un cliente.'
    const validos = items.filter((it) => it.productoId)
    if (validos.length === 0) return 'Agregá al menos un producto.'
    for (const it of validos) {
      const cant = Number(it.cantidad)
      if (!Number.isInteger(cant) || cant <= 0)
        return 'Las cantidades deben ser enteros mayores a cero.'
    }
    return null
  }

  async function enviar(e) {
    e.preventDefault()
    setErrorGeneral(null)
    const errLocal = validar()
    if (errLocal) {
      setErrorGeneral(new ApiError(errLocal, 400))
      return
    }

    const payload = {
      clienteId: Number(clienteId),
      items: items
        .filter((it) => it.productoId)
        .map((it) => ({
          productoId: Number(it.productoId),
          cantidad: Number(it.cantidad),
        })),
    }

    setEnviando(true)
    try {
      await crearVenta(payload)
      await onCreada()
    } catch (err) {
      setErrorGeneral(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Nueva venta" onClose={onClose}>
      {cargaError ? (
        <ErrorBanner error={cargaError} />
      ) : clientes === null || productos === null ? (
        <Loading texto="Cargando clientes y productos…" />
      ) : (
        <form onSubmit={enviar} noValidate>
          <ErrorBanner error={errorGeneral} onClose={() => setErrorGeneral(null)} />

          <div className="field">
            <label htmlFor="clienteId">Cliente</label>
            <select
              id="clienteId"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">— Seleccionar cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellido} (DNI {c.dni})
                </option>
              ))}
            </select>
          </div>

          <div className="items-section">
            <div className="items-title">
              <span>Ítems</span>
            </div>

            {items.map((it, idx) => (
              <div className="item-card" key={idx}>
                <div className="item-field item-prod">
                  <label>Producto</label>
                  <select
                    value={it.productoId}
                    onChange={(e) => setItem(idx, 'productoId', e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.marca}) · {formatMoneda(p.costo)} · stock {p.cantidadDisponible}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="item-field item-cant">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={it.cantidad}
                    onChange={(e) => setItem(idx, 'cantidad', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="item-remove"
                  onClick={() => quitarItem(idx)}
                  disabled={items.length === 1}
                  aria-label="Quitar ítem"
                  title="Quitar ítem"
                >
                  ✕
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={agregarItem}>
              + Agregar ítem
            </button>

            <div className="venta-total">
              <span>Total estimado</span>
              <strong>{formatMoneda(total)}</strong>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'Registrando…' : 'Registrar venta'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
