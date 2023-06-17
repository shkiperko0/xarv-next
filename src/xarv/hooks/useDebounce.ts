import { useEffect, useState } from "react";

export function useDebounce(value: any, delayms: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delayms)
      return () => clearTimeout(handler)
    }, [value, delayms])
  
    return debouncedValue;
}