import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { userService } from '../services/userService';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/users/me – dane zalogowanego użytkownika
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const user = await userService.getById(userId!);

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

export default router;