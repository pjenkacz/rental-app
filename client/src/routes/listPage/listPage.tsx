import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import './listPage.scss';
import Filter from '../../components/filter/filter';
import Card from '../../components/card/card';
import { useListings } from '../../hooks/useListings';
import type { ListingFilters, Listing } from '../../hooks/useListings';
import { useCreateConversation } from '../../hooks/useConversations';

const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, userId } = useAuth();
  const { openSignIn } = useClerk();
  const createConversation = useCreateConversation();

  const [filters, setFilters] = useState<ListingFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 20,
  });

  const { data, isLoading, isError } = useListings(filters);

  const listings = data?.data ?? [];

  const handleSearch = (newFilters: ListingFilters) => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      ...newFilters,
    });
  };

  const handleChat = (listing: Listing) => async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (userId === listing.userId) return; // właściciel nie może pisać do siebie
    const conv = await createConversation.mutateAsync(listing.id);
    navigate(`/messages/${conv.id}`);
  };

  return (
    <div className="listPage">
      <div className="listPage__inner">
        <Filter onSearch={handleSearch} activeCity={filters.city} />

        {isLoading && (
          <div className="listStatus">Loading listings...</div>
        )}

        {isError && (
          <div className="listStatus listStatus--error">
            Failed to load listings. Please try again.
          </div>
        )}

        {!isLoading && !isError && listings.length === 0 && (
          <div className="listStatus">No listings found for your search.</div>
        )}

        <div className="listPage__grid">
          {listings.map((listing) => (
            <Card key={listing.id} item={listing} onChat={handleChat(listing)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListPage;
