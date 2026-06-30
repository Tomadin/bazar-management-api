// Campo de formulario controlado: label + input + mensaje de error debajo.
// `error` viene de la validación local o de validationErrors[campo] del backend.
export default function Field({ label, name, error, ...inputProps }) {
  return (
    <div className={`field ${error ? 'field-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...inputProps} />
      {error && <span className="field-msg">{error}</span>}
    </div>
  )
}
