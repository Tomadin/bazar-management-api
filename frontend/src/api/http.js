// Cliente HTTP centralizado para el backend del bazar.
// Todas las respuestas de error del backend tienen el formato:
//   { timestamp, status, error, message, path, validationErrors }
// donde validationErrors puede ser null o { campo: mensaje }.

const BASE_URL = '/api/v1'

// Error tipado que llevan todas las rutas. Las vistas usan:
//   - message: para alertas generales (404/409/500)
//   - validationErrors: para pintar errores por campo en formularios (400)
export class ApiError extends Error {
  constructor(message, status, validationErrors) {
    super(message || 'Ocurrió un error inesperado.')
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors || null
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Falla de red: el backend no responde / proxy caído.
    throw new ApiError('No se pudo conectar con el servidor. ¿Está el backend corriendo?', 0)
  }

  // 204 No Content (DELETE / soft-delete): no hay body.
  if (response.status === 204) return null

  // Intentamos parsear el body como JSON (tanto éxito como error).
  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message = data?.message || `Error ${response.status}.`
    throw new ApiError(message, response.status, data?.validationErrors)
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
