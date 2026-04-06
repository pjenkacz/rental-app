import axios from 'axios';

type GetToken = () => Promise<string | null>;

// Przechowujemy referencję do getToken z Clerk.
// Ustawiana raz przez useSetupApiClient w Layout.
let _getToken: GetToken | null = null;

export const setTokenGetter = (fn: GetToken) => {
  _getToken = fn;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Przed każdym requestem — dołącz token Clerk jeśli użytkownik jest zalogowany
apiClient.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Globalnie obsługuj błędy odpowiedzi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        // Token wygasł lub nieprawidłowy — Clerk sam odświeży sesję
        console.warn('[apiClient] 401 Unauthorized');
      }
      if (status && status >= 500) {
        console.error('[apiClient] błąd serwera:', error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);
