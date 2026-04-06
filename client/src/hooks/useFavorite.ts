import { useState, useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { apiClient } from '../lib/apiClient';

export const useFavorite = (listingId: string, initialFavorited = false) => {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const toggle = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    // Optimistic update
    setIsFavorited((prev) => !prev);
    setIsLoading(true);

    try {
      if (isFavorited) {
        await apiClient.delete(`/api/favorites/${listingId}`);
      } else {
        await apiClient.post(`/api/favorites/${listingId}`);
      }
    } catch {
      // Rollback przy błędzie
      setIsFavorited((prev) => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFavorited, toggle, isLoading };
};
