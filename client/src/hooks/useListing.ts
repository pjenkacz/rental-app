import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Listing } from './useListings';

const fetchListing = async (id: string): Promise<Listing> => {
  const { data } = await apiClient.get(`/api/listings/${id}`);
  return data.data;
};

export const useListing = (id: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
  });
};
