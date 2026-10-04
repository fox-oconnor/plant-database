import { useState } from 'react'

// Keeps a piece of React state synced to localStorage, so the plant
// collection survives a page refresh. Works just like useState.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  const setAndSave = (newValue) => {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue
    setValue(resolved)
    try {
      window.localStorage.setItem(key, JSON.stringify(resolved))
    } catch {
      // storage unavailable — the app keeps working in memory
    }
  }

  return [value, setAndSave]
}
