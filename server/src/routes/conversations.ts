import { Router } from 'express';
import { z } from 'zod';
import { getAuth } from '@clerk/express';
import { conversationService } from '../services/conversationService';
import { listingService } from '../services/listingService';
import { requireAuth } from '../middleware/auth';
import { createConversationSchema } from '../validators/conversation';
import { createMessageSchema } from '../validators/message';

const router = Router();

// Wszystkie endpointy wymagają zalogowania
router.use(requireAuth);

// GET /api/conversations — lista konwersacji zalogowanego użytkownika
router.get('/', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const result = await conversationService.getAll(userId!);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/unread-count — liczba nieprzeczytanych wiadomości
// MUSI być przed /:id żeby Express nie potraktował "unread-count" jako ID
router.get('/unread-count', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const count = await conversationService.getUnreadCount(userId!);
    res.json({ data: { count } });
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations — stwórz lub zwróć istniejącą konwersację
router.post('/', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { listingId } = createConversationSchema.parse(req.body);

    // Pobierz ogłoszenie żeby poznać sellerId
    const listing = await listingService.getById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Ogłoszenie nie znalezione' });
    }

    const conversation = await conversationService.createOrGet({
      listingId,
      buyerId: userId!,
      sellerId: listing.userId,
    });

    res.status(201).json({ data: conversation });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Błąd walidacji', details: err.issues });
    }
    const e = err as { status?: number; message?: string };
    if (e.status === 400) {
      return res.status(400).json({ error: e.message });
    }
    next(err);
  }
});

// GET /api/conversations/:id/messages — wiadomości konwersacji
router.get('/:id/messages', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const msgs = await conversationService.getMessages(req.params.id, userId!);
    res.json({ data: msgs });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    if (e.status === 404) return res.status(404).json({ error: e.message });
    if (e.status === 403) return res.status(403).json({ error: e.message });
    next(err);
  }
});

// POST /api/conversations/:id/messages — wyślij wiadomość
router.post('/:id/messages', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { content } = createMessageSchema.parse(req.body);

    // Zweryfikuj że userId jest uczestnikiem (getMessages też to robi, ale tutaj najpierw sprawdzamy)
    await conversationService.getMessages(req.params.id, userId!);

    const message = await conversationService.sendMessage({
      conversationId: req.params.id,
      senderId: userId!,
      content,
    });

    res.status(201).json({ data: message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Błąd walidacji', details: err.issues });
    }
    const e = err as { status?: number; message?: string };
    if (e.status === 404) return res.status(404).json({ error: e.message });
    if (e.status === 403) return res.status(403).json({ error: e.message });
    next(err);
  }
});

// PATCH /api/conversations/:id/messages/read — oznacz jako przeczytane
router.patch('/:id/messages/read', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    await conversationService.markAsRead(req.params.id, userId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
