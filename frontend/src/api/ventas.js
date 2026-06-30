import { api } from './http'

export function getVentas() {
  return api.get('/ventas')
}

export function getVenta(id) {
  return api.get(`/ventas/${id}`)
}

// body: { clienteId, items: [ { productoId, cantidad } ] }
export function crearVenta(venta) {
  return api.post('/ventas', venta)
}

// Anula la venta y repone el stock.
export function cancelarVenta(id) {
  return api.patch(`/ventas/${id}/cancelar`)
}
