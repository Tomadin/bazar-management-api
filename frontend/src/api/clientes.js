import { api } from './http'

// GET /clientes?incluirInactivos=
export function getClientes(incluirInactivos = false) {
  return api.get(`/clientes?incluirInactivos=${incluirInactivos}`)
}

export function getCliente(id) {
  return api.get(`/clientes/${id}`)
}

// body: { nombre, apellido, dni }
export function crearCliente(cliente) {
  return api.post('/clientes', cliente)
}

export function actualizarCliente(id, cliente) {
  return api.put(`/clientes/${id}`, cliente)
}

export function activarCliente(id) {
  return api.patch(`/clientes/${id}/activar`)
}

// Soft-delete: pasa a INACTIVO.
export function eliminarCliente(id) {
  return api.del(`/clientes/${id}`)
}
