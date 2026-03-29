import { Router } from 'express';
import { z } from 'zod';
import { getAuth } from '@clerk/express';
import { listingService } from '../services/listingService';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Schemat walidacji – Zod sprawdzi czy dane z requesta są poprawne
const createListingSchema = z.object({
  title: z.string().min(5, 'Tytuł musi mieć min. 5 znaków'),
  description: z.string().optional(),
  price: z.number().positive('Cena musi być dodatnia'),
  listingType: z.enum(['buy', 'rent']),
  propertyType: z.enum(['apartment', 'house', 'condo', 'land']),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.number().positive().optional(),
  address: z.string().min(3),
  city: z.string().min(2),
  country: z.string().default('USA'),
  latitude: z.number(),
  longitude: z.number(),
});

// GET /api/listings
router.get('/', async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, listingType, bedrooms } = req.query;

    const result = await listingService.getAll({
      city: city as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      listingType: listingType as 'buy' | 'rent',
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
    });

    res.json({ data: result, count: result.length });
  } catch (err) {
    next(err); // ← przekaż błąd do errorHandler
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

// POST /api/listings  (wymaga zalogowania)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    // Zod waliduje body – jeśli coś nie pasuje, rzuca ZodError
    const validated = createListingSchema.parse(req.body);

    const newListing = await listingService.create({
      ...validated,
      price: String(validated.price),
      area: validated.area ? String(validated.area) : undefined,
      latitude: String(validated.latitude),
      longitude: String(validated.longitude),
      userId: userId!,
    });

    res.status(201).json({ data: newListing });
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Błąd walidacji – 400 zamiast 500
      return res.status(400).json({ 
        error: 'Błąd walidacji', 
        details: (err as z.ZodError).issues 
      });
    }
    next(err);
  }
});

// PUT /api/listings/:id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const id = String(req.params.id)
    const updated = await listingService.update(
      id, 
      userId!, 
      req.body
    );

    if (!updated) {
      return res.status(404).json({ error: 'Nie znaleziono lub brak uprawnień' });
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const id = String(req.params.id)
    const deleted = await listingService.delete(id, userId!);

    if (!deleted) {
      return res.status(404).json({ error: 'Nie znaleziono lub brak uprawnień' });
    }

    res.status(204).send(); // 204 = sukces, brak treści odpowiedzi
  } catch (err) {
    next(err);
  }
});

export default router;
