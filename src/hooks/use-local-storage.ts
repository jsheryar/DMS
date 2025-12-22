
'use client';

import * as React from 'react';

// Custom hook for localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = React.useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    React.useEffect(() => {
      if (isMounted) {
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === key && e.newValue) {
            try {
                setStoredValue(JSON.parse(e.newValue));
            } catch (error) {
              console.log(error);
            }
          } else if (e.key === key && !e.newValue) {
             setStoredValue(initialValue);
          }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }
    }, [isMounted, key, initialValue]);


    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
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
