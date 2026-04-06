import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await apiClient.get(`/api/conversations/${conversationId}/messages`);
  return data.data;
};

const sendMessage = async ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<Message> => {
  const { data } = await apiClient.post(`/api/conversations/${conversationId}/messages`, {
    content,
  });
  return data.data;
};

export const useMessages = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 4000, // Polling co 4s — Phase 1 przed socket.io
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage({ conversationId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
