
import { useState, useEffect } from 'react';

// Hook personnalisé pour gérer les valeurs dans localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  // Passer la fonction d'initialisation à useState pour qu'elle ne s'exécute qu'une fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Récupérer du localStorage par clé
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si l'erreur se produit, retourner initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour la valeur dans localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à la valeur d'être une fonction pour la même API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Écouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage value:', error);
        }
      }
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('storage', handleStorageChange);

    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
