import { useCallback, useEffect, useState } from 'react'

// Hook genérico para GETs: maneja loading, error y permite recargar.
// fetcher debe ser una función estable (envolverla en useCallback en el caller).
export function useApi(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload, setData }
}
