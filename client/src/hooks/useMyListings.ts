import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Listing } from './useListings';

const fetchMyListings = async (): Promise<Listing[]> => {
  const { data } = await apiClient.get('/api/listings/user/me');
  return data.data;
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
  });
};
