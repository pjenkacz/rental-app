import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { favoriteService } from '../services/favouriteService';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Wszystkie endpoints ulubionych wymagają auth
router.use(requireAuth);

// GET /api/favorites
router.get('/', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const result = await favoriteService.getByUserId(userId!);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/favorites/:listingId
router.post('/:listingId', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const favorite = await favoriteService.add(userId!, req.params.listingId);
    res.status(201).json({ data: favorite });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favorites/:listingId
router.delete('/:listingId', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    await favoriteService.remove(userId!, req.params.listingId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;