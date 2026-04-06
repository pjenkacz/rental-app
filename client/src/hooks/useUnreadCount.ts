import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '../lib/apiClient';

const fetchUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get('/api/conversations/unread-count');
  return data.data.count;
};

export const useUnreadCount = () => {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    enabled: !!isSignedIn,
    refetchInterval: 30000, // Odświeżaj co 30s
  });
};
