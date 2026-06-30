import { useCallback, useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import { getProductosBajoStock } from '../api/productos.js'
import { getResumenVentasDia, getMayorVenta } from '../api/ventas.js'
import Loading from '../components/Loading.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import ReponerStockModal from '../components/ReponerStockModal.jsx'
import { formatMoneda, formatFecha } from '../utils/format.js'

export default function ReportesPage() {
  return (
    <>
      <div className="page-header">
        <h1>Reportes</h1>
      </div>

      <div className="reportes">
        <div className="reportes-top">
          <MayorVenta />
          <ResumenPorDia />
        </div>
        <BajoStock />
      </div>
    </>
  )
}

/* ---------- Bloque: productos con bajo stock ---------- */
function BajoStock() {
  const fetcher = useCallback(() => getProductosBajoStock(), [])
  const { data: productos, loading, error, reload } = useApi(fetcher)
  const [reponiendo, setReponiendo] = useState(null)

  return (
    <section className="report-block">
      <h2 className="report-title">Productos con bajo stock</h2>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBanner error={error} />
      ) : productos.length === 0 ? (
        <div className="table-wrap">
          <p className="empty">No hay productos con bajo stock.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.marca}</td>
                  <td>
                    <span className="badge badge-bajo">{p.cantidadDisponible}</span>
                  </td>
                  <td>
                    <button className="btn-sm btn-primary" onClick={() => setReponiendo(p)}>
                      Reponer stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </section>
  )
}

/* ---------- Bloque: resumen de ventas por día ---------- */
function ResumenPorDia() {
  const [fecha, setFecha] = useState('')
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onFecha(e) {
    const valor = e.target.value
    setFecha(valor)
    setResumen(null)
    setError(null)
    if (!valor) return

    setLoading(true)
    try {
      const data = await getResumenVentasDia(valor)
      setResumen(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="report-block">
      <h2 className="report-title">Resumen de ventas por día</h2>
      <div className="field" style={{ maxWidth: 220 }}>
        <label htmlFor="fechaResumen">Fecha</label>
        <input id="fechaResumen" type="date" value={fecha} onChange={onFecha} />
      </div>

      {loading && <Loading />}
      {error && <ErrorBanner error={error} onClose={() => setError(null)} />}

      {resumen && !loading && (
        <div className="report-card">
          <p className="report-card-sub">Ventas del {formatFecha(resumen.fecha)}</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Cantidad de ventas</span>
              <span className="stat-valor">{resumen.cantidadVentas}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Monto total</span>
              <span className="stat-valor">{formatMoneda(resumen.montoTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {!resumen && !loading && !error && (
        <p className="muted">Elegí una fecha para ver el resumen.</p>
      )}
    </section>
  )
}

/* ---------- Bloque: mayor venta ---------- */
function MayorVenta() {
  const fetcher = useCallback(() => getMayorVenta(), [])
  const { data: venta, loading, error } = useApi(fetcher)

  // 404 = todavía no hay ventas: aviso suave en vez de banner de error.
  const sinVentas = error?.status === 404

  return (
    <section className="report-block">
      <h2 className="report-title">Mayor venta</h2>
      {loading ? (
        <Loading />
      ) : sinVentas ? (
        <p className="muted">No hay ventas registradas.</p>
      ) : error ? (
        <ErrorBanner error={error} />
      ) : (
        <div className="report-card">
          <p className="report-card-sub">
            Venta #{venta.codigoVenta} · {venta.nombreCliente} {venta.apellidoCliente}
          </p>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Total</span>
              <span className="stat-valor">{formatMoneda(venta.total)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Unidades vendidas</span>
              <span className="stat-valor">{venta.cantidadProductos}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
