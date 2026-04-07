import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { getAuth } from '@clerk/express';

const f = createUploadthing();

export const uploadRouter = {
  // Upload zdjęć ogłoszenia — max 10 plików, max 4MB każdy
  listingImages: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(({ req }) => {
      const { userId } = getAuth(req as Parameters<typeof getAuth>[0]);
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    }) 
    .onUploadComplete(({ metadata, file }) => {
      console.log(`[uploadthing] listing image uploaded by ${metadata.userId}: ${file.url}`);
      return { url: file.url };
    }),

  // Upload avatara użytkownika — 1 plik, max 2MB
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(({ req }) => {
      const { userId } = getAuth(req as Parameters<typeof getAuth>[0]);
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log(`[uploadthing] avatar uploaded by ${metadata.userId}: ${file.url}`);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
