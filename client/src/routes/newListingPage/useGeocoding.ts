import { useState, useCallback } from 'react';

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface UseGeocodingReturn {
  geocode: (address: string, city: string) => Promise<GeocodingResult | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useGeocoding = (): UseGeocodingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(
    async (address: string, city: string): Promise<GeocodingResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const query = encodeURIComponent(`${address}, ${city}`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'pl',
              'User-Agent': 'RentalApp/1.0',
            },
          }
        );

        if (!res.ok) throw new Error('Network error');

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setError(
            'Nie znaleziono adresu. Przykład: ul. Marszałkowska 1, Warszawa'
          );
          return null;
        }

        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      } catch {
        setError('Błąd połączenia z serwisem geokodowania. Spróbuj ponownie.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { geocode, isLoading, error, clearError };
};
