import { Router } from 'express';
import { Webhook } from 'svix';
import { userService } from '../services/userService';

const router = Router();

// POST /api/webhooks/clerk
// Clerk wysyła eventy user.created i user.updated
// Svix weryfikuje podpis — bez tego każdy mógłby wysłać fałszywy event
router.post('/clerk', async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Brak CLERK_WEBHOOK_SECRET w .env');
    return res.status(500).json({ error: 'Webhook nie skonfigurowany' });
  }

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Brak nagłówków svix' });
  }

  let event: ReturnType<Webhook['verify']>;

  try {
    const wh = new Webhook(secret);
    event = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ReturnType<Webhook['verify']>;
  } catch {
    return res.status(400).json({ error: 'Nieprawidłowy podpis webhooka' });
  }

  const { type, data } = event as { type: string; data: Record<string, unknown> };

  if (type === 'user.created' || type === 'user.updated') {
    const emailObj = (data.email_addresses as Array<{ email_address: string }>)?.[0];

    await userService.createOrUpdate({
      id: data.id as string,
      email: emailObj?.email_address ?? '',
      firstName: data.first_name as string | null,
      lastName: data.last_name as string | null,
      avatarUrl: data.image_url as string | null,
    });
  }

  if (type === 'user.deleted') {
    // ON DELETE CASCADE w bazie usunie ogłoszenia, ulubione i konwersacje
    await userService.delete(data.id as string);
  }

  res.json({ received: true });
});

export default router;
