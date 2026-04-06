import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Automatycznie synchronizuje zalogowanego użytkownika z lokalną bazą danych.
// Odpala POST /api/users/sync raz po zalogowaniu — zapewnia że user istnieje
// w tabeli users przed jakąkolwiek operacją wymagającą FK (ogłoszenia, ulubione).
export const useUserSync = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || synced.current) return;

    const sync = async () => {
      try {
        const token = await getToken();
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        synced.current = true;
      } catch (err) {
        console.error('[useUserSync] błąd synchronizacji:', err);
      }
    };

    sync();
  }, [isLoaded, isSignedIn, getToken]);
};
