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

// --- Reportes / consultas ---

// Resumen de ventas ACTIVA de un día. fecha en ISO yyyy-MM-dd.
// -> { fecha, cantidadVentas, montoTotal }
export function getResumenVentasDia(fecha) {
  return api.get(`/ventas/fecha/${fecha}`)
}

// Venta de mayor monto (solo ACTIVA). 404 si no hay ventas.
// -> { codigoVenta, total, cantidadProductos, nombreCliente, apellidoCliente }
export function getMayorVenta() {
  return api.get('/ventas/mayor_venta')
}

// Renglones de una venta. (Opcional: GET /ventas/{id} ya trae 'detalles'.)
export function getProductosDeVenta(codigoVenta) {
  return api.get(`/ventas/productos/${codigoVenta}`)
}
