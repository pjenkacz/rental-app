import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z.string().min(1, 'Wiadomość nie może być pusta').max(2000),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
