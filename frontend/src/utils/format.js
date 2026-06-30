// Formato de moneda: $1.234,50 estilo es-AR.
export function formatMoneda(n) {
  return Number(n ?? 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  })
}

// Formato de fecha legible a partir de un ISO yyyy-MM-dd → dd/MM/yyyy.
// Se parsea manualmente para evitar corrimientos por zona horaria.
export function formatFecha(iso) {
  if (!iso) return '—'
  const [anio, mes, dia] = String(iso).split('-')
  if (!anio || !mes || !dia) return iso
  return `${dia}/${mes}/${anio}`
}
