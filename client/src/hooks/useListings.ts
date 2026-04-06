import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface ListingFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'buy' | 'rent';
  bedrooms?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'area' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListingImage {
  id: string;
  url: string;
  order: number;
}

export interface ListingUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  listingType: 'buy' | 'rent';
  propertyType: 'apartment' | 'house' | 'condo' | 'land';
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  floor: number | null;
  amenities: string[];
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isPublished: boolean;
  userId: string;
  createdAt: string;
  images: ListingImage[];
  user: ListingUser;
}

export interface ListingsResponse {
  data: Listing[];
  count: number;
  limit: number;
  offset: number;
}

const fetchListings = async (filters: ListingFilters): Promise<ListingsResponse> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined)
  );
  const { data } = await apiClient.get('/api/listings', { params });
  return data;
};

export const useListings = (filters: ListingFilters = {}) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });
};
