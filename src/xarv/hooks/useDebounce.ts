import { useEffect, useState } from "react";

export function useDebounce<T = any>(value: T, delayms: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delayms)
      return () => clearTimeout(handler)
    }, [value, delayms])
  
    return debouncedValue;
}

export function useDebounceInitial<T = any>(initialState: T | (() => T), delayms: number) {
    const [debouncedValue, setDebouncedValue] = useState(initialState);
  
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(initialState), delayms)
      return () => clearTimeout(handler)
    }, [initialState, delayms])
  
    return debouncedValue;
}