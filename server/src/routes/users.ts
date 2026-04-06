import { Router } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
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

// POST /api/users/sync – upsert zalogowanego użytkownika do lokalnej bazy
// Wywoływany automatycznie przez frontend po zalogowaniu przez Clerk
router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const clerkUser = await clerkClient.users.getUser(userId!);

    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    );

    const user = await userService.createOrUpdate({
      id: clerkUser.id,
      email: primaryEmail?.emailAddress ?? '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    });

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

export default router;