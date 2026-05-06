import './card.scss';
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2, Bookmark, MessageCircle } from 'lucide-react';

export interface CardItem {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area?: number | null;
  listingType: 'buy' | 'rent';
  propertyType: 'apartment' | 'house' | 'condo' | 'land';
  images: { url: string; order?: number }[];
}

interface CardProps {
  item: CardItem;
  onChat?: () => void;
}

const Card: React.FC<CardProps> = ({ item, onChat }) => {
  const coverImage = item.images.length > 0
    ? [...item.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0].url
    : '';

  const typeLabel = item.listingType === 'rent' ? 'For Rent' : 'For Sale';

  return (
    <div className="card">
      <Link to={`/listings/${item.id}`} className="card__imageWrap">
        {coverImage
          ? <img src={coverImage} alt={item.title} className="card__image" />
          : <div className="card__imagePlaceholder" />
        }
        <span className={`card__badge card__badge--${item.listingType}`}>{typeLabel}</span>
      </Link>

      <div className="card__body">
        <div className="card__main">
          <h3 className="card__title">
            <Link to={`/listings/${item.id}`}>{item.title}</Link>
          </h3>
          <p className="card__location">
            <MapPin size={13} />
            <span>{item.address}, {item.city}</span>
          </p>
        </div>

        <p className="card__price">
          ${item.price.toLocaleString()}
          {item.listingType === 'rent' && <span className="card__priceUnit">/mo</span>}
        </p>

        <div className="card__footer">
          <div className="card__features">
            <span className="card__feat">
              <BedDouble size={13} />
              {item.bedrooms} bed{item.bedrooms !== 1 ? 's' : ''}
            </span>
            <span className="card__feat">
              <Bath size={13} />
              {item.bathrooms} bath{item.bathrooms !== 1 ? 's' : ''}
            </span>
            {item.area != null && (
              <span className="card__feat">
                <Maximize2 size={13} />
                {item.area} m²
              </span>
            )}
          </div>

          <div className="card__actions">
            <button className="card__action" aria-label="Save">
              <Bookmark size={14} />
            </button>
            {onChat && (
              <button className="card__action card__action--chat" onClick={onChat} aria-label="Chat">
                <MessageCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
