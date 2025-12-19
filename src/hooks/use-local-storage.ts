
'use client';

import * as React from 'react';

// Custom hook for localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = React.useState<T>(() => initialValue);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                 window.localStorage.setItem(key, JSON.stringify(initialValue));
                 setStoredValue(initialValue);
            }
        } catch (error) {
            console.log(error);
            setStoredValue(initialValue);
        }
    }, [key, initialValue]);
    
    React.useEffect(() => {
      if (isMounted) {
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === key) {
            try {
              const item = window.localStorage.getItem(key);
              if (item) {
                setStoredValue(JSON.parse(item));
              }
            } catch (error) {
              console.log(error);
            }
          }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }
    }, [isMounted, key]);


    const setValue = (value: T | ((val: T) => T)) => {
        if (!isMounted) return;
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Manually dispatch a storage event so other tabs/components can update.
            window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) }));
        } catch (error) {
            console.log(error);
        }
    };
    
    // Return initialValue on server-side
    if (!isMounted) {
      return [initialValue, () => {}];
    }

    return [storedValue, setValue];
}
