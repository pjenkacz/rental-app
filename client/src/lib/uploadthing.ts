import { generateReactHelpers } from '@uploadthing/react';

// Mirror server router shape — no server code imported, just types
type OurFileRouter = {
  listingImages: object;
  avatar: object;
};

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: `${import.meta.env.VITE_API_URL}/api/uploadthing`,
});
