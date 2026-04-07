import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useMyListings } from '../../hooks/useMyListings';
import Card from '../../components/card/card';
import type { CardItem } from '../../components/card/card';
import type { Listing } from '../../hooks/useListings';
import './ProfileListingsPage.scss';

const mapListingToCardItem = (listing: Listing): CardItem => ({
  id: listing.id,
  title: listing.title,
  address: listing.address,
  city: listing.city,
  price: listing.price,
  bedrooms: listing.bedrooms,
  bathrooms: listing.bathrooms,
  area: listing.area,
  listingType: listing.listingType,
  propertyType: listing.propertyType,
  images: listing.images,
});

const ProfileListingsPage: React.FC = () => {
  const { data: myListings, isLoading } = useMyListings();
  const hasListings = !isLoading && myListings && myListings.length > 0;

  return (
    <div className="profileListings">
      <div className="listingsHeader">
        <h3>My Listings</h3>
        <Link to="/listings/new" className="createBtn">+ Create New Listing</Link>
      </div>

      {isLoading && (
        <div className="listingsGrid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeletonCard" />
          ))}
        </div>
      )}

      {!isLoading && hasListings && (
        <div className="listingsGrid">
          {myListings.map(listing => (
            <div key={listing.id} className="myListingCard">
              <Card item={mapListingToCardItem(listing)} />
              <div className="myListingCard__actions">
                <Link
                  to={`/listings/${listing.id}/edit`}
                  className="actionBtn actionBtn--edit"
                  title="Edit listing"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  className="actionBtn actionBtn--delete"
                  title="Delete listing"
                  disabled
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !hasListings && (
        <div className="emptyState">
          <p>You haven't created any listings yet.</p>
          <Link to="/listings/new" className="ctaLink">Create your first listing →</Link>
        </div>
      )}
    </div>
  );
};

export default ProfileListingsPage;
