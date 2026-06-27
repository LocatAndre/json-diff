import { useEffect, useRef, useState } from "react";

interface PersistedStateOptions<T> {
  debounceMs?: number;
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options: PersistedStateOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void] {
  const { debounceMs = 300, serialize, deserialize } = options;

  const serializeRef = useRef(serialize ?? JSON.stringify);
  const deserializeRef = useRef(deserialize ?? JSON.parse);

  serializeRef.current = serialize ?? JSON.stringify;
  deserializeRef.current = deserialize ?? JSON.parse;

  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return deserializeRef.current(stored) as T;
      }
    } catch {
      // ignore corrupt storage
    }

    return initialValue;
  });

  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(key, serializeRef.current(state));
      } catch {
        // ignore quota errors
      }
    }, debounceMs);

    return () => window.clearTimeout(timeoutRef.current);
  }, [key, state, debounceMs]);

  return [state, setState];
}

export function usePersistedString(
  key: string,
  initialValue: string,
  debounceMs = 300,
): [string, (value: string | ((prev: string) => string)) => void] {
  return usePersistedState(key, initialValue, {
    debounceMs,
    serialize: (value) => value,
    deserialize: (raw) => raw,
  });
}
