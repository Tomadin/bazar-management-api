import { useCallback, useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  activarCliente,
  eliminarCliente,
} from '../api/clientes.js'
import { ApiError } from '../api/http.js'
import Loading from '../components/Loading.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import Modal from '../components/Modal.jsx'
import Field from '../components/Field.jsx'

const FORM_VACIO = { nombre: '', apellido: '', dni: '' }

function validar(form) {
  const errores = {}
  const nombre = form.nombre.trim()
  const apellido = form.apellido.trim()

  if (nombre.length < 2 || nombre.length > 12)
    errores.nombre = 'El nombre debe tener entre 2 y 12 caracteres.'
  if (apellido.length < 2 || apellido.length > 12)
    errores.apellido = 'El apellido debe tener entre 2 y 12 caracteres.'
  if (!/^[0-9]{8}$/.test(form.dni.trim()))
    errores.dni = 'El DNI debe ser un número válido de 8 dígitos.'

  return errores
}

export default function ClientesPage() {
  const [incluirInactivos, setIncluirInactivos] = useState(false)
  const fetcher = useCallback(() => getClientes(incluirInactivos), [incluirInactivos])
  const { data: clientes, loading, error, reload } = useApi(fetcher)

  // null = cerrado; {} = crear; objeto cliente = editar.
  const [editando, setEditando] = useState(null)
  const [accionError, setAccionError] = useState(null)

  async function manejarAccion(fn) {
    setAccionError(null)
    try {
      await fn()
      await reload()
    } catch (err) {
      setAccionError(err)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Clientes</h1>
        <div className="page-actions">
          <label className="toggle">
            <input
              type="checkbox"
              checked={incluirInactivos}
              onChange={(e) => setIncluirInactivos(e.target.checked)}
            />
            Incluir inactivos
          </label>
          <button className="btn-primary" onClick={() => setEditando({})}>
            + Nuevo cliente
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
                <th>Apellido</th>
                <th>DNI</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No hay clientes para mostrar.
                  </td>
                </tr>
              )}
              {clientes.map((c) => {
                const activo = c.estado === 'ACTIVO'
                return (
                  <tr key={c.id} className={activo ? undefined : 'inactivo'}>
                    <td>{c.id}</td>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
                    <td>{c.dni}</td>
                    <td>
                      <span className={`badge ${activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {activo ? (
                          <>
                            <button
                              className="btn-sm btn-ghost"
                              onClick={() => setEditando(c)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => manejarAccion(() => eliminarCliente(c.id))}
                            >
                              Desactivar
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-sm btn-success"
                            onClick={() => manejarAccion(() => activarCliente(c.id))}
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

      {editando && (
        <ClienteFormModal
          cliente={editando.id ? editando : null}
          onClose={() => setEditando(null)}
          onGuardado={async () => {
            setEditando(null)
            await reload()
          }}
        />
      )}
    </>
  )
}

function ClienteFormModal({ cliente, onClose, onGuardado }) {
  const esEdicion = Boolean(cliente)
  const [form, setForm] = useState(
    cliente
      ? { nombre: cliente.nombre, apellido: cliente.apellido, dni: cliente.dni }
      : FORM_VACIO,
  )
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

    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      dni: form.dni.trim(),
    }
    setEnviando(true)
    try {
      if (esEdicion) {
        await actualizarCliente(cliente.id, payload)
      } else {
        await crearCliente(payload)
      }
      await onGuardado()
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
    <Modal titulo={esEdicion ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose}>
      <ErrorBanner error={errorGeneral} onClose={() => setErrorGeneral(null)} />
      <form onSubmit={enviar} noValidate>
        <Field
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={setCampo}
          error={errores.nombre}
          maxLength={12}
        />
        <Field
          label="Apellido"
          name="apellido"
          value={form.apellido}
          onChange={setCampo}
          error={errores.apellido}
          maxLength={12}
        />
        <Field
          label="DNI"
          name="dni"
          value={form.dni}
          onChange={setCampo}
          error={errores.dni}
          maxLength={8}
          inputMode="numeric"
        />
        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? 'Guardando…' : esEdicion ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
