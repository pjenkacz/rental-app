import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '../lib/apiClient';

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
  createdAt: string;
}

const fetchConversations = async (): Promise<Conversation[]> => {
  const { data } = await apiClient.get('/api/conversations');
  return data.data;
};

const createConversation = async (listingId: string): Promise<Conversation> => {
  const { data } = await apiClient.post('/api/conversations', { listingId });
  return data.data;
};

export const useConversations = () => {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: !!isSignedIn,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
