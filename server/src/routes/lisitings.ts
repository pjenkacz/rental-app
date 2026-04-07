import { Router } from 'express';
import { z } from 'zod';
import { getAuth, clerkClient } from '@clerk/express';
import { listingService } from '../services/listingService';
import { userService } from '../services/userService';
import { requireAuth } from '../middleware/auth';
import {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
  mapQuerySchema,
} from '../validators/listing';

const router = Router();

// GET /api/listings — lista ogłoszeń z paginacją, filtrami i sortowaniem
router.get('/', async (req, res, next) => {
  try {
    const query = listingQuerySchema.parse(req.query);
    const result = await listingService.getAll(query);
    res.json({ data: result, count: result.length, limit: query.limit, offset: query.offset });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Błąd walidacji', details: err.issues });
    }
    next(err);
  }
});

// GET /api/listings/map — piny dla widocznego obszaru mapy
// MUSI być przed /:id żeby Express nie potraktował "map" jako ID
router.get('/map', async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng } = mapQuerySchema.parse(req.query);
    const pins = await listingService.getMapPins(swLat, swLng, neLat, neLng);
    res.json({ data: pins });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Błąd walidacji', details: err.issues });
    }
    next(err);
  }
});

// GET /api/listings/cities — autocomplete miast z bazy
// MUSI być przed /:id
router.get('/cities', async (req, res, next) => {
  try {
    const q = z.string().min(1).parse(req.query.q);
    const cities = await listingService.getCities(q);
    res.json({ data: cities });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Parametr q jest wymagany' });
    }
    next(err);
  }
});

// GET /api/listings/user/me — ogłoszenia zalogowanego użytkownika
// MUSI być przed /:id żeby Express nie potraktował "user" jako ID
router.get('/user/me', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const listings = await listingService.getByUserId(userId!);
    res.json({ data: listings });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await listingService.getById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ data: listing });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { images, ...listingData } = createListingSchema.parse(req.body);

    // Ensure user exists in DB — FK constraint requires it.
    // This handles the case where the Clerk webhook hasn't fired yet.
    const clerkUser = await clerkClient.users.getUser(userId!);
    await userService.createOrUpdate({
      id: userId!,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    });

    const newListing = await listingService.create(
      {
        ...listingData,
        price: String(listingData.price),
        area: listingData.area ? String(listingData.area) : undefined,
        latitude: String(listingData.latitude),
        longitude: String(listingData.longitude),
        userId: userId!,
      },
      images
    );

    res.status(201).json({ data: newListing });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Błąd walidacji', details: err.issues });
    }
    next(err);
  }
});

// PUT /api/listings/:id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const validated = updateListingSchema.parse(req.body);

    const updated = await listingService.update(String(req.params.id), userId!, {
      ...validated,
      price: validated.price ? String(validated.price) : undefined,
      area: validated.area ? String(validated.area) : undefined,
      latitude: validated.latitude ? String(validated.latitude) : undefined,
      longitude: validated.longitude ? String(validated.longitude) : undefined,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Nie znaleziono lub brak uprawnień' });
    }

    res.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Błąd walidacji', details: err.issues });
    }
    next(err);
  }
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const deleted = await listingService.delete(String(req.params.id), userId!);

    if (!deleted) {
      return res.status(404).json({ error: 'Nie znaleziono lub brak uprawnień' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
