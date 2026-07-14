import { useState, useEffect } from "react";

/**
 * Debounce a value by `delay` ms. The returned value only updates
 * after the caller stops changing it for `delay` milliseconds.
 *
 * Usage:
 *   const [query, setQuery] = useState("");
 *   const debouncedQuery = useDebounce(query, 200);
 *   // use debouncedQuery for filtering / API calls
 */
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
