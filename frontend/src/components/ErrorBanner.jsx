// Muestra el `message` de un ApiError (o cualquier Error) en rojo.
// onClose es opcional: si se pasa, muestra una "x" para descartar.
export default function ErrorBanner({ error, onClose }) {
  if (!error) return null
  return (
    <div className="alert alert-error" role="alert">
      <span>{error.message || 'Ocurrió un error inesperado.'}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  )
}
