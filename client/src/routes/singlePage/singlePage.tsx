import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import './singlePage.scss';
import Slider from '../../components/slider/slider';
import Map from '../../components/map/map.jsx';
import { apiClient } from '../../lib/apiClient';
import { useCreateConversation } from '../../hooks/useConversations';
import '../../responsive.scss';


interface ListingImage {
  id: string;
  url: string;
  order: number;
}

interface ListingUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  latitude: number;
  longitude: number;
  images: ListingImage[];
  user: ListingUser;
}

const SinglePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSignedIn, userId } = useAuth();
  const { openSignIn } = useClerk();
  const createConversation = useCreateConversation();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.get<{ data: Listing }>(`/api/listings/${id}`)
      .then(res => setListing(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = isSignedIn && userId === listing?.user?.id;

  const handleSendMessage = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (!listing || isOwner) return;
    const conv = await createConversation.mutateAsync(listing.id);
    navigate(`/messages/${conv.id}`);
  };

  if (loading) return <div className="singlePage">Ładowanie...</div>;
  if (!listing) return <div className="singlePage">Nie znaleziono ogłoszenia.</div>;

  const imageUrls = [...listing.images]
    .sort((a, b) => a.order - b.order)
    .map(img => img.url);

  const userName = [listing.user.firstName, listing.user.lastName].filter(Boolean).join(' ') || 'Właściciel';
  const userAvatar = listing.user.avatarUrl ?? '/noavatar.png';

  const mapItem = {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    latitude: listing.latitude,
    longitude: listing.longitude,
    images: listing.images.map(img => ({ url: img.url })),
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={imageUrls} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{listing.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{listing.address}, {listing.city}</span>
                </div>
                <div className="price">$ {listing.price}</div>
              </div>
              <div className="user">
                <img src={userAvatar} alt="User" />
                <span>{userName}</span>
              </div>
            </div>
            <div className="bottom">{listing.description}</div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                <p>Renter is responsible</p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pets Policy</span>
                <p>Pets allowed</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Property Fees</span>
                <p>Gimme 3x income</p>
              </div>
            </div>
          </div>
          <p className="title">Size</p>
          <div className="sizes">
            {listing.area != null && (
              <div className="size">
                <img src="/size.png" alt="" />
                <span>{listing.area} m²</span>
              </div>
            )}
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>100m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/bus.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>700m right</p>
              </div>
            </div>
            <div className="feature">
              <img src="/restaurant.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>1200m left</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[mapItem]} zoom={12} />
          </div>
          <div className="buttons">
            <button
              onClick={handleSendMessage}
              disabled={isOwner || createConversation.isPending}
              title={isOwner ? 'This is your listing' : undefined}
            >
              <img src="/chat.png" alt="" />
              {isOwner ? 'Your listing' : createConversation.isPending ? 'Opening...' : 'Send a Message'}
            </button>
            <button>
              <img src="/save.png" alt="" />
              Save the place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
