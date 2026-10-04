import { useState, useEffect } from 'react'

// Returns a value that only updates after `delay` ms of no changes.
// Used so we don't fire an API request on every keystroke —
// the search waits until the user pauses typing.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer) // cancel if value changes again
  }, [value, delay])

  return debounced
}
