import { api } from './http'

// GET /productos?incluirInactivos=
export function getProductos(incluirInactivos = false) {
  return api.get(`/productos?incluirInactivos=${incluirInactivos}`)
}

export function getProducto(id) {
  return api.get(`/productos/${id}`)
}

// body: { nombre, marca, costo, cantidadDisponible }
export function crearProducto(producto) {
  return api.post('/productos', producto)
}

// Descuenta stock. body: { cantidad: number > 0 }
export function descontarStock(id, cantidad) {
  return api.patch(`/productos/${id}/stock`, { cantidad })
}

// Reactiva un producto inactivo.
export function activarProducto(id) {
  return api.patch(`/productos/${id}/activar`)
}

// Soft-delete: pasa a INACTIVO.
export function eliminarProducto(id) {
  return api.del(`/productos/${id}`)
}
