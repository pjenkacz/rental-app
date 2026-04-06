export type ListingType = 'rent' | 'buy';
export type PropertyType = 'apartment' | 'house' | 'condo' | 'land';
export type Amenity = 'parking' | 'balkon' | 'klimatyzacja' | 'piwnica';

export interface UploadedImage {
  localId: string;
  url: string;
  order: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  localPreview?: string;
}

export interface WizardFormData {
  // Step 1
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  description: string;
  // Step 2
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  amenities: Amenity[];
  // Step 3
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export const STEP_LABELS = [
  'Podstawowe info',
  'Szczegóły',
  'Lokalizacja',
  'Zdjęcia',
  'Podgląd',
];

export const STEP_FIELDS: Record<number, (keyof WizardFormData)[]> = {
  0: ['title', 'listingType', 'propertyType', 'price', 'description'],
  1: ['bedrooms', 'bathrooms', 'area', 'amenities'],
  2: ['address', 'city', 'country', 'latitude', 'longitude'],
  3: [],
  4: [],
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Mieszkanie',
  house: 'Dom',
  condo: 'Apartament',
  land: 'Działka',
};

export const AMENITY_LABELS: Record<Amenity, string> = {
  parking: 'Parking',
  balkon: 'Balkon',
  klimatyzacja: 'Klimatyzacja',
  piwnica: 'Piwnica',
};
