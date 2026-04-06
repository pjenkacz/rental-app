import { z } from 'zod';

export const createConversationSchema = z.object({
  listingId: z.string().uuid('listingId musi być poprawnym UUID'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
