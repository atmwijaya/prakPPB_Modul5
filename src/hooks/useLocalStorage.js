import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to monitor localStorage changes
 * @param {string} key - The localStorage key to monitor
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {[value, setValue, isLoading]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing localStorage value:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // Also set up a periodic check for same-tab changes
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const item = window.localStorage.getItem(key);
        const newValue = item ? JSON.parse(item) : initialValue;
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Custom hook to monitor localStorage changes with polling
 * @param {string} key - The localStorage key to monitor
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {*} - The current value
 */
export function useLocalStorageValue(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const item = window.localStorage.getItem(key);
        const newValue = item ? JSON.parse(item) : initialValue;
        setValue(newValue);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [key, initialValue]);

  return value;
}
